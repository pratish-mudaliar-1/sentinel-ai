
import time
import networkx as nx
import statistics
from collections import deque

class GraphSentinel:
    """
    Graph-Based Detection System for Sentinel.
    Detects structural patterns like Funnel Attacks (Laundering) 
    that single-transaction models (Isolation Forest) miss.
    """
    def __init__(self, time_window=120):
        # Time window in seconds (2 minutes default)
        self.time_window = time_window
        self.graph = nx.DiGraph()
        self.transactions = deque() # Store (timestamp, tx_data)
        
        # Hyperparameters for Funnel Detection
        self.funnel_threshold = 15 # Number of distinct sources
        self.amount_variance_threshold = 50.0 # Variance in amounts
        self.target_wallet = None
    
    def add_transaction(self, tx):
        """
        Ingests a transaction and updates the graph.
        Returns detection result if a pattern is found.
        """
        current_time = time.time()
        
        # extract data
        src = tx.get('source', 'unknown_src')
        dst = tx.get('destination', 'unknown_dst') # We ensure main.py adds this
        amt = tx.get('amount', 0)
        tx_id = tx.get('id', 'unknown_id')
        
        # Add to history and graph
        self.transactions.append((current_time, tx))
        self.graph.add_edge(src, dst, amount=amt, id=tx_id, timestamp=current_time)
        
        # Prune old transactions
        self._prune_graph(current_time)
        
        # Detect patterns
        return self._detect_funnel_attack(dst)

    def _prune_graph(self, current_time):
        """Remove transactions older than the time window."""
        while self.transactions:
            ts, tx = self.transactions[0]
            if current_time - ts > self.time_window:
                self.transactions.popleft()
                src = tx.get('source')
                dst = tx.get('destination')
                try:
                    self.graph.remove_edge(src, dst)
                    # Clean up isolated nodes to save memory
                    if self.graph.degree(src) == 0: self.graph.remove_node(src)
                    if self.graph.degree(dst) == 0: self.graph.remove_node(dst)
                except nx.NetworkXError:
                    pass # Edge might have been removed already
            else:
                break
                
    def _detect_funnel_attack(self, target_node):
        """
        Checks if the target_node is the recipient of a funnel attack.
        Conditions:
        - Many wallets (> threshold) sending to ONE wallet.
        - Amounts are small and similar.
        """
        try:
            in_edges = list(self.graph.in_edges(target_node, data=True))
        except nx.NetworkXError:
            return None
            
        if len(in_edges) < self.funnel_threshold:
            return None
            
        # Extract amounts
        amounts = [data['amount'] for _, _, data in in_edges]
        
        # calculate stats
        if not amounts:
            return None
            
        mean_amt = statistics.mean(amounts)
        try:
            stdev_amt = statistics.stdev(amounts)
        except statistics.StatisticsError:
            stdev_amt = 0
            
        # Check patterns
        # 1. High in-degree (already checked)
        # 2. Similar amounts (low variance relative to mean, or just low absolute variance for "structuring")
        # 3. Small amounts (optional, but typical for laundering)
        
        is_suspicious_variance = stdev_amt < (mean_amt * 0.2) # Std deviation within 20% of mean (very similar amounts)
        is_suspicious_count = len(in_edges) >= self.funnel_threshold
        
        if is_suspicious_count and is_suspicious_variance:
            return {
                "type": "FUNNEL_ATTACK",
                "target": target_node,
                "source_count": len(in_edges),
                "avg_amount": mean_amt,
                "timestamp": time.time(),
                "risk_score": 0.95,
                "description": f"Detected {len(in_edges)} sources funneling similar amounts (avg ${mean_amt:.2f}) to {target_node}"
            }
            
        return None
