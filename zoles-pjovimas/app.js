// === Žemėlapio canvas logika ===
const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');
const finishBtn = document.getElementById('finishBtn');
const clearBtn = document.getElementById('clearBtn');
const exampleBtn = document.getElementById('exampleBtn');
const pointCountEl = document.getElementById('pointCount');
const mapInstructions = document.getElementById('mapInstructions');

let points = [];
let isFinished = false;
let backgroundImage = null;

// Canvas dydžio nustatymas pagal containerio proporcijas
function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    drawMap();
}

// "Palydovinio vaizdo" generavimas
function generateMapBackground() {
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);

    // Pagrindinis fonas - žalsvas atspalvis
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#a8b88a');
    gradient.addColorStop(0.5, '#8fa570');
    gradient.addColorStop(1, '#9bb076');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Pievos tekstūra - žolės plotai
    for (let i = 0; i < 80; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const size = Math.random() * 30 + 10;
        ctx.fillStyle = `rgba(${75 + Math.random() * 30}, ${108 + Math.random() * 30}, ${58 + Math.random() * 20}, 0.3)`;
        ctx.beginPath();
        ctx.ellipse(x, y, size, size * 0.7, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
    }

    // Keliai
    ctx.strokeStyle = 'rgba(120, 100, 80, 0.6)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.3);
    ctx.bezierCurveTo(w * 0.3, h * 0.25, w * 0.6, h * 0.35, w, h * 0.28);
    ctx.stroke();

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.45, 0);
    ctx.lineTo(w * 0.5, h);
    ctx.stroke();

    // Pastatai (sodybos)
    const buildings = [
        { x: w * 0.15, y: h * 0.65, w: 35, h: 28 },
        { x: w * 0.75, y: h * 0.35, w: 40, h: 32 },
        { x: w * 0.85, y: h * 0.75, w: 30, h: 24 },
    ];
    buildings.forEach(b => {
        ctx.fillStyle = 'rgba(139, 111, 71, 0.8)';
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.fillStyle = 'rgba(101, 67, 33, 0.9)';
        ctx.fillRect(b.x, b.y, b.w, 4);
    });

    // Medžiai
    const trees = [
        { x: w * 0.25, y: h * 0.4, r: 12 },
        { x: w * 0.7, y: h * 0.6, r: 14 },
        { x: w * 0.88, y: h * 0.7, r: 10 },
        { x: w * 0.1, y: h * 0.8, r: 11 },
        { x: w * 0.55, y: h * 0.2, r: 9 },
        { x: w * 0.4, y: h * 0.85, r: 13 },
        { x: w * 0.62, y: h * 0.45, r: 10 },
    ];
    trees.forEach(t => {
        // Šešėlis
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.beginPath();
        ctx.arc(t.x + 3, t.y + 3, t.r, 0, Math.PI * 2);
        ctx.fill();
        // Lapija
        ctx.fillStyle = 'rgba(74, 107, 58, 0.85)';
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(60, 90, 45, 0.6)';
        ctx.beginPath();
        ctx.arc(t.x - t.r * 0.3, t.y - t.r * 0.3, t.r * 0.5, 0, Math.PI * 2);
        ctx.fill();
    });

    // Tvenkinukas
    ctx.fillStyle = 'rgba(75, 130, 160, 0.7)';
    ctx.beginPath();
    ctx.ellipse(w * 0.3, h * 0.55, 35, 22, 0.3, 0, Math.PI * 2);
    ctx.fill();
}

function drawMap() {
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, w, h);

    generateMapBackground();

    // Piešiame plotą
    if (points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }

        if (isFinished) {
            ctx.closePath();
            ctx.fillStyle = 'rgba(34, 197, 94, 0.35)';
            ctx.fill();
        }

        ctx.strokeStyle = '#16a34a';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Linija į žymeklį (kol nebaigta)
        if (!isFinished && points.length > 0 && lastMouse) {
            ctx.beginPath();
            ctx.moveTo(points[points.length - 1].x, points[points.length - 1].y);
            ctx.lineTo(lastMouse.x, lastMouse.y);
            ctx.strokeStyle = 'rgba(22, 163, 74, 0.5)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Taškai
        points.forEach((p, i) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.strokeStyle = '#16a34a';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Numerukas
            ctx.fillStyle = '#16a34a';
            ctx.font = 'bold 10px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(i + 1, p.x, p.y);
        });
    }
}

// Žiūrime, kur yra pelė (kad rodytume punktyrinę liniją)
let lastMouse = null;

canvas.addEventListener('mousemove', (e) => {
    if (isFinished) return;
    const rect = canvas.getBoundingClientRect();
    lastMouse = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
    if (points.length > 0) drawMap();
});

canvas.addEventListener('click', (e) => {
    if (isFinished) return;

    // Paslepiame instrukcijas
    if (mapInstructions && !mapInstructions.classList.contains('hidden')) {
        mapInstructions.classList.add('hidden');
    }

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Tikriname, ar nepaspausta ant pirmojo taško (uždaryti)
    if (points.length >= 3) {
        const first = points[0];
        const dist = Math.hypot(x - first.x, y - first.y);
        if (dist < 15) {
            finishPolygon();
            return;
        }
    }

    points.push({ x, y });
    updatePointCount();
    drawMap();

    if (points.length >= 3) {
        finishBtn.disabled = false;
    }
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const clickEvent = new MouseEvent('click', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(clickEvent);
}, { passive: false });

function updatePointCount() {
    pointCountEl.textContent = `${points.length} ${getPointWord(points.length)}`;
}

function getPointWord(n) {
    if (n === 0) return 'taškų';
    if (n === 1) return 'taškas';
    if (n >= 2 && n <= 9) return 'taškai';
    return 'taškų';
}

function finishPolygon() {
    if (points.length < 3) return;
    isFinished = true;
    finishBtn.disabled = true;
    drawMap();
    calculateArea();
}

function calculateArea() {
    // Shoelace formulė ploto skaičiavimui
    let area = 0;
    for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        area += points[i].x * points[j].y;
        area -= points[j].x * points[i].y;
    }
    area = Math.abs(area / 2);

    // Konvertuojame pikselių plotą į arus
    // Sąlygiškai: 1 pikselis canvas'e ~ 0.15 m, taigi 1 px² ~ 0.0225 m²
    // Kalibravimas: prie 800x600 canvas, vidutinis pažymėjimas (~50,000 px²) atitinka ~30 arų
    const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
    const scaleM2PerPx2 = 0.6 * (800 / canvasWidth) ** 2;
    const areaInM2 = area * scaleM2PerPx2;
    const areaInArai = areaInM2 / 100;

    document.getElementById('plotas').textContent = areaInArai.toFixed(1).replace('.', ',');
    document.getElementById('plotasHint').textContent = `≈ ${Math.round(areaInM2)} m²`;
    updatePrice();
}

finishBtn.addEventListener('click', finishPolygon);

clearBtn.addEventListener('click', () => {
    points = [];
    isFinished = false;
    finishBtn.disabled = true;
    document.getElementById('plotas').textContent = '0,0';
    document.getElementById('plotasHint').textContent = 'Pažymėkite sklypą';
    document.getElementById('kaina').textContent = '0';
    document.getElementById('orderBtn').disabled = true;
    document.getElementById('savings').classList.remove('visible');
    updatePointCount();
    if (mapInstructions) mapInstructions.classList.remove('hidden');
    drawMap();
});

exampleBtn.addEventListener('click', () => {
    // Užkrauname pavyzdinį plotą
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    points = [
        { x: w * 0.18, y: h * 0.25 },
        { x: w * 0.55, y: h * 0.18 },
        { x: w * 0.78, y: h * 0.35 },
        { x: w * 0.72, y: h * 0.72 },
        { x: w * 0.25, y: h * 0.78 },
        { x: w * 0.12, y: h * 0.5 },
    ];
    isFinished = true;
    finishBtn.disabled = true;
    if (mapInstructions) mapInstructions.classList.add('hidden');
    updatePointCount();
    drawMap();
    calculateArea();
});

// === Kainos skaičiavimas ===
function updatePrice() {
    const plotasText = document.getElementById('plotas').textContent;
    const arai = parseFloat(plotasText.replace(',', '.')) || 0;

    if (arai === 0) {
        document.getElementById('kaina').textContent = '0';
        document.getElementById('orderBtn').disabled = true;
        document.getElementById('savings').classList.remove('visible');
        return;
    }

    const kainaUzAra = parseFloat(document.getElementById('zoles-bukle').value);
    const periodKoef = parseFloat(document.getElementById('periodiskumas').value);
    const lapuValymas = document.getElementById('lapuValymas').checked;

    let kaina = arai * kainaUzAra;

    // Lapų valymo priedas
    if (lapuValymas) {
        kaina *= 1.30;
    }

    // Periodiškumo nuolaida
    const kainaBeNuolaidos = kaina;
    kaina *= periodKoef;

    // Minimumas - 50€
    kaina = Math.max(50, kaina);

    document.getElementById('kaina').textContent = Math.round(kaina);

    // Sutaupymas
    const sutaupymas = Math.round(kainaBeNuolaidos - kaina);
    const savingsEl = document.getElementById('savings');
    if (sutaupymas > 0) {
        savingsEl.textContent = `Sutaupote ${sutaupymas} € lyginant su vienkartiniu`;
        savingsEl.classList.add('visible');
    } else {
        savingsEl.classList.remove('visible');
    }

    document.getElementById('orderBtn').disabled = false;
}

document.getElementById('zoles-bukle').addEventListener('change', updatePrice);
document.getElementById('periodiskumas').addEventListener('change', updatePrice);
document.getElementById('lapuValymas').addEventListener('change', updatePrice);

// === "Užsakyti" mygtukas - perkelia į kontaktų formą ===
document.getElementById('orderBtn').addEventListener('click', () => {
    const plotas = document.getElementById('plotas').textContent;
    const kaina = document.getElementById('kaina').textContent;

    document.getElementById('hiddenPlotas').value = plotas;
    document.getElementById('hiddenKaina').value = kaina;

    const messageField = document.getElementById('message');
    if (!messageField.value) {
        messageField.value = `Norėčiau užsakyti žolės pjovimo paslaugą.\nApskaičiuotas plotas: ${plotas} arų.\nApskaičiuota kaina: ${kaina} €.`;
    }

    document.getElementById('kontaktai').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
        document.getElementById('name').focus();
    }, 800);
});

// === Kontaktų forma ===
document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    // Demo: parodome toast
    // Realiame projekte čia būtų fetch() į /api/kontaktas endpoint
    console.log('Užklausa:', Object.fromEntries(formData));

    showToast('✓ Užklausa išsiųsta. Susisieksime per 2 valandas.');
    e.target.reset();
});

// === Toast žinutės ===
const toast = document.getElementById('toast');
function showToast(message) {
    toast.textContent = message;
    toast.classList.add('visible');
    setTimeout(() => {
        toast.classList.remove('visible');
    }, 4000);
}

// === Mobilus meniu ===
document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('navMobile').classList.toggle('open');
});

document.querySelectorAll('.nav-mobile a').forEach(a => {
    a.addEventListener('click', () => {
        document.getElementById('navMobile').classList.remove('open');
    });
});

// === Inicializacija ===
window.addEventListener('load', resizeCanvas);
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
