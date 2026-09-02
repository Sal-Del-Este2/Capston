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

function actualizarFotosPendientesPanel() {
    const contadorResumen =
        document.getElementById(
            "fotos-pendientes-panel-admin"
        );

    const contadorTarjeta =
        document.getElementById(
            "fotos-pendientes-tarjeta-admin"
        );

    let fotos = [];

    try {
        const datosGuardados =
            JSON.parse(
                localStorage.getItem(
                    "fotosReclutasScout"
                )
            );

        fotos = Array.isArray(datosGuardados)
            ? datosGuardados
            : [];
    } catch (error) {
        console.error(
            "No fue posible cargar las fotografías:",
            error
        );
    }

    const cantidadPendientes =
        fotos.filter(function (foto) {
            return foto.estado === "PENDIENTE";
        }).length;

    if (contadorResumen) {
        contadorResumen.textContent =
            cantidadPendientes;
    }

    if (contadorTarjeta) {
        contadorTarjeta.textContent =
            cantidadPendientes;
    }
}

actualizarFotosPendientesPanel();