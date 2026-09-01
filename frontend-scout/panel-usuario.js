const usuarioAutenticado =
    sessionStorage.getItem("usuarioAutenticado");
const botonCerrarSesion =
    document.getElementById("cerrar-sesion");
//Proteger el Panel
if(usuarioAutenticado!=="true"){
    window.location.href="login.html";
}
//Cerrar la sesión
if (botonCerrarSesion){
    botonCerrarSesion.addEventListener("click",funtion (evento))
        evento.preventDefault();

        sessionStorage.removeItem("usuarioAutenticado");
        sessionStorage.removeItem("correoUsuario");

        window.location.href= "index.html";
}