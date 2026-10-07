const formularioLogin = document.getElementById("form-login");
if (formularioLogin) {
    formularioLogin.addEventListener("submit", async function (evento) {
        evento.preventDefault();
        const correo = document.getElementById("correo-login").value.trim();
        const password = document.getElementById("password-login").value.trim();
        if (correo === "" || password === "") {
            alert("Debes completar el correo y la contraseña.");
            return;
        }
        if (password.length < 6) {
            alert("La contraseña debe tener al menos 6 caracteres.");
            return;
        }
        try {
            const respuesta = await fetch("http://localhost:8080/usuarios/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ correo, password })
            });
            const data = await respuesta.json();
            if (data.error) {
                alert(data.error);
                return;
            }
            // Bloquear si está inactivo
            if (data.estado && data.estado.toLowerCase() === "inactivo") {
                alert("Tu cuenta está inactiva. Contacta al administrador.");
                return;
            }
            // Guardar sesión
            sessionStorage.setItem("usuarioAutenticado", "true");
            sessionStorage.setItem("usuarioId",data.id);
            sessionStorage.setItem("correoUsuario", data.correo || correo);
            sessionStorage.setItem("nombreUsuario", data.nombre || ""); //+
            sessionStorage.setItem("rolUsuario", data.rol || "");
            // Redirigir según rol
            if (data.rol && data.rol.toLowerCase() === "administrador") {
                window.location.href = "panel-admin.html";
            } else {
                window.location.href = "panel-usuario.html";
            }
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
