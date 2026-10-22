(function () {
    const alertOriginal = window.alert;
    function crearModal() {
        const overlay = document.createElement("div");
        overlay.className = "modal-mensaje-overlay";
        overlay.id = "modal-mensaje-overlay";
        overlay.innerHTML = `
            <div class="modal-mensaje" role="alertdialog" aria-modal="true" aria-labelledby="modal-mensaje-titulo">
                <h2 class="modal-mensaje-titulo" id="modal-mensaje-titulo">Mensaje</h2>
                <p class="modal-mensaje-texto" id="modal-mensaje-texto"></p>
                <button type="button" class="modal-mensaje-boton" id="modal-mensaje-boton">Aceptar</button>
            </div>
        `;
        document.body.appendChild(overlay);
        const boton = overlay.querySelector("#modal-mensaje-boton");
        function cerrar() {overlay.classList.remove("visible");}
        boton.addEventListener("click", cerrar);
        overlay.addEventListener("click", function (evento) {
            if (evento.target === overlay) {cerrar();}
        });
        document.addEventListener("keydown", function (evento) {
            if (evento.key === "Escape" && overlay.classList.contains("visible")) {cerrar();}
        });
        return overlay;
    }
    window.alert = function (mensaje) {
        let overlay = document.getElementById("modal-mensaje-overlay");
        if (!overlay) {overlay = crearModal();}
        const titulo = overlay.querySelector("#modal-mensaje-titulo");
        const texto = overlay.querySelector("#modal-mensaje-texto");
        const mensajeTexto = String(mensaje ?? "");

        if (
            mensajeTexto.toLowerCase().includes("error") ||
            mensajeTexto.toLowerCase().includes("no se pudo") ||
            mensajeTexto.toLowerCase().includes("incorrecta") ||
            mensajeTexto.toLowerCase().includes("inválid")
        ) {
            titulo.textContent = "Atención";
        } else {titulo.textContent = "Mensaje";}
        texto.textContent = mensajeTexto;
        overlay.classList.add("visible");
        overlay.querySelector("#modal-mensaje-boton").focus();
    };
    window.mostrarMensaje = window.alert;
})();