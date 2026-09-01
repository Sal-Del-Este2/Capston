const formularioRegistro =
    document.getElementById("form-registro");

if (formularioRegistro) {
    formularioRegistro.addEventListener(
        "submit",
        function (evento) {
            evento.preventDefault();

            const nombre = document
                .getElementById("nombre-registro")
                .value
                .trim();

            const nickname = document
                .getElementById("nickname-registro")
                .value
                .trim()
                .toLowerCase();

            const correo = document
                .getElementById("correo-registro")
                .value
                .trim()
                .toLowerCase();

            const password = document
                .getElementById("password-registro")
                .value;

            const confirmarPassword = document
                .getElementById("confirmar-password")
                .value;

            const validarNombre =
                /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$/;

            const validarNickname =
                /^[a-z0-9_]+$/;

            const validarPassword =
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{12,64}$/;

            if (!validarNombre.test(nombre)) {
                alert(
                    "El nombre solo puede contener letras y espacios."
                );

                return;
            }

            if (
                nickname.length < 3 ||
                nickname.length > 20
            ) {
                alert(
                    "El nickname debe tener entre 3 y 20 caracteres."
                );

                return;
            }

            if (!validarNickname.test(nickname)) {
                alert(
                    "El nickname solo puede contener letras, " +
                    "números y guion bajo."
                );

                return;
            }

            if (!validarPassword.test(password)) {
                alert(
                    "La contraseña debe tener entre 12 y 64 caracteres, " +
                    "incluyendo una mayúscula, una minúscula, un número " +
                    "y un carácter especial."
                );

                return;
            }

            if (password !== confirmarPassword) {
                alert("Las contraseñas no coinciden.");

                return;
            }

            const usuariosRegistrados =
                JSON.parse(
                    localStorage.getItem(
                        "usuariosRegistrados"
                    )
                ) || [];

            const nicknameOcupado =
                usuariosRegistrados.some(
                    function (usuario) {
                        return usuario.nickname === nickname;
                    }
                );

            if (nicknameOcupado) {
                alert(
                    "Este nickname ya está registrado. Elige otro."
                );

                return;
            }

            const correoRegistrado =
                usuariosRegistrados.some(
                    function (usuario) {
                        return usuario.correo === correo;
                    }
                );

            if (correoRegistrado) {
                alert(
                    "Ya existe una cuenta asociada a este correo."
                );

                return;
            }

            const nuevoUsuario = {
                id: Date.now(),
                nombre: nombre,
                nickname: nickname,
                correo: correo,
                rol: "usuario"
            };

            usuariosRegistrados.push(nuevoUsuario);

            localStorage.setItem(
                "usuariosRegistrados",
                JSON.stringify(usuariosRegistrados)
            );

            alert(
                `Usuario @${nickname} registrado correctamente.`
            );

            window.location.href = "login.html";
        }
    );
}