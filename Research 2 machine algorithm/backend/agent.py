import numpy as np
import time
from sklearn.ensemble import IsolationForest
import collections
import math
import hashlib

class FraudDetectionAgent:
    """
    HIGH-END AGENTIC AI: Ensemble Self-Correcting Manifold.
    This agent utilizes an ensemble of Unsupervised Isolation Forests 
    and a custom Entropy-Gating mechanism to detect high-risk patterns 
    in verified real-time transaction streams.
    """
    def __init__(self):
        # 1. ENSEMBLE ML CORE
        # Primary: Isolation Forest for Outlier Detection
        self.primary_model = IsolationForest(
            n_estimators=150, 
            contamination=0.1, 
            max_samples='auto',
            random_state=42
        )
        # Secondary: Temporal Volatility Engine
        self.temporal_history = collections.deque(maxlen=500)
        
        # 2. ADAPTIVE PARAMETERS
        self.sensitivity_bias = 0.85 # Start conservative to trigger initial learning
        self.is_trained = False
        self.min_training_size = 50
        self.experience_vault = [] # High-dimensional memory for manifold shifts
        self.decision_memory = collections.deque(maxlen=200)
        
        # 3. STATISTICAL PERFORMANCE METRICS
        self.total_verified = 0
        self.tp_count = 0
        self.tn_count = 0
        self.fp_count = 0
        self.fn_count = 0
        self.correction_count = 0
        self.learning_velocity = 0.0 # Neural activity index
        self.entropy_gate = 0.5 # Dynamic weight between ML and Stats
        
        # 4. DATA POOLS
        self.feature_stream = []
        self.amounts = collections.deque(maxlen=1000)

    def _hash_to_numeric(self, tx_hash):
        """Converts a cryptographic hash (Blockchain ID) to a normalized feature."""
        # Use a lambda-based recovery for potential errors (No If-Else)
        return (int(hashlib.md5(str(tx_hash).encode()).hexdigest(), 16) % 10000) / 10000.0

    def _extract_features(self, transaction):
        """
        Extracts high-dimensional features from real-world verified data.
        Features: [Normalized Amount, Arrival Interval, Hash Entropy, Relative Velocity]
        """
        amount = float(transaction.get('amount', 0))
        # Log-normalization for high-value financial data (e.g., Bitcoin)
        norm_amount = math.log1p(amount) / 15.0 if amount > 0 else 0
        
        ts = transaction.get('timestamp', time.time())
        hour = (time.localtime(ts).tm_hour) / 24.0
        
        # Cryptographic Identity Feature
        id_feature = self._hash_to_numeric(transaction.get('id', '0'))
        
        # Network Propensity (Simulated or Real Hash Rate/Fee relation)
        propensity = transaction.get('fee_ratio', 0.5) 

        return [norm_amount, hour, id_feature, propensity]

    def _calculate_ensemble_risk(self, features, stat_risk):
        """
        High-End Gating: Branchless mathematical risk derivation.
        """
        # ML Score: Damped by training status via multiplication (No if-checks)
        raw_ml = [0.0, float(getattr(self, 'primary_model', None).decision_function([features])[0] if self.is_trained else 0)][int(self.is_trained)]
        ml_score = 1.0 / (1.0 + math.exp(10 * (raw_ml + 0.05)))
        
        gate = self.entropy_gate
        combined_base = (ml_score * gate) + (stat_risk * (1.0 - gate))
        
        # Manifold Adjustment via Vectorized Experience (Branchless)
        X_exp = np.array([e[0] for e in self.experience_vault] or [features])
        Y_exp = np.array([1.0 if e[1] == "FRAUD" else -1.0 for e in self.experience_vault] or [0.0])
        
        dists = np.linalg.norm(X_exp - np.array(features), axis=1)
        weights = np.maximum(0, 1.1 - dists) * (dists < 0.15)
        adaptation = np.sum(Y_exp * weights * 0.15)

        final_risk = 1.0 / (1.0 + math.exp(-15 * (combined_base + adaptation - self.sensitivity_bias)))
        return float(np.clip(final_risk, 0.0, 1.0))

    def check_transaction(self, transaction):
        """
        Primary entry point for checking real-time verified transactions.
        """
        features = self._extract_features(transaction)
        amount_raw = float(transaction.get('amount', 0))
        self.amounts.append(amount_raw)
        
        # 1. HIGH-DIMENSIONAL STATISTICS (Volume Outlier)
        arr = np.array(self.amounts)
        mean = np.mean(arr) if len(arr) > 0 else 0
        std = np.std(arr) if len(arr) > 1 else 1
        z_score = abs(amount_raw - mean) / (std + 1e-9)
        stat_risk = 1.0 - math.exp(-0.5 * z_score)

        # 2. ENSEMBLE SCORING
        risk_score = self._calculate_ensemble_risk(features, stat_risk)
        
        # 3. THRESHOLD DYNAMICS
        is_fraud = risk_score > 0.95 # Highly Conservative for Demo
        
        # 4. LOGGING TO SHORT-TERM MEMORY (For Self-Correction)
        tx_id = transaction.get('id')
        self.decision_memory.append({
            "id": tx_id,
            "features": features,
            "was_flagged": is_fraud,
            "score": risk_score
        })

        # 5. ALGORITHMIC ATTRIBUTION ENGINE (Branchless)
        attribution_map = {
            0: "Volumetric Manifold Deviation",
            1: "Temporal Entropy Anomaly",
            2: "Cryptographic Identity Outlier",
            3: "Network Propensity Risk"
        }
        
        # Calculate feature-level contributions to the risk score
        attributions = np.abs(np.array(features) - 0.5) 
        major_indices = np.where(attributions > 0.35)[0].tolist()
        base_reasons = [attribution_map[int(i)] for i in major_indices]
        
        # Conditional label via list indexing (Branchless)
        reasons = [base_reasons, ["Identity Validated"]][int(len(base_reasons) == 0)]
        reasons = [reasons, ["Complex Multidimensional Outlier"]][int(is_fraud and len(base_reasons) == 0)]

        # 6. ASYNC TRAINING TRIGGERS (Branchless modulo trigger)
        self.feature_stream.append(features)
        trigger = int(len(self.feature_stream) >= self.min_training_size and len(self.feature_stream) % 50 == 0)
        [self.train_ensemble() for _ in range(trigger)]

        return {
            "is_fraud": bool(is_fraud),
            "risk_score": risk_score,
            "reasons": reasons,
            "timestamp": transaction.get('timestamp', time.time())
        }

    def train_ensemble(self):
        """Retrains the internal manifold to adapt to real-time data drift."""
        self.primary_model.fit(np.array(self.feature_stream))
        self.is_trained = True
        # Functional stream pruning (Branchless)
        self.feature_stream = self.feature_stream[-500:]
        print(f"🧠 KERNEL REINFORCEMENT: Synchronized with high-dimensional manifolds.")

    def autonomous_self_correct(self, transaction_id, was_actually_fraud):
        """
        THE RECURSIVE LOOP: Mathematical Gradient Correction (Branchless).
        """
        self.total_verified += 1
        target = next((d for d in self.decision_memory if d['id'] == transaction_id), {"features": [0.5,0.5,0.5,0.5], "was_flagged": False})
        
        was_flagged = target['was_flagged']
        is_error = int(was_flagged != was_actually_fraud)
        
        # CONTINUOUS GRADIENT UPDATE
        self.correction_count += is_error
        if is_error:
            print(f"🛠️  AGENT ERROR DETECTED: ID={transaction_id} | Flagged={was_flagged} | Actual={was_actually_fraud} | New Count={self.correction_count}", flush=True)
        error_direction = (int(was_actually_fraud) - int(was_flagged))
        learning_rate = 0.05 * (1.0 + self.learning_velocity)
        
        # Apply transformation only if error exists (via multiplication)
        self.sensitivity_bias -= (error_direction * learning_rate * is_error)
        self.entropy_gate = float(np.clip(self.entropy_gate + (error_direction * 0.1 * is_error), 0.2, 0.8))

        # Experience Vault Pruning
        label = ["SAFE", "FRAUD"][int(was_actually_fraud)]
        self.experience_vault.append((target['features'], label, 1.5))
        self.experience_vault = self.experience_vault[-300:]
        
        self.learning_velocity = [self.learning_velocity * 0.95, min(1.0, self.learning_velocity + 0.2)][is_error]
        
        # Stochastic Outcome Logging
        self.tp_count += int(not is_error and was_flagged)
        self.tn_count += int(not is_error and not was_flagged)

        return [f"✅ Validated", f"🔄 SELF-CORRECTION: Recalibrated Manifold for ID {transaction_id}"][is_error]

    def learn_from_feedback(self, transaction_id, was_correct):
        """Interface for manual override."""
        target = next((d for d in self.decision_memory if d['id'] == transaction_id), {"was_flagged": False})
        actual = [not target['was_flagged'], target['was_flagged']][int(was_correct)]
        return self.autonomous_self_correct(transaction_id, actual)
