const totalUsuariosAdmin =
    document.getElementById("total-usuarios-admin");

const cuotasPendientesAdmin =
    document.getElementById("cuotas-pendientes-admin");

const actividadesAdmin =
    document.getElementById("actividades-admin");

const mensajesAdmin =
    document.getElementById("mensajes-admin");

const botonCerrarSesionAdmin =
    document.getElementById("cerrar-sesion-admin");


function cargarResumenAdministrativo() {
    const usuariosRegistrados =
        JSON.parse(
            localStorage.getItem("usuariosRegistrados")
        ) || [];

    /*
     * Mientras no exista el microservicio,
     * utilizamos datos simulados.
     */

    const resumenAdministrativo = {
        totalUsuarios:
            usuariosRegistrados.length,

        cuotasPendientes: 18,
        actividadesProximas: 4,
        mensajesNoLeidos: 6
    };

    totalUsuariosAdmin.textContent =
        resumenAdministrativo.totalUsuarios;

    cuotasPendientesAdmin.textContent =
        resumenAdministrativo.cuotasPendientes;

    actividadesAdmin.textContent =
        resumenAdministrativo.actividadesProximas;

    mensajesAdmin.textContent =
        resumenAdministrativo.mensajesNoLeidos;
}


if (botonCerrarSesionAdmin) {
    botonCerrarSesionAdmin.addEventListener(
        "click",
        function (evento) {
            evento.preventDefault();

            const confirmarSalida = confirm(
                "¿Deseas cerrar la sesión administrativa?"
            );

            if (!confirmarSalida) {
                return;
            }

            sessionStorage.removeItem(
                "usuarioAutenticado"
            );

            sessionStorage.removeItem(
                "correoUsuario"
            );

            sessionStorage.removeItem(
                "rolUsuario"
            );

            window.location.href = "index.html";
        }
    );
}


cargarResumenAdministrativo();