const formularioRegistro =
    document.getElementById("form-registro");

formularioRegistro.addEventListener("submit", function(evento) {

    evento.preventDefault();

    const nombre =
        document.getElementById("nombre-registro").value.trim();

    const password =
        document.getElementById("password-registro").value;

    const confirmarPassword =
        document.getElementById("confirmar-password").value;


    const validarNombre =
        /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$/;


    if (!validarNombre.test(nombre)) {

        alert("El nombre solo puede contener letras");

        return;
    }


    if (password !== confirmarPassword) {

        alert("Las contraseñas no coinciden");

        return;
    }


    alert("Usuario registrado correctamente");

});