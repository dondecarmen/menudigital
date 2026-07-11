// =========================================================================
// 🔐 CONFIGURACIÓN DEL PIN DE ADMINISTRADOR
// ⚠️ CAMBIA ESTE VALOR POR TU PIN SECRETO
// =========================================================================
const PIN_ADMIN = "1234"; // 👈 Cambia esto por tu clave real

// =========================================================================
// 🔥 CONEXIÓN CON FIREBASE
// =========================================================================
const firebaseConfig = {
    apiKey: "AIzaSyA8I3ybJNfXLYvx6quNcgYv9mDpOMyWhjc",
    authDomain: "donde-carmen.firebaseapp.com",
    projectId: "donde-carmen",
    storageBucket: "donde-carmen.firebasestorage.app",
    messagingSenderId: "432685338703",
    appId: "1:432685338703:web:81967270e483e477ed5a3a",
    measurementId: "G-TR69YF2SSC"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// =========================================================================
// ❌ VARIABLE GLOBAL PARA CANCELACIÓN DE PEDIDOS
// =========================================================================
let pedidoACancelar = null;

// =========================================================================
// 🔐 SISTEMA DE AUTENTICACIÓN
// =========================================================================
let sesionActiva = false;
let valoresSensiblesVisibles = false;
let valoresReales = { ventas: 0, ticket: 0 };

function verificarPin(pinIngresado) {
    return pinIngresado === PIN_ADMIN;
}

function iniciarSesion() {
    sesionActiva = true;
    sessionStorage.setItem('admin_auth', 'ok');
    document.getElementById('modal-login').style.display = 'none';
    document.getElementById('contenido-admin').style.display = 'block';
    escucharPedidosHoy();
}

function cerrarSesion() {
    sesionActiva = false;
    valoresSensiblesVisibles = false;
    sessionStorage.removeItem('admin_auth');
    document.getElementById('contenido-admin').style.display = 'none';
    document.getElementById('modal-login').style.display = 'flex';
    document.getElementById('input-pin').value = '';
    document.getElementById('login-error').textContent = '';
    if (unsubscribePedidos) unsubscribePedidos();
    ocultarValoresSensibles();
}

function verificarSesionActiva() {
    if (sessionStorage.getItem('admin_auth') === 'ok') {
        iniciarSesion();
    }
}

// =========================================================================
// 👁️ MOSTRAR / OCULTAR VALORES SENSIBLES
// =========================================================================
function mostrarValoresSensibles() {
    valoresSensiblesVisibles = true;
    const elVentas = document.getElementById('stat-ventas');
    const elTicket = document.getElementById('stat-ticket');
    elVentas.textContent = formatPrecio(valoresReales.ventas);
    elVentas.classList.remove('valor-oculto');
    elTicket.textContent = formatPrecio(valoresReales.ticket);
    elTicket.classList.remove('valor-oculto');
    document.getElementById('btn-ojo-ventas').textContent = '🙈';
    document.getElementById('btn-ojo-ticket').textContent = '🙈';
}

function ocultarValoresSensibles() {
    valoresSensiblesVisibles = false;
    const elVentas = document.getElementById('stat-ventas');
    const elTicket = document.getElementById('stat-ticket');
    elVentas.textContent = '****';
    elVentas.classList.add('valor-oculto');
    elTicket.textContent = '****';
    elTicket.classList.add('valor-oculto');
    document.getElementById('btn-ojo-ventas').textContent = '👁️';
    document.getElementById('btn-ojo-ticket').textContent = '👁️';
}

function toggleValoresSensibles() {
    if (valoresSensiblesVisibles) {
        ocultarValoresSensibles();
    } else {
        abrirModalPinRapido(mostrarValoresSensibles);
    }
}

function abrirModalPinRapido(callbackExito) {
    const modal = document.getElementById('modal-pin-rapido');
    const input = document.getElementById('input-pin-rapido');
    const error = document.getElementById('error-pin-rapido');
    input.value = '';
    error.textContent = '';
    input.classList.remove('error');
    modal.classList.add('activo');
    setTimeout(() => input.focus(), 100);

    const btnConfirmar = document.getElementById('btn-confirmar-pin-rapido');
    const nuevoBtn = btnConfirmar.cloneNode(true);
    btnConfirmar.parentNode.replaceChild(nuevoBtn, btnConfirmar);

    nuevoBtn.addEventListener('click', () => {
        const pin = input.value.trim();
        if (verificarPin(pin)) {
            modal.classList.remove('activo');
            callbackExito();
        } else {
            input.classList.add('error');
            error.textContent = '❌ PIN incorrecto';
            input.value = '';
            setTimeout(() => {
                input.classList.remove('error');
                error.textContent = '';
            }, 1500);
        }
    });

    input.onkeydown = (e) => {
        if (e.key === 'Enter') nuevoBtn.click();
    };
}

// =========================================================================
// 📅 UTILIDADES DE FECHA
// =========================================================================
function fechaHoy() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function formatFecha(fechaStr) {
    const [y,m,d] = fechaStr.split('-');
    return `${d}/${m}/${y}`;
}
function formatPrecio(n) {
    return '$' + Number(n||0).toLocaleString('es-CO');
}
function getFechaDeTimestamp(ts) {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// =========================================================================
// 📊 LISTENER EN TIEMPO REAL
// =========================================================================
let pedidosHoy = [];
let unsubscribePedidos = null;
let primeraCarga = true;

function escucharPedidosHoy() {
    const contenedor = document.getElementById('contenedor-pedidos');
    document.getElementById('fecha-hoy').textContent = formatFecha(fechaHoy());

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    if (unsubscribePedidos) unsubscribePedidos();

    contenedor.innerHTML = '<div class="vacio-mensaje">Conectando con Firebase...</div>';

    unsubscribePedidos = db.collection('pedidos_donde_carmen')
        .where('fecha_raw', '>=', hoy)
        .where('fecha_raw', '<', manana)
        .orderBy('fecha_raw', 'desc')
        .onSnapshot((snapshot) => {
            const pedidosAnteriores = pedidosHoy.length;

            pedidosHoy = [];
            snapshot.forEach(doc => {
                pedidosHoy.push({ id: doc.id, ...doc.data() });
            });

            renderizarPedidosHoy();
            actualizarEstadisticas();

            if (!primeraCarga) {
                const cambios = snapshot.docChanges();
                const hayNuevos = cambios.some(c => c.type === 'added');
                if (hayNuevos && pedidosHoy.length > pedidosAnteriores) {
                    mostrarNotificacion('🆕 ¡Nuevo pedido recibido!');
                    reproducirSonido();
                }
            }
            primeraCarga = false;
        }, (error) => {
            console.error('Error listener:', error);
            contenedor.innerHTML = '<div class="vacio-mensaje">⚠️ Error de conexión. Reintentando...</div>';
        });
}

// =========================================================================
// 🔔 NOTIFICACIÓN TIPO TOAST
// =========================================================================
function mostrarNotificacion(mensaje) {
    let toast = document.getElementById('toast-admin');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-admin';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #25d366, #128c7e);
            color: white;
            padding: 15px 25px;
            border-radius: 12px;
            font-weight: 800;
            box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4);
            z-index: 99999;
            font-family: 'Poppins', sans-serif;
        `;
        if (!document.getElementById('anim-toast')) {
            const style = document.createElement('style');
            style.id = 'anim-toast';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(120%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        document.body.appendChild(toast);
    }
    toast.textContent = mensaje;
    toast.style.display = 'block';
    toast.style.animation = 'none';
    setTimeout(() => { toast.style.animation = 'slideInRight 0.4s ease'; }, 10);
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.style.display = 'none';
    }, 4000);
}

// =========================================================================
// 🔊 SONIDO DE ALERTA
// =========================================================================
function reproducirSonido() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);

        setTimeout(() => {
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.type = 'sine';
            osc2.frequency.value = 1100;
            gain2.gain.setValueAtTime(0.3, ctx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc2.start(ctx.currentTime);
            osc2.stop(ctx.currentTime + 0.3);
        }, 150);
    } catch (e) {
        console.log('Audio no soportado:', e);
    }
}

// =========================================================================
// 📋 RENDERIZAR PEDIDOS DEL DÍA
// =========================================================================
function renderizarPedidosHoy() {
    const contenedor = document.getElementById('contenedor-pedidos');
    if (pedidosHoy.length === 0) {
        contenedor.innerHTML = '<div class="vacio-mensaje">📭 No hay pedidos registrados hoy. Esperando nuevos pedidos en tiempo real...</div>';
        return;
    }
    let html = `
        <table class="tabla-pedidos">
            <thead>
                <tr>
                    <th>Hora</th>
                    <th>Cliente</th>
                    <th class="col-ocultar-movil">Tipo</th>
                    <th>Productos</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;
    pedidosHoy.forEach(p => {
        const hora = p.hora || '--:--';
        const cliente = p.cliente || 'Cliente Web';
        const tipo = p.tipo_entrega || '-';
        const numProductos = p.productos ? p.productos.reduce((s,x)=>s+(x.cantidad||1),0) : 0;
        const total = p.total || 0;
        const estado = p.estado || 'Pendiente';
        const claseEstado = estado === 'Entregado' ? 'badge-entregado' :
                            estado === 'Cerrado' ? 'badge-cerrado' :
                            estado === 'Cancelado' ? 'badge-cancelado' : 'badge-pendiente';

        const puedeCancelar = (estado === 'Pendiente' || estado === 'Entregado');
        const botonCancelar = puedeCancelar ?
            `<button class="btn-cancelar-pedido" data-id="${p.id}" data-cliente="${cliente}" data-total="${total}">❌ Cancelar</button>` :
            '<span style="color:#6c757d; font-size:0.8rem;">—</span>';

        html += `
            <tr>
                <td>${hora}</td>
                <td>${cliente}</td>
                <td class="col-ocultar-movil">${tipo}</td>
                <td>${numProductos} item(s)</td>
                <td><strong>${formatPrecio(total)}</strong></td>
                <td><span class="badge-estado ${claseEstado}">${estado}</span></td>
                <td>${botonCancelar}</td>
            </tr>
        `;
    });
    html += '</tbody></table>';
    contenedor.innerHTML = html;

    // Agregar event listeners a los botones de cancelar
    document.querySelectorAll('.btn-cancelar-pedido').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const cliente = btn.getAttribute('data-cliente');
            const total = btn.getAttribute('data-total');
            abrirModalCancelarPedido(id, cliente, total);
        });
    });
}

// =========================================================================
// ❌ CANCELAR PEDIDO
// =========================================================================
function abrirModalCancelarPedido(id, cliente, total) {
    pedidoACancelar = id; // Guardar el ID del pedido

    const modal = document.getElementById('modal-cancelar');
    const inputMotivo = document.getElementById('motivo-cancelacion');
    const error = document.getElementById('error-cancelacion');

    document.getElementById('info-pedido-cancelar').innerHTML = `
        <div style="background:#fff3cd; padding:12px; border-radius:10px; margin-bottom:15px; border-left:4px solid #ffc107;">
            <div style="font-weight:700; color:#856404; margin-bottom:5px;">📦 Pedido a cancelar:</div>
            <div style="color:#212529;"><strong>Cliente:</strong> ${cliente}</div>
            <div style="color:#212529;"><strong>Total:</strong> ${formatPrecio(total)}</div>
        </div>
    `;

    inputMotivo.value = '';
    error.textContent = '';
    error.style.color = '';
    modal.classList.add('activo');
    setTimeout(() => inputMotivo.focus(), 100);
}

async function confirmarCancelacion() {
    const motivo = document.getElementById('motivo-cancelacion').value.trim();
    const error = document.getElementById('error-cancelacion');

    if (!motivo) {
        error.textContent = '⚠️ Debes ingresar un motivo de cancelación';
        error.style.color = '#dc3545';
        return;
    }

    if (!pedidoACancelar) {
        error.textContent = '⚠️ Error: No se pudo identificar el pedido';
        error.style.color = '#dc3545';
        return;
    }

    const btn = document.getElementById('btn-confirmar-cancelacion');
    btn.disabled = true;
    btn.textContent = 'Cancelando...';

    try {
        await db.collection('pedidos_donde_carmen').doc(pedidoACancelar).update({
            estado: 'Cancelado',
            motivo_cancelacion: motivo,
            fecha_cancelacion: new Date()
        });

        cerrarModal('modal-cancelar');
        mostrarNotificacion('❌ Pedido cancelado correctamente');
        pedidoACancelar = null; // Limpiar la variable

    } catch (err) {
        console.error(err);
        error.textContent = '⚠️ Error al cancelar: ' + err.message;
        error.style.color = '#dc3545';
    } finally {
        btn.disabled = false;
        btn.textContent = '✅ Confirmar Cancelación';
    }
}

// =========================================================================
// 📊 ACTUALIZAR ESTADÍSTICAS
// =========================================================================
function actualizarEstadisticas() {
    const pedidosActivos = pedidosHoy.filter(p => p.estado !== 'Cancelado');
    const totalVentas = pedidosActivos.reduce((s,p) => s + (p.total||0), 0);
    const ticketProm = pedidosActivos.length > 0 ? totalVentas / pedidosActivos.length : 0;

    valoresReales.ventas = totalVentas;
    valoresReales.ticket = Math.round(ticketProm);

    document.getElementById('stat-pedidos').textContent = pedidosActivos.length;
    cargarContadorCierres();

    if (valoresSensiblesVisibles) {
        mostrarValoresSensibles();
    }
}

async function cargarContadorCierres() {
    try {
        const hoy = fechaHoy();
        const snap = await db.collection('cierres_caja')
            .where('fecha', '==', hoy)
            .get();
        document.getElementById('stat-cierres').textContent = snap.size;
    } catch(e) {
        document.getElementById('stat-cierres').textContent = '0';
    }
}

// =========================================================================
// 📅 HISTORIAL DE VENTAS POR RANGO DE FECHAS
// =========================================================================
async function buscarHistorial() {
    const desde = document.getElementById('fecha-desde').value;
    const hasta = document.getElementById('fecha-hasta').value;
    const cont = document.getElementById('contenedor-historial');

    if (!desde || !hasta) {
        cont.innerHTML = '<div class="vacio-mensaje">⚠️ Selecciona ambas fechas.</div>';
        return;
    }
    cont.innerHTML = '<div class="vacio-mensaje">Buscando...</div>';

    try {
        const fechaInicio = new Date(desde + 'T00:00:00');
        const fechaFin = new Date(hasta + 'T23:59:59');

        const snap = await db.collection('pedidos_donde_carmen')
            .where('fecha_raw', '>=', fechaInicio)
            .where('fecha_raw', '<=', fechaFin)
            .orderBy('fecha_raw', 'desc')
            .get();

        const pedidos = [];
        snap.forEach(doc => pedidos.push({ id: doc.id, ...doc.data() }));

        if (pedidos.length === 0) {
            cont.innerHTML = '<div class="vacio-mensaje">📭 No hay ventas en ese rango.</div>';
            return;
        }

        const porDia = {};
        pedidos.forEach(p => {
            const dia = getFechaDeTimestamp(p.fecha_raw);
            if (!porDia[dia]) porDia[dia] = { pedidos: 0, total: 0, lista: [] };
            if (p.estado !== 'Cancelado') {
                porDia[dia].pedidos++;
                porDia[dia].total += (p.total||0);
            }
            porDia[dia].lista.push(p);
        });

        let html = '';
        Object.keys(porDia).sort().reverse().forEach(dia => {
            const info = porDia[dia];
            html += `
                <div style="background:#f8fafc; border-radius:12px; padding:15px; margin-bottom:15px; border-left:4px solid #ff4757;">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:10px;">
                        <h3 style="margin:0; color:#212529;">📆 ${formatFecha(dia)}</h3>
                        <div style="display:flex; gap:15px;">
                            <span style="font-weight:700; color:#495057;">📦 ${info.pedidos} pedidos</span>
                            <span style="font-weight:800; color:#25d366;">💰 ${formatPrecio(info.total)}</span>
                        </div>
                    </div>
                    <table class="tabla-pedidos" style="margin:0;">
                        <thead>
                            <tr>
                                <th>Hora</th>
                                <th>Cliente</th>
                                <th class="col-ocultar-movil">Tipo</th>
                                <th>Productos</th>
                                <th>Total</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            info.lista.forEach(p => {
                const numProd = p.productos ? p.productos.reduce((s,x)=>s+(x.cantidad||1),0) : 0;
                const estado = p.estado || 'Pendiente';
                const claseEstado = estado === 'Entregado' ? 'badge-entregado' :
                                    estado === 'Cerrado' ? 'badge-cerrado' :
                                    estado === 'Cancelado' ? 'badge-cancelado' : 'badge-pendiente';
                html += `
                    <tr>
                        <td>${p.hora || '--:--'}</td>
                        <td>${p.cliente || 'Cliente Web'}</td>
                        <td class="col-ocultar-movil">${p.tipo_entrega || '-'}</td>
                        <td>${numProd} item(s)</td>
                        <td><strong>${formatPrecio(p.total||0)}</strong></td>
                        <td><span class="badge-estado ${claseEstado}">${estado}</span></td>
                    </tr>
                `;
            });
            html += `</tbody></table></div>`;
        });
        cont.innerHTML = html;
    } catch (err) {
        console.error(err);
        cont.innerHTML = '<div class="vacio-mensaje">⚠️ Error al buscar. Revisa la consola.</div>';
    }
}

// =========================================================================
// 📥 EXPORTAR CSV
// =========================================================================
function exportarCSV() {
    if (pedidosHoy.length === 0) {
        alert('⚠️ No hay pedidos hoy para exportar.');
        return;
    }
    let csv = 'Fecha,Hora,Cliente,Tipo Entrega,Productos,Total,Estado,Motivo Cancelación\n';
    pedidosHoy.forEach(p => {
        const fecha = getFechaDeTimestamp(p.fecha_raw);
        const productos = (p.productos||[]).map(x => `${x.cantidad||1}x ${x.nombre}`).join(' | ');
        const motivo = p.motivo_cancelacion || '';
        csv += `"${fecha}","${p.hora||''}","${p.cliente||''}","${p.tipo_entrega||''}","${productos}",${p.total||0},"${p.estado||''}","${motivo}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ventas_dondecarmen_${fechaHoy()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// =========================================================================
// 🔐 CERRAR CAJA + IMPRIMIR TICKET
// =========================================================================
function abrirModalCierre() {
    const pedidosActivos = pedidosHoy.filter(p => p.estado !== 'Cancelado');

    if (pedidosActivos.length === 0) {
        alert('⚠️ No hay pedidos activos hoy para cerrar caja.');
        return;
    }

    const total = pedidosActivos.reduce((s,p) => s + (p.total||0), 0);
    const domicilio = pedidosActivos.filter(p => p.tipo_entrega === 'Domicilio').length;
    const local = pedidosActivos.filter(p => p.tipo_entrega !== 'Domicilio').length;
    const cancelados = pedidosHoy.filter(p => p.estado === 'Cancelado').length;

    document.getElementById('resumen-cierre').innerHTML = `
        <div style="display:flex; justify-content:space-between; padding:5px 0;">
            <span>📦 Total de pedidos:</span>
            <strong>${pedidosActivos.length}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; padding:5px 0;">
            <span>🛵 Domicilios:</span>
            <strong>${domicilio}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; padding:5px 0;">
            <span>🏠 Local:</span>
            <strong>${local}</strong>
        </div>
        ${cancelados > 0 ? `
        <div style="display:flex; justify-content:space-between; padding:5px 0; color:#dc3545;">
            <span>❌ Cancelados:</span>
            <strong>${cancelados}</strong>
        </div>
        ` : ''}
        <div style="display:flex; justify-content:space-between; padding:8px 0; border-top:2px dashed #ced4da; margin-top:8px;">
            <span style="font-size:1.1rem;">💰 TOTAL RECAUDADO:</span>
            <strong style="color:#25d366; font-size:1.2rem;">${formatPrecio(total)}</strong>
        </div>
    `;
    document.getElementById('modal-cierre').classList.add('activo');
}

async function confirmarCierre() {
    const pedidosActivos = pedidosHoy.filter(p => p.estado !== 'Cancelado');
    const total = pedidosActivos.reduce((s,p) => s + (p.total||0), 0);
    const btn = document.getElementById('btn-confirmar-cierre');
    btn.disabled = true;
    btn.textContent = 'Procesando...';

    try {
        await db.collection('cierres_caja').add({
            fecha: fechaHoy(),
            fecha_completa: new Date(),
            total_pedidos: pedidosActivos.length,
            total_ventas: total,
            ticket_promedio: Math.round(total / pedidosActivos.length),
            pedidos_ids: pedidosActivos.map(p => p.id)
        });

        const batch = db.batch();
        pedidosActivos.forEach(p => {
            const ref = db.collection('pedidos_donde_carmen').doc(p.id);
            batch.update(ref, { estado: 'Cerrado' });
        });
        await batch.commit();

        generarTicket();
        setTimeout(() => window.print(), 300);

        cerrarModal('modal-cierre');
        mostrarNotificacion('✅ Caja cerrada con éxito');
    } catch (err) {
        console.error(err);
        alert('⚠️ Error al cerrar caja: ' + err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = '✅ Confirmar e Imprimir';
    }
}

function generarTicket() {
    const pedidosActivos = pedidosHoy.filter(p => p.estado !== 'Cancelado');
    const total = pedidosActivos.reduce((s,p) => s + (p.total||0), 0);
    const ahora = new Date();
    const horaStr = ahora.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

    let itemsHtml = '';
    pedidosActivos.forEach((p, i) => {
        let detalles = '';
        if (p.productos) {
            p.productos.forEach(prod => {
                detalles += `<div class="item-detalle">- ${prod.cantidad||1}x ${prod.nombre} (${formatPrecio((prod.precio||0)*(prod.cantidad||1))})</div>`;
            });
        }
        itemsHtml += `
            <li>
                <div class="item-linea">
                    <span class="item-nombre">#${i+1} - ${p.cliente || 'Cliente Web'}</span>
                    <span>${formatPrecio(p.total||0)}</span>
                </div>
                <div class="item-detalle">${p.hora || '--:--'} | ${p.tipo_entrega || '-'}</div>
                ${detalles}
            </li>
        `;
    });

    document.getElementById('ticket-impresion').innerHTML = `
        <div class="ticket-header">
            <h2>DONDE CARMEN</h2>
            <p>🍔 Menú Digital</p>
            <p>CIERRE DE CAJA</p>
        </div>
        <div class="ticket-info">
            <div><span>📅 Fecha:</span><strong>${formatFecha(fechaHoy())}</strong></div>
            <div><span>🕐 Hora cierre:</span><strong>${horaStr}</strong></div>
            <div><span>📦 Total pedidos:</span><strong>${pedidosActivos.length}</strong></div>
        </div>
        <ul class="ticket-items">
            ${itemsHtml}
        </ul>
        <div class="ticket-total">
            <div class="fila-total">
                <span>SUBTOTAL:</span>
                <span>${formatPrecio(total)}</span>
            </div>
            <div class="fila-total gran-total">
                <span>TOTAL:</span>
                <span>${formatPrecio(total)}</span>
            </div>
            <div class="fila-total" style="margin-top:8px; font-size:0.9rem;">
                <span>Ticket promedio:</span>
                <span>${formatPrecio(Math.round(total/pedidosActivos.length))}</span>
            </div>
        </div>
        <div class="ticket-footer">
            <p>¡Gracias por su preferencia!</p>
            <p>--- Donde Carmen ---</p>
        </div>
    `;
    document.getElementById('ticket-impresion').style.display = 'block';
}

// =========================================================================
// 🔧 UTILIDADES DE MODAL
// =========================================================================
function cerrarModal(id) {
    document.getElementById(id).classList.remove('activo');
}

// =========================================================================
// 🎯 EVENTOS PRINCIPALES
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
    verificarSesionActiva();

    // 🔐 LOGIN PRINCIPAL
    const inputPin = document.getElementById('input-pin');
    const btnIngresar = document.getElementById('btn-ingresar');
    const loginError = document.getElementById('login-error');

    btnIngresar.addEventListener('click', () => {
        const pin = inputPin.value.trim();
        if (verificarPin(pin)) {
            iniciarSesion();
        } else {
            inputPin.classList.add('error');
            loginError.textContent = '❌ PIN incorrecto. Intenta de nuevo.';
            inputPin.value = '';
            setTimeout(() => {
                inputPin.classList.remove('error');
                loginError.textContent = '';
            }, 1500);
        }
    });

    inputPin.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') btnIngresar.click();
    });

    // 👁️ BOTONES DE OJO
    document.getElementById('btn-ojo-ventas').addEventListener('click', toggleValoresSensibles);
    document.getElementById('btn-ojo-ticket').addEventListener('click', toggleValoresSensibles);

    // 🔐 CERRAR SESIÓN
    document.getElementById('btn-cerrar-sesion').addEventListener('click', () => {
        if (confirm('¿Seguro que deseas cerrar sesión?')) {
            cerrarSesion();
        }
    });

    // 📅 HISTORIAL
    const hoy = fechaHoy();
    const hace7 = new Date();
    hace7.setDate(hace7.getDate() - 7);
    document.getElementById('fecha-hasta').value = hoy;
    document.getElementById('fecha-desde').value = `${hace7.getFullYear()}-${String(hace7.getMonth()+1).padStart(2,'0')}-${String(hace7.getDate()).padStart(2,'0')}`;

    document.getElementById('btn-ver-historial').addEventListener('click', () => {
        document.getElementById('modal-historial').classList.add('activo');
    });
    document.getElementById('btn-filtrar-historial').addEventListener('click', buscarHistorial);

    // 📥 CSV
    document.getElementById('btn-exportar-csv').addEventListener('click', exportarCSV);

    // 🔐 CERRAR CAJA
    document.getElementById('btn-cerrar-caja').addEventListener('click', abrirModalCierre);
    document.getElementById('btn-confirmar-cierre').addEventListener('click', confirmarCierre);

    // ❌ CANCELAR PEDIDO
    document.getElementById('btn-confirmar-cancelacion').addEventListener('click', confirmarCancelacion);

    // Cerrar modales al hacer clic fuera
    document.querySelectorAll('.modal-admin').forEach(m => {
        m.addEventListener('click', (e) => {
            if (e.target === m) m.classList.remove('activo');
        });
    });

    // 🔊 Activar audio al primer clic
    document.body.addEventListener('click', function activarAudio() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            ctx.resume();
        } catch(e) {}
        document.body.removeEventListener('click', activarAudio);
    }, { once: true });
});