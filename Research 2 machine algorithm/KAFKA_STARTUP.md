# Kafka Startup Instructions

To run the project with actual Apache Kafka, follow these steps in separate terminals:

## 1. Start Zookeeper
Open a terminal and navigate to your Kafka folder:
```powershell
cd c:\kafka\kafka_2.13-3.9.1
.\bin\windows\zookeeper-server-start.bat .\config\zookeeper.properties
```

## 2. Start Kafka Broker
Open another terminal:
```powershell
cd c:\kafka\kafka_2.13-3.9.1
.\bin\windows\kafka-server-start.bat .\config\server.properties
```

## 3. Verify Topics (Optional)
Once Kafka is running, you can list the topics created by the application:
```powershell
cd c:\kafka\kafka_2.13-3.9.1
.\bin\windows\kafka-topics.bat --list --bootstrap-server localhost:9092
```

## 4. Run the Backend
```powershell
cd "c:\Research 2 machine algorithm\backend"
python main.py
```

The application is configured to automatically create the following topics:
- `raw_transactions`
- `processed_transactions`
- `self_correction`
