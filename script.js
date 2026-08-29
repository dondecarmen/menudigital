// =========================================================================
// 🔥 CONEXIÓN OFICIAL CON FIREBASE (DONDE CARMEN)
// =========================================================================
const firebaseConfig = {
  apiKey: "AIzaSyA8I3ybJNfXLYvx6quNbgYv9mDpOMyWhjc",
  authDomain: "donde-carmen.firebaseapp.com",
  projectId: "donde-carmen",
  storageBucket: "donde-carmen.firebasestorage.app",
  messagingSenderId: "432685338703",
  appId: "1:432685338703:web:81967270e483e477ed5a3a",
  measurementId: "G-TR69YF2SSC"
};

// Protección: si Firebase no carga, la página sigue funcionando
let db = null;
if (typeof firebase !== "undefined") {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  db = firebase.firestore();
}

// 🆕 === REGISTRO DEL SERVICE WORKER (PWA) ===
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('✅ PWA instalada correctamente'))
      .catch(err => console.warn('⚠️ SW falló:', err));
  });
}

let linkGoogleMaps = "";

document.addEventListener("DOMContentLoaded", () => {
  const contenedorMenu = document.querySelector(".contenedor-menu");
  const headerFiltros = document.querySelector(".filtros");
  const heroBanner = document.querySelector(".hero-banner");
  const botones = document.querySelectorAll(".btn-filtro-card");
  const platos = document.querySelectorAll(".item-menu");
  const btnVerCarrito = document.getElementById("btn-ver-carrito");
  const modalCarrito = document.getElementById("modal-carrito");
  const cerrarCarrito = document.getElementById("cerrar-carrito");
  const btnSeguirComiendo = document.getElementById("btn-seguir-comiendo");
  const btnConfirmarWhatsapp = document.getElementById("btn-confirmar-whatsapp");
  const itemsCarritoContenedor = document.getElementById("items-carrito");
  const totalCarritoPrecio = document.getElementById("total-carrito-precio");
  const numeroTelefono = "573028549426";
  let carrito = [];

  // =========================================================================
  // 1. ESTADO INICIAL DEL MENÚ (Ocultar platos al entrar)
  // =========================================================================
  platos.forEach(plato => plato.style.display = "none");
  if (headerFiltros) headerFiltros.style.display = "flex";
  if (heroBanner) heroBanner.style.display = "block";

  const botonVolver = document.createElement("button");
  botonVolver.className = "btn-volver";
  botonVolver.type = "button";
  botonVolver.innerHTML = "⬅ Volver al Menú Principal";
  botonVolver.style.display = "none";
  if (contenedorMenu) {
    contenedorMenu.parentNode.insertBefore(botonVolver, contenedorMenu);
  }

  // =========================================================================
  // 2. CONTROL DE PUBLICIDAD CONTINUO (SPLASH SCREEN)
  // =========================================================================
  const splashPromo = document.getElementById("splash-promo");
  const cerrarSplash = document.getElementById("cerrar-splash");
  const btnAccionSplash = document.getElementById("btn-accion-splash");

  if (splashPromo) {
    setTimeout(() => { splashPromo.style.display = "flex"; }, 800);

    const ocultarSplashConAnimacion = () => {
      splashPromo.style.opacity = "0";
      splashPromo.style.transition = "opacity 0.3s ease";
      setTimeout(() => {
        splashPromo.style.display = "none";
        splashPromo.style.opacity = "1";
      }, 300);
    };

    if (cerrarSplash) cerrarSplash.addEventListener("click", ocultarSplashConAnimacion);
    splashPromo.addEventListener("click", (e) => {
      if (e.target === splashPromo) ocultarSplashConAnimacion();
    });

    if (btnAccionSplash) {
      btnAccionSplash.addEventListener("click", () => {
        ocultarSplashConAnimacion();
        const botonHamburguesas = document.querySelector('.btn-filtro-card[data-categoria="hamburguesas"]');
        if (botonHamburguesas) {
          botonHamburguesas.click();
          const targetScroll = document.querySelector(".contenedor-menu") || document.querySelector(".filtros");
          if (targetScroll) {
            window.scrollTo({
              top: targetScroll.offsetTop - 140,
              behavior: "smooth"
            });
          }
        }
      });
    }
  }

  // =========================================================================
  // 3. INYECCIÓN AUTOMÁTICA DEL SELECTOR DE CANTIDAD
  // =========================================================================
  const botonesPedirIniciales = document.querySelectorAll(".btn-pedir-plato");
  botonesPedirIniciales.forEach(btn => {
    const platoContenedor = btn.closest(".item-menu");
    if (!platoContenedor) return;
    const categoria = platoContenedor.getAttribute("data-categoria");
    if (categoria !== "butifarras" && categoria !== "bebidas") return;

    const contenedorCantidad = document.createElement("div");
    contenedorCantidad.className = "contenedor-cantidad-pedir";
    btn.parentNode.insertBefore(contenedorCantidad, btn);
    contenedorCantidad.innerHTML = `
      <div class="control-cantidad">
        <button class="btn-menos" type="button">−</button>
        <span class="numero-cantidad">1</span>
        <button class="btn-mas" type="button">+</button>
      </div>
    `;
    contenedorCantidad.appendChild(btn);

    const btnMas = contenedorCantidad.querySelector(".btn-mas");
    const btnMenos = contenedorCantidad.querySelector(".btn-menos");
    const indicadorCantidad = contenedorCantidad.querySelector(".numero-cantidad");

    btnMas.addEventListener("click", (e) => {
      e.stopPropagation();
      let cant = parseInt(indicadorCantidad.textContent);
      indicadorCantidad.textContent = cant + 1;
    });
    btnMenos.addEventListener("click", (e) => {
      e.stopPropagation();
      let cant = parseInt(indicadorCantidad.textContent);
      if (cant > 1) indicadorCantidad.textContent = cant - 1;
    });
  });

  // =========================================================================
  // 4. 🕒 CONTROL AUTOMÁTICO DE HORARIOS DE ATENCIÓN
  // =========================================================================
  function verificarHorarioAtencion() {
    const ahora = new Date();
    const dia = ahora.getDay();
    const hora = ahora.getHours();
    const minutos = ahora.getMinutes();
    const tiempoEnMinutos = hora * 60 + minutos;

    const inicioServicio = 17 * 60 + 30;
    const finServicio = 23 * 60 + 30;
    const esMartes = (dia === 2);
    const esHoraPermitida = tiempoEnMinutos >= inicioServicio && tiempoEnMinutos <= finServicio;
    const abierto = !esMartes && esHoraPermitida;

    const botonesPedir = document.querySelectorAll(".btn-pedir-plato");
    botonesPedir.forEach(btn => {
      if (!abierto) {
        btn.disabled = true;
        btn.textContent = "🔒 Cerrado por el momento";
        btn.classList.add("btn-deshabilitado");
      } else {
        btn.disabled = false;
        btn.textContent = "Añadir al Carrito 🛒";
        btn.classList.remove("btn-deshabilitado");
      }
    });

    let bannerEstado = document.getElementById("banner-estado-local");
    if (!bannerEstado) {
      bannerEstado = document.createElement("div");
      bannerEstado.id = "banner-estado-local";
      if (heroBanner) heroBanner.appendChild(bannerEstado);
    }

    if (!abierto) {
      let mensaje = "🕒 <strong>Actualmente estamos cerrados.</strong>";
      if (esMartes) {
        mensaje = "🔒 <strong>Martes no tenemos servicio.</strong> ¡Te esperamos de Lunes, Miércoles a Domingo desde las 5:30 PM!";
      } else if (!esMartes && !esHoraPermitida) {
        mensaje = "⏳ <strong>Hoy abrimos a las 5:30 PM.</strong> ¡Prepara tu pedido!";
      } else {
        mensaje = "🛵 <strong>Horario de pedidos:</strong> Lunes, Miércoles a Domingo de 5:30 PM a 11:30 PM.";
      }
      bannerEstado.className = "banner-cerrado";
      bannerEstado.innerHTML = mensaje;
    } else {
      bannerEstado.className = "banner-abierto";
      bannerEstado.innerHTML = "🟢 <strong>¡Estamos recibiendo pedidos!</strong> (5:30 PM - 11:30 PM)";
    }
  }
  verificarHorarioAtencion();
  setInterval(verificarHorarioAtencion, 60000);

  // =========================================================================
  // 5. FUNCIONES DE FILTRADO Y CATEGORÍAS
  // =========================================================================
  function mostrarCategoriasPrincipales(manipularHistorial = true) {
    platos.forEach(plato => plato.style.display = "none");
    if (headerFiltros) headerFiltros.style.display = "flex";
    botonVolver.style.display = "none";
    if (heroBanner) heroBanner.style.display = "block";
    if (manipularHistorial && window.history.state && window.history.state.categoria) {
      window.history.pushState(null, "", window.location.pathname);
    }
  }

  function activarCategoriaFiltro(categoriaFiltrada, manipularHistorial = true) {
    platos.forEach(plato => {
      if (categoriaFiltrada === "todos" || plato.getAttribute("data-categoria") === categoriaFiltrada) {
        plato.style.display = "flex";
      } else {
        plato.style.display = "none";
      }
    });

    if (categoriaFiltrada === "todos") {
      mostrarCategoriasPrincipales(manipularHistorial);
    } else {
      if (headerFiltros) headerFiltros.style.display = "none";
      botonVolver.style.display = "block";
      if (heroBanner) heroBanner.style.display = "none";
      if (manipularHistorial) {
        window.history.pushState({ categoria: categoriaFiltrada }, "", `#${categoriaFiltrada}`);
      }
    }
  }

  botones.forEach(boton => {
    boton.addEventListener("click", () => {
      const categoriaFiltrada = boton.getAttribute("data-categoria");
      activarCategoriaFiltro(categoriaFiltrada, true);
    });
  });

  botonVolver.addEventListener("click", (e) => {
    e.stopPropagation();
    if (window.history.state && window.history.state.categoria) {
      window.history.back();
    } else {
      mostrarCategoriasPrincipales(true);
    }
  });

  window.addEventListener("popstate", (event) => {
    if (event.state && event.state.categoria) {
      activarCategoriaFiltro(event.state.categoria, false);
    } else {
      mostrarCategoriasPrincipales(false);
    }
  });

  const hashInicial = window.location.hash.replace("#", "");
  if (hashInicial && document.querySelector(`.btn-filtro-card[data-categoria="${hashInicial}"]`)) {
    activarCategoriaFiltro(hashInicial, false);
  }

  // =========================================================================
  // 6. ACTUALIZAR VISIBILIDAD DEL BOTÓN CARRITO
  // =========================================================================
  function actualizarVisibilidadBotonCarrito() {
    if (btnVerCarrito) {
      const totalProductos = carrito.reduce((total, item) => total + item.cantidad, 0);
      const contadores = document.querySelectorAll(".contador-productos");
      contadores.forEach(contador => { contador.innerHTML = totalProductos; });
      if (totalProductos > 0) {
        btnVerCarrito.classList.add("activo");
      } else {
        btnVerCarrito.classList.remove("activo");
      }
    }
  }
  actualizarVisibilidadBotonCarrito();

  // =========================================================================
  // 7. LÓGICA DE EXCLUSIVIDAD: "Sin Salsas" vs otras salsas
  // =========================================================================
  document.addEventListener("change", (e) => {
    if (e.target.classList.contains("salsa-item")) {
      const plato = e.target.closest(".item-menu");
      if (!plato) return;
      const sinSalsasChk = plato.querySelector('.salsa-item[value="Sin Salsas"]');
      const otrasSalsas = plato.querySelectorAll('.salsa-item:not([value="Sin Salsas"])');

      if (e.target.value === "Sin Salsas" && e.target.checked) {
        otrasSalsas.forEach(chk => chk.checked = false);
      } else if (e.target.value !== "Sin Salsas" && e.target.checked) {
        if (sinSalsasChk) sinSalsasChk.checked = false;
      }
    }
  });

  // =========================================================================
  // 8. EVENTO PRINCIPAL: CLICK EN BOTÓN DE PEDIR PLATO
  // =========================================================================
  document.addEventListener("click", (e) => {
    const btnPedir = e.target.closest(".btn-pedir-plato");
    if (!btnPedir || btnPedir.disabled) return;
    e.preventDefault();
    e.stopPropagation();

    const plato = btnPedir.closest(".item-menu");
    if (!plato) return;

    const salsaChecks = plato.querySelectorAll(".salsa-item");
    let salsas = [];
    plato.querySelectorAll(".salsa-item:checked").forEach(chk => {
      salsas.push(chk.value);
    });

    if (salsaChecks.length > 0 && salsas.length === 0) {
      const toast = document.getElementById("notificacion-toast");
      if (toast) {
        toast.innerHTML = "⚠️ Debes seleccionar al menos una salsa (o 'Sin Salsas')";
        toast.classList.add("mostrar");
        setTimeout(() => {
          toast.classList.remove("mostrar");
          toast.innerHTML = "✨ ¡Plato añadido al carrito!";
        }, 2500);
      }
      const titulosSeccion = plato.querySelectorAll(".titulo-seccion");
      titulosSeccion.forEach(titulo => {
        if (titulo.textContent.toLowerCase().includes("salsas")) {
          const textoOriginal = titulo.textContent;
          titulo.style.color = "#dc3545";
          titulo.style.fontWeight = "900";
          titulo.textContent = "🔴 ¿Qué salsas deseas? (OBLIGATORIO)";
          setTimeout(() => {
            titulo.style.color = "#ff4757";
            titulo.style.fontWeight = "800";
            titulo.textContent = textoOriginal;
          }, 2500);
        }
      });
      return;
    }

    const nombrePlato = plato.querySelector("h3").textContent;
    let quitados = [];
    plato.querySelectorAll(".quitar-item:checked").forEach(chk => {
      quitados.push(chk.value);
    });

    let adiciones = [];
    let valorAdiciones = 0;
    plato.querySelectorAll(".adicion-item:checked").forEach(chk => {
      adiciones.push(chk.value);
      const valorAdicion = parseInt(chk.getAttribute("data-valor")) || 0;
      valorAdiciones += valorAdicion;
    });

    let acompanamiento = "";
    const radioSeleccionado = plato.querySelector("input[type='radio']:checked");
    if (radioSeleccionado) acompanamiento = radioSeleccionado.value;

    const elementoPrecio = plato.querySelector(".precio");
    const precioBase = parseInt(elementoPrecio.getAttribute("data-precio-base")) || 0;
    const precioFinalItem = precioBase + valorAdiciones;

    const indicadorCantidad = plato.querySelector(".numero-cantidad");
    const cantidadA_Anadir = indicadorCantidad ? parseInt(indicadorCantidad.textContent) : 1;

    const configuracionId = `${nombrePlato}-${quitados.join(",")}-${adiciones.join(",")}-${salsas.join(",")}-${acompanamiento}`;
    const itemExistente = carrito.find(item => item.configId === configuracionId);

    if (itemExistente) {
      itemExistente.cantidad += cantidadA_Anadir;
    } else {
      carrito.push({
        id: Date.now() + Math.random(),
        configId: configuracionId,
        nombre: nombrePlato,
        precio: precioFinalItem,
        cantidad: cantidadA_Anadir,
        quitados: quitados,
        adiciones: adiciones,
        salsas: salsas,
        acompanamiento: acompanamiento
      });
    }

    actualizarVisibilidadBotonCarrito();

    const toast = document.getElementById("notificacion-toast");
    if (toast) {
      toast.innerHTML = `✨ ¡${cantidadA_Anadir} producto(s) añadido(s) al carrito!`;
      toast.classList.add("mostrar");
      setTimeout(() => {
        toast.classList.remove("mostrar");
        toast.innerHTML = "✨ ¡Plato añadido al carrito!";
      }, 2000);
    }

    const textoOriginal = btnPedir.innerHTML;
    btnPedir.innerHTML = "¡Añadido! ✔️";
    btnPedir.style.background = "#25d366";
    btnPedir.disabled = true;
    setTimeout(() => {
      btnPedir.innerHTML = textoOriginal;
      btnPedir.style.background = "";
      btnPedir.disabled = false;
      if (indicadorCantidad) indicadorCantidad.textContent = "1";
    }, 1000);

    const details = plato.querySelector("details");
    if (details) details.removeAttribute("open");
    plato.querySelectorAll("input[type='checkbox']").forEach(chk => chk.checked = false);
    plato.querySelectorAll("input[type='radio']").forEach(rd => rd.checked = false);
    if (elementoPrecio) {
      elementoPrecio.textContent = `$${precioBase.toLocaleString('es-CO')}`;
    }
  });

  // EVENTO: CAMBIO EN ADICIONES (actualiza el precio visible)
  document.addEventListener("change", (e) => {
    if (e.target.classList.contains("adicion-item")) {
      const plato = e.target.closest(".item-menu");
      if (!plato) return;
      const elementoPrecio = plato.querySelector(".precio");
      const precioBase = parseInt(elementoPrecio.getAttribute("data-precio-base")) || 0;
      let extra = 0;
      plato.querySelectorAll(".adicion-item:checked").forEach(chk => {
        const valorAdicion = parseInt(chk.getAttribute("data-valor")) || 2000;
        extra += valorAdicion;
      });
      elementoPrecio.textContent = `$${(precioBase + extra).toLocaleString('es-CO')}`;
    }
  });

  // =========================================================================
  // 9. MODAL DEL CARRITO Y WHATSAPP
  // =========================================================================
  if (btnVerCarrito) {
    btnVerCarrito.addEventListener("click", (e) => {
      e.preventDefault();
      if (carrito.length === 0) return;
      renderizarCarrito();
      if (modalCarrito) modalCarrito.style.display = "flex";

      const camposDomicilio = document.getElementById("campos-domicilio");
      const entregaInicial = document.querySelector('input[name="tipo-entrega"]:checked');
      if (entregaInicial && camposDomicilio) {
        camposDomicilio.style.display = (entregaInicial.value === "Domicilio") ? "flex" : "none";
      }

      // Sincronizar visibilidad de secciones de pago al abrir el carrito
      const metodoPagoInicial = document.querySelector('input[name="metodo-pago"]:checked');
      const opcionesEfectivoInit = document.querySelector('.opciones-efectivo');
      const opcionesTransferenciaInit = document.querySelector('.opciones-transferencia');
      const nequiInfoInit = document.querySelector('.nequi-info');
      if (metodoPagoInicial) {
        if (opcionesEfectivoInit) opcionesEfectivoInit.style.display = (metodoPagoInicial.value === "efectivo") ? "block" : "none";
        if (opcionesTransferenciaInit) opcionesTransferenciaInit.style.display = (metodoPagoInicial.value === "transferencia") ? "block" : "none";
        if (nequiInfoInit) nequiInfoInit.style.display = (metodoPagoInicial.value === "transferencia") ? "block" : "none";
      } else {
        if (opcionesEfectivoInit) opcionesEfectivoInit.style.display = "none";
        if (opcionesTransferenciaInit) opcionesTransferenciaInit.style.display = "none";
        if (nequiInfoInit) nequiInfoInit.style.display = "none";
      }

      // Sincronizar campo de cambio
      const tipoEfectivoInicial = document.querySelector('input[name="tipo-efectivo"]:checked');
      const campoCambioInit = document.getElementById('campo-cambio-efectivo');
      if (campoCambioInit) {
        campoCambioInit.style.display = (tipoEfectivoInicial && tipoEfectivoInicial.value === "Necesito cambio") ? "block" : "none";
      }
    });
  }

  if (cerrarCarrito) cerrarCarrito.addEventListener("click", () => modalCarrito.style.display = "none");
  if (btnSeguirComiendo) btnSeguirComiendo.addEventListener("click", () => modalCarrito.style.display = "none");

  function renderizarCarrito() {
    if (!itemsCarritoContenedor) return;
    itemsCarritoContenedor.innerHTML = "";
    let granTotal = 0;

    carrito.forEach((producto) => {
      const subtotalItem = producto.precio * producto.cantidad;
      granTotal += subtotalItem;

      const itemDiv = document.createElement("div");
      itemDiv.className = "item-lista-carrito";

      let detallesHTML = "";
      if (producto.acompanamiento) detallesHTML += `<li>${producto.acompanamiento}</li>`;
      if (producto.quitados.length > 0) detallesHTML += `<li>Sin: ${producto.quitados.join(", ")}</li>`;
      if (producto.adiciones.length > 0) detallesHTML += `<li>Extras: ${producto.adiciones.join(", ")}</li>`;
      if (producto.salsas.length > 0) detallesHTML += `<li>Salsas: ${producto.salsas.join(", ")}</li>`;

      itemDiv.innerHTML = `
        <div class="info-item-car">
          <h4><span style="color:#ff4757; font-weight:800;">${producto.cantidad}x</span> ${producto.nombre}</h4>
          ${detallesHTML ? `<ul>${detallesHTML}</ul>` : ""}
          <p class="precio-item-car">$${subtotalItem.toLocaleString('es-CO')}</p>
        </div>
        <button class="btn-eliminar-item" data-id="${producto.id}" type="button">❌</button>
      `;
      itemsCarritoContenedor.appendChild(itemDiv);
    });

    if (totalCarritoPrecio) {
      totalCarritoPrecio.textContent = `$${granTotal.toLocaleString('es-CO')}`;
    }

    document.querySelectorAll(".btn-eliminar-item").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idEliminar = parseFloat(e.currentTarget.getAttribute("data-id"));
        carrito = carrito.filter(item => item.id !== idEliminar);
        actualizarVisibilidadBotonCarrito();
        if (carrito.length === 0) {
          if (modalCarrito) modalCarrito.style.display = "none";
        } else {
          renderizarCarrito();
        }
      });
    });
  }

  function mostrarConfirmacionPedido() {
    const modalConfirmacion = document.createElement("div");
    modalConfirmacion.className = "modal-confirmacion";
    modalConfirmacion.innerHTML = `
      <div class="contenido-confirmacion">
        <div class="icono-confirmacion">✅</div>
        <h2 class="titulo-confirmacion">¡Pedido Enviado!</h2>
        <p class="texto-confirmacion">
          Tu pedido fue enviado por <strong>WhatsApp</strong>.<br>
          Te contactaremos pronto para confirmar los detalles y la dirección de entrega. 🙏
        </p>
        <button class="btn-cerrar-confirmacion" type="button">Volver al Menú 🍔</button>
      </div>
    `;
    document.body.appendChild(modalConfirmacion);

    const btnCerrarConf = modalConfirmacion.querySelector(".btn-cerrar-confirmacion");
    btnCerrarConf.addEventListener("click", () => {
      modalConfirmacion.remove();
    });
  }

  if (btnConfirmarWhatsapp) {
    btnConfirmarWhatsapp.addEventListener("click", () => {
      if (carrito.length === 0) return;

      const entregaCheck = document.querySelector('input[name="tipo-entrega"]:checked');
      const entregaSeleccionada = entregaCheck ? entregaCheck.value : "Recoger";

      if (entregaSeleccionada === "Domicilio" && !linkGoogleMaps) {
        alert("⚠️ Por favor, comparte tu ubicación GPS para poder realizar el domicilio.");
        return;
      }

      const metodoPago = document.querySelector('input[name="metodo-pago"]:checked');
      if (!metodoPago) {
        alert("⚠️ Por favor selecciona un método de pago.");
        return;
      }

      let metodoPagoTexto = metodoPago.value;

      // === CALCULAR TOTAL PRIMERO ===
      let granTotal = 0;
      carrito.forEach((producto) => {
        granTotal += producto.precio * producto.cantidad;
      });

      // === VALIDAR Y CONSTRUIR DETALLE DE PAGO ===
      let detallePago = "";
      let montoEfectivo = 0;
      if (metodoPagoTexto === "transferencia") {
        const checkComprobante = document.getElementById('check-comprobante-transferencia');
        if (checkComprobante && !checkComprobante.checked) {
          alert("⚠️ Por favor confirma que ya realizaste la transferencia a Nequi 3028393885.");
          return;
        }
        detallePago = "💳 *Pago:* Transferencia Nequi\n📱 *Número:* 3028393885\n";
      } else if (metodoPagoTexto === "efectivo") {
        const tipoEfectivo = document.querySelector('input[name="tipo-efectivo"]:checked');
        if (!tipoEfectivo) {
          alert("⚠️ Por favor indica si pagas exacto o necesitas cambio.");
          return;
        }
        if (tipoEfectivo.value === "Necesito cambio") {
          const inputMonto = document.getElementById('monto-paga-efectivo');
          if (!inputMonto || !inputMonto.value || parseInt(inputMonto.value) <= 0) {
            alert("⚠️ Por favor ingresa con cuánto vas a pagar para calcular el cambio.");
            if (inputMonto) inputMonto.focus();
            return;
          }
          montoEfectivo = parseInt(inputMonto.value);
          if (montoEfectivo < granTotal) {
            alert("⚠️ El monto ingresado ($" + montoEfectivo.toLocaleString('es-CO') + ") es menor que el total del pedido ($" + granTotal.toLocaleString('es-CO') + "). Por favor verifica.");
            return;
          }
          const cambio = montoEfectivo - granTotal;
          detallePago = `💵 *Pago:* Efectivo\n🧾 *Detalle:* Necesito cambio\n💰 *Paga con:* $${montoEfectivo.toLocaleString('es-CO')}\n🔀 *Cambio:* $${cambio.toLocaleString('es-CO')}\n`;
        } else {
          detallePago = `💵 *Pago:* Efectivo\n🧾 *Detalle:* Pago exacto\n`;
        }
      }

      // === CONSTRUIR MENSAJE DE WHATSAPP ===
      let mensaje = "¡Hola Donde Carmen! 🍔\nEste es mi pedido desde el menú digital:\n\n";

      carrito.forEach((producto, index) => {
        const subtotalItem = producto.precio * producto.cantidad;
        let textProducto = `${index + 1}. *${producto.cantidad}x ${producto.nombre}*`;
        if (producto.acompanamiento) textProducto += `_(${producto.acompanamiento})_`;
        mensaje += textProducto + "\n";
        if (producto.quitados.length > 0) mensaje += `❌ Sin: ${producto.quitados.join(", ")}\n`;
        if (producto.adiciones.length > 0) mensaje += `➕ Extra: ${producto.adiciones.join(", ")}\n`;
        if (producto.salsas.length > 0) mensaje += `🥫 Salsas: ${producto.salsas.join(", ")}\n`;
        mensaje += `_Subtotal: $${subtotalItem.toLocaleString('es-CO')}_\n\n`;
      });

      let datosEnvioText = "";
      let clienteNombre = "Cliente Web";
      let clienteDireccion = "Ubicación GPS";

      if (entregaSeleccionada === "Domicilio") {
        const inputNombre = document.getElementById("dom-nombre");
        clienteNombre = (inputNombre && inputNombre.value.trim()) ? inputNombre.value.trim() : "No especificado";
        datosEnvioText += `👤 *Cliente:* ${clienteNombre}\n`;
        datosEnvioText += `📍 *Mapa GPS:* ${linkGoogleMaps}\n`;
      } else if (entregaSeleccionada === "Recoger") {
        datosEnvioText += `🥡 *Entrega:* Pasar a recoger al local.\n`;
        clienteDireccion = "No aplica";
      } else {
        datosEnvioText += `🍽️ *Entrega:* Comer en el establecimiento.\n`;
        clienteDireccion = "No aplica";
      }

      mensaje += `---------------------------\n`;
      mensaje += datosEnvioText;
      mensaje += detallePago;
      mensaje += `💰 *TOTAL A PAGAR: $${granTotal.toLocaleString('es-CO')}*\n\n`;
      mensaje += `¿Me confirman el pedido? 🙏`;

      window.open(`https://wa.me/${numeroTelefono}?text=${encodeURIComponent(mensaje)}`, '_blank');

      // 🆕 === GUARDAR EN FIREBASE CON SEGUIMIENTO EN TIEMPO REAL ===
      if (db) {
        const pedidoRef = db.collection("pedidos_donde_carmen").doc();
        pedidoRef.set({
          fecha_raw: new Date(),
          hora: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
          productos: carrito,
          total: granTotal,
          estado: "Pendiente",
          tipo_entrega: entregaSeleccionada,
          cliente: clienteNombre,
          direccion: clienteDireccion,
          gps: linkGoogleMaps || "No enviado",
          metodo_pago: metodoPagoTexto,
          detalle_pago: detallePago,
          monto_efectivo: montoEfectivo || 0
        }).then(() => {
          // Guardar ID del pedido activo
          localStorage.setItem('pedidoActivo', pedidoRef.id);

          // 🆕 Mostrar modal de seguimiento
          mostrarModalSeguimiento(pedidoRef.id);

          // 🔥 Escuchar cambios en tiempo real
          pedidoRef.onSnapshot(doc => {
            if (!doc.exists) return;
            const nuevoEstado = doc.data().estado;
            actualizarTimeline(nuevoEstado);

            // 🆕 Notificación push al cliente
            if ('Notification' in window && Notification.permission === 'granted') {
              const mensajes = {
                'Preparando': '👨‍🍳 ¡Tu pedido se está preparando!',
                'EnCamino': '🛵 ¡Tu pedido va en camino!',
                'Entregado': '✅ ¡Buen provecho! Gracias por tu pedido.'
              };
              if (mensajes[nuevoEstado]) {
                new Notification('Donde Carmen', {
                  body: mensajes[nuevoEstado],
                  icon: '/icon-192.png'
                });
              }
            }

            // 🆕 Cerrar modal automáticamente cuando se entrega (después de 15 seg)
            if (nuevoEstado === 'Entregado') {
              setTimeout(() => {
                const modal = document.getElementById('modal-seguimiento');
                if (modal) modal.style.display = 'none';
              }, 15000);
            }
          });
        }).catch(err => console.error("Error guardando pedido:", err));
      }

      // Reiniciar estado
      linkGoogleMaps = "";
      const btnGps = document.getElementById("btn-gps");
      if (btnGps) {
        btnGps.disabled = false;
        btnGps.style.background = "#e0f2fe";
        btnGps.style.color = "#0369a1";
        btnGps.textContent = "📍 Compartir mi ubicación GPS actual";
        const statusGps = document.getElementById("status-gps");
        if (statusGps) statusGps.textContent = "";
      }

      const inputNombre = document.getElementById("dom-nombre");
      if (inputNombre) inputNombre.value = "";

      // === RESETEAR CAMPOS DE PAGO ===
      const radiosMetodoPagoReset = document.querySelectorAll('input[name="metodo-pago"]');
      radiosMetodoPagoReset.forEach(r => r.checked = false);
      const radiosTipoEfectivoReset = document.querySelectorAll('input[name="tipo-efectivo"]');
      radiosTipoEfectivoReset.forEach(r => r.checked = false);
      const opcionesEfectivoReset = document.querySelector('.opciones-efectivo');
      if (opcionesEfectivoReset) opcionesEfectivoReset.style.display = "none";
      const opcionesTransferenciaReset = document.querySelector('.opciones-transferencia');
      if (opcionesTransferenciaReset) opcionesTransferenciaReset.style.display = "none";
      const campoCambioReset = document.getElementById('campo-cambio-efectivo');
      if (campoCambioReset) campoCambioReset.style.display = "none";
      const inputMontoReset = document.getElementById('monto-paga-efectivo');
      if (inputMontoReset) inputMontoReset.value = "";
      const checkComprobanteReset = document.getElementById('check-comprobante-transferencia');
      if (checkComprobanteReset) checkComprobanteReset.checked = false;
      const nequiInfoReset = document.querySelector('.nequi-info');
      if (nequiInfoReset) nequiInfoReset.style.display = "none";

      carrito = [];
      actualizarVisibilidadBotonCarrito();
      if (modalCarrito) modalCarrito.style.display = "none";
      mostrarConfirmacionPedido();
    });
  }

  // =========================================================================
  // 10. UBICACIÓN GPS
  // =========================================================================
  window.obtenerUbicacionGPS = function () {
    const status = document.getElementById("status-gps");
    const btn = document.getElementById("btn-gps");

    if (!navigator.geolocation) {
      if (status) status.textContent = "❌ Tu teléfono no soporta geolocalización.";
      return;
    }

    if (status) status.textContent = "🛰️ Localizando...";
    if (btn) btn.disabled = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        linkGoogleMaps = `https://www.google.com/maps?q=${lat},${lon}`;
        if (status) status.textContent = "✅ ¡Ubicación GPS agregada con éxito!";
        if (btn) {
          btn.style.background = "#d4edda";
          btn.style.color = "#155724";
          btn.textContent = "📍 Ubicación Guardada ✔️";
        }
      },
      (error) => {
        if (btn) btn.disabled = false;
        if (status) status.textContent = "⚠️ No se pudo acceder al GPS. Activa tu ubicación.";
        console.log(error);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // =========================================================================
  // 11. CONTROL DE TIPOS DE ENTREGA
  // =========================================================================
  const radiosEntrega = document.querySelectorAll('input[name="tipo-entrega"]');
  const camposDomicilio = document.getElementById("campos-domicilio");

  if (radiosEntrega && camposDomicilio) {
    radiosEntrega.forEach(radio => {
      radio.addEventListener("change", (e) => {
        if (e.target.value === "Domicilio") {
          camposDomicilio.style.display = "flex";
        } else {
          camposDomicilio.style.display = "none";
          linkGoogleMaps = "";
          const statusGps = document.getElementById("status-gps");
          if (statusGps) statusGps.textContent = "";
        }
      });
    });
  }

  // =========================================================================
  // 11b. CONTROL DE MÉTODO DE PAGO Y OPCIONES DE EFECTIVO
  // =========================================================================
  const radiosMetodoPago = document.querySelectorAll('input[name="metodo-pago"]');
  const opcionesEfectivo = document.querySelector('.opciones-efectivo');
  const opcionesTransferencia = document.querySelector('.opciones-transferencia');
  const nequiInfo = document.querySelector('.nequi-info');

  if (radiosMetodoPago.length > 0) {
    radiosMetodoPago.forEach(radio => {
      radio.addEventListener("change", (e) => {
        const valor = e.target.value;

        // Mostrar/ocultar sección de efectivo
        if (opcionesEfectivo) {
          opcionesEfectivo.style.display = (valor === "efectivo") ? "block" : "none";
        }

        // Mostrar/ocultar sección de transferencia
        if (opcionesTransferencia) {
          opcionesTransferencia.style.display = (valor === "transferencia") ? "block" : "none";
        }

        // Mostrar/ocultar info de Nequi junto a los radios
        if (nequiInfo) {
          nequiInfo.style.display = (valor === "transferencia") ? "block" : "none";
        }

        // Si se cambia a transferencia, resetear radios de efectivo
        if (valor === "transferencia") {
          const radiosTipoEfectivo = document.querySelectorAll('input[name="tipo-efectivo"]');
          radiosTipoEfectivo.forEach(r => r.checked = false);
          const campoCambio = document.getElementById('campo-cambio-efectivo');
          if (campoCambio) campoCambio.style.display = "none";
          const inputMonto = document.getElementById('monto-paga-efectivo');
          if (inputMonto) inputMonto.value = "";
        }
      });
    });
  }

  // Mostrar/ocultar campo de monto cuando se selecciona "Necesito cambio"
  const radiosTipoEfectivo = document.querySelectorAll('input[name="tipo-efectivo"]');
  if (radiosTipoEfectivo.length > 0) {
    radiosTipoEfectivo.forEach(radio => {
      radio.addEventListener("change", (e) => {
        const campoCambio = document.getElementById('campo-cambio-efectivo');
        if (campoCambio) {
          campoCambio.style.display = (e.target.value === "Necesito cambio") ? "block" : "none";
          if (e.target.value === "Pago exacto") {
            const inputMonto = document.getElementById('monto-paga-efectivo');
            if (inputMonto) inputMonto.value = "";
          }
        }
      });
    });
  }

  // =========================================================================
  // 12. MARQUESINA INTERACTIVA
  // =========================================================================
  const marqueeItems = document.querySelectorAll(".marquee-item");
  marqueeItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const categoriaDestino = item.getAttribute("data-destino");
      if (!categoriaDestino) return;

      const botonFiltro = document.querySelector(`.btn-filtro-card[data-categoria="${categoriaDestino}"]`);
      if (botonFiltro) {
        botonFiltro.click();
        item.style.background = "#ffe0e2";
        setTimeout(() => { item.style.background = "#ffffff"; }, 200);

        const conMenu = document.querySelector(".contenedor-menu") || document.querySelector(".filtros");
        if (conMenu) {
          window.scrollTo({
            top: conMenu.offsetTop - 140,
            behavior: "smooth"
          });
        }
      }
    });
  });

  // =========================================================================
  // 🆕 13. 📦 SEGUIMIENTO DE PEDIDO EN TIEMPO REAL
  // =========================================================================
  function mostrarModalSeguimiento(pedidoId) {
    const modal = document.getElementById('modal-seguimiento');
    const idEl = document.getElementById('seguimiento-id');
    const btnMisPedidos = document.getElementById('btn-mis-pedidos');
    if (!modal || !idEl) return;

    idEl.textContent = pedidoId.slice(-6).toUpperCase();
    modal.style.display = 'flex';
    if (btnMisPedidos) btnMisPedidos.style.display = 'block';
    actualizarTimeline('Pendiente');
  }

  function actualizarTimeline(estado) {
    const orden = ['Pendiente', 'Preparando', 'EnCamino', 'Entregado'];
    const idx = orden.indexOf(estado);
    document.querySelectorAll('.estado').forEach((el, i) => {
      el.classList.remove('activo', 'completado');
      if (i < idx) el.classList.add('completado');
      else if (i === idx) el.classList.add('activo');
    });

    const msgs = {
      'Pendiente': '⏳ Pedido recibido. Confirmando...',
      'Preparando': '👨‍🍳 ¡Carmen ya está preparando tu pedido!',
      'EnCamino': '🛵 Tu pedido va en camino. ¡Prepárate!',
      'Entregado': '✅ ¡Entregado! Cuéntanos cómo estuvo 🙏'
    };
    const mensajeEl = document.getElementById('mensaje-estado');
    if (mensajeEl) mensajeEl.textContent = msgs[estado] || '';
  }

  // Botón flotante "Ver mi pedido"
  const btnMisPedidos = document.getElementById('btn-mis-pedidos');
  if (btnMisPedidos) {
    btnMisPedidos.addEventListener('click', () => {
      const id = localStorage.getItem('pedidoActivo');
      if (id) mostrarModalSeguimiento(id);
    });
  }

  // Botón cerrar modal de seguimiento
  const btnCerrarSeguimiento = document.getElementById('cerrar-seguimiento');
  if (btnCerrarSeguimiento) {
    btnCerrarSeguimiento.addEventListener('click', () => {
      const modal = document.getElementById('modal-seguimiento');
      if (modal) modal.style.display = 'none';
    });
  }

  // 🆕 Reanudar seguimiento si hay pedido activo al cargar
  window.addEventListener('load', () => {
    const id = localStorage.getItem('pedidoActivo');
    if (id && db) {
      db.collection('pedidos_donde_carmen').doc(id).get().then(doc => {
        if (doc.exists && doc.data().estado !== 'Entregado' && doc.data().estado !== 'Cancelado') {
          mostrarModalSeguimiento(id);
          // Re-suscribirse al listener
          db.collection('pedidos_donde_carmen').doc(id).onSnapshot(docSnap => {
            if (docSnap.exists) {
              const nuevoEstado = docSnap.data().estado;
              actualizarTimeline(nuevoEstado);

              if ('Notification' in window && Notification.permission === 'granted') {
                const mensajes = {
                  'Preparando': '👨‍🍳 ¡Tu pedido se está preparando!',
                  'EnCamino': '🛵 ¡Tu pedido va en camino!',
                  'Entregado': '✅ ¡Buen provecho! Gracias por tu pedido.'
                };
                if (mensajes[nuevoEstado]) {
                  new Notification('Donde Carmen', {
                    body: mensajes[nuevoEstado],
                    icon: '/icon-192.png'
                  });
                }
              }

              if (nuevoEstado === 'Entregado') {
                setTimeout(() => {
                  const modal = document.getElementById('modal-seguimiento');
                  if (modal) modal.style.display = 'none';
                }, 15000);
              }
            }
          });
        } else {
          // Si ya está entregado o cancelado, limpiar localStorage
          localStorage.removeItem('pedidoActivo');
          if (btnMisPedidos) btnMisPedidos.style.display = 'none';
        }
      }).catch(err => console.log('No se pudo reanudar seguimiento:', err));
    }
  });

  // 🆕 Pedir permiso de notificaciones al primer clic
  document.addEventListener('click', function pedirPermiso() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    document.removeEventListener('click', pedirPermiso);
  }, { once: true });

}); // Cierre de DOMContentLoaded
