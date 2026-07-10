// =========================================================================
// 🔥 CONEXIÓN OFICIAL CON FIREBASE (DONDE CARMEN)
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

let linkGoogleMaps = "";

document.addEventListener("DOMContentLoaded", () => {
    const contenedorMenu = document.querySelector(".contenedor-menu");
    const headerFiltros = document.querySelector(".filtros");
    const heroBanner = document.querySelector(".hero-banner");

    // =========================================================================
    // 📺 CONTROL DE PUBLICIDAD CONTINUO (SPLASH SCREEN)
    // =========================================================================
    const splashPromo = document.getElementById("splash-promo");
    const cerrarSplash = document.getElementById("cerrar-splash");
    const btnAccionSplash = document.getElementById("btn-accion-splash");

    if (splashPromo) {
        setTimeout(() => {
            splashPromo.style.display = "flex";
        }, 800);

        const ocultarSplashConAnimacion = () => {
            splashPromo.style.opacity = "0";
            splashPromo.style.transition = "opacity 0.3s ease";
            setTimeout(() => {
                splashPromo.style.display = "none";
                splashPromo.style.opacity = "";
            }, 300);
        };

        cerrarSplash.addEventListener("click", ocultarSplashConAnimacion);
        splashPromo.addEventListener("click", (e) => {
            if (e.target === splashPromo) {
                ocultarSplashConAnimacion();
            }
        });

        btnAccionSplash.addEventListener("click", () => {
            ocultarSplashConAnimacion();
            const botonHamburguesas = document.querySelector('.btn-filtro-card[data-categoria="hamburguesas"]');
            if (botonHamburguesas) {
                botonHamburguesas.click();
                const contenedorMenu = document.querySelector(".contenedor-menu") || document.querySelector(".filtros");
                if (contenedorMenu) {
                    window.scrollTo({
                        top: contenedorMenu.offsetTop - 140,
                        behavior: "smooth"
                    });
                }
            }
        });
    }

    const botonVolver = document.createElement("button");
    botonVolver.className = "btn-volver";
    botonVolver.innerHTML = "⬅ Volver al Menú Principal";
    botonVolver.style.display = "none";

    if (contenedorMenu) {
        contenedorMenu.parentNode.insertBefore(botonVolver, contenedorMenu);
    }

    // =========================================================================
    // ⭐ INYECCIÓN AUTOMÁTICA DEL SELECTOR DE CANTIDAD (Butifarras y Bebidas)
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
            if (cant > 1) {
                indicadorCantidad.textContent = cant - 1;
            }
        });
    });

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

    platos.forEach(plato => plato.style.display = "none");
    if (headerFiltros) headerFiltros.style.display = "flex";
    if (heroBanner) heroBanner.style.display = "block";
    botonVolver.style.display = "none";

    // =========================================================================
    // ✅ FUNCIÓN CORREGIDA: ACTUALIZAR VISIBILIDAD DEL BOTÓN CARRITO
    // =========================================================================
    function actualizarVisibilidadBotonCarrito() {
        if (btnVerCarrito) {
            const totalProductos = carrito.reduce((total, item) => total + item.cantidad, 0);
            
            const contadores = document.querySelectorAll(".contador-productos");
            contadores.forEach(contador => {
                contador.innerHTML = totalProductos;
            });
            
            if (totalProductos > 0) {
                btnVerCarrito.classList.add("activo");
                btnVerCarrito.style.display = "flex";
            } else {
                btnVerCarrito.classList.remove("activo");
                btnVerCarrito.style.display = "none";
            }
        }
    }

    actualizarVisibilidadBotonCarrito();

    // =========================================================================
    //  FUNCIONES DE CATEGORÍAS
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

    // =========================================================================
    // LÓGICA DINÁMICA DE ACTUALIZACIÓN EN VIVO (ARMA TU PLATO)
    // =========================================================================
    const cardAtp = document.querySelector('.item-menu[data-categoria="arma-tu-plato"]');
    if (cardAtp) {
        const actualizarResumenYPrecioATP = () => {
            const precioElemento = cardAtp.querySelector(".precio");
            const resumenBase = document.getElementById("resumen-base-atp");
            const resumenProteinas = document.getElementById("resumen-proteinas-atp");
            const resumenExtras = document.getElementById("resumen-extras-atp");
            let totalPlato = 0;

            const baseSeleccionada = cardAtp.querySelector('input[name="base-atp"]:checked');
            if (baseSeleccionada) {
                totalPlato += parseInt(baseSeleccionada.getAttribute("data-valor")) || 5000;
                if (resumenBase) resumenBase.textContent = baseSeleccionada.value;
            }

            let proteinasClasificadas = [];
            cardAtp.querySelectorAll('.opcion-proteina input:checked').forEach(chk => {
                totalPlato += parseInt(chk.getAttribute("data-valor")) || 0;
                proteinasClasificadas.push(chk.value);
            });
            if (resumenProteinas) {
                resumenProteinas.textContent = proteinasClasificadas.length > 0 ? proteinasClasificadas.join(", ") : "Ninguna";
            }

            let extrasClasificados = [];
            cardAtp.querySelectorAll('.opcion-extra input:checked').forEach(chk => {
                totalPlato += parseInt(chk.getAttribute("data-valor")) || 0;
                extrasClasificados.push(chk.value);
            });
            if (resumenExtras) {
                resumenExtras.textContent = extrasClasificados.length > 0 ? extrasClasificados.join(", ") : "Ninguno";
            }

            if (precioElemento) {
                precioElemento.textContent = `$${totalPlato.toLocaleString('es-CO')}`;
            }
        };

        cardAtp.addEventListener("change", (e) => {
            if (e.target.classList.contains("input-precio-atp") || e.target.classList.contains("adicion-item") || e.target.name === "base-atp") {
                actualizarResumenYPrecioATP();
            }
        });
    }

    // =========================================================================
    //  LÓGICA DE EXCLUSIVIDAD: "Sin Salsas" vs otras salsas
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
    // EVENTO PRINCIPAL: CLICK EN BOTÓN DE PEDIR PLATO
    // =========================================================================
    document.addEventListener("click", (e) => {
        if (e.target.tagName === "BUTTON" && e.target.closest(".item-menu")) {
            const btnPedir = e.target;
            if (btnPedir.classList.contains("btn-volver") || btnPedir.id === "cerrar-carrito" || btnPedir.classList.contains("btn-mas") || btnPedir.classList.contains("btn-menos")) return;

            e.preventDefault();
            e.stopPropagation();

            const plato = btnPedir.closest(".item-menu");

            let salsas = [];
            plato.querySelectorAll(".salsa-item:checked").forEach(chk => {
                salsas.push(chk.value);
            });

            if (salsas.length === 0) {
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
                    if (titulo.textContent.includes("salsas")) {
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
            const isAtp = plato.getAttribute("data-categoria") === "arma-tu-plato";

            if (isAtp) {
                const baseRadio = plato.querySelector('input[name="base-atp"]:checked');
                if (baseRadio) {
                    acompanamiento = `Base: ${baseRadio.value}`;
                    const precioRadio = parseInt(baseRadio.getAttribute("data-valor")) || 5000;
                    valorAdiciones += (precioRadio - 5000);
                }
            } else {
                const radioSeleccionado = plato.querySelector("input[type='radio']:checked");
                if (radioSeleccionado) {
                    acompanamiento = radioSeleccionado.value;
                }
            }

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

            const contadores = document.querySelectorAll(".contador-productos");
            contadores.forEach(contador => {
                contador.innerHTML = Math.max(0, carrito.reduce((total, item) => total + item.cantidad, 0));
            });

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
            plato.querySelectorAll("input[type='radio']").forEach(rd => {
                if (rd.name !== "base-atp") rd.checked = false;
            });

            const primerRadioAtp = plato.querySelector('input[name="base-atp"][value="Papas a la francesa"]');
            if (primerRadioAtp) primerRadioAtp.checked = true;

            if (elementoPrecio) {
                elementoPrecio.textContent = `$${precioBase.toLocaleString('es-CO')}`;
            }

            const resumenBase = document.getElementById("resumen-base-atp");
            const resumenProteinas = document.getElementById("resumen-proteinas-atp");
            const resumenExtras = document.getElementById("resumen-extras-atp");

            if (resumenBase) resumenBase.textContent = "Papas a la francesa";
            if (resumenProteinas) resumenProteinas.textContent = "Ninguna";
            if (resumenExtras) resumenExtras.textContent = "Ninguno";
        }
    });

    // EVENTO: CAMBIO EN ADICIONES (PLATOS REGULARES)
    document.addEventListener("change", (e) => {
        if (e.target.classList.contains("adicion-item")) {
            const plato = e.target.closest(".item-menu");
            if (!plato || plato.getAttribute("data-categoria") === "arma-tu-plato") return;

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
    // ✅ EVENTO DEL BOTÓN VER CARRITO (CORREGIDO)
    // =========================================================================
    if (btnVerCarrito) {
        btnVerCarrito.addEventListener("click", (e) => {
            e.preventDefault();
            if (carrito.length === 0) return;
            
            renderizarCarrito();
            if (modalCarrito) modalCarrito.style.display = "flex";

            // VERIFICAR ESTADO INICIAL DE TIPO DE ENTREGA AL ABRIR MODAL
            const camposDomicilio = document.getElementById("campos-domicilio");
            const entregaInicial = document.querySelector('input[name="tipo-entrega"]:checked');
            
            if (entregaInicial && camposDomicilio) {
    if (entregaInicial.value === "Domicilio") {
        camposDomicilio.style.display = "flex";
    } else {
        camposDomicilio.style.display = "none";
    }
}
        });
    }

    if (cerrarCarrito) cerrarCarrito.addEventListener("click", () => modalCarrito.style.display = "none");
    if (btnSeguirComiendo) btnSeguirComiendo.addEventListener("click", () => modalCarrito.style.display = "none");

    // =========================================================================
    //  RENDERIZAR CARRITO
    // =========================================================================
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
                <button class="btn-eliminar-item" data-id="${producto.id}">❌</button>
            `;
            itemsCarritoContenedor.appendChild(itemDiv);
        });

        if (totalCarritoPrecio) {
            totalCarritoPrecio.textContent = `$${granTotal.toLocaleString('es-CO')}`;
        }

        document.querySelectorAll(".btn-eliminar-item").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const idEliminar = parseFloat(e.target.getAttribute("data-id"));
                carrito = carrito.filter(item => item.id !== idEliminar);

                const contadores = document.querySelectorAll(".contador-productos");
                contadores.forEach(contador => {
                    contador.innerHTML = Math.max(0, carrito.reduce((total, item) => total + item.cantidad, 0));
                });

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
                <button class="btn-cerrar-confirmacion">Volver al Menú 🍔</button>
            </div>
        `;
        document.body.appendChild(modalConfirmacion);

        const btnCerrarConf = modalConfirmacion.querySelector(".btn-cerrar-confirmacion");
        btnCerrarConf.addEventListener("click", () => {
            modalConfirmacion.remove();
        });
    }

    // =========================================================================
    // 💬 LOGICA UNIFICADA PARA WHATSAPP + GUARDADO EN PANEL ADMIN
    // =========================================================================
    if (btnConfirmarWhatsapp) {
        btnConfirmarWhatsapp.addEventListener("click", () => {
            if (carrito.length === 0) return;

            let mensaje = "*¡Hola Donde Carmen! 🍔*\n*Este es mi pedido desde el menú digital:*\n\n";
            let granTotal = 0;

            carrito.forEach((producto, index) => {
                const subtotalItem = producto.precio * producto.cantidad;
                let textProducto = `${index + 1}. *${producto.cantidad}x ${producto.nombre}*`;
                if (producto.acompanamiento) textProducto += ` _(${producto.acompanamiento})_`;
                mensaje += textProducto + `\n`;
                if (producto.quitados.length > 0) mensaje += `    ❌ Sin: ${producto.quitados.join(", ")}\n`;
                if (producto.adiciones.length > 0) mensaje += `    ➕ Extra: ${producto.adiciones.join(", ")}\n`;
                if (producto.salsas.length > 0) mensaje += `     Salsas: ${producto.salsas.join(", ")}\n`;
                mensaje += `    _Subtotal: $${subtotalItem.toLocaleString('es-CO')}_\n\n`;
                granTotal += subtotalItem;
            });

            const entregaSeleccionada = document.querySelector('input[name="tipo-entrega"]:checked').value;
            let datosEnvioText = "";
            let clienteNombre = "Cliente Web";
            let clienteDireccion = "Ubicación GPS";

            if (entregaSeleccionada === "Domicilio") {
                clienteNombre = document.getElementById("dom-nombre").value.trim() || "No especificado";
                if (!linkGoogleMaps) {
                    alert("⚠️ Por favor, comparte tu ubicación GPS para poder realizar el domicilio.");
                    return;
                }
                datosEnvioText += ` *Cliente:* ${clienteNombre}\n`;
                datosEnvioText += `📍 *Mapa GPS:* ${linkGoogleMaps}\n`;
            } else if (entregaSeleccionada === "Recoger") {
                datosEnvioText += `🥡 *Entrega:* Pasar a recoger al local.\n`;
                clienteDireccion = "No aplica";
            } else {
                datosEnvioText += `️ *Entrega:* Comer en el establecimiento.\n`;
                clienteDireccion = "No aplica";
            }

            mensaje += `---------------------------\n`;
            mensaje += datosEnvioText;
            mensaje += `💰 *TOTAL A PAGAR: $${granTotal.toLocaleString('es-CO')}*\n\n`;
            mensaje += `¿Me confirman el pedido para enviar los datos de mi domicilio? 🙏`;

            window.open(`https://wa.me/${numeroTelefono}?text=${encodeURIComponent(mensaje)}`, '_blank');

            db.collection("pedidos_donde_carmen").add({
                fecha_raw: new Date(),
                hora: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
                productos: carrito,
                total: granTotal,
                estado: "Pendiente",
                tipo_entrega: entregaSeleccionada,
                cliente: clienteNombre,
                direccion: clienteDireccion,
                gps: linkGoogleMaps || "No enviado"
            })
            .then(() => console.log("¡Pedido en la nube con despacho guardado!"))
            .catch((err) => console.error(err));

            linkGoogleMaps = "";
            const btnGps = document.getElementById("btn-gps");
            if (btnGps) {
                btnGps.disabled = false;
                btnGps.style.background = "#e0f2fe";
                btnGps.style.color = "#0369a1";
                btnGps.textContent = "📍 Compartir mi ubicación GPS actual";
                document.getElementById("status-gps").textContent = "";
            }

            carrito = [];
            const contadores = document.querySelectorAll(".contador-productos");
            contadores.forEach(contador => {
                contador.innerHTML = "0";
            });

            actualizarVisibilidadBotonCarrito();
            if (modalCarrito) modalCarrito.style.display = "none";
            mostrarConfirmacionPedido();
        });
    }

    // =========================================================================
    // 🌍 CONTROL DE TIPOS DE ENTREGA Y GPS
    // =========================================================================
    window.obtenerUbicacionGPS = function() {
        const status = document.getElementById("status-gps");
        const btn = document.getElementById("btn-gps");

        if (!navigator.geolocation) {
            status.textContent = "❌ Tu teléfono no soporta geolocalización.";
            return;
        }

        status.textContent = "🛰️ Localizando...";
        btn.disabled = true;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                linkGoogleMaps = `https://www.google.com/maps?q=${lat},${lon}`;
                status.textContent = "✅ ¡Ubicación GPS agregada con éxito!";
                btn.style.background = "#d4edda";
                btn.style.color = "#155724";
                btn.textContent = "📍 Ubicación Guardada ✔️";
            },
            (error) => {
                btn.disabled = false;
                status.textContent = " No se pudo acceder al GPS. Activa tu ubicación.";
                console.log(error);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    // =========================================================================
    // 🛵 CONTROL DINÁMICO DE VISIBILIDAD DE ENTREGA
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
    // ⭐ INTERACTIVIDAD DE LA MARQUESINA MODERNA
    // =========================================================================
    const marqueeItems = document.querySelectorAll(".marquee-item");
    marqueeItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const categoriaDestino = item.getAttribute("data-destino");
            if (categoriaDestino) {
                const botonFiltro = document.querySelector(`.btn-filtro-card[data-categoria="${categoriaDestino}"]`);
                if (botonFiltro) {
                    botonFiltro.click();
                    item.style.background = "#ffe0e2";
                    setTimeout(() => {
                        item.style.background = "#ffffff";
                    }, 200);

                    const conMenu = document.querySelector(".contenedor-menu") || document.querySelector(".filtros");
                    if (conMenu) {
                        window.scrollTo({
                            top: conMenu.offsetTop - 140,
                            behavior: "smooth"
                        });
                    }
                }
            }
        });
    });
});
