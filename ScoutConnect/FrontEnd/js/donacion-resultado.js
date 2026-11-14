(() => {
    "use strict";
    const CLAVE_DONACION_PENDIENTE = "donacionScoutPendiente";
    const elementos = {
        indicador: document.getElementById("indicador-estado-donacion"),
        iconoEstado: document.getElementById("icono-estado-donacion"),
        textoEstado: document.getElementById("texto-estado-donacion"),
        mensaje: document.getElementById("mensaje-resultado-donacion"),
        detalle: document.getElementById("detalle-donacion"),
        monto: document.getElementById("monto-donacion-resultado"),
        tipo: document.getElementById("tipo-donacion-resultado"),
        filaNombre: document.getElementById("fila-nombre-donante"),
        nombre: document.getElementById("nombre-donante-resultado"),
        filaCorreo: document.getElementById("fila-correo-donante"),
        correo: document.getElementById("correo-donante-resultado"),
        fecha: document.getElementById("fecha-donacion-resultado"),
        estado: document.getElementById("estado-donacion-resultado"),
        sinDatos: document.getElementById("resultado-sin-datos-donacion"),
        mensajeSinDatos: document.getElementById("mensaje-sin-datos-donacion"),
        botonDescargar: document.getElementById("boton-descargar-donacion"),
        mensajeComprobante: document.getElementById("mensaje-comprobante-donacion")
    };
    let donacionActual = null;
    let resultadoPagoActual = null;
    // Formatear monto en pesos chilenos.
    function formatearMoneda(valor) {
        const monto = Number(valor);
        if (!Number.isSafeInteger(monto) || monto < 0) {return "Monto no disponible";}
        return monto.toLocaleString("es-CL", {style: "currency", currency: "CLP", maximumFractionDigits: 0});
    }
    // Formatear fecha.
    function formatearFecha(fecha) {
        if (!fecha) return "No disponible";
        const fechaConvertida = new Date(fecha);
        if (Number.isNaN(fechaConvertida.getTime())) {return "No disponible";}
        return fechaConvertida.toLocaleString("es-CL", {dateStyle: "long", timeStyle: "short"});
    }
    // Recuperar los datos guardados antes de ir a Webpay.
    function leerDonacionPendiente() {
        try {
            const contenido = sessionStorage.getItem(CLAVE_DONACION_PENDIENTE);
            if (!contenido) return null;
            const datos = JSON.parse(contenido);
            if (!datos || typeof datos !== "object") return null;
            const monto = Number(datos.monto);
            const tipo = String(datos.tipoDonacion || "").toUpperCase();
            if (!Number.isSafeInteger(monto) || monto < 1) return null;
            if (!["ANONIMA", "IDENTIFICADA"].includes(tipo)) { return null;}
            let nombre = null;
            let correo = null;
            if (tipo === "IDENTIFICADA") {
                nombre = typeof datos.nombreDonante === "string" ? datos.nombreDonante.trim() : "";
                correo = typeof datos.correoDonante === "string" ? datos.correoDonante.trim() : "";
                if (!nombre || !correo) return null;
            }
            return {
                monto,
                tipoDonacion: tipo,
                nombreDonante: nombre,
                correoDonante: correo,
                fechaInicio: datos.fechaInicio || null
            };
        } catch (error) {
            console.error("Error al recuperar los datos de la donación:", error);
            return null;
        }
    }
    // Obtener resultado devuelto por Webpay.
    function leerResultadoUrl() {
        const parametros = new URLSearchParams(window.location.search);
        return parametros.get("pago");
    }
    // Mostrar estado de la operación.
    function mostrarEstado(resultado) {
        const estados = {
            aprobado: {
                clase: "estado-aprobado",
                icono: "✓",
                titulo: "Donación aprobada",
                mensaje: "Webpay informó que el pago fue aprobado."
            },
            rechazado: {
                clase: "estado-rechazado",
                icono: "✕",
                titulo: "Donación rechazada",
                mensaje: "Webpay informó que el pago no fue aprobado."
            },
            cancelado: {
                clase: "estado-cancelado",
                icono: "!",
                titulo: "Donación cancelada",
                mensaje: "La operación fue cancelada."
            },
            error: {
                clase: "estado-error",
                icono: "!",
                titulo: "No se pudo confirmar la donación",
                mensaje: "No fue posible confirmar el resultado de la operación. Verifica su estado antes de volver a intentar el pago."
          }
        };
        const estado = estados[resultado] || {
            clase: "estado-error",
            icono: "!",
            titulo: "Resultado no disponible",
            mensaje: "No se recibió un resultado de pago reconocido."
        };
        elementos.indicador.className = `indicador-estado-donacion ${estado.clase}`;
        elementos.iconoEstado.textContent = estado.icono;
        elementos.textoEstado.textContent = estado.titulo;
        elementos.mensaje.textContent = estado.mensaje;
        elementos.estado.textContent = estado.titulo;
        return resultado === "aprobado";
    }
    // Mostrar datos de la donación.
    function mostrarDatos(donacion) {
        elementos.monto.textContent = formatearMoneda(donacion.monto);
        elementos.tipo.textContent = donacion.tipoDonacion === "ANONIMA" ? "Anónima" : "Identificada";
        const esIdentificada = donacion.tipoDonacion === "IDENTIFICADA";
        elementos.filaNombre.hidden = !esIdentificada;
        elementos.filaCorreo.hidden = !esIdentificada;
        elementos.nombre.textContent = esIdentificada ? donacion.nombreDonante : "";
        elementos.correo.textContent = esIdentificada ? donacion.correoDonante : "";
        elementos.fecha.textContent = formatearFecha(donacion.fechaInicio);
        elementos.detalle.hidden = false;
    }
    // Mostrar error cuando no existen datos guardados.
    function mostrarErrorDatos() {
        elementos.sinDatos.hidden = false;
        elementos.mensajeSinDatos.textContent = "No se encontraron datos válidos de la donación en esta sesión. " + "No es posible generar el comprobante.";
        elementos.botonDescargar.disabled = true;
    }
    // Inicializar página.
    function inicializar() {
        resultadoPagoActual = leerResultadoUrl();
        const pagoAprobado = mostrarEstado(resultadoPagoActual);
        // Retirar los parámetros de la URL después de leer el resultado.
        window.history.replaceState({}, document.title, window.location.pathname);
        donacionActual = leerDonacionPendiente();
        if (!donacionActual) {mostrarErrorDatos(); return;}
        mostrarDatos(donacionActual);
        if (pagoAprobado) {elementos.botonDescargar.disabled = false;
        } else {
            elementos.botonDescargar.disabled = true;
            elementos.mensajeComprobante.textContent = "El comprobante descargable solo está habilitado para pagos aprobados.";
        }
    }
    // Agregar texto con ajuste de línea en PDF.
    function agregarTexto(documento, texto, x, y, ancho, interlineado = 6) {
        const lineas = documento.splitTextToSize(String(texto), ancho);
        documento.text(lineas, x, y);
        return y + lineas.length * interlineado;
    }
    // Generar comprobante PDF.
    function generarComprobantePDF() {
        if (!donacionActual || resultadoPagoActual !== "aprobado") {
            elementos.mensajeComprobante.textContent = "No se puede generar el comprobante: no hay una donación aprobada con datos disponibles.";
            return;
        }
        if (!window.jspdf || typeof window.jspdf.jsPDF !== "function"
        ) {elementos.mensajeComprobante.textContent = "No se pudo cargar jsPDF. Comprueba la conexión y vuelve a intentarlo."; return;}
        const boton = elementos.botonDescargar;
        boton.disabled = true;
        boton.textContent = "Generando PDF...";
        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();
            const anchoPagina = pdf.internal.pageSize.getWidth();
            const altoPagina = pdf.internal.pageSize.getHeight();
            const margen = 18;
            const anchoTexto = anchoPagina - margen * 2;
            let y = 24;
            // Encabezado.
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(19);
            pdf.text("Comunidad Scout", margen, y);
            y += 9;
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(12);
            pdf.text("Comprobante de donación", margen, y);
            y += 8;
            pdf.setDrawColor(180, 180, 180);
            pdf.line(margen, y, anchoPagina - margen, y);
            // Resultado.
            y += 13;
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(13);
            pdf.text("Resultado de la operación", margen, y);
            y += 9;
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(11);
            pdf.text("Estado: Pago aprobado", margen, y);
            // Datos de la donación.
            y += 13;
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(12);
            pdf.text("Datos de la donación", margen, y);
            y += 10;
            const datos = [
                ["Monto:", formatearMoneda(donacionActual.monto)],
                ["Tipo:", donacionActual.tipoDonacion === "ANONIMA" ? "Anónima" : "Identificada"],
                ["Fecha:", formatearFecha(donacionActual.fechaInicio)]
            ];
            if (donacionActual.tipoDonacion === "IDENTIFICADA") {
                datos.push(
                    ["Donante:", donacionActual.nombreDonante],
                    ["Correo:", donacionActual.correoDonante]
                );
            }
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(11);
            for (const [etiqueta, valor] of datos) {
                if (y > altoPagina - 45) {pdf.addPage(); y = 24;}
                pdf.setFont("helvetica", "bold");
                pdf.text(etiqueta, margen, y);
                pdf.setFont("helvetica", "normal");
                y = agregarTexto(pdf, valor, margen + 32, y, anchoTexto - 32) + 4;
            }
            y += 8;
            if (y > altoPagina - 45) {pdf.addPage(); y = 24;}
            pdf.setDrawColor(180, 180, 180);
            pdf.line(margen, y, anchoPagina - margen, y);
            y += 9;
            pdf.setFont("helvetica", "italic");
            pdf.setFontSize(8);
            const aclaracion =
                "Documento generado en el navegador con los datos conservados " +
                "durante el proceso y el resultado recibido al regresar de Webpay. " +
                "No constituye un documento tributario ni una verificación " +
                "independiente de la transacción.";
            agregarTexto(pdf, aclaracion, margen, y, anchoTexto, 5);
            const fechaArchivo = new Date().toISOString().slice(0, 10);
            const archivo = `Comprobante_Donacion_ScoutConnect_${fechaArchivo}.pdf`;
            pdf.save(archivo);
            elementos.mensajeComprobante.textContent = "El comprobante PDF se generó correctamente.";
        } catch (error) {
            console.error("Error al generar el comprobante PDF:", error);
            elementos.mensajeComprobante.textContent = "No fue posible generar el comprobante PDF.";
        } finally {
            boton.disabled = false;
            boton.textContent = "Descargar comprobante PDF";
        }
    }
    // Evento de descarga.
    elementos.botonDescargar.addEventListener("click", generarComprobantePDF);
    // Ejecutar inicialización.
    inicializar();
})();