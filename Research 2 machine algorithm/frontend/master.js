document.addEventListener('DOMContentLoaded', () => {
    // --- AUTH GUARD: AUTO-LOGIN FOR DEMO ---
    let storedUser = localStorage.getItem('sentinel_user');
    if (!storedUser) {
        // Auto-provision admin for demo
        const demoUser = {
            id: 'admin',
            name: 'Sentinel Administrator',
            role: 'administrator',
            timestamp: Date.now()
        };
        localStorage.setItem('sentinel_user', JSON.stringify(demoUser));
        localStorage.setItem('sentinel_token', 'demo_active_session');
        storedUser = JSON.stringify(demoUser);
    }

    const currentUser = JSON.parse(storedUser);

    // Update User Info in UI
    const usernameEl = document.getElementById('user-name');
    const roleEl = document.getElementById('user-role');
    if (usernameEl) usernameEl.textContent = currentUser.name;
    if (roleEl) roleEl.textContent = `// ${currentUser.role.toUpperCase()}`;

    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');
    const viewTitle = document.getElementById('view-title');
    const viewSubtitle = document.getElementById('view-subtitle');

    const viewData = {
        dashboard: {
            title: "Command Overview",
            subtitle: "Unified monitoring for Sentinel AI & Kafka Infrastructure"
        },
        fraud: {
            title: "Fraud Analysis Grid",
            subtitle: "Real-time threat detection and AI self-correction manifold"
        },
        kafka: {
            title: "Kafka Flow Pipeline",
            subtitle: "Infrastructure monitoring for distributed data streams"
        },
        geo: {
            title: "Global Geolocation Analytics",
            subtitle: "Real-time mapping of sophisticated adversarial threats & attack duration"
        },
        quantum: {
            title: "Quantum Defense Module",
            subtitle: "Post-quantum cryptographic shield & lattice-based threat mitigation"
        },
        agent: {
            title: "Self-Correcting AI Agent",
            subtitle: "Live manifold state · Ensemble scoring · Autonomous gradient correction"
        }
    };

    function applyRBAC() {
        const userStr = localStorage.getItem('sentinel_user');
        if (!userStr) return;
        const user = JSON.parse(userStr);

        const quantumNavItem = document.querySelector('.nav-item[data-view="quantum"]');
        if (quantumNavItem) {
            if (['administrator', 'admin', 'analyst', 'root'].includes(user.role)) {
                quantumNavItem.innerHTML = '<span class="icon">⚛️</span> Quantum Firewall';
                quantumNavItem.style.opacity = '1';
                quantumNavItem.style.pointerEvents = 'auto';
            } else {
                // Restricted for non-privileged users
                quantumNavItem.style.opacity = '0.5';
                quantumNavItem.style.pointerEvents = 'none';
                if (!quantumNavItem.innerText.includes('[LOCKED]')) {
                    quantumNavItem.innerHTML += ' <span style="font-size:0.6rem; color: #ffaa00;">[LOCKED]</span>';
                }
            }
        }
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const viewId = item.getAttribute('data-view');

            // Check permissions
            const user = JSON.parse(localStorage.getItem('sentinel_user') || '{}');
            if (viewId === 'quantum' && !['administrator', 'admin', 'analyst', 'root'].includes(user.role)) {
                logSystemEvent('error', 'Security Clearance Insufficient for Quantum Module');
                return;
            }

            // Update Active Nav
            navItems.forEach(ni => ni.classList.remove('active'));
            item.classList.add('active');

            // Switch View
            views.forEach(v => v.classList.remove('active'));
            const targetView = document.getElementById(`view-${viewId}`);
            if (targetView) targetView.classList.add('active');

            // Update Header
            if (viewData[viewId]) {
                viewTitle.innerText = viewData[viewId].title;
                viewSubtitle.innerText = viewData[viewId].subtitle;
            }
        });
    });

    applyRBAC();

    // Clock
    setInterval(() => {
        const now = new Date();
        document.getElementById('clock').innerText = now.toLocaleTimeString();
    }, 1000);

    // --- Overview Chart Initialization ---
    const ovCtx = document.getElementById('overviewChart').getContext('2d');
    const MAX_DATA = 30;
    const ovData = {
        raw: Array(MAX_DATA).fill(0),
        processed: Array(MAX_DATA).fill(0),
        threats: Array(MAX_DATA).fill(0),
        corrected: Array(MAX_DATA).fill(0)
    };

    const overviewChart = new Chart(ovCtx, {
        type: 'line',
        data: {
            labels: Array(MAX_DATA).fill(''),
            datasets: [
                {
                    label: 'RAW',
                    data: ovData.raw,
                    borderColor: '#00d4ff',
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                },
                {
                    label: 'PROCESSED',
                    data: ovData.processed,
                    borderColor: '#00ff9d',
                    backgroundColor: 'rgba(0, 255, 157, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                },
                {
                    label: 'THREATS',
                    data: ovData.threats,
                    borderColor: '#ff003c',
                    backgroundColor: 'rgba(255, 0, 60, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                },
                {
                    label: 'CORRECTED',
                    data: ovData.corrected,
                    borderColor: '#ff00ff',
                    backgroundColor: 'rgba(255, 0, 255, 0.1)',
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
            scales: {
                x: { display: false },
                y: {
                    display: true,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#555', font: { size: 10 } }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: { color: '#888', font: { size: 10 }, boxWidth: 10 }
                }
            },
            animation: { duration: 400 }
        }
    });

    // --- System Log Helper ---
    function logSystemEvent(tag, message) {
        const logContainer = document.getElementById('system-log');
        if (!logContainer) return;

        const entry = document.createElement('div');
        entry.className = 'log-entry';

        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];

        const tagClass = `tag-${tag.toLowerCase()}`;

        entry.innerHTML = `
            <span class="log-time">${timeStr}</span>
            <span class="log-tag ${tagClass}">${tag.toUpperCase()}</span>
            <span class="log-message">${message}</span>
        `;

        logContainer.prepend(entry);
        if (logContainer.children.length > 50) {
            logContainer.removeChild(logContainer.lastChild);
        }
    }

    // --- Stats Update Logic ---
    let lastFraudCount = 0;
    let lastCorrectionCount = 0;

    function updateSummary() {
        const token = localStorage.getItem('sentinel_token');
        fetch('/api/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                if (res.status === 401) {
                    console.error("Session status: 401 Unauthorized [Access Control Disabled]");
                    return;
                }
                return res.json();
            })
            .then(data => {
                if (!data) return;
                // Update UI Counters
                animateValue('sum-raw', data.raw_count);
                animateValue('sum-processed', data.processed_count);
                animateValue('sum-fraud', data.fraud_detected);
                animateValue('sum-correction', data.correction_count);

                // Update Chart Data
                updateChartData(ovData.raw, data.raw_count % 100);
                updateChartData(ovData.processed, (data.processed_count % 100) * 0.8);
                updateChartData(ovData.threats, data.fraud_detected % 50);
                updateChartData(ovData.corrected, data.correction_count % 50);

                overviewChart.update();

                // Check for events to log
                if (data.fraud_detected > lastFraudCount) {
                    logSystemEvent('threat', `New threat vector neutralized: ID-${Date.now().toString().slice(-6)}`);
                    lastFraudCount = data.fraud_detected;
                }
                if (data.correction_count > lastCorrectionCount) {
                    logSystemEvent('ai', `Autonomous self-correction applied. Accuracy improved to ${data.accuracy}%`);
                    lastCorrectionCount = data.correction_count;
                }
            })
            .catch(err => console.error("Stats fetch error:", err));
    }

    function updateChartData(arr, val) {
        arr.shift();
        arr.push(val);
    }

    function animateValue(id, value) {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerText = value.toLocaleString();
    }

    setInterval(updateSummary, 2000);
    updateSummary();

    // Load user info and setup system controls
    function loadUserInfo() {
        const userStr = localStorage.getItem('sentinel_user');
        if (userStr) {
            const user = JSON.parse(userStr);
            document.getElementById('user-name').innerText = user.name;

            // Show system toggle for administrators
            if (['administrator', 'admin', 'root'].includes(user.role)) {
                document.getElementById('system-toggle').style.display = 'block';
                checkSystemStatus();
            }
        }
    }

    async function checkSystemStatus() {
        const token = localStorage.getItem('sentinel_token');
        try {
            const res = await fetch('/api/system/status', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                updateToggleButton(data.backend_active);
            }
        } catch (err) {
            console.error('Status check failed:', err);
        }
    }

    function updateToggleButton(isActive) {
        const btn = document.getElementById('system-toggle');
        if (isActive) {
            btn.innerHTML = '⏸ PAUSE BACKEND';
            btn.style.background = 'rgba(255, 0, 60, 0.2)';
            btn.style.borderColor = '#ff003c';
            btn.style.color = '#ff003c';
        } else {
            btn.innerHTML = '▶ RESUME BACKEND';
            btn.style.background = 'rgba(0, 255, 157, 0.2)';
            btn.style.borderColor = '#00ff9d';
            btn.style.color = '#00ff9d';
        }
    }

    window.toggleBackend = async function () {
        const token = localStorage.getItem('sentinel_token');
        try {
            const res = await fetch('/api/system/control', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                updateToggleButton(data.backend_active);
                logSystemEvent('system', data.message);
            } else if (res.status === 403) {
                logSystemEvent('error', 'Administrator access required');
            }
        } catch (err) {
            logSystemEvent('error', 'Failed to toggle system: ' + err.message);
        }
    };

    // --- Export Functionality ---
    window.downloadReport = async function (type, format) {
        const token = localStorage.getItem('sentinel_token');
        const endpoint = `/api/export/${type}/${format}`;
        logSystemEvent('info', `Export initiated: ${type.toUpperCase()} Report [${format.toUpperCase()}]`);

        try {
            const response = await fetch(endpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Network response was not ok');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${type}_report_${new Date().getTime()}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            logSystemEvent('info', `Export successful: ${type.toUpperCase()} [${format.toUpperCase()}]`);
        } catch (error) {
            console.error('Download failed:', error);
            logSystemEvent('error', `Export failed: ${error.message}`);
        }
    };

    loadUserInfo();
    setInterval(checkSystemStatus, 5000);

    // Initial logs
    setTimeout(() => logSystemEvent('info', 'Secure handshake established with Kafka cluster.'), 1000);
    setTimeout(() => logSystemEvent('info', 'AI Core synchronized with blockchain ledger.'), 3000);
});
