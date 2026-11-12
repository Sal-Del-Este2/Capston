package com.scout.MS_Finanzas.service;

import com.scout.MS_Finanzas.exception.ValidacionNegocioException;
import com.scout.MS_Finanzas.model.Cuota;
import com.scout.MS_Finanzas.model.DetalleCompra;
import com.scout.MS_Finanzas.model.EstadoOrden;
import com.scout.MS_Finanzas.model.OrdenCompra;
import com.scout.MS_Finanzas.model.Pago;
import com.scout.MS_Finanzas.model.Producto;
import com.scout.MS_Finanzas.repository.CuotaRepository;
import com.scout.MS_Finanzas.repository.EstadoOrdenRepository;
import com.scout.MS_Finanzas.repository.OrdenCompraRepository;
import com.scout.MS_Finanzas.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

@Service
@Transactional
public class PagoDestinoService {
    private final OrdenCompraRepository ordenCompraRepository;
    private final CuotaRepository cuotaRepository;
    private final ProductoRepository productoRepository;
    private final EstadoOrdenRepository estadoOrdenRepository;
    public PagoDestinoService(
            OrdenCompraRepository ordenCompraRepository,
            CuotaRepository cuotaRepository,
            ProductoRepository productoRepository,
            EstadoOrdenRepository estadoOrdenRepository
    ) {
        this.ordenCompraRepository = ordenCompraRepository;
        this.cuotaRepository = cuotaRepository;
        this.productoRepository = productoRepository;
        this.estadoOrdenRepository = estadoOrdenRepository;
    }
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void confirmarDestino(Long pagoId) {
        if (pagoId == null) {throw new ValidacionNegocioException("El identificador del pago es obligatorio.");}
        var ordenOptional = ordenCompraRepository.buscarPorPagoIdConBloqueo(pagoId);
        if (ordenOptional.isPresent()) {confirmarOrden(ordenOptional.get()); return;}
        // Se conserva el comportamiento de confirmación de cuotas.
        cuotaRepository.findByPagoId(pagoId).ifPresent(this::confirmarCuota);
    }
    private void confirmarOrden(OrdenCompra orden) {
        // 1. Verificar que exista un pago asociado.
        Pago pago = orden.getPago();
        if (pago == null || pago.getEstado() == null) {
            throw new ValidacionNegocioException("La orden no tiene un pago asociado válido.");
        }
        // 2. Verificar que el pago esté aprobado.
        String estadoPago = pago.getEstado().getNombre();
        if (!"PAGADO".equals(estadoPago)) {
            throw new ValidacionNegocioException("No se puede procesar la orden porque el pago no está PAGADO.");
        }
        // 3. Verificar el estado actual de la orden.
        String estadoActual = orden.getEstado().getNombre();
        Set<String> estadosProcesados = Set.of(
                "EN PROCESO",
                "PENDIENTE DE ENTREGA",
                "ENTREGADO"
        );
        // Evitar descuentos repetidos.
        if (estadosProcesados.contains(estadoActual)) {return;}
        if ("CANCELADO".equals(estadoActual)) {
            throw new ValidacionNegocioException("No se puede confirmar una orden cancelada.");
        }
        if (!"PENDIENTE".equals(estadoActual)) {
            throw new ValidacionNegocioException("La orden no se encuentra en un estado válido para confirmar el pago.");
        }
        // 4. Validar los detalles de la compra.
        if (orden.getDetalles() == null || orden.getDetalles().isEmpty()) {
            throw new ValidacionNegocioException("La orden no contiene productos.");
        }
        // Agrupar cantidades por producto.
        Map<Long, Integer> cantidadesPorProducto = new TreeMap<>();
        for (DetalleCompra detalle : orden.getDetalles()) {
            if (detalle.getProducto() == null || detalle.getProducto().getId() == null) {
                throw new ValidacionNegocioException("Existe un detalle de compra sin producto asociado.");
            }
            if (detalle.getCantidad() == null || detalle.getCantidad() <= 0) {
                throw new ValidacionNegocioException("La cantidad de un producto no es válida.");
            }
            Long productoId = detalle.getProducto().getId();
            cantidadesPorProducto.merge(productoId, detalle.getCantidad(), Math::addExact);
        }
        // 5. Bloquear los productos involucrados.
        var productosBloqueados =
                productoRepository.buscarTodosPorIdConBloqueo(cantidadesPorProducto.keySet());
        Map<Long, Producto> productosPorId = new HashMap<>();
        for (Producto producto : productosBloqueados) {productosPorId.put(producto.getId(), producto);}
        if (productosPorId.size() != cantidadesPorProducto.size()) {
            throw new ValidacionNegocioException("Uno o más productos de la orden ya no existen.");
        }
        // 6. Validar todo el stock antes de descontar.
        for (Map.Entry<Long, Integer> entrada : cantidadesPorProducto.entrySet()) {
            Producto producto = productosPorId.get(entrada.getKey());
            Integer cantidadSolicitada = entrada.getValue();
            if (producto.getStock() == null || producto.getStock() < cantidadSolicitada) {
                throw new ValidacionNegocioException("Stock insuficiente para el producto: " + producto.getTitulo());
            }
        }
        // 7. Descontar el inventario.
        for (Map.Entry<Long, Integer> entrada : cantidadesPorProducto.entrySet()) {
            Producto producto = productosPorId.get(entrada.getKey());
            producto.setStock(producto.getStock() - entrada.getValue());
            producto.setFechaActualizacion(LocalDateTime.now());
        }
        productoRepository.saveAll(productosBloqueados);
        // 8. Cambiar el estado de la orden.
        // Mantener la orden PENDIENTE para que el administrador pueda iniciar su gestión desde el panel administrativo.
        orden.setFechaActualizacion(LocalDateTime.now());
        ordenCompraRepository.save(orden);
    }
    private void confirmarCuota(Cuota cuota) {
        if (!"PAGADA".equals(cuota.getEstado().getNombre())) {throw new ValidacionNegocioException("La cuota no está marcada como pagada.");}
    }
}