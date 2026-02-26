// Real-time Graph Setup
const ctx = document.getElementById('fraudChart').getContext('2d');
const MAX_DATA_POINTS = 30;
const labels = Array(MAX_DATA_POINTS).fill('');
const allowedIntensity = Array(MAX_DATA_POINTS).fill(0);
const blockedIntensity = Array(MAX_DATA_POINTS).fill(0);

const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: labels,
        datasets: [
            {
                label: 'Verified Traffic',
                data: allowedIntensity,
                backgroundColor: 'rgba(0, 242, 255, 0.1)',
                borderColor: '#00f2ff',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0
            },
            {
                label: 'Threat Spikes',
                data: blockedIntensity,
                backgroundColor: 'rgba(255, 0, 60, 0.2)',
                borderColor: '#ff003c',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        interaction: { intersect: false },
        scales: {
            x: { display: false },
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { display: false }
            }
        },
        plugins: {
            legend: {
                display: true,
                labels: { color: '#888', font: { family: "'Courier New', monospace" } }
            }
        }
    }
});

// AI Manifold Chart (Sensitivity Bias over time)
const mCtx = document.getElementById('manifoldChart').getContext('2d');
const manifoldData = Array(MAX_DATA_POINTS).fill(0.5);
const manifoldChart = new Chart(mCtx, {
    type: 'line',
    data: {
        labels: labels,
        datasets: [{
            label: 'Decision Manifold (Bias)',
            data: manifoldData,
            borderColor: '#00ff9d',
            backgroundColor: 'rgba(0, 255, 157, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.1,
            pointRadius: 0
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: {
            x: { display: false },
            y: { min: 0.2, max: 0.8, ticks: { color: '#444' }, grid: { color: '#111' } }
        },
        plugins: { legend: { display: false } }
    }
});

// Connection
const socket = new WebSocket(`ws://${window.location.host}/ws/transactions`);
let blockedCount = 0;
let totalCount = 0;
let correctedCount = 0;
let displayedCorrectedCount = 0;

socket.onmessage = function (event) {
    const message = JSON.parse(event.data);

    if (message.type === 'new_transaction') {
        const payload = message.data;
        triggerAgenticCycle(['step-observe', 'step-decide', 'step-act']);
        handleNewTransaction(payload.data, payload.hash);
        updateLedger(payload);
        updateGraph(payload.data.is_fraud);
    }
    else if (message.type === 'agent_update') {
        if (message.message.includes('SELF-CORRECTION')) {
            triggerAgenticCycle(['step-learn']);
            animateCorrectionHubAction(message.message);
        }
        handleAgentUpdate(message.message);
    }
};

function animateCorrectionHubAction(msg) {
    const flowOutcome = document.getElementById('flow-outcome');
    const flowRefine = document.getElementById('flow-refine');

    const details = msg.split(':')[1] || "Drift detected";

    flowOutcome.querySelector('p').innerText = "Analyzing outcome for: " + details;
    flowOutcome.classList.add('active');

    setTimeout(() => {
        flowOutcome.classList.remove('active');
        flowRefine.querySelector('p').innerText = "Manifold bias recalibrated.";
        flowRefine.classList.add('active');
        setTimeout(() => {
            flowRefine.classList.remove('active');
            flowOutcome.querySelector('p').innerText = "Monitoring outcome drifts...";
            flowRefine.querySelector('p').innerText = "Recalibrating bias points...";
        }, 3000);
    }, 2000);
}

function triggerAgenticCycle(steps) {
    steps.forEach((stepId, index) => {
        setTimeout(() => {
            const el = document.getElementById(stepId);
            if (el) {
                el.classList.add('active');
                setTimeout(() => el.classList.remove('active'), 800);
            }
        }, index * 200);
    });
}

function handleAgentUpdate(text) {
    const log = document.getElementById('ai-correction-log');
    const event = document.createElement('div');
    event.className = 'correction-event';

    if (text.includes('SELF-CORRECTION')) {
        event.innerHTML = `<span style="color: #00ff9d; font-weight: bold">>> ${text}</span>`;
    } else {
        event.innerText = `> ${text}`;
    }

    log.prepend(event);
    if (log.children.length > 50) log.lastChild.remove();
}

function updateStats() {
    fetch('/api/stats')
        .then(res => res.json())
        .then(data => {
            document.getElementById('ai-bias').innerText = data.detection_bias.toFixed(2);
            document.getElementById('ai-error').innerText = data.learning_velocity.toFixed(3);

            // 4 Core Stats Sync
            document.getElementById('raw-count-val').innerText = data.raw_count.toString().padStart(4, '0');
            document.getElementById('processed-count-val').innerText = data.processed_count.toString().padStart(4, '0');
            document.getElementById('fraud-count-val').innerText = data.fraud_detected.toString().padStart(4, '0');
            document.getElementById('corrected-count-val').innerText = data.correction_count.toString().padStart(4, '0');

            // Header Sync (if exists)
            const countEl = document.getElementById('corrected-count');
            if (countEl) countEl.innerText = data.correction_count;

            document.getElementById('live-accuracy').innerText = data.accuracy + '%';

            document.getElementById('bias-fill').style.width = (data.detection_bias * 100) + '%';
            document.getElementById('error-fill').style.width = (data.learning_velocity * 100) + '%';

            // Update manifold chart
            manifoldData.shift();
            manifoldData.push(data.detection_bias);
            manifoldChart.update();
        });
}

setInterval(updateStats, 2000);

function updateGraph(isFraud) {
    allowedIntensity.shift();
    blockedIntensity.shift();

    if (isFraud) {
        blockedIntensity.push(rand(70, 100));
        allowedIntensity.push(rand(5, 20));
    } else {
        blockedIntensity.push(rand(0, 10));
        allowedIntensity.push(rand(50, 80));
    }
    chart.update();
}

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function handleNewTransaction(tx, hash) {
    const feed = document.getElementById('transaction-feed');
    const item = document.createElement('div');
    item.className = `transaction-item ${tx.is_fraud ? 'blocked' : ''}`;
    const timeStr = new Date(tx.timestamp * 1000).toLocaleTimeString();

    let statusHtml = tx.is_fraud ? `<span class="block-badge">BLOCKED</span>` : `<span class="allow-badge">ALLOWED</span>`;

    let riskHtml = '';
    if (tx.risk_factors && tx.risk_factors.length > 0) {
        riskHtml = `<div style="font-size: 0.7rem; color: #ff003c; margin-left: 10px;">⚠️ ${tx.risk_factors.join(', ')}</div>`;
    }

    item.innerHTML = `
        <span>${timeStr}</span>
        <span style="color: #00f2ff">${tx.id}</span>
        <span>${tx.source}</span>
        <span style="color: #888">Verified Node</span>
        <span>$${tx.amount.toLocaleString()}</span>
        <span>${statusHtml}</span>
        ${riskHtml ? `<div style="grid-column: 1 / -1; font-size: 0.7rem; color: #ff003c; margin-top: 4px;">⚠️ ${tx.risk_factors.join(', ')}</div>` : ''}
    `;

    feed.prepend(item);
    if (feed.children.length > 20) feed.lastChild.remove();
}

function updateLedger(entry) {
    const chain = document.getElementById('ledger-chain');
    const block = document.createElement('div');
    block.className = 'ledger-block';
    block.innerHTML = `
        <div>BLOCK #${entry.index}</div>
        <div style="font-size: 0.5rem; margin-top: 5px">${entry.hash.substring(0, 10)}...</div>
    `;
    chain.appendChild(block);
    chain.scrollLeft = chain.scrollWidth;
}

socket.onopen = () => {
    const log = document.getElementById('ai-correction-log');
    if (log) log.innerHTML += '<div>> UPLINK ESTABLISHED.</div>';
};

// ========== EXPORT DOWNLOAD FUNCTIONS ==========
async function triggerDownload(endpoint, reportName, format) {
    try {
        showDownloadNotification(reportName, format);
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('Export failed');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportName.replace(/\s+/g, '_')}_${new Date().getTime()}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Download error:', error);
        if (window.parent && window.parent.logSystemEvent) {
            window.parent.logSystemEvent('error', `Export failed: ${error.message}`);
        }
    }
}

function downloadFraudPDF() {
    triggerDownload('/api/export/fraud/pdf', 'Fraud Report PDF', 'pdf');
}

function downloadFraudExcel() {
    triggerDownload('/api/export/fraud/excel', 'Fraud Report Excel', 'excel');
}

function downloadCorrectedPDF() {
    triggerDownload('/api/export/corrected/pdf', 'Corrected Transactions PDF', 'pdf');
}

function downloadCorrectedExcel() {
    triggerDownload('/api/export/corrected/excel', 'Corrected Transactions Excel', 'excel');
}

function showDownloadNotification(reportName, format) {
    const log = document.getElementById('ai-correction-log');
    if (log) {
        const event = document.createElement('div');
        event.style.color = '#00ff9d';
        event.style.fontWeight = 'bold';
        event.innerHTML = `>>> EXPORT INITIATED: ${reportName} [${format.toUpperCase()}]`;
        log.prepend(event);
        if (log.children.length > 50) log.lastChild.remove();
    }
}

