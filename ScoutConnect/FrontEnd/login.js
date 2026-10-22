const INTENTOS_MAXIMOS_LOGIN = 3;
const TIEMPO_BLOQUEO_LOGIN = 5 * 60 * 1000;

const formularioLogin = document.getElementById("form-login");
function obtenerBloqueoLogin() {
    const bloqueoHasta = Number(localStorage.getItem("bloqueoLoginHasta") || 0);
    const intentosFallidos = Number(localStorage.getItem("intentosFallidosLogin") || 0);
    return {bloqueoHasta, intentosFallidos};
}
function loginBloqueado() {
    const bloqueo = obtenerBloqueoLogin();
    return bloqueo.bloqueoHasta > Date.now();
}
function obtenerMinutosRestantesBloqueo() {
    const bloqueo = obtenerBloqueoLogin();
    const minutos = Math.ceil((bloqueo.bloqueoHasta - Date.now()) / 60000);
    return minutos > 0 ? minutos : 1;
}
function registrarIntentoFallido() {
    const bloqueo = obtenerBloqueoLogin();
    const intentos = bloqueo.intentosFallidos + 1;
    localStorage.setItem("intentosFallidosLogin", intentos.toString());
    if (intentos >= INTENTOS_MAXIMOS_LOGIN) {
        localStorage.setItem("bloqueoLoginHasta", (Date.now() + TIEMPO_BLOQUEO_LOGIN).toString());
        localStorage.setItem("intentosFallidosLogin", "0");
    }
}
function limpiarIntentosFallidos() {
    localStorage.removeItem("intentosFallidosLogin");
    localStorage.removeItem("bloqueoLoginHasta");
}
if (formularioLogin) {
    formularioLogin.addEventListener("submit", async function (evento) {
        evento.preventDefault();
        if (loginBloqueado()) {alert(`Demasiados intentos fallidos. ` + `Debes esperar ${obtenerMinutosRestantesBloqueo()} minuto(s) para reintentar.`);return;}
        const correo = document.getElementById("correo-login").value.trim();
        const password = document.getElementById("password-login").value.trim();
        if (correo === "" || password === "") {alert("Debes completar el correo y la contraseña."); return;}
        if (password.length < 6) {alert("La contraseña debe tener al menos 6 caracteres."); return;}
        try {
            const respuesta = await fetch("http://localhost:8080/usuarios/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ correo, password })
            });
            const data = await respuesta.json();
            if (data.error) {
                registrarIntentoFallido();
                const bloqueo = obtenerBloqueoLogin();
                if (bloqueo.bloqueoHasta > Date.now()) {
                    alert(`Cuenta bloqueada por intentos fallidos. ` + `Debes esperar ${obtenerMinutosRestantesBloqueo()} minuto(s).`);
                }else {const intentosRestantes = INTENTOS_MAXIMOS_LOGIN - bloqueo.intentosFallidos;
                    alert(`${data.error}\n` + `Intentos restantes: ${intentosRestantes}.`);
                } return;
            }
            // Bloquear si está inactivo
            if (data.estado && data.estado.toLowerCase() === "inactivo") {
                alert("Tu cuenta está inactiva. Contacta al administrador.");
                return;
            }
            limpiarIntentosFallidos();
            // Guardar sesión
            sessionStorage.setItem("tokenUsuario", data.token || "");
            sessionStorage.setItem("usuarioAutenticado", "true");
            sessionStorage.setItem("usuarioId",data.id);
            sessionStorage.setItem("correoUsuario", data.correo || correo);
            sessionStorage.setItem("nombreUsuario", data.nombre || "");
            sessionStorage.setItem("nicknameUsuario", data.nickname || "");
            // Redirigir según rol
            const rol = (data.rol || "").toLowerCase();
            sessionStorage.setItem("rolUsuario", rol);
            sessionStorage.setItem("ultimaActividadAdmin", Date.now().toString());
            const debeCambiarPassword = data.debeCambiarPassword === "true";
            if (debeCambiarPassword) {
                sessionStorage.setItem("cambioPasswordObligatorio", "true");
                window.location.href = "cambiar-password.html";
                return
            }
            switch (rol) {
                case "administrador": window.location.href = "panel-admin.html"; break;
                case "dirigente": window.location.href = "panel-recluta.html";break;
                case "recluta": window.location.href = "panel-recluta.html"; break;
                case "apoderado": window.location.href = "panel-usuario.html";break;
                default: window.location.href = "panel-usuario.html";} // scout
        } catch (error) {
            console.error("Error en el login:", error);
            alert("Error al conectar con el servidor.");
        }
    });
}
// visor de contraseña
const passwordInput = document.getElementById("password-login");
const botonMostrarPassword = document.getElementById("mostrar-password");
const iconoPassword = document.getElementById("icono-password");
if (passwordInput && botonMostrarPassword && iconoPassword) {botonMostrarPassword.addEventListener("click", function (evento) {evento.preventDefault();
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        iconoPassword.src = "img/iconos/ojo-a.svg";
        iconoPassword.alt = "Ocultar contraseña";
        botonMostrarPassword.setAttribute("aria-label", "Ocultar contraseña");
        botonMostrarPassword.setAttribute("aria-pressed", "true");
    } else {
        passwordInput.type = "password";
        iconoPassword.src = "img/iconos/ojo-c.svg";
        iconoPassword.alt = "Mostrar contraseña";
        botonMostrarPassword.setAttribute("aria-label", "Mostrar contraseña");
        botonMostrarPassword.setAttribute("aria-pressed", "false");
    }
});}
