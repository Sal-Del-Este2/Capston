const URL_CAMBIAR_PASSWORD = "http://localhost:8080/usuarios/cambiar-password";
const formularioCambiarPassword = document.getElementById("form-cambiar-password");
if (sessionStorage.getItem("cambioPasswordObligatorio") !== "true") {window.location.href = "login.html";}
if (formularioCambiarPassword) {
    formularioCambiarPassword.addEventListener("submit", async function (evento) {evento.preventDefault();
        const correo = sessionStorage.getItem("correoUsuario");
        const passwordActual = document.getElementById("password-temporal").value.trim();
        const passwordNueva = document.getElementById("password-nueva").value.trim();
        const passwordConfirmar = document.getElementById("password-confirmar").value.trim();
        if (!correo) {alert("No se encontró la sesión del usuario. Vuelve a iniciar sesión."); window.location.href = "login.html"; return;}
        if (passwordNueva.length < 6) {alert("La nueva contraseña debe tener al menos 6 caracteres."); return;}
        if (passwordNueva !== passwordConfirmar) {alert("Las contraseñas nuevas no coinciden."); return;}
        try {
            const respuesta = await fetch(URL_CAMBIAR_PASSWORD, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    correo: correo,
                    passwordActual: passwordActual,
                    passwordNueva: passwordNueva
                })
            });
            const data = await respuesta.json();
            if (!respuesta.ok || data.error) {alert(data.error || "No se pudo cambiar la contraseña."); return;}
            sessionStorage.removeItem("cambioPasswordObligatorio");
            alert(data.mensaje || "Contraseña actualizada correctamente.");
            const rol = (sessionStorage.getItem("rolUsuario") || "").toLowerCase();
            switch (rol) {
                case "administrador": window.location.href = "panel-admin.html"; break;
                case "dirigente":
                case "recluta": window.location.href = "panel-recluta.html"; break;
                case "apoderado": window.location.href = "panel-usuario.html"; break;
                default: window.location.href = "panel-usuario.html";
            }
        } catch (error) {console.error("Error al cambiar la contraseña:", error); alert("No se pudo conectar con el servidor.");}
    });
}