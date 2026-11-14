
const API_DONACIONES = "http://localhost:8082/api/donaciones";
const formulario = document.getElementById("formulario-donacion");
const montoInput = document.getElementById("monto-donacion");
const tipoDonacion = document.getElementById("tipo-donacion");
const datosDonante = document.getElementById("datos-donante");
const nombreDonante = document.getElementById("nombre-donante");
const correoDonante = document.getElementById("correo-donante");
const botonDonar = document.getElementById("boton-donar");
const mensajeDonacion = document.getElementById("mensaje-donacion");
// Mostrar u ocultar los datos según el tipo de donación
tipoDonacion.addEventListener("change", () => {
    const identificada = tipoDonacion.value === "IDENTIFICADA";
    datosDonante.hidden = !identificada;
    nombreDonante.required = identificada;
    correoDonante.required = identificada;
    if (!identificada) {nombreDonante.value = ""; correoDonante.value = "";}
});
// Mostrar mensajes al usuario
function mostrarMensaje(mensaje, tipo) {
    mensajeDonacion.textContent = mensaje;
    mensajeDonacion.className = `mensaje-donacion ${tipo}`;

}
// Enviar formulario
formulario.addEventListener("submit", async (event) => {
    event.preventDefault();
    const monto = Number(montoInput.value);
    const tipo = tipoDonacion.value;
    if (!Number.isSafeInteger(monto) || monto < 1) {mostrarMensaje("Ingresa un monto válido.", "error"); return;}
    if (tipo === "IDENTIFICADA") {
        if (!nombreDonante.value.trim()) {
            mostrarMensaje("Ingresa tu nombre completo.", "error");
            nombreDonante.focus();
            return;
        }
        if (!correoDonante.checkValidity()) {
            mostrarMensaje("Ingresa un correo electrónico válido.", "error");
            correoDonante.focus();
            return;
        }
    }
    // Construir solicitud según CrearDonacionRequest
    const donacion = {
        monto: monto,
        tipoDonacion: tipo,
        nombreDonante: tipo === "IDENTIFICADA" ? nombreDonante.value.trim() : null,
        correoDonante: tipo === "IDENTIFICADA" ? correoDonante.value.trim() : null
    };
    botonDonar.disabled = true;
    botonDonar.textContent = "Procesando...";
    mostrarMensaje("Registrando la donación y preparando el pago...", "info");
    try {
        const respuesta = await fetch(API_DONACIONES, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(donacion)
        });
        const resultado = await respuesta.json();
        if (!respuesta.ok) {throw new Error(resultado.error || resultado.message || "No fue posible registrar la donación.");}
        if (!resultado.url || !resultado.token) {throw new Error("El servidor no devolvió los datos de Webpay.");}
        // Guardar los datos de la donación para mostrarlos en la página de resultado
        sessionStorage.setItem("donacionScoutPendiente",
            JSON.stringify({
                monto: monto,
                tipoDonacion: tipo,
                nombreDonante: tipo === "IDENTIFICADA" ? nombreDonante.value.trim() : null,
                correoDonante: tipo === "IDENTIFICADA" ? correoDonante.value.trim() : null,
                fechaInicio: new Date().toISOString()
            })
        );
        mostrarMensaje("Redirigiendo a Webpay...", "info");
        // Enviar token a Webpay mediante POST
        const formularioWebpay = document.createElement("form");
        formularioWebpay.method = "POST";
        formularioWebpay.action = resultado.url;
        const campoToken = document.createElement("input");
        campoToken.type = "hidden";
        campoToken.name = "token_ws";
        campoToken.value = resultado.token;
        formularioWebpay.appendChild(campoToken);
        document.body.appendChild(formularioWebpay);
        formularioWebpay.submit();
    } catch (error) {console.error("Error al realizar la donación:", error);
        mostrarMensaje(error.message || "Ocurrió un error al procesar la donación.", "error");
        botonDonar.disabled = false;
        botonDonar.textContent = "Continuar al pago";
    }
});
