const formularioPerfil = document.getElementById("form-perfil");
const correoPerfil = document.getElementById("correo-perfil");
const rutPerfil = document.getElementById("rut-perfil");

// Recuperar correo utilizado en el login
const correoUsuario =
    sessionStorage.getItem("correoUsuario");

if (correoPerfil && correoUsuario) {
    correoPerfil.value = correoUsuario;
}

// Formatear RUT mientras se escribe
if (rutPerfil) {
    rutPerfil.addEventListener("input", function () {
        rutPerfil.value = formatearRut(rutPerfil.value);
    });
}

function formatearRut(rut) {
    let valor = rut
        .replace(/\./g, "")
        .replace(/-/g, "")
        .replace(/[^0-9kK]/g, "")
        .toUpperCase();

    if (valor.length <= 1) {
        return valor;
    }

    const cuerpo = valor.slice(0, -1);
    const digitoVerificador = valor.slice(-1);

    return `${Number(cuerpo).toLocaleString("es-CL")}-${digitoVerificador}`;
}

function validarRut(rut) {
    const rutLimpio = rut
        .replace(/\./g, "")
        .replace(/-/g, "")
        .toUpperCase();

    if (rutLimpio.length < 2) {
        return false;
    }

    const cuerpo = rutLimpio.slice(0, -1);
    const digitoIngresado = rutLimpio.slice(-1);

    if (!/^\d+$/.test(cuerpo)) {
        return false;
    }

    let suma = 0;
    let multiplicador = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += Number(cuerpo[i]) * multiplicador;
        multiplicador =
            multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const resultado = 11 - (suma % 11);

    let digitoCalculado;

    if (resultado === 11) {
        digitoCalculado = "0";
    } else if (resultado === 10) {
        digitoCalculado = "K";
    } else {
        digitoCalculado = String(resultado);
    }

    return digitoIngresado === digitoCalculado;
}

// Cargar información guardada
const perfilGuardado =
    JSON.parse(localStorage.getItem("perfilUsuario"));

if (perfilGuardado && formularioPerfil) {
    document.getElementById("nombre-perfil").value =
        perfilGuardado.nombre || "";

    document.getElementById("rut-perfil").value =
        perfilGuardado.rut || "";

    document.getElementById("telefono-perfil").value =
        perfilGuardado.telefono || "";

    document.getElementById("fecha-nacimiento").value =
        perfilGuardado.fechaNacimiento || "";

    document.getElementById("comuna-perfil").value =
        perfilGuardado.comuna || "";

    document.getElementById("direccion-perfil").value =
        perfilGuardado.direccion || "";

    document.getElementById("grupo-perfil").value =
        perfilGuardado.grupo || "";
}

// Guardar información
if (formularioPerfil) {
    formularioPerfil.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const rut = rutPerfil.value.trim();

        if (!validarRut(rut)) {
            alert("El RUT ingresado no es válido.");
            rutPerfil.focus();
            return;
        }

        const perfilUsuario = {
            nombre: document
                .getElementById("nombre-perfil")
                .value
                .trim(),

            rut: rut,

            correo: correoPerfil.value,

            telefono: document
                .getElementById("telefono-perfil")
                .value
                .trim(),

            fechaNacimiento: document
                .getElementById("fecha-nacimiento")
                .value,

            comuna: document
                .getElementById("comuna-perfil")
                .value
                .trim(),

            direccion: document
                .getElementById("direccion-perfil")
                .value
                .trim(),

            grupo: document
                .getElementById("grupo-perfil")
                .value
        };

        localStorage.setItem(
            "perfilUsuario",
            JSON.stringify(perfilUsuario)
        );

        alert("Tus datos fueron guardados correctamente.");
    });
}