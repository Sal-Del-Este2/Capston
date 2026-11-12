package com.scout.MS_Finanzas.service;

import com.scout.MS_Finanzas.dto.DetalleCompraResponse;
import com.scout.MS_Finanzas.dto.OrdenCompraResponse;
import com.scout.MS_Finanzas.exception.ComprobantePdfException;
import com.scout.MS_Finanzas.model.FotoProducto;
import com.scout.MS_Finanzas.repository.FotoProductoRepository;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import javax.imageio.ImageIO;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

@Service
public class ComprobantePdfService {
    private static final Logger logger = LoggerFactory.getLogger(ComprobantePdfService.class);
    private static final Locale LOCALE = Locale.forLanguageTag("es-CL");
    private static final DateTimeFormatter FORMATO_FECHA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm", LOCALE);
    private static final NumberFormat FORMATO_MONEDA = NumberFormat.getCurrencyInstance(LOCALE);
    private static final float MARGEN = 45;
    private static final float ANCHO_IMAGEN = 45;
    private static final float ALTO_IMAGEN = 45;
    static {
        FORMATO_MONEDA.setMinimumFractionDigits(0);
        FORMATO_MONEDA.setMaximumFractionDigits(0);
    }
    private final FotoProductoRepository fotoProductoRepository;
    public ComprobantePdfService(FotoProductoRepository fotoProductoRepository) {
        this.fotoProductoRepository = fotoProductoRepository;
    }
    public byte[] generarComprobante(OrdenCompraResponse orden) {
        if (orden == null) {throw new ComprobantePdfException("No existe información de la orden.", null);}
        try (
            PDDocument documento = new PDDocument();
            ByteArrayOutputStream salida = new ByteArrayOutputStream()
        ) {
            // Fuentes
            ClassPathResource recursoFuente = new ClassPathResource("fonts/DejaVuSans.ttf");
            PDType0Font fuente;
            try (InputStream stream = recursoFuente.getInputStream()) {fuente = PDType0Font.load(documento, stream);}
            // Logo
            PDImageXObject logo = cargarImagenRecurso(documento, "images/ScoutConnet_2026.png");
            // Primera página
            PDPage pagina = new PDPage(PDRectangle.A4);
            documento.addPage(pagina);
            PDPageContentStream contenido = new PDPageContentStream(documento, pagina);
            float y = pagina.getMediaBox().getHeight() - 45;
            // Encabezado
            if (logo != null) {dibujarImagen(contenido, logo, MARGEN, y - 55, 55, 55);}
            escribir(contenido, fuente, 20, MARGEN + 70, y - 20, "Comunidad Scout");
            escribir(contenido, fuente, 11, MARGEN + 70, y - 40, "Comprobante de compra");
            y -= 85;
            linea(contenido, y);
            y -= 25;
            // Información de la orden
            escribir(contenido, fuente, 11, MARGEN, y, "Orden: #" + orden.getId());
            escribir(contenido, fuente, 10, 350, y, "Estado: " + texto(orden.getEstado()));
            y -= 20;
            String fecha = orden.getFecha() != null ? orden.getFecha().format(FORMATO_FECHA) : "No disponible";
            escribir(contenido, fuente, 10, MARGEN, y, "Fecha: " + fecha);
            y -= 30;
            // Productos
            escribir(contenido, fuente, 13, MARGEN, y, "Detalle de productos");
            y -= 25;
            dibujarEncabezadoProductos(contenido, fuente, y);
            y -= 22;
            // Detalles de compra
            if (orden.getDetalles() != null) {
                for (DetalleCompraResponse detalle : orden.getDetalles()) {
                    if (y < 105) {
                        contenido.close();
                        pagina = new PDPage(PDRectangle.A4);
                        documento.addPage(pagina);
                        contenido = new PDPageContentStream(documento, pagina);
                        y = pagina.getMediaBox().getHeight() - 55;
                        escribir(contenido, fuente, 13, MARGEN, y, "Detalle de productos (continuación)");
                        y -= 30;
                        dibujarEncabezadoProductos(contenido, fuente, y);
                        y -= 22;
                    }
                    // Recuperar primera fotografía del producto
                    PDImageXObject imagen = cargarImagenProducto(documento, detalle.getProductoId());
                    if (imagen != null) {dibujarImagen(contenido, imagen, MARGEN, y - 38, ANCHO_IMAGEN, ALTO_IMAGEN);
                    } else {escribir(contenido, fuente, 7, MARGEN, y - 18, "Sin imagen");}
                    escribir(contenido, fuente, 8, 105, y - 10, limitarTexto(detalle.getNombreProducto(), 35));
                    escribir(contenido, fuente, 8, 335, y - 10, String.valueOf(detalle.getCantidad()));
                    escribir(contenido, fuente, 8, 405, y - 10, moneda(detalle.getPrecioUnitario()));
                    escribir(contenido, fuente, 8, 490, y - 10, moneda(detalle.getSubtotal()));
                    y -= 55;
                    linea(contenido, y);
                    y -= 15;
                }
            }
            // Resumen tributario
            if (y < 140) {
                contenido.close();
                pagina = new PDPage(PDRectangle.A4);
                documento.addPage(pagina);
                contenido = new PDPageContentStream(documento, pagina);
                y = pagina.getMediaBox().getHeight() - 55;
            }
            y -= 5;
            escribir(contenido, fuente, 10, 350, y, "Neto total: " + moneda(orden.getNeto()));
            y -= 20;
            escribir(contenido, fuente, 10, 350, y, "IVA (" + orden.getPorcentajeImpuesto() + "%): " + moneda(orden.getMontoImpuesto()));
            y -= 25;
            escribir(contenido, fuente, 14, 350, y, "TOTAL: " + moneda(orden.getTotal()));
            y -= 55;
            escribir(contenido, fuente, 9, MARGEN, y, "ScoutConnect - Comunidad Scout");
            y -= 15;
            escribir(contenido, fuente, 8, MARGEN, y, "Comprobante generado desde el sistema.");
            contenido.close();
            documento.save(salida);
            return salida.toByteArray();
        } catch (IOException e) {logger.error("Error al generar el PDF del comprobante de la orden {}.", orden.getId(), e);
            throw new ComprobantePdfException("No fue posible generar el comprobante PDF.", e);
        }
    }
    // Recuperar la primera fotografía disponible del producto
    private PDImageXObject cargarImagenProducto(PDDocument documento, Long productoId) {
        if (productoId == null) {return null;}
        try {
            List<FotoProducto> fotos = fotoProductoRepository.findByProductoIdOrderByOrdenVisualizacionAsc(productoId);
            if (fotos == null || fotos.isEmpty()) {return null;}
            for (FotoProducto foto : fotos) {
                if (foto.getRutaArchivo() == null) {continue;}
                java.nio.file.Path ruta = java.nio.file.Paths.get(foto.getRutaArchivo());
                if (!java.nio.file.Files.isRegularFile(ruta)) {logger.warn("No existe la fotografía del producto {}: {}", productoId, ruta); continue;}
                BufferedImage imagen = ImageIO.read(ruta.toFile());
                if (imagen == null) {continue;}
                return LosslessFactory.createFromImage(documento, imagen);
            }
        } catch (Exception e) {logger.warn("No fue posible recuperar la fotografía del producto {}.", productoId, e);}
        return null;
    }
    // Recuperar logo desde resources
    private PDImageXObject cargarImagenRecurso(PDDocument documento, String ruta
    ) throws IOException {
        ClassPathResource recurso = new ClassPathResource(ruta);
        if (!recurso.exists()) {logger.warn("No se encontró el logo: {}", ruta); return null;}
        try (InputStream stream = recurso.getInputStream()) {
            BufferedImage imagen = ImageIO.read(stream);
            if (imagen == null) {logger.warn("El logo no tiene un formato de imagen compatible."); return null;}
            return LosslessFactory.createFromImage(documento, imagen);
        }
    }
    // Dibujar imagen manteniendo proporciones
    private void dibujarImagen(PDPageContentStream contenido, PDImageXObject imagen, float x, float y, float anchoMaximo, float altoMaximo
    ) throws IOException {
        float proporcion = Math.min(anchoMaximo / imagen.getWidth(), altoMaximo / imagen.getHeight());
        float ancho = imagen.getWidth() * proporcion;
        float alto = imagen.getHeight() * proporcion;
        float posicionX = x + (anchoMaximo - ancho) / 2;
        float posicionY = y + (altoMaximo - alto) / 2;
        contenido.drawImage(imagen, posicionX, posicionY, ancho, alto);
    }
    private void dibujarEncabezadoProductos(PDPageContentStream contenido, PDType0Font fuente, float y
    ) throws IOException {
        escribir(contenido, fuente, 8, MARGEN, y, "Imagen");
        escribir(contenido, fuente, 8, 105, y, "Producto");
        escribir(contenido, fuente, 8, 335, y, "Cant.");
        escribir(contenido, fuente, 8, 405, y, "Precio");
        escribir(contenido, fuente, 8, 490, y, "Subtotal");
        linea(contenido, y - 8);
    }
    private void escribir(PDPageContentStream contenido, PDType0Font fuente, float tamanio, float x, float y, String texto
    ) throws IOException {
        contenido.beginText();
        contenido.setFont(fuente, tamanio);
        contenido.newLineAtOffset(x, y);
        contenido.showText(texto != null ? texto : "");
        contenido.endText();
    }
    private void linea(PDPageContentStream contenido, float y
    ) throws IOException {
        contenido.moveTo(MARGEN, y);
        contenido.lineTo(550, y);
        contenido.stroke();
    }
    private String moneda(BigDecimal valor) {return FORMATO_MONEDA.format(valor != null ? valor : BigDecimal.ZERO);}
    private String texto(String valor) {return valor != null ? valor : "No disponible";}
    private String limitarTexto(String texto, int maximo) {
        if (texto == null) {return "";}
        if (texto.length() <= maximo) {return texto;}
        return texto.substring(0, maximo - 3) + "...";
    }
}