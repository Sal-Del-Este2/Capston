document.addEventListener("DOMContentLoaded", () => {
    const botonesGrupo = document.querySelectorAll(".boton-grupo");
    const modalMapa = document.getElementById("modal-mapa-grupo");
    const tituloMapa = document.getElementById("titulo-mapa-grupo");
    const iframeMapa = document.getElementById("iframe-mapa-grupo");
    const direccionMapa = document.getElementById("direccion-mapa-grupo");
    const enlaceGoogleMaps = document.getElementById("enlace-google-maps");
    const botonCerrarMapa = document.getElementById("cerrar-mapa-grupo");
    function abrirMapaGrupo(nombre, ubicacion) {
        const ubicacionCodificada = encodeURIComponent(ubicacion);
        tituloMapa.textContent = nombre;
        direccionMapa.textContent = ubicacion;
        iframeMapa.src = `https://maps.google.com/maps?q=${ubicacionCodificada}&output=embed`;
        enlaceGoogleMaps.href = `https://www.google.com/maps/search/?api=1&query=${ubicacionCodificada}`;
        modalMapa.hidden = false;
        document.body.classList.add("modal-mapa-abierto");
        botonCerrarMapa.focus();
    }
    function cerrarMapaGrupo() {
        modalMapa.hidden = true;
        iframeMapa.src = "";
        document.body.classList.remove("modal-mapa-abierto");
    }
    botonesGrupo.forEach(boton => {
        boton.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            const nombre = boton.dataset.nombre;
            const ubicacion = boton.dataset.ubicacion;
            if (!nombre || !ubicacion) {console.error("Faltan datos del grupo o su ubicación.");return;}
            abrirMapaGrupo(nombre, ubicacion);
        });
    });
    botonCerrarMapa.addEventListener("click", cerrarMapaGrupo);
    modalMapa.addEventListener("click", event => {if (event.target === modalMapa) {cerrarMapaGrupo();}});
    document.addEventListener("keydown", event => {if (event.key === "Escape" && !modalMapa.hidden) {cerrarMapaGrupo();}});
});