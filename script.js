document.addEventListener("DOMContentLoaded", () => {
    const contenedorMenu = document.querySelector(".contenedor-menu");
    const headerFiltros = document.querySelector(".filtros");
    const heroBanner = document.querySelector(".hero-banner");
    const botonVolver = document.createElement("button");
    botonVolver.className = "btn-volver";
    botonVolver.innerHTML = "⬅ Volver al Menú Principal";
    botonVolver.style.display = "none";
    if (contenedorMenu) {
        contenedorMenu.parentNode.insertBefore(botonVolver, contenedorMenu);
    }

    // =========================================================================
    // ⭐ INYECCIÓN AUTOMÁTICA DEL SELECTOR DE CANTIDAD EN LOS BOTONES
    // =========================================================================
    const botonesPedirIniciales = document.querySelectorAll(".btn-pedir-plato");
    botonesPedirIniciales.forEach(btn => {
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

    const botonTodos = document.querySelector('[data-categoria="todos"]');
    if (botonTodos) botonTodos.style.display = "none";

    function actualizarVisibilidadBotonCarrito() {
        if (btnVerCarrito) {
            const totalProductos = carrito.reduce((total, item) => total + item.cantidad, 0);
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

    function mostrarCategoriasPrincipales() {
        platos.forEach(plato => plato.style.display = "none");
        if (headerFiltros) headerFiltros.style.display = "flex";
        botonVolver.style.display = "none";
        if (heroBanner) heroBanner.style.display = "block";
    }

    botonVolver.addEventListener("click", (e) => {
        e.stopPropagation();
        mostrarCategoriasPrincipales();
    });

    function activarCategoriaFiltro(categoriaFiltrada) {
        platos.forEach(plato => {
            if (categoriaFiltrada === "todos" || plato.getAttribute("data-categoria") === categoriaFiltrada) {
                plato.style.display = "flex";
            } else {
                plato.style.display = "none";
            }
        });
        if (categoriaFiltrada === "todos") {
            if (headerFiltros) headerFiltros.style.display = "flex";
            botonVolver.style.display = "none";
            if (heroBanner) heroBanner.style.display = "block";
        } else {
            if (headerFiltros) headerFiltros.style.display = "none";
            botonVolver.style.display = "block";
            if (heroBanner) heroBanner.style.display = "none";
        }
    }

    botones.forEach(boton => {
        boton.addEventListener("click", () => {
            const categoriaFiltrada = boton.getAttribute("data-categoria");
            activarCategoriaFiltro(categoriaFiltrada);
        });
    });

    // =========================================================================
    // ⭐ LÓGICA DE EXCLUSIVIDAD: "Sin Salsas" vs otras salsas
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
    // EVENTO PRINCIPAL: CLICK EN BOTÓN DE PEDIR PLATO (AGRUPADO)
    // =========================================================================
    document.addEventListener("click", (e) => {
        if (e.target.tagName === "BUTTON" && e.target.closest(".item-menu")) {
            const btnPedir = e.target;
            if (btnPedir.classList.contains("btn-volver") || btnPedir.id === "cerrar-carrito" || btnPedir.classList.contains("btn-mas") || btnPedir.classList.contains("btn-menos")) return;

            e.preventDefault();
            e.stopPropagation();

            const plato = btnPedir.closest(".item-menu");

            // ⭐ VALIDACIÓN DE SALSAS OBLIGATORIAS
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
                const valorAdicion = parseInt(chk.getAttribute("data-valor")) || 2000;
                valorAdiciones += valorAdicion;
            });

            let acompanamiento = "";
            const radioSeleccionado = plato.querySelector("input[type='radio']:checked");
            if (radioSeleccionado) {
                acompanamiento = radioSeleccionado.value;
            }

            const elementoPrecio = plato.querySelector(".precio");
            const precioBase = parseInt(elementoPrecio.getAttribute("data-precio-base")) || 0;
            const precioFinalItem = precioBase + valorAdiciones;

            // Obtener la cantidad seleccionada desde el indicador visual
            const indicadorCantidad = plato.querySelector(".numero-cantidad");
            const cantidadA_Anadir = indicadorCantidad ? parseInt(indicadorCantidad.textContent) : 1;

            // Generar clave única para identificar platos exactamente idénticos
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

            const contadores = document.querySelectorAll("#contador-productos");
            contadores.forEach(contador => {
                contador.innerHTML = carrito.reduce((total, item) => total + item.cantidad, 0);
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
            plato.querySelectorAll("input[type='radio']").forEach(rd => rd.checked = false);

            if (elementoPrecio) {
                elementoPrecio.textContent = `$${precioBase.toLocaleString('es-CO')}`;
            }
        }
    });

    // EVENTO: CAMBIO EN ADICIONES (ACTUALIZAR PRECIO EN TIEMPO REAL)
    document.addEventListener("change", (e) => {
        if (e.target.classList.contains("adicion-item")) {
            const plato = e.target.closest(".item-menu");
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

    // EVENTO: CLICK EN VER CARRITO
    if (btnVerCarrito) {
        btnVerCarrito.addEventListener("click", (e) => {
            e.preventDefault();
            if (carrito.length === 0) return;
            renderizarCarrito();
            if (modalCarrito) modalCarrito.style.display = "flex";
        });
    }

    if (cerrarCarrito) cerrarCarrito.addEventListener("click", () => modalCarrito.style.display = "none");
    if (btnSeguirComiendo) btnSeguirComiendo.addEventListener("click", () => modalCarrito.style.display = "none");

    // FUNCIÓN: RENDERIZAR CARRITO (MODIFICADA PARA AGRUPAR EN LÍNEA)
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
            if (producto.acompanamiento) detallesHTML += `<li>Acompañamiento: ${producto.acompanamiento}</li>`;
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
                carrito = Float64Array ? carrito.filter(item => item.id !== idEliminar) : carrito;

                const contadores = document.querySelectorAll("#contador-productos");
                contadores.forEach(contador => {
                    contador.innerHTML = carrito.reduce((total, item) => total + item.cantidad, 0);
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

    // =========================================================================
    // ⭐ FUNCIÓN: MOSTRAR MODAL DE CONFIRMACIÓN DE PEDIDO ENVIADO
    // =========================================================================
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

        modalConfirmacion.addEventListener("click", (e) => {
            if (e.target === modalConfirmacion) {
                modalConfirmacion.remove();
            }
        });
    }

    // =========================================================================
    // ⭐ EVENTO: CONFIRMAR PEDIDO POR WHATSAPP + LIMPIEZA + CONFIRMACIÓN (MODIFICADO PARA AGRUPAR EN LÍNEA)
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
                if (producto.salsas.length > 0) mensaje += `    🧴 Salsas: ${producto.salsas.join(", ")}\n`;
                mensaje += `    _Subtotal: $${subtotalItem.toLocaleString('es-CO')}_\n\n`;

                granTotal += subtotalItem;
            });

            mensaje += `---------------------------\n`;
            mensaje += `💰 *TOTAL A PAGAR: $${granTotal.toLocaleString('es-CO')}*\n\n`;
            mensaje += `¿Me confirman el pedido para enviar los datos de mi domicilio? 🙏`;

            // Abrir WhatsApp
            window.open(`https://wa.me/${numeroTelefono}?text=${encodeURIComponent(mensaje)}`, '_blank');

            // ⭐ PASO 1: Limpiar el carrito
            carrito = [];
            const contadores = document.querySelectorAll("#contador-productos");
            contadores.forEach(contador => {
                contador.innerHTML = "0";
            });
            actualizarVisibilidadBotonCarrito();

            // ⭐ PASO 2: Cerrar el modal del carrito
            if (modalCarrito) modalCarrito.style.display = "none";

            // ⭐ PASO 3: Mostrar pantalla de confirmación
            mostrarConfirmacionPedido();

            // ⭐ PASO 4: Mostrar toast adicional (por si acaso)
            const toast = document.getElementById("notificacion-toast");
            if (toast) {
                toast.innerHTML = "✅ ¡Pedido enviado con éxito!";
                toast.classList.add("mostrar");
                setTimeout(() => {
                    toast.classList.remove("mostrar");
                    toast.innerHTML = "✨ ¡Plato añadido al carrito!";
                }, 3000);
            }
        });
    }
});
