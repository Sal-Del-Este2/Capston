const usuarioAutenticado = sessionStorage.getItem("usuarioAutenticado");
const botonCerrarSesion = document.getElementById("cerrar-sesion");
//Proteger el Panel
if(usuarioAutenticado!=="true"){
    window.location.href="login.html";
}
const nombreUsuario = sessionStorage.getItem("nombreUsuario"); //+
const tituloBienvenida = document.getElementById("titulo-bienvenida"); //+
if (tituloBienvenida && nombreUsuario) {
    tituloBienvenida.innerHTML = ` ${nombreUsuario} <img src="img/iconos/perfil.svg" width="50px alt="Icono perfil"> `;
}

//Cerrar la sesión
if (botonCerrarSesion){
    botonCerrarSesion.addEventListener("click",funtion (evento))
        evento.preventDefault();
        sessionStorage.removeItem("usuarioAutenticado");
        sessionStorage.removeItem("correoUsuario");
        sessionStorage.removeItem("nombreUsuario"); //+
        sessionStorage.removeItem("rolUsuario"); //+
        window.location.href= "index.html";
}