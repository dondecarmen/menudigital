<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Panel de Administración - Donde Carmen</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    /* ==========================================================================
    CONFIGURACIÓN GENERAL
    ========================================================================== */
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Poppins', 'Segoe UI', sans-serif;
    }
    body {
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ed 100%);
      min-height: 100vh;
      color: #1a1a1a;
    }

    /* ==========================================================================
    MODAL DE LOGIN
    ========================================================================== */
    .modal-login {
      position: fixed;
      inset: 0;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 99999;
      padding: 20px;
    }
    .login-box {
      background: #fff;
      padding: 40px 30px;
      border-radius: 20px;
      width: 100%;
      max-width: 400px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .login-box .icono {
      font-size: 4rem;
      margin-bottom: 15px;
    }
    .login-box h2 {
      color: #212529;
      font-weight: 900;
      margin-bottom: 8px;
      font-size: 1.6rem;
    }
    .login-box p {
      color: #6c757d;
      margin-bottom: 25px;
      font-size: 0.95rem;
    }
    .login-box input {
      width: 100%;
      padding: 14px;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      font-size: 1.1rem;
      text-align: center;
      letter-spacing: 8px;
      font-weight: 700;
      margin-bottom: 15px;
      transition: border-color 0.2s;
    }
    .login-box input:focus {
      outline: none;
      border-color: #ff4757;
    }
    .login-box input.error {
      border-color: #dc3545;
      animation: shake 0.4s;
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-8px); }
      75% { transform: translateX(8px); }
    }
    .login-box button {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #ff4757, #ff6b81);
      color: #fff;
      border: none;
      border-radius: 12px;
      font-weight: 800;
      font-size: 1rem;
      cursor: pointer;
      text-transform: uppercase;
      transition: transform 0.1s, box-shadow 0.2s;
      box-shadow: 0 4px 15px rgba(255,71,87,0.3);
    }
    .login-box button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255,71,87,0.4);
    }
    .login-box button:active { transform: scale(0.98); }
    .login-error {
      color: #dc3545;
      font-weight: 700;
      font-size: 0.9rem;
      min-height: 20px;
      margin-top: 10px;
    }

    /* ==========================================================================
    HEADER DEL PANEL
    ========================================================================== */
    .header-admin {
      background: linear-gradient(135deg, #ff4757, #ff6b81);
      color: #fff;
      padding: 20px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }
    .header-admin h1 {
      font-size: 1.4rem;
      font-weight: 900;
    }
    .header-admin .acciones {
      display: flex;
      gap: 10px;
    }
    .header-admin button {
      padding: 8px 16px;
      border: 2px solid #fff;
      background: transparent;
      color: #fff;
      border-radius: 10px;
      font-weight: 700;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.2s;
    }
    .header-admin button:hover {
      background: #fff;
      color: #ff4757;
    }

    /* ==========================================================================
    CONTENEDOR PRINCIPAL
    ========================================================================== */
    .contenido-admin {
      display: none;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    /* ==========================================================================
    TARJETAS DE ESTADÍSTICAS
    ========================================================================== */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 15px;
      margin-bottom: 25px;
    }
    .stat-card {
      background: #fff;
      padding: 20px;
      border-radius: 16px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
      border-left: 5px solid #ff4757;
      transition: transform 0.2s;
    }
    .stat-card:hover { transform: translateY(-3px); }
    .stat-card:nth-child(2) { border-left-color: #25d366; }
    .stat-card:nth-child(3) { border-left-color: #ffc107; }
    .stat-card:nth-child(4) { border-left-color: #17a2b8; }
    .stat-label {
      font-size: 0.85rem;
      color: #6c757d;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .stat-value {
      font-size: 2rem;
      font-weight: 900;
      color: #212529;
    }
    .stat-value.valor-oculto {
      letter-spacing: 4px;
      color: #adb5bd;
    }
    .btn-ojo {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.2rem;
      padding: 4px;
    }

    /* ==========================================================================
    BOTONES DE ACCIÓN
    ========================================================================== */
    .acciones-panel {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      margin-bottom: 25px;
    }
    .btn-accion {
      padding: 14px;
      border: none;
      border-radius: 12px;
      font-weight: 800;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
      color: #fff;
      text-transform: uppercase;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .btn-accion:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.15); }
    .btn-accion:active { transform: scale(0.98); }
    .btn-historial { background: linear-gradient(135deg, #17a2b8, #138496); }
    .btn-csv { background: linear-gradient(135deg, #28a745, #218838); }
    .btn-cierre { background: linear-gradient(135deg, #6f42c1, #5a32a3); }

    /* ==========================================================================
    TABLA DE PEDIDOS
    ========================================================================== */
    .seccion-pedidos {
      background: #fff;
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
      margin-bottom: 25px;
    }
    .seccion-pedidos h2 {
      color: #212529;
      font-weight: 900;
      margin-bottom: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }
    .fecha-hoy-badge {
      background: #ffe0e2;
      color: #ff4757;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 700;
    }
    .tabla-pedidos {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }
    .tabla-pedidos thead {
      background: #f8fafc;
    }
    .tabla-pedidos th {
      padding: 12px 10px;
      text-align: left;
      font-weight: 800;
      color: #495057;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #e9ecef;
    }
    .tabla-pedidos td {
      padding: 12px 10px;
      border-bottom: 1px solid #f1f3f5;
      color: #212529;
    }
    .tabla-pedidos tbody tr:hover {
      background: #f8fafc;
    }
    .col-ocultar-movil { display: table-cell; }
    @media (max-width: 768px) {
      .col-ocultar-movil { display: none; }
      .tabla-pedidos { font-size: 0.8rem; }
      .tabla-pedidos th, .tabla-pedidos td { padding: 8px 5px; }
    }

    /* ==========================================================================
    BADGES DE ESTADO
    ========================================================================== */
    .badge-estado {
      padding: 5px 10px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      display: inline-block;
    }
    .badge-pendiente { background: #fff3cd; color: #856404; }
    .badge-preparando { background: #cfe2ff; color: #084298; }
    .badge-encamino { background: #e2d9f3; color: #5a32a3; }
    .badge-entregado { background: #d4edda; color: #155724; }
    .badge-cerrado { background: #e2e3e5; color: #383d41; }
    .badge-cancelado { background: #f8d7da; color: #721c24; }

    /* ==========================================================================
    ACCIONES DE ESTADO (DROPDOWN + CANCELAR)
    ========================================================================== */
    .acciones-estado {
      display: flex;
      gap: 5px;
      align-items: center;
      flex-wrap: wrap;
    }
    .select-estado {
      padding: 6px 8px;
      border-radius: 8px;
      border: 2px solid #e2e8f0;
      font-weight: 700;
      font-size: 0.75rem;
      cursor: pointer;
      background: #fff;
      transition: border-color 0.2s;
    }
    .select-estado:focus {
      border-color: #ff4757;
      outline: none;
    }
    .btn-cancelar-pedido {
      background: #fff5f5;
      border: 2px solid #ffc9c9;
      color: #c92a2a;
      padding: 6px 10px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 700;
      font-size: 0.75rem;
      transition: all 0.2s;
    }
    .btn-cancelar-pedido:hover {
      background: #c92a2a;
      color: #fff;
      border-color: #c92a2a;
    }

    /* ==========================================================================
    MENSAJES VACÍOS
    ========================================================================== */
    .vacio-mensaje {
      text-align: center;
      padding: 40px 20px;
      color: #6c757d;
      font-weight: 600;
      font-size: 0.95rem;
    }

    /* ==========================================================================
    MODALES GENÉRICOS
    ========================================================================== */
    .modal-admin {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      z-index: 99998;
      justify-content: center;
      align-items: center;
      padding: 20px;
      backdrop-filter: blur(3px);
    }
    .modal-admin.activo { display: flex; }
    .modal-contenido {
      background: #fff;
      border-radius: 20px;
      padding: 30px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.85); }
      to { opacity: 1; transform: scale(1); }
    }
    .modal-contenido h2 {
      color: #212529;
      font-weight: 900;
      margin-bottom: 15px;
      font-size: 1.4rem;
    }
    .modal-contenido label {
      display: block;
      font-weight: 700;
      color: #495057;
      margin-bottom: 6px;
      font-size: 0.9rem;
    }
    .modal-contenido input[type="date"],
    .modal-contenido input[type="text"],
    .modal-contenido textarea {
      width: 100%;
      padding: 12px;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      font-size: 0.95rem;
      margin-bottom: 15px;
      font-family: inherit;
    }
    .modal-contenido input:focus,
    .modal-contenido textarea:focus {
      outline: none;
      border-color: #ff4757;
    }
    .modal-botones {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }
    .modal-botones button {
      flex: 1;
      padding: 12px;
      border: none;
      border-radius: 10px;
      font-weight: 800;
      cursor: pointer;
      text-transform: uppercase;
      font-size: 0.85rem;
      transition: all 0.2s;
    }
    .btn-secundario {
      background: #f1f3f5;
      color: #495057;
    }
    .btn-secundario:hover { background: #e9ecef; }
    .btn-principal {
      background: linear-gradient(135deg, #ff4757, #ff6b81);
      color: #fff;
      box-shadow: 0 4px 12px rgba(255,71,87,0.3);
    }
    .btn-principal:hover { transform: translateY(-2px); }
    .btn-principal:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    .btn-verde {
      background: linear-gradient(135deg, #25d366, #128c7e);
      color: #fff;
      box-shadow: 0 4px 12px rgba(37,211,102,0.3);
    }

    /* ==========================================================================
    HISTORIAL
    ========================================================================== */
    .rango-fechas {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    /* ==========================================================================
    CONFIGURACIÓN DE IMPRESIÓN
    ========================================================================== */
    @media print {
      body * { visibility: hidden; }
      #ticket-impresion, #ticket-impresion * { visibility: visible; }
      #ticket-impresion {
        position: absolute;
        left: 0;
        top: 0;
        width: 80mm;
        font-family: 'Courier New', monospace;
        color: #000;
      }
      .ticket-header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 8px; margin-bottom: 10px; }
      .ticket-header h2 { font-size: 1.3rem; }
      .ticket-info { font-size: 0.9rem; margin-bottom: 10px; }
      .ticket-info div { display: flex; justify-content: space-between; padding: 3px 0; }
      .ticket-items { list-style: none; padding: 0; border-top: 1px dashed #000; padding-top: 8px; }
      .ticket-items li { margin-bottom: 10px; font-size: 0.9rem; }
      .item-linea { display: flex; justify-content: space-between; font-weight: 700; }
      .item-detalle { font-size: 0.8rem; color: #333; margin-left: 10px; }
      .ticket-total { border-top: 2px dashed #000; padding-top: 8px; margin-top: 10px; }
      .fila-total { display: flex; justify-content: space-between; padding: 3px 0; }
      .gran-total { font-size: 1.2rem; font-weight: 900; border-top: 1px solid #000; padding-top: 5px; margin-top: 5px; }
      .ticket-footer { text-align: center; margin-top: 15px; font-size: 0.85rem; border-top: 1px dashed #000; padding-top: 8px; }
    }
    #ticket-impresion { display: none; }

    /* ==========================================================================
    RESPONSIVE
    ========================================================================== */
    @media (max-width: 600px) {
      .header-admin h1 { font-size: 1.1rem; }
      .stat-value { font-size: 1.5rem; }
      .modal-contenido { padding: 20px; }
      .rango-fechas { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>

  <!-- ======================================================================
  MODAL DE LOGIN
  ======================================================================= -->
  <div id="modal-login" class="modal-login">
    <div class="login-box">
      <div class="icono">🔐</div>
      <h2>Acceso Restringido</h2>
      <p>Ingresa el PIN de administrador para continuar</p>
      <input type="password" id="input-pin" placeholder="••••" maxlength="10" inputmode="numeric">
      <button id="btn-ingresar">Ingresar al Panel</button>
      <div id="login-error" class="login-error"></div>
    </div>
  </div>

  <!-- ======================================================================
  CONTENIDO DEL PANEL
  ======================================================================= -->
  <div id="contenido-admin" class="contenido-admin">
    <header class="header-admin">
      <h1>🍔 Donde Carmen - Panel de Control</h1>
      <div class="acciones">
        <button id="btn-cerrar-sesion">🔒 Cerrar Sesión</button>
        <a href="../index.html" style="text-decoration:none;">
          <button>🛒 Ver Menú</button>
        </a>
      </div>
    </header>

    <!-- Estadísticas -->
    <div class="stats-grid" style="margin-top:20px;">
      <div class="stat-card">
        <div class="stat-label">📦 Pedidos Hoy</div>
        <div class="stat-value" id="stat-pedidos">0</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">
          💰 Ventas Totales
          <button class="btn-ojo" id="btn-ojo-ventas">👁️</button>
        </div>
        <div class="stat-value valor-oculto" id="stat-ventas">****</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">
          🎫 Ticket Promedio
          <button class="btn-ojo" id="btn-ojo-ticket">👁️</button>
        </div>
        <div class="stat-value valor-oculto" id="stat-ticket">****</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">🔐 Cierres Realizados</div>
        <div class="stat-value" id="stat-cierres">0</div>
      </div>
    </div>

    <!-- Botones de acción -->
    <div class="acciones-panel">
      <button class="btn-accion btn-historial" id="btn-ver-historial">📅 Ver Historial de Ventas</button>
      <button class="btn-accion btn-csv" id="btn-exportar-csv">📥 Exportar CSV / Excel</button>
      <button class="btn-accion btn-cierre" id="btn-cerrar-caja">🔐 Cerrar Caja del Día</button>
    </div>

    <!-- Tabla de pedidos -->
    <div class="seccion-pedidos">
      <h2>
        📋 Pedidos de Hoy
        <span class="fecha-hoy-badge" id="fecha-hoy"></span>
      </h2>
      <div id="contenedor-pedidos">
        <div class="vacio-mensaje">Cargando pedidos...</div>
      </div>
    </div>
  </div>

  <!-- ======================================================================
  MODAL: HISTORIAL DE VENTAS
  ======================================================================= -->
  <div id="modal-historial" class="modal-admin">
    <div class="modal-contenido">
      <h2>📅 Historial de Ventas</h2>
      <div class="rango-fechas">
        <div>
          <label>Desde:</label>
          <input type="date" id="fecha-desde">
        </div>
        <div>
          <label>Hasta:</label>
          <input type="date" id="fecha-hasta">
        </div>
      </div>
      <button class="btn-accion btn-principal" id="btn-filtrar-historial" style="width:100%;">🔍 Buscar</button>
      <div id="contenedor-historial" style="margin-top:20px;">
        <div class="vacio-mensaje">Selecciona un rango de fechas para ver las ventas.</div>
      </div>
      <div class="modal-botones">
        <button class="btn-secundario" onclick="cerrarModal('modal-historial')">Cerrar</button>
      </div>
    </div>
  </div>

  <!-- ======================================================================
  MODAL: CERRAR CAJA
  ======================================================================= -->
  <div id="modal-cierre" class="modal-admin">
    <div class="modal-contenido">
      <h2>🔐 Cerrar Caja</h2>
      <div style="background:#fff3cd; padding:15px; border-radius:10px; border-left:4px solid #ffc107; margin-bottom:15px;">
        <p style="color:#856404; font-weight:700;">🧾 ¿Confirmas el cierre de caja?</p>
        <p style="color:#495057; font-size:0.9rem; margin-top:8px;">
          Se generará un ticket con el resumen del día y se registrará el cierre en el sistema.
        </p>
      </div>
      <div id="resumen-cierre"></div>
      <div class="modal-botones">
        <button class="btn-secundario" onclick="cerrarModal('modal-cierre')">Cancelar</button>
        <button class="btn-verde" id="btn-confirmar-cierre">✅ Confirmar e Imprimir</button>
      </div>
    </div>
  </div>

  <!-- ======================================================================
  MODAL: PIN RÁPIDO (para ver valores sensibles)
  ======================================================================= -->
  <div id="modal-pin-rapido" class="modal-admin">
    <div class="modal-contenido" style="max-width:380px;">
      <h2>🔐 Verificar Identidad</h2>
      <p style="color:#6c757d; margin-bottom:15px;">🔑 Ingresa el PIN para ver los valores sensibles</p>
      <input type="password" id="input-pin-rapido" placeholder="••••" maxlength="10" inputmode="numeric" style="width:100%; padding:14px; border:2px solid #e2e8f0; border-radius:12px; font-size:1.1rem; text-align:center; letter-spacing:8px; font-weight:700; margin-bottom:10px;">
      <div id="error-pin-rapido" style="color:#dc3545; font-weight:700; min-height:20px; font-size:0.9rem;"></div>
      <div class="modal-botones">
        <button class="btn-secundario" onclick="cerrarModal('modal-pin-rapido')">❌ Cancelar</button>
        <button class="btn-principal" id="btn-confirmar-pin-rapido">Confirmar</button>
      </div>
    </div>
  </div>

  <!-- ======================================================================
  MODAL: CANCELAR PEDIDO
  ======================================================================= -->
  <div id="modal-cancelar" class="modal-admin">
    <div class="modal-contenido">
      <h2>❌ Cancelar Pedido</h2>
      <div id="info-pedido-cancelar"></div>
      <label>Motivo de cancelación: *</label>
      <textarea id="motivo-cancelacion" rows="3" placeholder="Ej: Cliente canceló, producto no disponible..."></textarea>
      <div id="error-cancelacion" style="color:#dc3545; font-weight:700; min-height:20px; font-size:0.9rem;"></div>
      <div class="modal-botones">
        <button class="btn-secundario" onclick="cerrarModal('modal-cancelar')">Volver</button>
        <button class="btn-principal" id="btn-confirmar-cancelacion">✅ Confirmar Cancelación</button>
      </div>
    </div>
  </div>

  <!-- ======================================================================
  TICKET DE IMPRESIÓN (oculto, se muestra al imprimir)
  ======================================================================= -->
  <div id="ticket-impresion"></div>

  <!-- ======================================================================
  FIREBASE + SCRIPT
  ======================================================================= -->
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
  <script src="admin.js"></script>
</body>
</html>
