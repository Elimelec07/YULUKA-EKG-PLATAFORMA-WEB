'use strict';

// ================================================================
//  MOTOR ECG (mismo estándar clínico que el monitor principal)
// ================================================================

const pluginPapelECG = {
    id: 'papelECG',
    beforeDraw: (chart) => {
        const { ctx, chartArea } = chart;
        if (!chartArea) return;
        ctx.save();
        ctx.fillStyle = '#fff5f5';
        ctx.fillRect(chartArea.left, chartArea.top, chartArea.width, chartArea.height);
        const mmX = chartArea.width / 75;
        const mmY = chartArea.height / 50;
        ctx.beginPath();
        for (let i = 0; i <= 75; i++) {
            const x = chartArea.left + i * mmX;
            ctx.lineWidth   = i % 5 === 0 ? 1.0 : 0.4;
            ctx.strokeStyle = i % 5 === 0 ? 'rgba(255,99,132,0.5)' : 'rgba(255,99,132,0.2)';
            ctx.moveTo(x, chartArea.top); ctx.lineTo(x, chartArea.bottom);
            ctx.stroke(); ctx.beginPath();
        }
        for (let i = 0; i <= 50; i++) {
            const y = chartArea.top + i * mmY;
            ctx.lineWidth   = i % 5 === 0 ? 1.0 : 0.4;
            ctx.strokeStyle = i % 5 === 0 ? 'rgba(255,99,132,0.5)' : 'rgba(255,99,132,0.2)';
            ctx.moveTo(chartArea.left, y); ctx.lineTo(chartArea.right, y);
            ctx.stroke(); ctx.beginPath();
        }
        ctx.restore();
    }
};

const graficasQuiz = {};

function dibujarCanal(canvasId, datos, fs) {
    const el = document.getElementById(canvasId);
    if (!el) return;
    const ctx = el.getContext('2d');
    if (graficasQuiz[canvasId]) graficasQuiz[canvasId].destroy();
    graficasQuiz[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: datos.map((_, i) => (i / fs).toFixed(3)),
            datasets: [{ data: datos, borderColor: '#111827', borderWidth: 1.2,
                         pointRadius: 0, tension: 0.1 }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, animation: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: {
                x: { display: false },
                y: { display: false, min: -2.5, max: 2.5 }
            },
            layout: { padding: 0 }
        },
        plugins: [pluginPapelECG]
    });
}

// ================================================================
//  ESTADO DEL QUIZ
// ================================================================

let casoActual       = null;
let correctas        = 0;
let totalRespondidas = 0;
let respuestasDadas  = {};
let preguntasOrden   = [];
let casosVistosHoy   = 0;

// ── Datos ECG del caso activo (para el zoom) ──────────────────
let _datosECG = {};
let _fsECG    = 500;

// ================================================================
//  CUADRÍCULA DE PRECISIÓN INTERACTIVA (mismo motor que el monitor)
// ================================================================

let _datosZoom = null;
let _labelZoom = '';
let _fsZoom    = 500;
let _vista     = { x: 0, y: 0, ancho: 75, alto: 50 };

let _arrastrandoZoom = false;
let _arrastreZoom    = { cx0:0, cy0:0, vx0:0, vy0:0 };

let _modoMedicion   = false;
let _puntosM        = [];
let _cursorMm       = null;

function _canvasAMm(cx, cy) {
    const c = document.getElementById('canvas-zoom');
    return {
        x: (cx / c.offsetWidth)  * _vista.ancho + _vista.x,
        y: (cy / c.offsetHeight) * _vista.alto  + _vista.y,
    };
}

function _mmAPx(mx, my) {
    const c = document.getElementById('canvas-zoom');
    return {
        x: (mx - _vista.x) / _vista.ancho * c.width,
        y: (my - _vista.y) / _vista.alto  * c.height,
    };
}

function _aplicarZoom(factor, cxMm, cyMm) {
    const nAncho = Math.max(2, Math.min(75, _vista.ancho * factor));
    const nAlto  = nAncho * (50 / 75);
    const rx = (cxMm - _vista.x) / _vista.ancho;
    const ry = (cyMm - _vista.y) / _vista.alto;
    _vista.x     = cxMm - rx * nAncho;
    _vista.y     = cyMm - ry * nAlto;
    _vista.ancho = nAncho;
    _vista.alto  = nAlto;
    document.getElementById('zoom-nivel').textContent =
        `${(75 / _vista.ancho).toFixed(1)}×`;
}

function _rrect(ctx, x, y, w, h, r) {
    if (ctx.roundRect) { ctx.roundRect(x, y, w, h, r); return; }
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y); ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r); ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h); ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r); ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
}

function _renderZoom() {
    const canvas = document.getElementById('canvas-zoom');
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    ctx.fillStyle = '#fff5f5';
    ctx.fillRect(0, 0, W, H);

    const pxXpMm = W / _vista.ancho;
    const pxYpMm = H / _vista.alto;

    // Cuadrícula
    for (let mm = Math.floor(_vista.x); mm <= Math.ceil(_vista.x + _vista.ancho); mm++) {
        const px = (mm - _vista.x) / _vista.ancho * W;
        const big = mm % 5 === 0;
        ctx.strokeStyle = big ? 'rgba(210,50,70,0.55)' : 'rgba(210,50,70,0.2)';
        ctx.lineWidth   = big ? 1.0 : 0.5;
        ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke();
        if (big && pxXpMm >= 4) {
            ctx.fillStyle = 'rgba(175,45,65,0.65)';
            ctx.font = `${Math.min(11, Math.max(9, pxXpMm * 1.4))}px sans-serif`;
            ctx.fillText(`${mm}mm / ${(mm/25).toFixed(2)}s`, px + 3, H - 4);
        }
    }
    for (let mm = Math.floor(_vista.y); mm <= Math.ceil(_vista.y + _vista.alto); mm++) {
        const py = (mm - _vista.y) / _vista.alto * H;
        const big = mm % 5 === 0;
        ctx.strokeStyle = big ? 'rgba(210,50,70,0.55)' : 'rgba(210,50,70,0.2)';
        ctx.lineWidth   = big ? 1.0 : 0.5;
        ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke();
        if (big && pxYpMm >= 4) {
            ctx.fillStyle = 'rgba(175,45,65,0.65)';
            ctx.font = `${Math.min(11, Math.max(9, pxYpMm * 1.4))}px sans-serif`;
            ctx.fillText(`${((25 - mm) / 10).toFixed(1)}mV`, 3, py - 3);
        }
    }

    // Línea isoeléctrica
    const yIso = (25 - _vista.y) / _vista.alto * H;
    if (yIso >= 0 && yIso <= H) {
        ctx.strokeStyle = 'rgba(210,50,70,0.38)';
        ctx.lineWidth = 1.5; ctx.setLineDash([6, 4]);
        ctx.beginPath(); ctx.moveTo(0, yIso); ctx.lineTo(W, yIso); ctx.stroke();
        ctx.setLineDash([]);
    }

    // Señal ECG
    if (_datosZoom?.length) {
        ctx.strokeStyle = '#111827';
        ctx.lineWidth   = Math.max(1, Math.min(2.2, pxXpMm * 0.18));
        ctx.lineJoin    = 'round';
        ctx.beginPath();
        let started = false;
        for (let i = 0; i < _datosZoom.length; i++) {
            const mmX = (i / _fsZoom) * 25;
            if (mmX < _vista.x - 0.5 || mmX > _vista.x + _vista.ancho + 0.5) continue;
            const mmY = 25 - _datosZoom[i] * 10;
            const px  = (mmX - _vista.x) / _vista.ancho * W;
            const py  = (mmY - _vista.y) / _vista.alto  * H;
            if (!started) { ctx.moveTo(px, py); started = true; }
            else ctx.lineTo(px, py);
        }
        ctx.stroke();
    }

    // Crosshair
    if (_cursorMm) {
        const cpx = (_cursorMm.x - _vista.x) / _vista.ancho * W;
        const cpy = (_cursorMm.y - _vista.y) / _vista.alto  * H;
        ctx.strokeStyle = 'rgba(66,153,225,0.75)';
        ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(cpx, 0); ctx.lineTo(cpx, H);
        ctx.moveTo(0, cpy); ctx.lineTo(W, cpy);
        ctx.stroke(); ctx.setLineDash([]);
        document.getElementById('info-cursor').textContent =
            `t = ${(_cursorMm.x/25).toFixed(3)} s  (${_cursorMm.x.toFixed(1)} mm)  ·  ${((25-_cursorMm.y)/10).toFixed(3)} mV`;
    }

    // Puntos de medición
    _puntosM.forEach((p, i) => {
        const { x: px, y: py } = _mmAPx(p.x, p.y);
        ctx.fillStyle   = i === 0 ? '#48bb78' : '#e53e3e';
        ctx.strokeStyle = 'white'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI*2);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = 'white'; ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(i+1, px, py);
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    });

    // Línea y resultado de medición
    if (_puntosM.length === 2) {
        const { x:px1, y:py1 } = _mmAPx(_puntosM[0].x, _puntosM[0].y);
        const { x:px2, y:py2 } = _mmAPx(_puntosM[1].x, _puntosM[1].y);
        ctx.strokeStyle = '#805ad5'; ctx.lineWidth = 2; ctx.setLineDash([6,3]);
        ctx.beginPath(); ctx.moveTo(px1, py1); ctx.lineTo(px2, py2); ctx.stroke();
        ctx.setLineDash([]);
        const dxMm = Math.abs(_puntosM[1].x - _puntosM[0].x);
        const dyMm = Math.abs(_puntosM[1].y - _puntosM[0].y);
        const dt   = (dxMm/25).toFixed(3);
        const dv   = (dyMm/10).toFixed(3);
        const dist = Math.sqrt(dxMm*dxMm + dyMm*dyMm).toFixed(2);
        const mx = (px1+px2)/2, my = (py1+py2)/2;
        const bW=186, bH=66;
        const bX=Math.max(4, Math.min(W-bW-4, mx-bW/2));
        const bY=Math.max(4, Math.min(H-bH-4, my-bH-12));
        ctx.fillStyle='rgba(237,233,254,0.95)'; ctx.strokeStyle='rgba(128,90,213,0.7)'; ctx.lineWidth=1.5;
        ctx.beginPath(); _rrect(ctx, bX, bY, bW, bH, 6); ctx.fill(); ctx.stroke();
        ctx.fillStyle='#44337a'; ctx.font='bold 11px monospace'; ctx.textAlign='center';
        ctx.fillText(`Δt = ${dt} s  (${dxMm.toFixed(1)} mm)`,  bX+bW/2, bY+18);
        ctx.fillText(`ΔV = ${dv} mV  (${dyMm.toFixed(1)} mm)`, bX+bW/2, bY+34);
        ctx.fillText(`Distancia = ${dist} mm`,                       bX+bW/2, bY+52);
        ctx.textAlign='left';
        document.getElementById('info-medicion').textContent =
            `Δt=${dt}s · ΔV=${dv}mV · Dist=${dist}mm`;
    }
}

function abrirModalZoom(label, datos, fs) {
    _datosZoom     = datos;
    _labelZoom     = label;
    _fsZoom        = fs;
    _vista         = { x:0, y:0, ancho:75, alto:50 };
    _modoMedicion  = false;
    _puntosM       = [];
    _cursorMm      = null;
    const modal    = document.getElementById('modal-zoom');
    modal.style.display = 'flex';
    document.getElementById('modal-zoom-label').textContent = `Derivación ${label}`;
    document.getElementById('zoom-nivel').textContent       = '1×';
    document.getElementById('info-cursor').textContent      = 'Mueve el cursor sobre la gráfica';
    document.getElementById('info-medicion').textContent    = '';
    document.getElementById('modo-medicion-label').style.display = 'none';
    document.getElementById('btn-medir').classList.remove('btn-medir-activo');
    document.getElementById('canvas-zoom').style.cursor    = 'grab';
    requestAnimationFrame(_renderZoom);
}

function inicializarModalZoom() {
    const modal  = document.getElementById('modal-zoom');
    const canvas = document.getElementById('canvas-zoom');

    // Cerrar
    document.getElementById('btn-cerrar-modal').addEventListener('click',
        () => { modal.style.display = 'none'; });
    modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

    // Zoom +/-
    document.getElementById('btn-zoom-mas').addEventListener('click', () => {
        _aplicarZoom(0.55, _vista.x + _vista.ancho/2, _vista.y + _vista.alto/2); _renderZoom();
    });
    document.getElementById('btn-zoom-menos').addEventListener('click', () => {
        _aplicarZoom(1.6,  _vista.x + _vista.ancho/2, _vista.y + _vista.alto/2); _renderZoom();
    });

    // Reset
    document.getElementById('btn-reset-zoom').addEventListener('click', () => {
        _vista = { x:0, y:0, ancho:75, alto:50 };
        document.getElementById('zoom-nivel').textContent = '1×';
        _modoMedicion = false; _puntosM = [];
        document.getElementById('btn-medir').classList.remove('btn-medir-activo');
        document.getElementById('modo-medicion-label').style.display = 'none';
        document.getElementById('info-medicion').textContent = '';
        canvas.style.cursor = 'grab';
        _renderZoom();
    });

    // Medir
    document.getElementById('btn-medir').addEventListener('click', () => {
        _modoMedicion = !_modoMedicion; _puntosM = [];
        document.getElementById('info-medicion').textContent = '';
        document.getElementById('btn-medir').classList.toggle('btn-medir-activo', _modoMedicion);
        document.getElementById('modo-medicion-label').style.display = _modoMedicion ? 'inline' : 'none';
        canvas.style.cursor = _modoMedicion ? 'crosshair' : 'grab';
        _renderZoom();
    });

    // Scroll = zoom centrado en cursor
    canvas.addEventListener('wheel', e => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const mm   = _canvasAMm(e.clientX - rect.left, e.clientY - rect.top);
        _aplicarZoom(e.deltaY > 0 ? 1.22 : 0.82, mm.x, mm.y);
        _renderZoom();
    }, { passive: false });

    // Movimiento del mouse
    canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
        _cursorMm = _canvasAMm(cx, cy);
        if (_arrastrandoZoom && !_modoMedicion) {
            const dxMm = ((_arrastreZoom.cx0 - cx) / canvas.offsetWidth)  * _vista.ancho;
            const dyMm = ((_arrastreZoom.cy0 - cy) / canvas.offsetHeight) * _vista.alto;
            _vista.x = _arrastreZoom.vx0 + dxMm;
            _vista.y = _arrastreZoom.vy0 + dyMm;
        }
        _renderZoom();
    });
    canvas.addEventListener('mouseleave', () => {
        _cursorMm = null;
        document.getElementById('info-cursor').textContent = 'Mueve el cursor sobre la gráfica';
        _renderZoom();
    });
    canvas.addEventListener('mousedown', e => {
        if (_modoMedicion) return;
        _arrastrandoZoom = true;
        const rect = canvas.getBoundingClientRect();
        _arrastreZoom = {
            cx0: e.clientX - rect.left, cy0: e.clientY - rect.top,
            vx0: _vista.x,              vy0: _vista.y,
        };
        canvas.style.cursor = 'grabbing';
    });
    canvas.addEventListener('mouseup', () => {
        _arrastrandoZoom = false;
        canvas.style.cursor = _modoMedicion ? 'crosshair' : 'grab';
    });

    // Click = punto de medición
    canvas.addEventListener('click', e => {
        if (!_modoMedicion) return;
        const rect = canvas.getBoundingClientRect();
        const mm   = _canvasAMm(e.clientX - rect.left, e.clientY - rect.top);
        if (_puntosM.length >= 2) { _puntosM = []; document.getElementById('info-medicion').textContent = ''; }
        _puntosM.push(mm);
        if (_puntosM.length === 1)
            document.getElementById('info-medicion').textContent = 'Haz clic en el segundo punto...';
        _renderZoom();
    });

    // Pinch-to-zoom táctil
    let lastPinch = null;
    canvas.addEventListener('touchstart', e => {
        if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            lastPinch = Math.hypot(dx, dy);
        }
    }, { passive: true });
    canvas.addEventListener('touchmove', e => {
        e.preventDefault();
        if (e.touches.length === 2 && lastPinch) {
            const dx   = e.touches[0].clientX - e.touches[1].clientX;
            const dy   = e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.hypot(dx, dy);
            const rect = canvas.getBoundingClientRect();
            const midX = (e.touches[0].clientX + e.touches[1].clientX)/2 - rect.left;
            const midY = (e.touches[0].clientY + e.touches[1].clientY)/2 - rect.top;
            const mm   = _canvasAMm(midX, midY);
            _aplicarZoom(lastPinch / dist, mm.x, mm.y);
            lastPinch = dist;
            _renderZoom();
        }
    }, { passive: false });
    canvas.addEventListener('touchend', () => { lastPinch = null; });

    // Atajos de teclado (solo cuando el modal está visible)
    document.addEventListener('keydown', e => {
        if (modal.style.display === 'none') return;
        const cx = _vista.x + _vista.ancho/2, cy = _vista.y + _vista.alto/2;
        const paso = _vista.ancho * 0.12;
        switch (e.key) {
            case 'Escape':      modal.style.display = 'none'; break;
            case '+': case '=': _aplicarZoom(0.6, cx, cy); _renderZoom(); break;
            case '-':           _aplicarZoom(1.5, cx, cy); _renderZoom(); break;
            case 'ArrowLeft':   _vista.x -= paso; _renderZoom(); break;
            case 'ArrowRight':  _vista.x += paso; _renderZoom(); break;
            case 'ArrowUp':     _vista.y -= paso*(50/75); _renderZoom(); break;
            case 'ArrowDown':   _vista.y += paso*(50/75); _renderZoom(); break;
            case 'm': case 'M': document.getElementById('btn-medir').click(); break;
        }
    });

    window.addEventListener('resize', () => {
        if (modal.style.display !== 'none') _renderZoom();
    });
}

// ================================================================
//  CARGA DEL CASO
// ================================================================

function cargarCaso() {
    mostrarEstado('cargando');
    fetch('/api/quiz/random')
        .then(r => r.json())
        .then(data => {
            if (data.estado !== 'exito') throw new Error(data.mensaje);
            casoActual      = data;
            respuestasDadas = {};
            casosVistosHoy++;
            renderCaso(data);
            renderMonitor(data.datos_12_derivaciones, data.frecuencia_muestreo);
            renderPreguntas(data.preguntas);
            document.getElementById('quiz-nav').style.display = 'none';
            mostrarEstado('contenido');
        })
        .catch(err => {
            document.getElementById('quiz-error-msg').textContent =
                'Error al cargar el caso: ' + err.message;
            mostrarEstado('error');
        });
}

function mostrarEstado(estado) {
    document.getElementById('quiz-cargando').style.display  = estado === 'cargando'  ? 'flex' : 'none';
    document.getElementById('quiz-error').style.display     = estado === 'error'     ? 'flex' : 'none';
    document.getElementById('quiz-contenido').style.display = estado === 'contenido' ? 'block': 'none';
}

// ================================================================
//  RENDER: HISTORIA CLÍNICA
// ================================================================

function renderCaso(data) {
    const c = data.caso;
    document.getElementById('caso-numero').textContent =
        `CASO CLÍNICO • ${String(casosVistosHoy).padStart(2,'0')}`;
    document.getElementById('caso-titulo').textContent   = c.titulo;
    document.getElementById('caso-paciente').textContent =
        `${c.sexo} · ${c.edad} años`;
    document.getElementById('caso-motivo').textContent   = c.motivo;
    document.getElementById('caso-antecedentes').textContent = c.antecedentes;
    document.getElementById('caso-pistas-texto').textContent = c.pistas_ecg;

    const signosEl = document.getElementById('caso-signos');
    signosEl.innerHTML = '';
    const alertas = new Set(['FC','SpO₂','TA']);
    (c.signos_vitales || []).forEach(([nombre, valor]) => {
        const esAlerta = alertas.has(nombre) && (
            valor.includes('↓') || valor.includes('↑') ||
            parseFloat(valor) < 60 || parseFloat(valor) > 100
        );
        const fila = document.createElement('div');
        fila.className = 'signo-fila';
        fila.innerHTML = `<span class="signo-nombre">${nombre}</span>
                          <span class="signo-valor${esAlerta ? ' alerta' : ''}">${valor}</span>`;
        signosEl.appendChild(fila);
    });
}

// ================================================================
//  RENDER: MONITOR 12 DERIVACIONES
// ================================================================

const ORDEN_DISPLAY = [
    ['I','aVR','V1','V4'],
    ['II','aVL','V2','V5'],
    ['III','aVF','V3','V6'],
];

function renderMonitor(senales, fs) {
    // Guardar datos para el zoom
    _datosECG = senales;
    _fsECG    = fs;

    const grid = document.getElementById('quiz-monitor-grid');
    grid.innerHTML = '';

    ORDEN_DISPLAY.forEach(fila => {
        fila.forEach(canal => {
            const div    = document.createElement('div');
            div.className = 'quiz-derivacion';
            div.id        = `qd-${canal}`;

            const label  = document.createElement('div');
            label.className = 'quiz-derivacion-label';
            label.textContent = canal === 'I' ? 'DI' : canal === 'II' ? 'DII' : canal === 'III' ? 'DIII' : canal;

            const badge = document.createElement('div');
            badge.className = 'quiz-derivacion-badge';
            badge.id        = `badge-${canal}`;
            badge.textContent = 'CLAVE';

            const canvas = document.createElement('canvas');
            canvas.id = `qcanvas_${canal}`;

            div.appendChild(label);
            div.appendChild(badge);
            div.appendChild(canvas);
            grid.appendChild(div);

            // Click → abrir cuadrícula de precisión
            div.addEventListener('click', () => {
                if (_datosECG[canal]) abrirModalZoom(canal, _datosECG[canal], _fsECG);
            });
        });
    });

    // Pequeño delay para asegurar layout antes de dibujar
    requestAnimationFrame(() => {
        Object.keys(senales).forEach(canal => {
            dibujarCanal(`qcanvas_${canal}`, senales[canal], fs);
        });
    });
}

// ================================================================
//  RENDER: PREGUNTAS
// ================================================================

function renderPreguntas(preguntas) {
    preguntasOrden = preguntas.map(p => p.id);
    const container = document.getElementById('preguntas-container');
    container.innerHTML = '';

    preguntas.forEach((preg, idx) => {
        const card = document.createElement('div');
        card.className = 'pregunta-card' + (idx > 0 ? ' bloqueada' : '');
        card.id        = `pregunta-card-${preg.id}`;

        card.innerHTML = `
            <div class="pregunta-header">
                <div class="pregunta-numero">${preg.numero}</div>
                <div class="pregunta-icono">${preg.icono}</div>
                <div class="pregunta-enunciado">${preg.enunciado}</div>
            </div>
            <div class="pregunta-cuerpo">
                <div class="opciones-grid" id="opciones-${preg.id}"></div>
                <div class="retroalimentacion" id="retro-${preg.id}"></div>
            </div>`;

        container.appendChild(card);

        const opcionesEl = card.querySelector(`#opciones-${preg.id}`);
        const letras = ['A','B','C','D'];
        preg.opciones.forEach((op, oi) => {
            const btn = document.createElement('button');
            btn.className = 'opcion-btn';
            btn.id        = `opcion-${preg.id}-${op.id}`;
            btn.innerHTML = `<span class="opcion-letra">${letras[oi]}</span><span>${op.texto}</span>`;
            btn.addEventListener('click', () => responder(preg, op));
            opcionesEl.appendChild(btn);
        });
    });
}

// ================================================================
//  GUÍA PEDAGÓGICA — Patrones ECG por caso y pregunta
// ================================================================

const GUIA_PEDAGOGICA = {
    caso_imi_dx: {
        patron: '🔴 Elevación de ST en Cara Inferior',
        hallazgo: '<strong>Segmento ST</strong> elevado ≥ 1 mm en derivaciones II, III y aVF',
        medida: 'ST ≥ 1 mm en ≥ 2 derivaciones contiguas inferiores + imagen especular (depresión) en I y aVL',
        fisio: 'La oclusión de la <strong>ACD</strong> genera corriente de lesión subepicárdica que desplaza el ST hacia arriba en la cara inferior. La depresión recíproca en I-aVL descarta pericarditis (que eleva ST difusamente sin imagen especular).',
    },
    caso_imi_conducta: {
        patron: '⏱️ Protocolo IAMCEST — Tiempo = Miocardio',
        hallazgo: 'Activación del <strong>Código Infarto</strong> como primera acción: cada minuto cuesta miocardio',
        medida: 'Objetivo ICP primaria < 90 min desde primer contacto médico · ASA 300 mg masticable + O₂ si SpO₂ < 94%',
        fisio: 'Cada minuto de isquemia destruye aproximadamente <strong>2 millones de cardiomiocitos</strong>. Los antihipertensivos están contraindicados con TA 88/58 (hipotensión activa). La atropina solo se usa para la bradicardia, DESPUÉS de activar el código.',
    },
    caso_asmi_dx: {
        patron: '🔵 Patrón QS + Elevación ST Anteroseptal',
        hallazgo: '<strong>Patrón QS</strong> en V1-V2 con elevación del ST: indica necrosis transmural activa',
        medida: 'Ondas Q ≥ 40 ms o ≥ 25% de la amplitud del QRS · Elevación ST ≥ 1 mm en V1-V4',
        fisio: 'La <strong>DAI proximal</strong> irriga tabique y pared anterior (~40% del VI). Su oclusión produce QS por pérdida total de la onda r septal y ST elevado por corriente de lesión activa. El síncope previo refleja la caída brusca del gasto cardíaco.',
    },
    caso_asmi_conducta: {
        patron: '⚡ IAMCEST Anteroseptal — Mayor Mortalidad',
        hallazgo: 'Acciones <strong>simultáneas y en paralelo</strong>: Código + O₂ + 2 accesos IV + ASA',
        medida: 'SpO₂ objetivo ≥ 94% · ICP primaria < 90 min · NO nitratos (contraindicados en hipotensión)',
        fisio: 'El IAMCEST anteroseptal tiene <strong>mayor mortalidad</strong> que el inferior por el volumen miocárdico comprometido (DAI irriga ~40% del VI vs ~20% de la ACD). El síncope durante isquemia indica FV inminente — emergencia máxima.',
    },
    caso_afib_dx: {
        patron: '🌊 Fibrilación Auricular — Ritmo Irregularmente Irregular',
        hallazgo: '<strong>Ausencia de ondas P</strong> + intervalos RR variables sin ningún patrón fijo',
        medida: 'Línea de base fibrilatoria (ondas f) a 350-600/min · QRS estrecho < 120 ms si no hay aberrancia',
        fisio: 'Cientos de frentes de activación caóticos en ambas aurículas impiden la formación de ondas P organizadas. El nodo AV recibe estímulos al azar, produciendo el ritmo ventricular <strong>irregularmente irregular</strong> — el sello diagnóstico de la FA.',
    },
    caso_afib_conducta: {
        patron: '🩸 FA — Anticoagulación + Control de Frecuencia',
        hallazgo: '<strong>Monitoreo + anticoagulación</strong> como pilares: el mayor riesgo es el tromboembolismo',
        medida: 'FC objetivo < 110 lpm en FA aguda estable · Metoprolol o Diltiazem IV · HBPM o Heparina',
        fisio: 'La FA produce éstasis en la orejuela auricular izquierda, favoreciendo trombos con riesgo de <strong>ACV embólico</strong>. La cardioversión sin anticoagulación previa puede movilizar trombos ya formados. Primero anticoagular, luego cardiovertir.',
    },
    caso_aflt_dx: {
        patron: '🦷 Flutter Auricular — Dientes de Sierra',
        hallazgo: '<strong>Ondas F regulares</strong> "en dientes de sierra" a 250-350/min en cara inferior',
        medida: 'FC auricular ~300/min · Conducción 2:1 → FC ventricular ~150 lpm (clave diagnóstica clásica)',
        fisio: 'Un circuito de <strong>macroreentrada</strong> en el istmo cavo-tricuspídeo genera activación auricular organizada y rápida. El nodo AV solo conduce 1 de cada 2 impulsos (bloqueo 2:1 fisiológico), resultando en FC ventricular característica de ~150 lpm.',
    },
    caso_aflt_conducta: {
        patron: '⚡ Flutter — Alta Respuesta a Cardioversión',
        hallazgo: 'Anticoagulación + preparación para <strong>cardioversión eléctrica</strong> (eficacia > 95%)',
        medida: 'Cardioversión sincronizada 50-100 J · Adenosina: diagnóstica (desenmasca ondas F), NO terapéutica',
        fisio: 'La adenosina bloquea transitoriamente el nodo AV, revelando las ondas F del flutter, pero <strong>no interrumpe el circuito de reentrada</strong>. El riesgo tromboembólico del flutter es equivalente al de la FA — anticoagular siempre.',
    },
    caso_clbbb_dx: {
        patron: '📐 BRIHH — Ancho del QRS y Morfología Específica',
        hallazgo: '<strong>QRS ≥ 120 ms</strong> + morfología rS o QS en V1 + R con muesca o empastada en V5-V6',
        medida: 'V1: deflexión negativa amplia (rS o QS) · V5-V6: onda R ancha con empastamiento o muesca (RR\')',
        fisio: 'El bloqueo de la rama izquierda obliga al impulso a activar el VI de forma lenta y <strong>tortuosa desde el VD</strong>. Esta activación retardada produce el QRS ancho, el empastamiento en V5-V6 y la discordancia ST-T (hallazgo normal en BRIHH, no indica isquemia por sí solo).',
    },
    caso_clbbb_conducta: {
        patron: '🚨 BRIHH Nuevo = STEMI Equivalente',
        hallazgo: 'Comparar con ECG previo + <strong>troponinas urgentes</strong> + activar Código Infarto si es nuevo',
        medida: 'Criterio de Sgarbossa: ST ≥ 1 mm concordante con QRS = isquemia activa probable · Sensibilidad ~36%',
        fisio: 'Un BRIHH de <strong>nueva aparición</strong> con sintomatología isquémica activa es un STEMI equivalente — el BRIHH enmascara los cambios clásicos del ST. La atropina trata bradicardia, no el BRIHH. El BRIHH crónico puede coexistir con isquemia activa.',
    },
    caso_lngqt_dx: {
        patron: '📏 QT Prolongado — Riesgo de Torsades de Pointes',
        hallazgo: '<strong>Intervalo QT prolongado</strong>: medir desde inicio del QRS hasta el fin de la onda T en DII y V5',
        medida: 'QTc > 500 ms = riesgo ALTO de Torsades · Normal: < 450 ms (hombre) / < 460 ms (mujer)',
        fisio: 'La amiodarona bloquea canales de K⁺ (corriente I<sub>kr</sub>), prolongando la repolarización. La hipopotasemia <strong>potencia dramáticamente este efecto</strong>. El período vulnerable prolongado permite post-despolarizaciones tempranas que desencadenan TV polimórfica (Torsades).',
    },
    caso_lngqt_conducta: {
        patron: '💊 QT Largo Adquirido — Protocolo de Emergencia',
        hallazgo: 'Suspender la causa + <strong>MgSO₄ 2g IV</strong> + corregir K⁺ + desfibrilador al lado',
        medida: 'K⁺ objetivo ≥ 4.5 mEq/L · MgSO₄ 2g en 10 min · UCI con monitoreo continuo',
        fisio: 'El <strong>Magnesio</strong> suprime las post-despolarizaciones tempranas aunque no corrija el QT. La amiodarona está absolutamente contraindicada — es la causa del problema. Si ocurre Torsades → desfibrilación inmediata (no sincronizada si es TV polimórfica).',
    },
    caso_sbrad_dx: {
        patron: '🐢 Bradicardia Sinusal Sintomática',
        hallazgo: 'Onda P <strong>positiva</strong> en DII antes de cada QRS · FC < 60 lpm · QRS estrecho y regular',
        medida: 'FC < 60 lpm · PR 120-200 ms · Cada P conduce un QRS: no hay bloqueo verdadero',
        fisio: 'El metoprolol (betabloqueante β1) frena el nodo sinusal al bloquear la estimulación adrenérgica. La TA 92/58 y el presíncope indican <strong>compromiso hemodinámico</strong> — el mecanismo compensador (FC) ya está agotado. Emergencia real.',
    },
    caso_sbrad_conducta: {
        patron: '💉 Bradicardia Sintomática — Protocolo ACLS',
        hallazgo: 'Suspender metoprolol + <strong>Atropina 0.5 mg IV</strong> repetible c/3-5 min hasta 3 mg',
        medida: 'Si no responde a Atropina: Marcapaso transcutáneo 70-80 lpm · Dopamina o Adrenalina en infusión',
        fisio: 'La Atropina bloquea el nervio vago, liberando la inhibición sobre el nodo sinusal. La adrenalina 1 mg IV es para <strong>paro cardíaco sin pulso</strong> — en bradicardia con pulso generaría vasoconstricción excesiva y riesgo de FV. Maniobra de Valsalva disminuye la FC: indicada para taquicardias, nunca para bradicardias.',
    },
    caso_stach_dx: {
        patron: '🏃 Taquicardia Sinusal — Síntoma, no Arritmia',
        hallazgo: 'Onda P <strong>positiva y visible</strong> antes de cada QRS en DII · FC > 100 lpm · Ritmo regular',
        medida: 'Morfología P-QRS-T completamente normal · PR y QRS dentro de rangos · Origen: nodo sinusal',
        fisio: 'La taquicardia sinusal es un <strong>mecanismo compensador fisiológico</strong>, no una arritmia primaria. Dolor → simpático (+FC), hipovolemia → barorreceptores (+FC), fiebre → automatismo sinusal +10 lpm/°C. Tratar la causa siempre es suficiente.',
    },
    caso_stach_conducta: {
        patron: '🎯 Tratar la CAUSA de la Taquicardia Sinusal',
        hallazgo: 'Analgesia + hidratación IV + antitérmicos: la FC <strong>descenderá espontáneamente</strong>',
        medida: 'Metoprolol contraindicado en hipovolemia con TA 98/62 · Adenosina solo para TSVP, no sinusal',
        fisio: 'Un betabloqueante en paciente hipovolémico y taquicárdico puede precipitar <strong>colapso hemodinámico</strong>: la taquicardia es el único mecanismo que mantiene el gasto cardíaco cuando el volumen es bajo. Frena el corazón → cae el gasto → choque.',
    },
};

// ================================================================
//  MODAL DE RETROALIMENTACIÓN PEDAGÓGICA
// ================================================================

let _modalCallback = null;   // función a ejecutar al cerrar el modal

function abrirModalRetro(pregunta, esCorrecta) {
    const clave   = `${casoActual.caso_id}_${pregunta.id}`;
    const guia    = GUIA_PEDAGOGICA[clave] || null;
    const modal   = document.getElementById('modal-retro');
    const header  = document.getElementById('modal-retro-header');

    // ---- Cabecera (color semántico) ----
    header.className = 'modal-retro-header ' + (esCorrecta ? 'retro-ok' : 'retro-mal');
    document.getElementById('modal-retro-icono').textContent    = esCorrecta ? '✅' : '💡';
    document.getElementById('modal-retro-titulo').textContent   = esCorrecta
        ? '¡Excelente ojo clínico!'
        : 'Respuesta incorrecta';
    document.getElementById('modal-retro-subtitulo').textContent = esCorrecta
        ? 'Identificaste correctamente el patrón'
        : 'Analicemos juntos la clave diagnóstica';

    // ---- Texto de retroalimentación clínica ----
    document.getElementById('modal-retro-texto').innerHTML =
        esCorrecta ? pregunta.retro_ok : pregunta.retro_mal;

    // ---- Guía pedagógica ----
    const patronEl = document.getElementById('modal-retro-patron');
    if (guia) {
        patronEl.style.display = 'block';
        document.getElementById('patron-titulo').textContent   = guia.patron;
        document.getElementById('patron-hallazgo').innerHTML   = `<strong>Hallazgo clave:</strong> ${guia.hallazgo}`;
        document.getElementById('patron-medida').innerHTML     = `<strong>Medida técnica:</strong> ${guia.medida}`;
        document.getElementById('patron-fisio').innerHTML      = `<strong>Fisiopatología:</strong> ${guia.fisio}`;
    } else {
        patronEl.style.display = 'none';
    }

    // ---- Derivaciones clave (siempre, no solo en acierto) ----
    const leadsEl = document.getElementById('modal-retro-leads');
    if (pregunta.derivaciones_clave && pregunta.derivaciones_clave.length > 0) {
        leadsEl.style.display = 'flex';
        leadsEl.innerHTML =
            `<span class="retro-leads-label">Derivaciones clave:</span>` +
            pregunta.derivaciones_clave.map(l =>
                `<span class="retro-lead-chip" style="background:${pregunta.color_clave}20;
                 color:${pregunta.color_clave};border-color:${pregunta.color_clave}80">${l}</span>`
            ).join('');
    } else {
        leadsEl.style.display = 'none';
    }

    // ---- Resaltar las derivaciones SIEMPRE (no solo en acierto) ----
    if (pregunta.derivaciones_clave && pregunta.derivaciones_clave.length > 0) {
        resaltarDerivaciones(pregunta.derivaciones_clave, pregunta.color_clave);
        // Scroll suave al monitor para que el estudiante vea el resaltado
        setTimeout(() =>
            document.getElementById('quiz-monitor-grid')
                ?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
        250);
    }

    modal.style.display = 'flex';

    // Al cerrar: desbloquear siguiente pregunta o mostrar nav final
    const idxActual   = preguntasOrden.indexOf(pregunta.id);
    const siguienteId = preguntasOrden[idxActual + 1];
    _modalCallback = () => {
        modal.style.display = 'none';
        if (siguienteId) {
            const nextCard = document.getElementById(`pregunta-card-${siguienteId}`);
            nextCard?.classList.remove('bloqueada');
            setTimeout(() => nextCard?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
        } else {
            setTimeout(mostrarNavFinal, 400);
        }
    };
}

function inicializarModalRetro() {
    document.getElementById('modal-retro-continuar')
        .addEventListener('click', () => _modalCallback?.());
    // Cerrar con Escape
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && document.getElementById('modal-retro').style.display !== 'none')
            _modalCallback?.();
    });
}

// ================================================================
//  LÓGICA DE RESPUESTA Y RETROALIMENTACIÓN
// ================================================================

function responder(pregunta, opcionElegida) {
    if (respuestasDadas[pregunta.id]) return;
    respuestasDadas[pregunta.id] = opcionElegida.id;

    const esCorrecta = opcionElegida.correcta;
    if (esCorrecta) correctas++;
    totalRespondidas++;
    actualizarPuntaje();

    // Deshabilitar botones y colorear opciones
    const card = document.getElementById(`pregunta-card-${pregunta.id}`);
    card.querySelectorAll('.opcion-btn').forEach(btn => { btn.disabled = true; });

    pregunta.opciones.forEach(op => {
        const btn = document.getElementById(`opcion-${pregunta.id}-${op.id}`);
        if (!btn) return;
        if (op.correcta)                          btn.classList.add('correcta-mostrada');
        else if (op.id === opcionElegida.id)      btn.classList.add('elegida-incorrecta');
        else                                      btn.classList.add('incorrecta-mostrada');
    });

    card.classList.add(esCorrecta ? 'respondida-ok' : 'respondida-mal');

    // Guardar resultado en servidor (fire-and-forget, no bloquea el quiz)
    fetch('/api/guardar_resultado', {
        method:  'POST',
        headers: {'Content-Type': 'application/json'},
        body:    JSON.stringify({
            caso_id:     casoActual.caso_id,
            pregunta_id: pregunta.id,
            es_correcto: esCorrecta,
        })
    }).catch(() => {});   // silencioso si no hay sesión iniciada

    // Abrir modal pedagógico (con pequeño delay para ver el color del botón)
    setTimeout(() => abrirModalRetro(pregunta, esCorrecta), 320);
}

// ================================================================
//  RESALTADO DE DERIVACIONES CLAVE
// ================================================================

function resaltarDerivaciones(canales, color) {
    // Extraer R,G,B del color hex para CSS
    const rgb = hexARGB(color);

    canales.forEach(canal => {
        const div = document.getElementById(`qd-${canal}`);
        if (!div) return;
        div.classList.add('derivacion-clave');
        div.style.borderColor = color;
        div.style.setProperty('--clave-rgb', rgb);

        const badge = document.getElementById(`badge-${canal}`);
        if (badge) {
            badge.style.background = color;
            badge.textContent = 'CLAVE';
        }
    });
}

function limpiarResaltadoDerivaciones() {
    document.querySelectorAll('.quiz-derivacion.derivacion-clave').forEach(div => {
        div.classList.remove('derivacion-clave');
        div.style.borderColor = '';
    });
    document.querySelectorAll('.quiz-derivacion-badge').forEach(b => {
        b.style.background = '';
    });
}

function hexARGB(hex) {
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return `${r},${g},${b}`;
}

// ================================================================
//  PUNTAJE Y NAVEGACIÓN FINAL
// ================================================================

function actualizarPuntaje() {
    document.getElementById('puntaje-correctas').textContent = correctas;
    document.getElementById('puntaje-total').textContent     = totalRespondidas;
}

function mostrarNavFinal() {
    const nav = document.getElementById('quiz-nav');
    nav.style.display = 'flex';

    const pct = Math.round((correctas / totalRespondidas) * 100);
    const emoji = pct === 100 ? '🏆' : pct >= 75 ? '✅' : pct >= 50 ? '📚' : '🔄';
    document.getElementById('resultado-resumen').textContent =
        `${emoji}  Aciertos acumulados: ${correctas} / ${totalRespondidas} (${pct}%)`;

    nav.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ================================================================
//  INICIO
// ================================================================

window.onload = () => {
    inicializarModalRetro();
    inicializarModalZoom();
    cargarCaso();
};
