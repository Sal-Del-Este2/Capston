const formularioLogin = document.getElementById("form-login");

if (formularioLogin) {
    formularioLogin.addEventListener("submit", async function (evento) {
        evento.preventDefault();

        const correo = document.getElementById("correo-login").value.trim();
        const password = document.getElementById("password-login").value;

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

            // ⚠️ Bloquear si está inactivo
            if (data.estado && data.estado.toLowerCase() === "inactivo") {
                alert("Tu cuenta está inactiva. Contacta al administrador.");
                return;
            }

            // Guardar sesión
            sessionStorage.setItem("usuarioAutenticado", "true");
            sessionStorage.setItem("correoUsuario", correo);
            sessionStorage.setItem("rolUsuario", data.rol);

            // Redirigir según rol
            if (data.rol === "administrador") {
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
