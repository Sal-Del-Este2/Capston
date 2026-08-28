const formularioLogin = document.getElementById("form-login");

formularioLogin.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const correo = document.getElementById("correo-login").value.trim();
    const password = document.getElementById("password-login").value;

    if (correo !== "" && password !== "") {
        alert("Inicio de sesión correcto");
    }
});