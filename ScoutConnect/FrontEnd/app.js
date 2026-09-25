// Modal de información de los grupos scout
const modalGrupo = document.getElementById("modal-grupo");
const botonesGrupo = document.querySelectorAll(".boton-grupo");
const cerrarModalGrupo = document.querySelector(".cerrar-modal");
const tituloModalGrupo = document.getElementById("titulo-modal");
const ubicacionModalGrupo = document.getElementById("ubicacion-modal");
const ramasModalGrupo = document.getElementById("ramas-modal");

if (modalGrupo && botonesGrupo.length > 0) {
    botonesGrupo.forEach(function (boton) {
        boton.addEventListener("click", function (evento) {
            evento.preventDefault();

            tituloModalGrupo.textContent = boton.dataset.nombre;
            ubicacionModalGrupo.textContent =
                `📍 ${boton.dataset.ubicacion}`;
            ramasModalGrupo.textContent =
                `Ramas: ${boton.dataset.ramas}`;

            modalGrupo.style.display = "block";
        });
    });
}

if (cerrarModalGrupo && modalGrupo) {
    cerrarModalGrupo.addEventListener("click", function () {
        modalGrupo.style.display = "none";
    });
}

// Cerrar el modal haciendo clic fuera de su contenido
window.addEventListener("click", function (evento) {
    if (evento.target === modalGrupo) {
        modalGrupo.style.display = "none";
    }
});

// Cerrar el modal presionando Escape
document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape" && modalGrupo) {
        modalGrupo.style.display = "none";
    }
});

// nuevo

const btnSubir = document.getElementById("btnSubir");

window.addEventListener("scroll", () => {

    if (window.scrollY > 300) {
        btnSubir.style.display = "block";
    } else {
        btnSubir.style.display = "none";
    }
});

btnSubir.addEventListener("click", () => {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});
