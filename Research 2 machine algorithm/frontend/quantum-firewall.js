/**
 * QUANTUM FIREWALL DEFENSE SYSTEM - PREMIM HUD V9.5
 * Features: Radiation Heatmap, RBAC, Advanced Shield Visuals
 */

// ============================================
// SYSTEM STATE & CONFIG
// ============================================

let ws = null;
let reconnectInterval = null;
let userRole = 'GUEST';
let lastStats = null;

// Heatmap config
const heatPoints = [];
const decayRate = 0.02;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🛡️ Sentinel Quantum UI Initializing...');

    // 1. Check User Permissions (RBAC)
    await checkUserRole();

    // 2. Start Background Particles
    initQuantumBackground();

    // 3. Start Shield Visualizer
    initShieldVisualizer();

    // 4. Start Radiation Heatmap
    initHeatmap();

    // 5. Connect Real-time Stream
    connectWebSocket();

    // 6. Load Static Data
    loadDefenseLayers();

    console.log('✅ Initialization Complete.');
});

// ============================================
// RBAC: USER PERMISSION CONTROL
// ============================================

async function checkUserRole() {
    try {
        const response = await fetch('/api/system/status');
        if (!response.ok) throw new Error('Unauthorized');

        const data = await response.json();
        userRole = data.user.role;
        document.getElementById('currentUserRole').textContent = userRole.toUpperCase();

        // If not admin, reduce accessibility to certain detailed panels
        if (['administrator', 'admin', 'analyst', 'root'].includes(userRole)) {
            // Full access granted
            console.log('🛡️ Authorized Access Granted');
        } else {
            console.warn('⚠️ Restricted Access Mode Active');
            const defensePanel = document.querySelector('.hud-panel:first-child');
            if (defensePanel) {
                defensePanel.style.position = 'relative';
                const lock = document.createElement('div');
                lock.className = 'panel-lock-overlay';
                lock.innerHTML = '<span class="lock-icon">🔒</span><p>ADMIN ONLY</p>';
                defensePanel.appendChild(lock);
            }
        }
    } catch (error) {
        console.error('RBAC Error:', error);
        window.location.href = '/login';
    }
}

// ============================================
// WEBSOCKET: REAL-TIME DATA
// ============================================

function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/quantum-firewall`;

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        console.log('📡 Connected to Quantum Telemetry');
        clearInterval(reconnectInterval);
    };

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'quantum_stats') {
            updateUI(message.data);

            // Trigger threat radiation if under attack
            if (message.data.status === 'UNDER_ATTACK') {
                triggerRadiation(Math.random() * window.innerWidth, Math.random() * window.innerHeight, 1.0);
            }
        }
    };

    ws.onclose = () => {
        console.log('🛰️ Telemetry Lost. Reconnecting...');
        reconnectInterval = setInterval(connectWebSocket, 5000);
    };
}

// ============================================
// UI UPDATES
// ============================================

function updateUI(stats) {
    lastStats = stats;

    // Header Stats
    safeUpdate('resistanceScore', `${stats.quantum_resistance_score}%`);
    safeUpdate('defenseStatus', stats.status === 'UNDER_ATTACK' ? 'UNDER ATTACK' : 'ARMED');

    const statusEl = document.getElementById('defenseStatus');
    if (statusEl) {
        statusEl.className = stats.status === 'UNDER_ATTACK' ? 'value red status-pulse' : 'value green status-pulse';
    }

    // Core Counter Stats
    safeUpdate('totalScans', formatNumber(stats.total_scans));
    safeUpdate('quantumBlocked', formatNumber(stats.quantum_threats_blocked));
    safeUpdate('latticeVerifications', formatNumber(stats.lattice_verifications));

    // Left Panel Stats
    safeUpdate('entropyChecks', stats.entropy_checks);
    safeUpdate('classicalBlocked', stats.classical_threats_blocked);
    safeUpdate('activeLayersCount', stats.defense_layers_active);

    if (stats.last_attack) {
        const date = new Date(stats.last_attack * 1000);
        safeUpdate('lastAttackTime', date.toLocaleTimeString());
    }

    // Threat Status Indicator
    const indicator = document.getElementById('threatIndicator');
    const statusText = document.getElementById('threatStatusText');
    if (indicator && statusText) {
        if (stats.status === 'UNDER_ATTACK') {
            indicator.classList.add('under-attack');
            statusText.textContent = 'THREAT DETECTED';
            // Heavy radiation
            for (let i = 0; i < 3; i++) triggerRadiation(Math.random() * window.innerWidth, Math.random() * window.innerHeight, 0.5);
        } else {
            indicator.classList.remove('under-attack');
            statusText.textContent = 'MONITORING';
        }
    }

    // Recent Threats Feed
    renderThreatFeed(stats.recent_threats);

    // Distribution Chart
    renderChart(stats.threat_distribution);
}

function renderThreatFeed(threats) {
    const container = document.getElementById('threatsContainer');
    if (!container) return;

    if (!threats || threats.length === 0) {
        if (!container.querySelector('.empty-state')) {
            container.innerHTML = '<div class="empty-state"><div class="scan-bar"></div><p>AWAITING SIGNAL...</p></div>';
        }
        return;
    }

    // Render new threats (limit to last 15)
    container.innerHTML = '';
    threats.slice(-15).reverse().forEach(tGroup => {
        tGroup.threats.forEach(t => {
            const item = document.createElement('div');
            item.className = 'threat-item';
            const severityClass = `severity-${t.severity.toLowerCase()}`;

            item.innerHTML = `
                <div class="threat-header">
                    <span class="threat-name">${t.name}</span>
                    <span class="threat-severity ${severityClass}">${t.severity}</span>
                </div>
                <div class="threat-details">
                    <div class="threat-detail"><span class="label">TARGET</span><span class="value">${t.target}</span></div>
                    <div class="threat-detail"><span class="label">ID</span><span class="value">${tGroup.transaction_id.slice(0, 8)}</span></div>
                    <div class="threat-detail"><span class="label">ENTROPY</span><span class="value">${(tGroup.entropy * 100).toFixed(2)}%</span></div>
                    <div class="threat-detail"><span class="label">ACTION</span><span class="value">BLOCKED</span></div>
                </div>
            `;
            container.appendChild(item);
        });
    });
}

// ============================================
// VISUALS: RADIATION HEATMAP
// ============================================

function initHeatmap() {
    const canvas = document.getElementById('heatmapCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = heatPoints.length - 1; i >= 0; i--) {
            const p = heatPoints[i];

            // Draw radial radiation point
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
            const alpha = p.intensity * 0.3;
            grad.addColorStop(0, `rgba(189, 0, 255, ${alpha})`);
            grad.addColorStop(0.5, `rgba(0, 242, 255, ${alpha * 0.4})`);
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();

            // Update
            p.intensity -= decayRate;
            p.radius += 2;

            if (p.intensity <= 0) {
                heatPoints.splice(i, 1);
            }
        }

        requestAnimationFrame(draw);
    }

    draw();
}

function triggerRadiation(x, y, intensity) {
    heatPoints.push({
        x: x,
        y: y,
        radius: 10,
        intensity: intensity
    });
}

// ============================================
// VISUALS: QUANTUM SHIELD (CORE)
// ============================================

function initShieldVisualizer() {
    const canvas = document.getElementById('shieldCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let rotation = 0;

    function draw() {
        const w = canvas.width = canvas.offsetWidth;
        const h = canvas.height = canvas.offsetHeight;
        const cx = w / 2;
        const cy = h / 2;
        const size = Math.min(w, h) / 3;

        ctx.clearRect(0, 0, w, h);

        rotation += 0.005;

        // Lattice Hexagon Pattern
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);

        for (let i = 0; i < 3; i++) {
            const rad = size * (1 - i * 0.2);
            const alpha = 0.4 - i * 0.1;
            drawHex(ctx, 0, 0, rad, alpha);
            ctx.rotate(0.2);
        }

        ctx.restore();

        // Inner Glow Pulse
        const pulse = Math.sin(Date.now() / 500) * 10;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80 + pulse);
        grad.addColorStop(0, 'rgba(0, 242, 255, 0.4)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, 80 + pulse, 0, Math.PI * 2);
        ctx.fill();

        requestAnimationFrame(draw);
    }

    function drawHex(ctx, x, y, r, alpha) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const px = x + r * Math.cos(angle);
            const py = y + r * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(0, 242, 255, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Floating particles on edges
        if (Math.random() < 0.1) {
            ctx.fillStyle = '#fff';
            ctx.fillRect(r * Math.cos(rotation), r * Math.sin(rotation), 2, 2);
        }
    }

    draw();
}

// ============================================
// VISUALS: BACKGROUND PARTICLES
// ============================================

function initQuantumBackground() {
    const canvas = document.getElementById('quantumCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const particles = [];
    const count = 60;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0, 242, 255, 0.3)';

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }
    animate();
}

// ============================================
// DISTRIBUTION CHART (CANVAS)
// ============================================

function renderChart(distribution) {
    const canvas = document.getElementById('distributionChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const legend = document.getElementById('distributionLegend');

    const w = canvas.width = canvas.offsetWidth;
    const h = canvas.height = canvas.offsetHeight;

    if (!distribution || Object.keys(distribution).length === 0) {
        ctx.fillStyle = '#444';
        ctx.textAlign = 'center';
        ctx.fillText('WAITING FOR VECTORS...', w / 2, h / 2);
        return;
    }

    const entries = Object.entries(distribution);
    const colors = ['#00f2ff', '#ff003c', '#bd00ff', '#00ff9d', '#f59e0b'];

    ctx.clearRect(0, 0, w, h);

    const barWidth = w / entries.length - 10;
    const max = Math.max(...entries.map(e => e[1]));

    legend.innerHTML = '';

    entries.forEach(([name, count], i) => {
        const color = colors[i % colors.length];
        const barHeight = (count / max) * (h - 20);

        // Draw Bar
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.6;
        ctx.fillRect(i * (barWidth + 10), h - barHeight, barWidth, barHeight);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.strokeRect(i * (barWidth + 10), h - barHeight, barWidth, barHeight);

        // Value
        ctx.fillStyle = '#fff';
        ctx.font = '10px Share Tech Mono';
        ctx.fillText(count, i * (barWidth + 10) + 5, h - barHeight - 5);

        // Legend
        const lItem = document.createElement('div');
        lItem.className = 'legend-item';
        lItem.innerHTML = `<span class="legend-color" style="background:${color}"></span><span>${name}</span>`;
        legend.appendChild(lItem);
    });
}

// ============================================
// HELPERS
// ============================================

function safeUpdate(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
}

async function loadDefenseLayers() {
    try {
        const response = await fetch('/api/quantum/defense-layers');
        const data = await response.json();
        const container = document.getElementById('defenseLayers');
        if (!container) return;

        container.innerHTML = '';
        data.layers.forEach(layer => {
            const div = document.createElement('div');
            div.className = 'defense-layer';
            div.innerHTML = `
                <div class="layer-header">
                    <span class="layer-number">LAYER ${layer.layer}</span>
                    <span class="layer-status">${layer.status}</span>
                </div>
                <div class="layer-name">${layer.name}</div>
                <div class="layer-details">
                    <div class="layer-detail"><span>ALG</span><span class="layer-detail-value">${layer.algorithm}</span></div>
                    <div class="layer-detail"><span>SEC</span><span class="layer-detail-value">${layer.strength}</span></div>
                </div>
            `;
            container.appendChild(div);
        });
    } catch (e) {
        console.error('Failed to load layers', e);
    }
}
