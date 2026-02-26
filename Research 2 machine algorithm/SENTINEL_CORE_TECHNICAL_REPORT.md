# Sentinel Core: Technical Documentation & Defense Guide

## 1. Project Overview
**Sentinel Core** is a real-time, autonomous fraud detection system designed to monitor global Bitcoin transactions. Unlike traditional static rule engines, Sentinel Core employs an **Agentic AI** approach: it observes data streams, detects anomalies using unsupervised machine learning (Isolation Forests), acts by flagging suspicious activity, and—crucially—**learns and self-corrects** over time without human intervention.

The system visualizes this process through a high-fidelity "Cyberpunk" dashboard, showcasing the flow of data from the raw Bitcoin mempool through Apache Kafka pipelines to the AI analysis engine.

---

## 2. System Architecture
The application follows a modern **Event-Driven Microservices** architecture (simulated in a monolith for demonstration):

1.  **Data Source**: Global Bitcoin Network (Real-time WebSocket feed).
2.  **Ingestion Layer**: Python Producer that connects to the blockchain and pushes data to **Apache Kafka**.
3.  **Message Broker**: **Apache Kafka** acts as the central nervous system, decoupling data producers from consumers.
    *   `raw_transactions`: Incoming verified ledger data.
    *   `processed_transactions`: Data enriched with AI risk scores.
    *   `self_correction`: Feedback loops for model retraining.
4.  **Intelligence Layer (Backend)**:
    *   **FastAPI**: High-performance Async IO web server.
    *   **AI Agent**: Scikit-Learn based Isolation Forest & Heuristic Engine.
5.  **Visualization Layer (Frontend)**:
    *   Vanilla JavaScript/CSS3 for maximum performance and custom aesthetics.
    *   Real-time WebSockets connecting the browser to the backend.

---

## 3. Tech Stack & Libraries (Deep Dive)
**Judges may ask: "Why did you choose this stack?"**

### **Backend (Python)**
| Library | Purpose | Why this choice? |
| :--- | :--- | :--- |
| **FastAPI** | Web Framework | Unlike Flask/Django, FastAPI is built on **Asynchronous Server Gateway Interface (ASGI)**, allowing handling of thousands of concurrent WebSocket connections (critical for real-time tickers). |
| **Uvicorn** | ASGI Server | Lightning-fast server implementation to run FastAPI. |
| **Scikit-Learn** | Machine Learning | Robust, industry-standard library. specific usage: `IsolationForest` algorithm for high-dimensional outlier detection. |
| **Kafka-Python-ng** | Messaging Client | Connects Python to the Kafka broker. "ng" version used for better support of modern Kafka protocols. |
| **Websockets** | Protocol Client | Used to maintain a persistent connection to the external `blockchain.info` API to fetch live Bitcoin data. |
| **Numpy** | Math Computing | performing vector calculations (Z-scores, standard deviations) much faster than standard Python lists. |

### **Frontend (Web Technologies)**
| Technology | Purpose | Why this choice? |
| :--- | :--- | :--- |
| **Vanilla JS (ES6+)** | Logic | **No Frameworks (React/Vue)** were used to demonstrate raw understanding of the DOM, WebSockets, and event loops. Reduces bloat and maximizes performance. |
| **CSS3 Variables** | Styling | Used for the "Cyberpunk" design system. CSS Grid & Flexbox used for complex layouts without libraries like Bootstrap. |
| **Chart.js** | Visualization | Lightweight Canvas-based charting library. Used for the dynamic "Threat Spikes" and "Manifold Bias" graphs. |

---

## 4. Key Functionalities & Logic

### **A. Real-Time "Ground Truth" Engine**
*   **File**: `backend/main.py` -> `get_real_time_verification`
*   **Concept**: Since we don't have labeled "Fraud" data for live Bitcoin, we use **Heuristic Analysis** as a ground truth proxy.
*   **Logic**:
    1.  **Dust Attacks**: Outputs < 546 satoshis (too small to spend, typically spam/tracking).
    2.  **CoinJoin/Mixers**: Transactions with >5 inputs and >5 outputs (indicative of laundering).
    3.  **Fat Finger/Laundering**: Fees > 200 sat/byte (abnormal economic behavior).

### **B. The AI Agent**
*   **File**: `backend/agent.py` -> `FraudDetectionAgent`
*   **Algorithm**: **Isolation Forest**.
    *   *Why?* It doesn't need "Training Data" of past fraud. It isolates anomalies by randomly splitting data points. "Normal" points take many splits to isolate; "Anomalies" (Fraud) take very few.
*   **Self-Correction**: The agent maintains a `sensitivity_bias`. If it receives feedback (simulated via the "Ground Truth" heuristics) that it missed a fraud, it automatically lowers its detection threshold and re-trains on the missed pattern.

### **C. Kafka Pipeline**
*   The system uses **Topics** to segregate data stages:
    *   `raw -> agent -> processed -> UI`
*   This ensures that if the UI crashes, the AI keeps processing. If the AI is slow, the Producer keeps listening to the Blockchain. This is **Fault Tolerance**.

---

## 5. Potential Judges Questions (Defense Guide)

**Q: Is this real Bitcoin data?**
*   **A:** Yes. The backend connects specifically to `wss://ws.blockchain.info/inv`. The hashes, amounts, and fees you see are happening on the Bitcoin Mainnet right now.

**Q: How does the AI "Self-Correct"?**
*   **A:** The agent compares its own prediction against a "Heuristic Ground Truth" (checks for Dust/Mixers). If the AI says "Safe" but the Heuristics find "Dust", the Agent records a **False Negative**. It then mathematically adjusts its `sensitivity_bias` parameter (e.g., from 0.50 to 0.45) to become more aggressive and adds that transaction to its memory bank for re-training.

**Q: Why use Kafka for a single dashboard?**
*   **A:** To demonstrate scalability. In a real-world banking scenario, you process millions of transactions per second. A simple Python script would crash. Kafka acts as a buffer that can absorb massive spikes in traffic without losing data, allowing the AI to process at its own pace.

**Q: What is the "Manifold Bias" graph?**
*   **A:** It represents the internal decision boundary of the AI. When the line moves up/down, it visualizes the AI *thinking* and adjusting its strictness in real-time based on the errors it made.

