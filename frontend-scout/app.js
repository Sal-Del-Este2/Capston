const modal = document.getElementById("modal-grupo");

const botonesGrupo = document.querySelectorAll(".boton-grupo");

const cerrarModal = document.querySelector(".cerrar-modal");

const tituloModal = document.getElementById("titulo-modal");

const ubicacionModal = document.getElementById("ubicacion-modal");

const ramasModal = document.getElementById("ramas-modal");


botonesGrupo.forEach(function(boton) {

    boton.addEventListener("click", function(evento) {

        evento.preventDefault();

        tituloModal.textContent = boton.dataset.nombre;

        ubicacionModal.textContent =
            "📍 " + boton.dataset.ubicacion;

        ramasModal.textContent =
            "Ramas: " + boton.dataset.ramas;

        modal.style.display = "block";

    });

});


cerrarModal.addEventListener("click", function() {

    modal.style.display = "none";

});

/*Para que se vea oscuro el fondo del Modal */
window.addEventListener("click", function(evento) {

    if (evento.target === modal) {
        modal.style.display = "none";
    }

});

const modalProducto = document.getElementById("modal-producto");

const botonesProducto = document.querySelectorAll(".boton-producto");

const cerrarProducto = document.querySelector(".cerrar-producto");

const nombreProductoModal =
    document.getElementById("nombre-producto-modal");

const descripcionProductoModal =
    document.getElementById("descripcion-producto-modal");

const precioProductoModal =
    document.getElementById("precio-producto-modal");

    botonesProducto.forEach(function(boton) {

    boton.addEventListener("click", function(evento) {

        evento.preventDefault();

        nombreProductoModal.textContent =
            boton.dataset.nombre;

        descripcionProductoModal.textContent =
            boton.dataset.descripcion;

        precioProductoModal.textContent =
            boton.dataset.precio;

        modalProducto.style.display = "block";

    });

});
cerrarProducto.addEventListener("click", function() {

    modalProducto.style.display = "none";

});
window.addEventListener("click", function(evento) {

    if (evento.target === modalProducto) {
        modalProducto.style.display = "none";
    }

});

/*-------------------Carrito-------------------------------------------*/
const botonAgregarCarrito =
    document.getElementById("agregar-carrito");

const cantidadCarrito =
    document.getElementById("cantidad-carrito");

let carrito = [];

botonAgregarCarrito.addEventListener("click", function() {

    const producto = {
        nombre: nombreProductoModal.textContent,
        precio: precioProductoModal.textContent
    };

    carrito.push(producto);

    cantidadCarrito.textContent = carrito.length;

    console.log(carrito);

});

const abrirCarrito =
    document.getElementById("abrir-carrito");

const modalCarrito =
    document.getElementById("modal-carrito");

const cerrarCarrito =
    document.querySelector(".cerrar-carrito");

const listaCarrito =
    document.getElementById("lista-carrito");

const totalCarrito =
    document.getElementById("total-carrito");

function mostrarCarrito() {

    listaCarrito.innerHTML = "";

    let total = 0;

    carrito.forEach(function(producto) {

        const precioNumero =
            Number(
                producto.precio
                    .replace("$", "")
                    .replace(".", "")
            );

        total += precioNumero;

        const item = document.createElement("p");

        item.textContent =
            producto.nombre + " - " + producto.precio;

        listaCarrito.appendChild(item);

    });

    if (carrito.length === 0) {

        listaCarrito.innerHTML =
            "<p>Tu carrito está vacío.</p>";

    }

    totalCarrito.textContent =
        "$" + total.toLocaleString("es-CL");

}

abrirCarrito.addEventListener("click", function() {

    mostrarCarrito();

    modalCarrito.style.display = "block";

});

cerrarCarrito.addEventListener("click", function() {

    modalCarrito.style.display = "none";

});

window.addEventListener("click", function(evento) {

    if (evento.target === modalCarrito) {

        modalCarrito.style.display = "none";

    }

});

function mostrarCarrito() {

    listaCarrito.innerHTML = "";

    let total = 0;

    carrito.forEach(function(producto, indice) {

        const precioNumero =
            Number(
                producto.precio
                    .replace("$", "")
                    .replace(".", "")
            );

        total += precioNumero;

        const item = document.createElement("div");

        item.classList.add("item-carrito");

        item.innerHTML = `
            <span>
                ${producto.nombre} - ${producto.precio}
            </span>

            <button class="eliminar-producto"
                    data-indice="${indice}">
                Eliminar
            </button>
        `;

        listaCarrito.appendChild(item);

    });

    if (carrito.length === 0) {

        listaCarrito.innerHTML =
            "<p>Tu carrito está vacío.</p>";

    }

    totalCarrito.textContent =
        "$" + total.toLocaleString("es-CL");


    const botonesEliminar =
        document.querySelectorAll(".eliminar-producto");

    botonesEliminar.forEach(function(boton) {

        boton.addEventListener("click", function() {

            const indice = boton.dataset.indice;

            carrito.splice(indice, 1);

            cantidadCarrito.textContent =
                carrito.length;

            mostrarCarrito();

        });

    });

}




