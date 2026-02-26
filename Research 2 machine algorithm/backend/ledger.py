import hashlib
import json
import time

class QuantumSafeLog:
    """
    Simulates a tamper-evident, quantum-safe ledger using a cryptographic hash chain.
    Each entry is linked to the previous one, making it immutable.
    """
    def __init__(self):
        self.chain = []
        # Genesis block
        self.add_entry({"event": "SYSTEM_INIT", "timestamp": time.time()})

    def calculate_hash(self, data, previous_hash):
        """
        Creates a SHA-256 hash of the data + previous hash.
        In a real post-quantum scenario, this would use a PQC algorithm (e.g., XMSS or SPHINCS+).
        """
        payload = json.dumps(data, sort_keys=True) + str(previous_hash)
        return hashlib.sha256(payload.encode()).hexdigest()

    def add_entry(self, data):
        previous_hash = "0" if len(self.chain) == 0 else self.chain[-1]['hash']
        entry_hash = self.calculate_hash(data, previous_hash)
        
        entry = {
            "index": len(self.chain),
            "timestamp": time.time(),
            "data": data,
            "previous_hash": previous_hash,
            "hash": entry_hash
        }
        self.chain.append(entry)
        return entry

    def get_logs(self):
        return self.chain

    def verify_integrity(self):
        """
        Verifies the chain integrity by recomputing hashes.
        Returns True if valid, False if tampered.
        """
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            previous = self.chain[i-1]
            
            if current['previous_hash'] != previous['hash']:
                return False
                
            recalc_hash = self.calculate_hash(current['data'], current['previous_hash'])
            if recalc_hash != current['hash']:
                return False
                
        return True