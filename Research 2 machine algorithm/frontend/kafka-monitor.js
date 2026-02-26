// Kafka Monitor JavaScript
const MAX_DATA_POINTS = 30;

// Initialize Charts
const chartConfig = {
    type: 'line',
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: {
            x: { display: false },
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: '#888', font: { size: 10 } }
            }
        },
        plugins: {
            legend: { display: false }
        }
    }
};

// Mini charts for each topic
const rawChartData = Array(MAX_DATA_POINTS).fill(0);
const processedChartData = Array(MAX_DATA_POINTS).fill(0);
const correctionChartData = Array(MAX_DATA_POINTS).fill(0);

const rawChart = new Chart(document.getElementById('rawChart').getContext('2d'), {
    ...chartConfig,
    data: {
        labels: Array(MAX_DATA_POINTS).fill(''),
        datasets: [{
            data: rawChartData,
            borderColor: '#ffd700',
            backgroundColor: 'rgba(255, 215, 0, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0
        }]
    }
});

const processedChart = new Chart(document.getElementById('processedChart').getContext('2d'), {
    ...chartConfig,
    data: {
        labels: Array(MAX_DATA_POINTS).fill(''),
        datasets: [{
            data: processedChartData,
            borderColor: '#00ff9d',
            backgroundColor: 'rgba(0, 255, 157, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0
        }]
    }
});

const correctionChart = new Chart(document.getElementById('correctionChart').getContext('2d'), {
    ...chartConfig,
    data: {
        labels: Array(MAX_DATA_POINTS).fill(''),
        datasets: [{
            data: correctionChartData,
            borderColor: '#00f2ff',
            backgroundColor: 'rgba(0, 242, 255, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0
        }]
    }
});

// Throughput Chart (Combined)
const throughputData = {
    raw: Array(MAX_DATA_POINTS).fill(0),
    processed: Array(MAX_DATA_POINTS).fill(0),
    fraud: Array(MAX_DATA_POINTS).fill(0),
    correction: Array(MAX_DATA_POINTS).fill(0)
};

const throughputChart = new Chart(document.getElementById('throughputChart').getContext('2d'), {
    type: 'line',
    data: {
        labels: Array(MAX_DATA_POINTS).fill(''),
        datasets: [
            {
                label: 'Raw Transactions',
                data: throughputData.raw,
                borderColor: '#00d4ff', // Cyan
                backgroundColor: 'rgba(0, 212, 255, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 0
            },
            {
                label: 'Processed',
                data: throughputData.processed,
                borderColor: '#00ff9d', // Green
                backgroundColor: 'rgba(0, 255, 157, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 0
            },
            {
                label: 'Threats Detected',
                data: throughputData.fraud,
                borderColor: '#ff003c', // Red
                backgroundColor: 'rgba(255, 0, 60, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 0
            },
            {
                label: 'Corrected',
                data: throughputData.correction,
                borderColor: '#ff00ff', // Magenta
                backgroundColor: 'rgba(255, 0, 255, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 500
        },
        interaction: {
            intersect: false,
            mode: 'index'
        },
        scales: {
            x: { display: false },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                    drawBorder: false
                },
                ticks: {
                    color: '#888',
                    font: { size: 11 }
                }
            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    color: '#ccc',
                    font: { family: "'Outfit', sans-serif", size: 12 },
                    usePointStyle: true,
                    padding: 20
                }
            },
            tooltip: {
                backgroundColor: 'rgba(10, 10, 20, 0.9)',
                titleFont: { size: 13 },
                bodyFont: { size: 12 },
                padding: 12,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1
            }
        }
    }
});

// WebSocket Connection
const socket = new WebSocket(`ws://${window.location.host}/ws/kafka-metrics`);

socket.onopen = () => {
    console.log('Kafka metrics WebSocket connected');
    updateClusterStatus('CONNECTED', true);
};

socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    updateClusterStatus('ERROR', false);
};

socket.onclose = () => {
    console.log('WebSocket disconnected');
    updateClusterStatus('DISCONNECTED', false);
    // Attempt reconnection after 3 seconds
    setTimeout(() => {
        window.location.reload();
    }, 3000);
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    updateMetrics(data);
};

// Update cluster status
function updateClusterStatus(status, isConnected) {
    // Hidden status update
    console.log(`Cluster Status: ${status}`);
}

// Update all metrics
function updateMetrics(data) {
    const topics = data.topics;

    // Update raw_transactions
    if (topics.raw_transactions) {
        updateTopicMetrics('raw', topics.raw_transactions);
        updateChart(rawChartData, rawChart, topics.raw_transactions.rate);
        updateThroughput('raw', topics.raw_transactions.rate);
    }

    // Update processed_transactions
    if (topics.processed_transactions) {
        updateTopicMetrics('processed', topics.processed_transactions);
        updateChart(processedChartData, processedChart, topics.processed_transactions.rate);
        updateThroughput('processed', topics.processed_transactions.rate);
    }

    // Update self_correction
    if (topics.self_correction) {
        updateTopicMetrics('correction', topics.self_correction);
        updateChart(correctionChartData, correctionChart, topics.self_correction.rate);
        updateThroughput('correction', topics.self_correction.rate);
    }

    // Update fraud_detected throughput
    if (topics.fraud_detected) {
        updateThroughput('fraud', topics.fraud_detected.rate);
    }

    // Update throughput chart
    throughputChart.update();

    // Update Header
    document.getElementById('hdr-raw').textContent = topics.raw_transactions.count;
    document.getElementById('hdr-processed').textContent = topics.processed_transactions.count;
    document.getElementById('hdr-fraud').textContent = topics.fraud_detected.count;
    document.getElementById('hdr-correction').textContent = topics.self_correction.count;

    // Animate flow particles based on activity
    animateFlowParticles(topics);
}

// Update individual topic metrics
function updateTopicMetrics(prefix, metrics) {
    const countEl = document.getElementById(`${prefix}-count`);
    const rateEl = document.getElementById(`${prefix}-rate`);
    const totalEl = document.getElementById(`${prefix}-total`);

    if (countEl) countEl.textContent = metrics.count;
    if (rateEl) rateEl.textContent = `${metrics.rate.toFixed(1)}/s`;
    if (totalEl) totalEl.textContent = metrics.count;
}

// Update chart data
function updateChart(dataArray, chart, newValue) {
    dataArray.shift();
    dataArray.push(newValue);
    chart.update();
}

// Update throughput data
function updateThroughput(topic, rate) {
    throughputData[topic].shift();
    throughputData[topic].push(rate);
}

// Animate flow particles based on message rate
function animateFlowParticles(topics) {
    // Speed up animations if there's high throughput
    const rawRate = topics.raw_transactions?.rate || 0;
    const processedRate = topics.processed_transactions?.rate || 0;
    const correctionRate = topics.self_correction?.rate || 0;

    // Adjust animation speed based on rate
    adjustParticleSpeed('flow-1', rawRate);
    adjustParticleSpeed('flow-2', rawRate);
    adjustParticleSpeed('flow-3', processedRate);
    adjustParticleSpeed('flow-4', processedRate);
    adjustParticleSpeed('flow-5', correctionRate);
    adjustParticleSpeed('flow-6', correctionRate);
}

function adjustParticleSpeed(particleId, rate) {
    const particle = document.getElementById(particleId);
    if (!particle) return;

    // Base duration is 3s, speed up with higher rates
    let duration = 3;
    if (rate > 10) duration = 1.5;
    else if (rate > 5) duration = 2;
    else if (rate > 1) duration = 2.5;

    particle.style.animationDuration = `${duration}s`;

    // Add glow effect for high activity
    if (rate > 5) {
        particle.style.boxShadow = '0 0 20px rgba(0, 242, 255, 0.8)';
        particle.style.width = '10px';
        particle.style.height = '10px';
    } else {
        particle.style.boxShadow = '0 0 10px rgba(0, 242, 255, 0.3)';
        particle.style.width = '8px';
        particle.style.height = '8px';
    }
}

// Fetch initial stats
async function fetchInitialStats() {
    try {
        const response = await fetch('/api/kafka/stats');
        const data = await response.json();

        // Update cluster status
        updateClusterStatus(
            data.cluster_status === 'connected' ? 'CONNECTED' : 'DISCONNECTED',
            data.cluster_status === 'connected'
        );

        // Update consumer group status
        updateConsumerGroups(data.consumer_groups);
    } catch (error) {
        console.error('Failed to fetch initial stats:', error);
    }
}

function updateConsumerGroups(groups) {
    // Consumer groups are already displayed in HTML
    // This function can be extended to show dynamic status
    console.log('Consumer groups:', groups);
}

// Initialize
fetchInitialStats();

// Periodic stats refresh (backup to WebSocket)
setInterval(fetchInitialStats, 10000);
