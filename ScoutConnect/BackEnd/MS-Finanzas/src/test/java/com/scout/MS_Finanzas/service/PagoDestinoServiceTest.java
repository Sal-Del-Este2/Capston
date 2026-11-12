package com.scout.MS_Finanzas.service;

import com.scout.MS_Finanzas.exception.ValidacionNegocioException;
import com.scout.MS_Finanzas.model.*;
import com.scout.MS_Finanzas.repository.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)

public class PagoDestinoServiceTest {
    @Mock
    private OrdenCompraRepository ordenCompraRepository;
    @Mock
    private CuotaRepository cuotaRepository;
    @Mock
    private ProductoRepository productoRepository;
    @Mock
    private EstadoOrdenRepository estadoOrdenRepository;
    @InjectMocks
    private PagoDestinoService pagoDestinoService;
    private OrdenCompra orden;
    private Pago pago;
    private Producto producto;
    private DetalleCompra detalle;
    @BeforeEach
    void prepararDatos() {
        EstadoOrden estadoPendiente = crearEstadoOrden("PENDIENTE");
        EstadoPago estadoPagoPendiente = crearEstadoPago("PENDIENTE");
        pago = new Pago();
        pago.setId(100L);
        pago.setMonto(new BigDecimal("20000"));
        pago.setEstado(estadoPagoPendiente);
        orden = new OrdenCompra();
        orden.setId(10L);
        orden.setPago(pago);
        orden.setEstado(estadoPendiente);
        orden.setFecha(LocalDateTime.now());
        orden.setFechaActualizacion(LocalDateTime.now());
        producto = new Producto();
        producto.setId(1L);
        producto.setTitulo("Polera Scout");
        producto.setStock(10);
        detalle = new DetalleCompra();
        detalle.setProducto(producto);
        detalle.setCantidad(2);
        orden.agregarDetalle(detalle);
    }
    // 1. Pago pendiente: debe rechazar la operación.
    @Test
    void pagoPendienteNoDebeDescontarStock() {
        when(ordenCompraRepository.buscarPorPagoIdConBloqueo(100L)).thenReturn(Optional.of(orden));
        assertThrows(ValidacionNegocioException.class, () -> pagoDestinoService.confirmarDestino(100L));
        assertEquals(10, producto.getStock());
        verify(productoRepository, never()).buscarTodosPorIdConBloqueo(anyCollection());
        verify(ordenCompraRepository, never()).save(any(OrdenCompra.class));
    }
    // 2. Pago rechazado: debe rechazar la operación.
    @Test
    void pagoRechazadoNoDebeDescontarStock() {
        pago.setEstado(crearEstadoPago("RECHAZADO"));
        when(ordenCompraRepository.buscarPorPagoIdConBloqueo(100L)).thenReturn(Optional.of(orden));
        assertThrows(ValidacionNegocioException.class, () -> pagoDestinoService.confirmarDestino(100L));
        assertEquals(10, producto.getStock());
        verify(productoRepository, never()).saveAll(anyList());
    }
    // 3. Pago aprobado: debe descontar stock y actualizar la orden.
    @Test
    void pagoAprobadoDebeDescontarStockYActualizarOrden() {
        pago.setEstado(crearEstadoPago("PAGADO"));
        EstadoOrden estadoEnProceso = crearEstadoOrden("EN PROCESO");
        when(ordenCompraRepository.buscarPorPagoIdConBloqueo(100L)).thenReturn(Optional.of(orden));
        when(productoRepository.buscarTodosPorIdConBloqueo(anyCollection())).thenReturn(List.of(producto));
        when(estadoOrdenRepository.findByNombre("EN PROCESO")).thenReturn(Optional.of(estadoEnProceso));
        pagoDestinoService.confirmarDestino(100L);
        assertEquals(8, producto.getStock());
        assertEquals("EN PROCESO", orden.getEstado().getNombre());
        verify(productoRepository).saveAll(anyList());
        verify(ordenCompraRepository).save(orden);
    }
    // 4. Confirmación repetida: no debe descontar stock nuevamente.
    @Test
    void ordenEnProcesoNoDebeDescontarStockNuevamente() {
        pago.setEstado(crearEstadoPago("PAGADO"));
        orden.setEstado(crearEstadoOrden("EN PROCESO"));
        when(ordenCompraRepository.buscarPorPagoIdConBloqueo(100L)).thenReturn(Optional.of(orden));
        pagoDestinoService.confirmarDestino(100L);
        assertEquals(10, producto.getStock());
        verify(productoRepository, never()).buscarTodosPorIdConBloqueo(anyCollection());
        verify(productoRepository, never()).saveAll(anyList());
        verify(ordenCompraRepository, never()).save(any(OrdenCompra.class));
    }
    // 5. Orden cancelada: debe rechazar la operación.
    @Test
    void ordenCanceladaNoDebeProcesarse() {
        pago.setEstado(crearEstadoPago("PAGADO"));
        orden.setEstado(crearEstadoOrden("CANCELADO"));
        when(ordenCompraRepository.buscarPorPagoIdConBloqueo(100L)).thenReturn(Optional.of(orden));
        assertThrows(ValidacionNegocioException.class, () -> pagoDestinoService.confirmarDestino(100L));
        assertEquals(10, producto.getStock());
        verify(productoRepository, never()).saveAll(anyList());
    }
    // 6. Stock insuficiente: no debe descontar ningún producto.
    @Test
    void stockInsuficienteNoDebeModificarInventario() {
        pago.setEstado(crearEstadoPago("PAGADO"));
        producto.setStock(1);
        when(ordenCompraRepository.buscarPorPagoIdConBloqueo(100L)).thenReturn(Optional.of(orden));
        when(productoRepository.buscarTodosPorIdConBloqueo(anyCollection())).thenReturn(List.of(producto));
        assertThrows(ValidacionNegocioException.class, () -> pagoDestinoService.confirmarDestino(100L));
        assertEquals(1, producto.getStock());
        verify(productoRepository, never()).saveAll(anyList());
        verify(ordenCompraRepository, never()).save(any(OrdenCompra.class));
    }
    private EstadoOrden crearEstadoOrden(String nombre) {
        EstadoOrden estado = new EstadoOrden();
        estado.setNombre(nombre);
        return estado;
    }
    private EstadoPago crearEstadoPago(String nombre) {
        EstadoPago estado = new EstadoPago();
        estado.setNombre(nombre);
        return estado;
    }
}