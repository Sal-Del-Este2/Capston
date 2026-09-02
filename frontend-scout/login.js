const formularioLogin =
    document.getElementById("form-login");

if (formularioLogin) {
    formularioLogin.addEventListener(
        "submit",
        function (evento) {
            evento.preventDefault();

            const correo = document
                .getElementById("correo-login")
                .value
                .trim()
                .toLowerCase();

            const password = document
                .getElementById("password-login")
                .value;

            if (correo === "" || password === "") {
                alert(
                    "Debes completar el correo y la contraseña."
                );
                return;
            }

            if (password.length < 6) {
                alert(
                    "La contraseña debe tener al menos 6 caracteres."
                );
                return;
            }

            /*
             * Autenticación temporal mientras se construye
             * el microservicio de identidad.
             */
            let rolUsuario = "USUARIO";

            /*
             * Acceso administrativo temporal.
             * Más adelante el rol vendrá desde el backend.
             */
            if (
                correo === "admin@comunidadscout.cl"
            ) {
                rolUsuario = "ADMINISTRADOR";
            }

            /*
             * Guardamos la sesión antes de redirigir.
             */
            sessionStorage.setItem(
                "usuarioAutenticado",
                "true"
            );

            sessionStorage.setItem(
                "correoUsuario",
                correo
            );

            sessionStorage.setItem(
                "usuarioId",
                correo
            );

            sessionStorage.setItem(
                "rolUsuario",
                rolUsuario
            );

            /*
             * Redirección según el rol.
             */
            if (rolUsuario === "ADMINISTRADOR") {
                window.location.href =
                    "panel-admin.html";
            } else {
                window.location.href =
                    "panel-usuario.html";
            }
        }
    );
}