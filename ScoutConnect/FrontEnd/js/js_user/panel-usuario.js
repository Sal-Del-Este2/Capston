const usuarioAutenticado = sessionStorage.getItem("usuarioAutenticado");
const botonCerrarSesion = document.getElementById("cerrar-sesion");
//Proteger el Panel
if (usuarioAutenticado !== "true") {window.location.href = "../login.html";}
const nombreUsuario = sessionStorage.getItem("nombreUsuario");
const tituloBienvenida = document.getElementById("titulo-bienvenida");
// Mostrar nombre del usuario
if (tituloBienvenida && nombreUsuario) {tituloBienvenida.innerHTML = `
        <img src="../img/iconos/perfil.svg" width="30px" alt="Icono perfil"> ${nombreUsuario} `;
}
// Boton para subir
const btnSubir = document.getElementById("btnSubir");
window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {btnSubir.style.display = "block";
    } else {btnSubir.style.display = "none";}
});
btnSubir.addEventListener("click", () => {window.scrollTo({top: 0, behavior: "smooth"});});
//Cerrar la sesión
if (botonCerrarSesion) {botonCerrarSesion.addEventListener("click", function (evento) {
    evento.preventDefault();
    sessionStorage.removeItem("usuarioAutenticado");
    sessionStorage.removeItem("correoUsuario");
    sessionStorage.removeItem("nombreUsuario");
    sessionStorage.removeItem("rolUsuario");
    window.location.href = "../index.html";
    });
}