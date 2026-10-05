const formularioPerfil = document.getElementById("form-perfil");
const correoPerfil = document.getElementById("correo-perfil");
const rutPerfil = document.getElementById("rut-perfil");
const correoUsuario = sessionStorage.getItem("correoUsuario");

fetch("http://localhost:8080/comunas/listar")
    .then(response => response.json())
    .then(comunas => {const selectComuna = document.getElementById("comuna-perfil");
        comunas.forEach(comuna => {
            const option = document.createElement("option");
            option.value = comuna.id;
            option.textContent = comuna.nombre;
            selectComuna.appendChild(option);
        });
    });
if (correoPerfil && correoUsuario) {
    correoPerfil.value = correoUsuario;
}
// Formatear RUT
if (rutPerfil) {
    rutPerfil.addEventListener("input", function () {rutPerfil.value = formatearRut(rutPerfil.value);});
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
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
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
/* CARGAR DATOS DESDE BACKEND */
if (correoUsuario) {
    fetch(`http://localhost:8080/usuarios/perfil/${correoUsuario}`)
        .then(response => response.json())
        .then(usuario => {
            document.getElementById("nombre-perfil").value = usuario.nombre || "";
            document.getElementById("rut-perfil").value = usuario.rut || "";
            document.getElementById("correo-perfil").value = usuario.correo || "";
            document.getElementById("telefono-perfil").value = usuario.telefono || "";
            document.getElementById("fecha-nacimiento").value = usuario.nacimiento || "";
            document.getElementById("direccion-perfil").value = usuario.direccion || "";
            // document.getElementById("comuna-perfil").value = usuario.comuna || "";
            // document.getElementById("grupo-perfil").value = usuario.grupo || "";
            document.getElementById("comuna-perfil").value = usuario.comuna?.id || "";
            document.getElementById("grupo-perfil").value = usuario.grupo?.nombre || "";
            // Bloquear campos
            document.getElementById("nombre-perfil").readOnly = true;
            document.getElementById("rut-perfil").readOnly = true;
            document.getElementById("correo-perfil").readOnly = true;
            document.getElementById("fecha-nacimiento").disabled = true;
            document.getElementById("grupo-perfil").disabled = true;
        })
        .catch(error => {console.error("Error cargando perfil:", error);});
        setTimeout(() => {document.getElementById("comuna-perfil").value = usuario.comuna?.id || "";}, 100);
}
/* GUARDAR CAMBIOS */
if (formularioPerfil) {
    formularioPerfil.addEventListener("submit", function (evento) {
        evento.preventDefault();
        const perfilUsuario = {
            telefono: document
                .getElementById("telefono-perfil")
                .value
                .trim(),
            direccion: document
                .getElementById("direccion-perfil")
                .value
                .trim(),
            comuna: {id: parseInt(document.getElementById("comuna-perfil").value)}
        };
        //+
        fetch(`http://localhost:8080/usuarios/perfil/${correoUsuario}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(perfilUsuario)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {alert(data.error);
                return;
            }
            alert(data.mensaje);
            // alert("Tus datos fueron guardados correctamente.");
        })
        .catch(error => {console.error(error);});
    });
}
async function cargarComunas() {
    const response = await fetch("http://localhost:8080/comunas/listar");
    const comunas = await response.json();
    const select = document.getElementById("comuna-perfil");
    comunas.forEach(comuna => {
        const option = document.createElement("option");
        option.value = comuna.id;
        option.textContent = comuna.nombre;
        select.appendChild(option);
    });
}
async function cargarPerfil() {
    await cargarComunas();
    const response = await fetch(`http://localhost:8080/usuarios/perfil/${correoUsuario}`);
    const usuario = await response.json();
    document.getElementById("nombre-perfil").value =usuario.nombre || "";
    document.getElementById("rut-perfil").value =usuario.rut || "";
    document.getElementById("correo-perfil").value =usuario.correo || "";
    document.getElementById("telefono-perfil").value =usuario.telefono || "";
    document.getElementById("fecha-nacimiento").value =usuario.nacimiento || "";
    document.getElementById("direccion-perfil").value =usuario.direccion || "";
    document.getElementById("comuna-perfil").value =usuario.comuna?.id || "";
    document.getElementById("grupo-perfil").value =usuario.grupo?.nombre || "";
}
if (correoUsuario) {cargarPerfil();
}