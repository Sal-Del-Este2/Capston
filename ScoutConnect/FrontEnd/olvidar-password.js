const URL_OLVIDAR_PASSWORD = "http://localhost:8080/usuarios/olvidar-password";
const botonOlvidarPassword = document.getElementById("boton-olvidar-password");
if (botonOlvidarPassword) {
    botonOlvidarPassword.addEventListener("click", async function () {
        const correo = prompt("Ingresa el correo asociado a tu cuenta:");
        if (!correo) {return;}
        const correoNormalizado = correo.trim().toLowerCase();
        if (!correoNormalizado) {alert("Debes ingresar un correo electrónico."); return;}
        try {
            const respuesta = await fetch(URL_OLVIDAR_PASSWORD, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({correo: correoNormalizado})
            });
            const texto = await respuesta.text();
            let data = {};
            if (texto) {
                try {data = JSON.parse(texto);
                } catch (error) {data = { error: texto };}
            }
            if (!respuesta.ok) {alert(data.error || data.message || "No se pudo enviar la solicitud.");return;}
            alert(data.mensaje || "Si el correo es una cuenta activa, se envió una solicitud al administrador.");
        } catch (error) {console.error("Error al solicitar restablecimiento:", error); alert("No se pudo conectar con el servidor.");}
    });
}