package com.scout.MS_Finanzas.service;

import com.scout.MS_Finanzas.dto.*;
import com.scout.MS_Finanzas.exception.RecursoNoEncontradoException;
import com.scout.MS_Finanzas.exception.ValidacionNegocioException;
import com.scout.MS_Finanzas.model.*;
import com.scout.MS_Finanzas.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class OrdenCompraService {
    private final OrdenCompraRepository ordenRepository;
    private final ProductoRepository productoRepository;
    private final EstadoOrdenRepository estadoOrdenRepository;
    private final EstadoPagoRepository estadoPagoRepository;
    private final ImpuestoRepository impuestoRepository;
    private final PagoRepository pagoRepository;
    private final WebpayService webpayService;
    public OrdenCompraService(
        OrdenCompraRepository ordenRepository,
        ProductoRepository productoRepository,
        EstadoOrdenRepository estadoOrdenRepository,
        EstadoPagoRepository estadoPagoRepository,
        ImpuestoRepository impuestoRepository,
        PagoRepository pagoRepository,
        WebpayService webpayService
    ) {
        this.ordenRepository = ordenRepository;
        this.productoRepository = productoRepository;
        this.estadoOrdenRepository = estadoOrdenRepository;
        this.estadoPagoRepository = estadoPagoRepository;
        this.impuestoRepository = impuestoRepository;
        this.pagoRepository = pagoRepository;
        this.webpayService = webpayService;
    }
    // Crear orden e iniciar pago con Webpay
    public WebpayInicioResponse crear(Long usuarioId, CrearOrdenRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {throw new ValidacionNegocioException("Debe seleccionar al menos un producto.");}
        Impuesto iva = impuestoRepository
            .findFirstByEstadoNombreOrderByVigenteDesdeDesc("ACTIVO")
            .orElseThrow(() -> new RecursoNoEncontradoException("No existe un impuesto activo."));
        EstadoOrden estadoPendiente = estadoOrdenRepository
            .findByNombre("PENDIENTE")
            .orElseThrow(() -> new RecursoNoEncontradoException("Estado PENDIENTE no encontrado."));
        EstadoPago estadoPagoPendiente = estadoPagoRepository
            .findByNombre("PENDIENTE")
            .orElseThrow(() -> new RecursoNoEncontradoException("Estado PENDIENTE no encontrado."));
        OrdenCompra orden = new OrdenCompra();
        orden.setUsuarioId(usuarioId);
        orden.setEstado(estadoPendiente);
        orden.setImpuesto(iva);
        orden.setFecha(LocalDateTime.now());
        orden.setFechaActualizacion(LocalDateTime.now());
        BigDecimal neto = BigDecimal.ZERO;
        BigDecimal impuestoTotal = BigDecimal.ZERO;
        BigDecimal total = BigDecimal.ZERO;
        BigDecimal cien = BigDecimal.valueOf(100);
        BigDecimal divisor = cien.add(iva.getPorcentaje());
        for (ItemOrdenRequest item : request.getItems()) {
            if (item == null || item.getProductoId() == null) {throw new ValidacionNegocioException("Debe indicar el ID del producto.");}
            if (item.getCantidad() == null || item.getCantidad() <= 0) {throw new ValidacionNegocioException("La cantidad debe ser mayor a 0.");}
            Producto producto = productoRepository
                .findById(item.getProductoId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado."));
            if (!"ACTIVO".equals(producto.getEstado().getNombre())) {throw new ValidacionNegocioException("El producto no está disponible.");}
            if (producto.getStock() < item.getCantidad()) {
                throw new ValidacionNegocioException("Stock insuficiente para el producto: " + producto.getTitulo());
            }
            // El precio del producto ya incluye IVA.
            BigDecimal subtotal = producto.getPrecio().multiply(BigDecimal.valueOf(item.getCantidad()));
            // Separar el neto desde el precio final.
            BigDecimal netoDetalle = subtotal.multiply(cien).divide(divisor, 0, RoundingMode.HALF_UP);
            // Calcular IVA como diferencia para mantener el total exacto.
            BigDecimal impuestoDetalle = subtotal.subtract(netoDetalle);
            DetalleCompra detalle = new DetalleCompra();
            detalle.setProducto(producto);
            detalle.setNombreProducto(producto.getTitulo());
            detalle.setCantidad(item.getCantidad());
            detalle.setPrecioUnitario(producto.getPrecio());
            detalle.setSubtotal(subtotal);
            detalle.setNeto(netoDetalle);
            detalle.setMontoImpuesto(impuestoDetalle);
            detalle.setImpuesto(iva);
            orden.agregarDetalle(detalle);
            neto = neto.add(netoDetalle);
            impuestoTotal = impuestoTotal.add(impuestoDetalle);
            total = total.add(subtotal);
        }
        orden.setNeto(neto);
        orden.setMontoImpuesto(impuestoTotal);
        orden.setTotal(total);
        // Verificar que neto + IVA coincida con el total cobrado.
        if (neto.add(impuestoTotal).compareTo(total) != 0) {
            throw new IllegalStateException("Error en el cálculo del neto, IVA y total de la orden.");
        }
        Pago pago = new Pago();
        pago.setUsuarioId(usuarioId);
        pago.setMonto(orden.getTotal());
        pago.setDescripcion("Compra de productos MS-Finanzas");
        pago.setEstado(estadoPagoPendiente);
        pago.setFechaCreacion(LocalDateTime.now());
        pago.setFechaActualizacion(LocalDateTime.now());
        pago = pagoRepository.save(pago);
        orden.setPago(pago);
        orden = ordenRepository.save(orden);
        return webpayService.iniciarPago(pago, "ORDEN-" + orden.getId(), "MS-FINANZAS-" + usuarioId);
    }
    // Listar todas las órdenes para administración
    @Transactional(readOnly = true)
    public Page<OrdenCompraResponse> listarAdministrador(Pageable pageable) {
        return ordenRepository.findAll(pageable).map(this::convertir);
    }
    // Listar órdenes del usuario autenticado
    @Transactional(readOnly = true)
    public Page<OrdenCompraResponse> listarPorUsuario(Long usuarioId, Pageable pageable) {
        return ordenRepository.findByUsuarioId(usuarioId, pageable).map(this::convertir);
    }
    // Consultar una orden específica del usuario autenticado
    @Transactional(readOnly = true)
    public OrdenCompraResponse obtenerPorUsuario(Long ordenId, Long usuarioId) {
        OrdenCompra orden = ordenRepository.findById(ordenId)
            .orElseThrow(() -> new RecursoNoEncontradoException("Orden no encontrada."));
        if (!orden.getUsuarioId().equals(usuarioId)) {throw new RecursoNoEncontradoException("Orden no encontrada.");}
        return convertir(orden);
    }
    // Cambiar estado de una orden desde administración
    public OrdenCompraResponse cambiarEstado(Long ordenId, String estadoNombre) {
        OrdenCompra orden = ordenRepository.findById(ordenId)
            .orElseThrow(() -> new RecursoNoEncontradoException("Orden no encontrada."));
        EstadoOrden estado = estadoOrdenRepository
            .findByNombre(estadoNombre.trim().toUpperCase())
            .orElseThrow(() -> new ValidacionNegocioException("Estado no válido."));
        orden.setEstado(estado);
        orden.setFechaActualizacion(LocalDateTime.now());
        return convertir(orden);
    }
    // Convertir entidad a DTO
    private OrdenCompraResponse convertir(OrdenCompra orden) {
        OrdenCompraResponse response = new OrdenCompraResponse();
        response.setId(orden.getId());
        response.setUsuarioId(orden.getUsuarioId());
        response.setNeto(orden.getNeto());
        response.setMontoImpuesto(orden.getMontoImpuesto());
        response.setPorcentajeImpuesto(orden.getImpuesto().getPorcentaje());
        response.setTotal(orden.getTotal());
        response.setEstado(orden.getEstado().getNombre());
        response.setEstadoPago(orden.getPago() != null && orden.getPago().getEstado() != null ? orden.getPago().getEstado().getNombre() : "PENDIENTE");
        response.setFecha(orden.getFecha());
        List<DetalleCompraResponse> detalles = new ArrayList<>();
        for (DetalleCompra detalle : orden.getDetalles()) {
            DetalleCompraResponse detalleResponse = new DetalleCompraResponse();
            detalleResponse.setId(detalle.getId());
            detalleResponse.setProductoId(detalle.getProducto().getId());
            detalleResponse.setNombreProducto(detalle.getNombreProducto());
            detalleResponse.setCantidad(detalle.getCantidad());
            detalleResponse.setPrecioUnitario(detalle.getPrecioUnitario());
            detalleResponse.setSubtotal(detalle.getSubtotal());
            detalleResponse.setMontoImpuesto(detalle.getMontoImpuesto());
            detalles.add(detalleResponse);
        }
        response.setDetalles(detalles);
        return response;
    }
}