const formularioPerfil = document.getElementById("form-perfil");
const correoPerfil = document.getElementById("correo-perfil");
const rutPerfil = document.getElementById("rut-perfil");
const correoUsuario = sessionStorage.getItem("correoUsuario");
const API_USUARIOS = "http://localhost:8080/usuarios";
async function leerRespuesta(respuesta) {
    const texto = await respuesta.text();
    if (!texto) {
        return {};
    }
    try {return JSON.parse(texto);
    } catch (error) {return {error: texto};
    }
}
async function cargarComunas() {
    const respuesta = await fetch("http://localhost:8080/comunas/listar");
    if (!respuesta.ok) {throw new Error("No se pudieron cargar las comunas.");}
    const comunas = await respuesta.json();
    const selectComuna = document.getElementById("comuna-perfil");
    selectComuna.innerHTML = "<option value=\"\">Seleccione comuna</option>";
    comunas.forEach(function (comuna) {
        const option = document.createElement("option");
        option.value = comuna.id;
        option.textContent = comuna.nombre;
        selectComuna.appendChild(option);
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
if (rutPerfil) {
    rutPerfil.addEventListener("input", function () {rutPerfil.value = formatearRut(rutPerfil.value);});
}
function validarRut(rut) {
    const rutLimpio = rut.replace(/\./g, "").replace(/-/g, "").toUpperCase();
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
async function cargarDatosPerfil() {
    if (!correoUsuario) {
        return;
    }
    await cargarComunas();
    const respuesta = await fetch(`${API_USUARIOS}/perfil/${encodeURIComponent(correoUsuario)}`);
    if (!respuesta.ok) {throw new Error("No se pudo cargar el perfil.");}
    const usuario = await respuesta.json();
    document.getElementById("nombre-perfil").value = usuario.nombre || "";
    document.getElementById("rut-perfil").value = usuario.rut || "";
    document.getElementById("correo-perfil").value = usuario.correo || "";
    document.getElementById("telefono-perfil").value = usuario.telefono || "";
    document.getElementById("fecha-nacimiento").value = usuario.nacimiento || "";
    document.getElementById("direccion-perfil").value = usuario.direccion || "";
    document.getElementById("comuna-perfil").value = usuario.comuna?.id || "";
    document.getElementById("grupo-perfil").value = usuario.grupo?.nombre || "";
    document.getElementById("nombre-perfil").readOnly = true;
    document.getElementById("rut-perfil").readOnly = true;
    document.getElementById("correo-perfil").readOnly = true;
    document.getElementById("fecha-nacimiento").disabled = true;
    document.getElementById("grupo-perfil").disabled = true;
}
if (formularioPerfil) {
    formularioPerfil.addEventListener("submit", async function (evento) {
        evento.preventDefault();
        const perfilUsuario = {
            telefono: document.getElementById("telefono-perfil").value.trim(),
            direccion: document.getElementById("direccion-perfil").value.trim(),
            comuna: {id: Number(document.getElementById("comuna-perfil").value)}
        };
        try {const respuesta = await fetch(`${API_USUARIOS}/perfil/${
            encodeURIComponent(correoUsuario)}`,{
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(perfilUsuario)
            });
            const data =await leerRespuesta(respuesta);
                if (!respuesta.ok || data.error) {alert(data.error || "No se pudo actualizar el perfil.");
                    return;
                }
                alert(data.mensaje);
                } catch (error) {console.error("Error al guardar perfil:",error);
                alert("No se pudo conectar con el servidor.");
                }
        }
    );
}
async function cargarPdfPerfil() {
    const mensajePdf = document.getElementById("mensaje-pdf");
    const visorPdf = document.getElementById("visor-pdf");
    const enlaceDescargarPdf = document.getElementById("enlace-descargar-pdf");
    if (!mensajePdf || !visorPdf || !enlaceDescargarPdf) {
        return;
    }
    if (!correoUsuario) {mensajePdf.textContent = "No se encontró el correo del usuario.";
        return;
    }
    const urlPdf =`${API_USUARIOS}/perfil/${encodeURIComponent(correoUsuario)}/pdf`;
    try {
        // ++
        console.log("Solicitando PDF:", urlPdf);
        // ++
        const respuesta = await fetch(urlPdf);
        
        // ++
        console.log("Estado de respuesta:",respuesta.status);
        console.log("Tipo de contenido:", respuesta.headers.get("content-type"));
        // ++

        if (respuesta.status === 404) {mensajePdf.textContent = "No tienes un documento PDF cargado.";
            return;
        }
        if (!respuesta.ok) {throw new Error(`Error HTTP ${respuesta.status}`);}
        const tipoContenido = respuesta.headers.get("content-type") || "";
        // if (!tipoContenido || !tipoContenido.includes("application/pdf")) {throw new Error("La respuesta no es un PDF.");}
        
        if (!tipoContenido.toLowerCase().includes("application/pdf")) {throw new Error("El backend no devolvió un archivo PDF.");}
        const archivoPdf = await respuesta.blob();
        if (archivoPdf.size === 0) {throw new Error("El archivo PDF está vacío.");}
        const pdfConTipoCorrecto = new Blob([archivoPdf], {type: "application/pdf"});
        const urlTemporal = URL.createObjectURL(archivoPdf);
        visorPdf.src = urlTemporal;
        visorPdf.hidden = false;
        enlaceDescargarPdf.href = urlTemporal;
        enlaceDescargarPdf.download = "acuerdo.pdf";
        enlaceDescargarPdf.target = "_blank"; // ++
        enlaceDescargarPdf.hidden = false;
        mensajePdf.textContent = "Documento PDF cargado correctamente.";
    } catch (error) {console.error("Error al cargar el PDF:", error); mensajePdf.textContent = "No se pudo cargar el documento PDF.";}
}
async function iniciarPerfil() {
    if (!correoUsuario) {
        return;
    }
    try {
        await cargarDatosPerfil();
        await cargarPdfPerfil();
    } catch (error) {console.error("Error al iniciar el perfil:",error);}
}

const usuarioAutenticado = sessionStorage.getItem("usuarioAutenticado");
const botonCerrarSesion = document.getElementById("cerrar-sesion");
if (usuarioAutenticado !== "true") {window.location.href = "login.html";}
const nombreUsuario = sessionStorage.getItem("nombreUsuario");
const tituloBienvenida = document.getElementById("titulo-bienvenida");
if (tituloBienvenida && nombreUsuario) {
    tituloBienvenida.innerHTML = `${nombreUsuario}<img src="img/iconos/perfil.svg" width="50px" alt="Icono perfil">`;
}
if (botonCerrarSesion) {
    botonCerrarSesion.addEventListener("click", function (evento) {
        evento.preventDefault();
        sessionStorage.removeItem("usuarioAutenticado");
        sessionStorage.removeItem("correoUsuario");
        sessionStorage.removeItem("nombreUsuario");
        sessionStorage.removeItem("rolUsuario");
        window.location.href = "index.html";
    });
}

iniciarPerfil();






// fetch("http://localhost:8080/comunas/listar")
//     .then(response => response.json())
//     .then(comunas => {const selectComuna = document.getElementById("comuna-perfil");
//         comunas.forEach(comuna => {
//             const option = document.createElement("option");
//             option.value = comuna.id;
//             option.textContent = comuna.nombre;
//             selectComuna.appendChild(option);
//         });
//     });
// if (correoPerfil && correoUsuario) {
//     correoPerfil.value = correoUsuario;
// }
// function validarRut(rut) {
//     const rutLimpio = rut.replace(/\./g, "").replace(/-/g, "").toUpperCase();
//     if (rutLimpio.length < 2) {
//         return false;
//     }
//     const cuerpo = rutLimpio.slice(0, -1);
//     const digitoIngresado = rutLimpio.slice(-1);
//     if (!/^\d+$/.test(cuerpo)) {
//         return false;
//     }
//     let suma = 0;
//     let multiplicador = 2;
//     for (let i = cuerpo.length - 1; i >= 0; i--) {
//         suma += Number(cuerpo[i]) * multiplicador;
//         multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
//     }
//     const resultado = 11 - (suma % 11);
//     let digitoCalculado;
//     if (resultado === 11) {
//         digitoCalculado = "0";
//     } else if (resultado === 10) {
//         digitoCalculado = "K";
//     } else {
//         digitoCalculado = String(resultado);
//     }
//     return digitoIngresado === digitoCalculado;
// }
/* CARGAR DATOS DESDE BACKEND */
// async function cargarPerfil() {
//     await cargarComunas();
//     const response = await fetch(`http://localhost:8080/usuarios/perfil/${correoUsuario}`);
//     const usuario = await response.json();
//     document.getElementById("nombre-perfil").value =usuario.nombre || "";
//     document.getElementById("rut-perfil").value =usuario.rut || "";
//     document.getElementById("correo-perfil").value =usuario.correo || "";
//     document.getElementById("telefono-perfil").value =usuario.telefono || "";
//     document.getElementById("fecha-nacimiento").value =usuario.nacimiento || "";
//     document.getElementById("direccion-perfil").value =usuario.direccion || "";
//     document.getElementById("comuna-perfil").value =usuario.comuna?.id || "";
//     document.getElementById("grupo-perfil").value =usuario.grupo?.nombre || "";
// }
// if (correoUsuario) {cargarPerfil();
// }

// if (correoUsuario) {
//     fetch(`http://localhost:8080/usuarios/perfil/${correoUsuario}`)
//         .then(response => response.json())
//         .then(usuario => {
//             document.getElementById("nombre-perfil").value = usuario.nombre || "";
//             document.getElementById("rut-perfil").value = usuario.rut || "";
//             document.getElementById("correo-perfil").value = usuario.correo || "";
//             document.getElementById("telefono-perfil").value = usuario.telefono || "";
//             document.getElementById("fecha-nacimiento").value = usuario.nacimiento || "";
//             document.getElementById("direccion-perfil").value = usuario.direccion || "";
//             document.getElementById("comuna-perfil").value = usuario.comuna?.id || "";
//             document.getElementById("grupo-perfil").value = usuario.grupo?.nombre || "";
//             // Bloquear campos
//             document.getElementById("nombre-perfil").readOnly = true;
//             document.getElementById("rut-perfil").readOnly = true;
//             document.getElementById("correo-perfil").readOnly = true;
//             document.getElementById("fecha-nacimiento").disabled = true;
//             document.getElementById("grupo-perfil").disabled = true;
//         })
//         .catch(error => {console.error("Error cargando perfil:", error);});
// }


// cargarPdfPerfil();