/*-------------------Modal del producto-------------------*/
const modalProducto = document.getElementById("modal-producto");
const botonesProducto = document.querySelectorAll(".boton-producto");
const botonesAgregarDirecto = document.querySelectorAll(".boton-agregar");
const cerrarProducto = document.querySelector(".cerrar-producto");
const nombreProductoModal = document.getElementById("nombre-producto-modal");
const descripcionProductoModal = document.getElementById("descripcion-producto-modal");
const precioProductoModal = document.getElementById("precio-producto-modal");
botonesProducto.forEach(function (boton) {
    boton.addEventListener("click", function (evento) {
        evento.preventDefault();
        nombreProductoModal.textContent = boton.dataset.nombre;
        descripcionProductoModal.textContent = boton.dataset.descripcion;
        precioProductoModal.textContent = boton.dataset.precio;
        modalProducto.style.display = "block";
    });
});
botonesAgregarDirecto.forEach(function (boton) {
    boton.addEventListener("click", function () {
        const producto = {nombre: boton.dataset.nombre, precio: boton.dataset.precio};
        carrito.push(producto);
        guardarCarrito();
        cantidadCarrito.textContent = carrito.length;
        alert("Producto agregado al carrito");
    });
});
cerrarProducto.addEventListener("click", function () {modalProducto.style.display = "none";});
window.addEventListener("click", function (evento) {
    if (evento.target === modalProducto) {modalProducto.style.display = "none";}
});
/*-------------------Agregar al carrito-------------------*/
const botonAgregarCarrito = document.getElementById("agregar-carrito");
const cantidadCarrito = document.getElementById("cantidad-carrito");
let carrito = JSON.parse(localStorage.getItem("carritoScout")) || [];
cantidadCarrito.textContent = carrito.length;
function guardarCarrito() {
    localStorage.setItem("carritoScout", JSON.stringify(carrito));
}
botonAgregarCarrito.addEventListener("click", function () {
    const producto = {
        nombre: nombreProductoModal.textContent,
        precio: precioProductoModal.textContent
    };
    carrito.push(producto);
    guardarCarrito();
    cantidadCarrito.textContent = carrito.length;
    modalProducto.style.display = "none";
    alert("Producto agregado al carrito");
});
/*-------------------Modal del carrito-------------------*/
const abrirCarrito = document.getElementById("abrir-carrito");
const modalCarrito = document.getElementById("modal-carrito");
const cerrarCarrito = document.querySelector(".cerrar-carrito");
const listaCarrito = document.getElementById("lista-carrito");
const totalCarrito = document.getElementById("total-carrito");
const botonVaciarCarrito = document.getElementById("vaciar-carrito");
const botonVaciarCarritoNavbar = document.getElementById("vaciar-carrito-navbar");
abrirCarrito.addEventListener("click", function () {
    mostrarCarrito();
    modalCarrito.style.display = "block";
});
cerrarCarrito.addEventListener("click", function () {modalCarrito.style.display = "none";});
window.addEventListener("click", function (evento) {
    if (evento.target === modalCarrito) {modalCarrito.style.display = "none";}
});
/*-------------------Vaciar carrito-------------------*/
botonVaciarCarrito.addEventListener("click", function () {
    if (carrito.length === 0) {alert("El carrito ya está vacío"); return;}
    const confirmar = confirm("¿Deseas eliminar todos los productos?");
    if (confirmar) {
        carrito = [];
        guardarCarrito();
        cantidadCarrito.textContent = 0;
        mostrarCarrito();
    }
});
botonVaciarCarritoNavbar.addEventListener("click", function () {
    if (carrito.length === 0) {
        alert("El carrito ya está vacío");
        return;
    }
    const confirmar = confirm("¿Deseas vaciar todo el carrito?");
    if (confirmar) {
        carrito = [];
        guardarCarrito();
        cantidadCarrito.textContent = 0;
        totalCarrito.textContent = "$0";
        alert("Carrito vaciado");
    }
});
/*-------------------Mostrar carrito-------------------*/
function mostrarCarrito() {
    listaCarrito.innerHTML = "";
    let total = 0;
    carrito.forEach(function (producto, indice) {
        const precioNumero =
            Number(producto.precio
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
            <button
                class="eliminar-producto"
                data-indice="${indice}"
            >
                Eliminar
            </button>
        `;
        listaCarrito.appendChild(item);
    });
    if (carrito.length === 0) {listaCarrito.innerHTML = "<p>Tu carrito está vacío.</p>";}
    totalCarrito.textContent = "$" + total.toLocaleString("es-CL");
    const botonesEliminar = document.querySelectorAll(".eliminar-producto");
    botonesEliminar.forEach(function (boton) {
        boton.addEventListener("click", function () {
            const indice = Number(boton.dataset.indice);
            carrito.splice(indice, 1);
            guardarCarrito();
            cantidadCarrito.textContent = carrito.length;
            mostrarCarrito();
        });
    });
}
/*-------------------Confirmar pago-------------------*/
const botonConfirmarPago = document.getElementById("confirmar-pago");
botonConfirmarPago.addEventListener("click", function () {
    if (carrito.length === 0) {
        alert("Tu carrito está vacío. Agrega productos antes de pagar.");
        return;
    }
    let total = 0;
    carrito.forEach(producto => {
        const precioNumero = Number(producto.precio.replace("$", "").replace(".", ""));
        total += precioNumero;
    });
    const pago = {
        descripcion: "Compra en tienda scout",
        monto: total,
        usuarioId: 1
    };
    fetch("http://localhost:8082/finanzas/pagar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pago)
    })
        .then(res => res.json())
        .then(data => {
            console.log("Respuesta backend:", data);
            if (data.urlPago) {
                window.location.href = data.urlPago; // Redirige al checkout
            } else {
                alert(" No se recibió la URL de pago. Revisa el backend.");
            }
        })
        .catch(err => console.error("Error al iniciar pago:", err));
});
function iniciarPago() {
    const pago = {
        descripcion: "Uniforme Scout",
        monto: 5000,
        usuarioId: 1
    };
    fetch("http://localhost:8082/finanzas/pagar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pago)
    })
        .then(res => res.json())
        .then(data => {
            // Redirige al checkout sandbox de Mercado Pago
            window.location.href = data.urlPago;
        })
        .catch(err => console.error("Error al iniciar pago:", err));
}
