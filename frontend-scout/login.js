const formularioLogin =
    document.getElementById("form-login");

if (formularioLogin) {
    formularioLogin.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const correo = document
            .getElementById("correo-login")
            .value
            .trim();

        const password = document
            .getElementById("password-login")
            .value;

        if (correo === "" || password === "") {
            alert("Debes completar el correo y la contraseña.");
            return;
        }

        if (password.length < 6) {
            alert("La contraseña debe tener al menos 6 caracteres.");
            return;
        }
        if (usuarioActual.rol==="administrador") {
            window.location.href = "panel-admin.html";
        } else {
            window.location.href = "panel-admin.html";
        }

        // Sesión temporal mientras se construye el microservicio
        sessionStorage.setItem("usuarioAutenticado", "true");
        sessionStorage.setItem("correoUsuario", correo);

        window.location.href = "panel-usuario.html";
    });
}