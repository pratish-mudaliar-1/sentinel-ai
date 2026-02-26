from kafka import KafkaProducer, KafkaConsumer, KafkaAdminClient
from kafka.admin import NewTopic
import json
import logging
from collections import deque
import threading

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("KafkaIntegration")

# Global mock queues for fallback
mock_queues = {
    "raw_transactions": deque(maxlen=100),
    "processed_transactions": deque(maxlen=100),
    "self_correction": deque(maxlen=100)
}

class MockConsumer:
    def __init__(self, topic):
        self.topic = topic
        self.queue = mock_queues[topic]

    def poll(self, timeout_ms=500):
        if not self.queue:
            return {}
        
        # Format similar to kafka-python-ng poll results
        messages = []
        while self.queue:
            val = self.queue.popleft()
            # Create a mock message object with a .value attribute
            class MockMsg:
                def __init__(self, v): self.value = v
            messages.append(MockMsg(val))
        
        return {"mock_tp": messages}

class RealKafkaPipe:
    def __init__(self, bootstrap_servers='localhost:9092'):
        self.bootstrap_servers = bootstrap_servers
        self.topics = ["raw_transactions", "processed_transactions", "self_correction"]
        self.use_mock = False
        
        try:
            self.producer = KafkaProducer(
                bootstrap_servers=bootstrap_servers,
                value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                retries=2,
                request_timeout_ms=1000
            )
            logger.info("✅ Kafka Producer initialized.")
            self._ensure_topics()
        except Exception as e:
            logger.error(f"❌ Kafka Connection Failed: {e}")
            logger.info("⚠️ ACTIVATING MOCK KAFKA FALLBACK...")
            self.producer = None
            self.use_mock = True

    def _ensure_topics(self):
        try:
            admin_client = KafkaAdminClient(bootstrap_servers=self.bootstrap_servers, request_timeout_ms=1000)
            existing_topics = admin_client.list_topics()
            new_topics = [NewTopic(name=topic, num_partitions=1, replication_factor=1) 
                          for topic in self.topics if topic not in existing_topics]
            if new_topics:
                admin_client.create_topics(new_topics=new_topics, timeout_ms=5000)
                logger.info(f"Created topics: {[t.name for t in new_topics]}")
            admin_client.close()
        except Exception as e:
            logger.warning(f"⚠️ Could not ensure topics: {e}")

    def produce(self, topic, data):
        if self.producer and not self.use_mock:
            try:
                self.producer.send(topic, data)
            except Exception as e:
                logger.error(f"❌ Failed to produce to Kafka: {e}")
                self.use_mock = True
                mock_queues[topic].append(data)
        else:
            if topic in mock_queues:
                mock_queues[topic].append(data)

    def get_consumer(self, topic, group_id=None):
        if self.use_mock:
            return MockConsumer(topic)
            
        try:
            return KafkaConsumer(
                topic,
                bootstrap_servers=self.bootstrap_servers,
                group_id=group_id,
                auto_offset_reset='latest',
                enable_auto_commit=True,
                value_deserializer=lambda x: json.loads(x.decode('utf-8')),
                request_timeout_ms=1000
            )
        except Exception as e:
            logger.error(f"❌ Kafka Consumer failed: {e}")
            self.use_mock = True
            return MockConsumer(topic)

        