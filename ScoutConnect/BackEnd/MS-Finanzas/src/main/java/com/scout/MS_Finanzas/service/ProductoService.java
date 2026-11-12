package com.scout.MS_Finanzas.service;

import com.scout.MS_Finanzas.dto.FotoProductoResponse;
import com.scout.MS_Finanzas.dto.ProductoRequest;
import com.scout.MS_Finanzas.dto.ProductoResponse;
import com.scout.MS_Finanzas.exception.RecursoNoEncontradoException;
import com.scout.MS_Finanzas.exception.ValidacionNegocioException;
import com.scout.MS_Finanzas.model.*;
import com.scout.MS_Finanzas.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ProductoService {
    private static final int MAXIMO_FOTOS = 3;
    private static final long MAXIMO_BYTES = 10L * 1024L * 1024L;
    private final ProductoRepository productoRepository;
    private final FotoProductoRepository fotoProductoRepository;
    private final GrupoRepository grupoRepository;
    private final RamaRepository ramaRepository;
    private final EstadoProductoRepository estadoProductoRepository;
    private final ImpuestoRepository impuestoRepository;
    private final Path directorioBase;
    public ProductoService(
        ProductoRepository productoRepository,
        FotoProductoRepository fotoProductoRepository,
        GrupoRepository grupoRepository,
        RamaRepository ramaRepository,
        EstadoProductoRepository estadoProductoRepository,
        ImpuestoRepository impuestoRepository,
        @Value("${app.storage.productos:uploads/productos}") String rutaBase
    ) {
        this.productoRepository = productoRepository;
        this.fotoProductoRepository = fotoProductoRepository;
        this.grupoRepository = grupoRepository;
        this.ramaRepository = ramaRepository;
        this.estadoProductoRepository = estadoProductoRepository;
        this.impuestoRepository = impuestoRepository;
        this.directorioBase = Paths.get(rutaBase).toAbsolutePath().normalize();
    }
    @Transactional(readOnly = true)
    public Page<ProductoResponse> listar(Pageable pageable) {return productoRepository.findAll(pageable).map(this::convertir);}
    @Transactional(readOnly = true)
    public Page<ProductoResponse> listarActivos(Pageable pageable) {return productoRepository.findByEstadoNombre("ACTIVO", pageable).map(this::convertir);}
    @Transactional(readOnly = true)
    public ProductoResponse obtener(Long id) {return convertir(buscar(id));}
    public ProductoResponse crear(ProductoRequest request, List<MultipartFile> archivos) {
        validarFotos(archivos);
        if (productoRepository.findByTituloIgnoreCase(request.getTitulo().trim()).isPresent()) {
            throw new ValidacionNegocioException("Ya existe un producto con ese título.");
        }
        Producto producto = new Producto();
        aplicarDatos(producto, request);
        producto.setEstado(estadoProductoRepository.findByNombre("ACTIVO").orElseThrow(() -> new RecursoNoEncontradoException("Estado ACTIVO no encontrado.")));
        producto.setFechaCreacion(LocalDateTime.now());
        producto.setFechaActualizacion(LocalDateTime.now());
        Producto guardado = productoRepository.save(producto);
        guardarFotos(guardado, archivos);
        return convertir(guardado);
    }
    public ProductoResponse actualizar(Long id, ProductoRequest request) {
        Producto producto = buscar(id);
        aplicarDatos(producto, request);
        producto.setFechaActualizacion(LocalDateTime.now());
        return convertir(producto);
    }
    public ProductoResponse cambiarEstado(Long id, String estado) {
        Producto producto = buscar(id);
        EstadoProducto estadoProducto = estadoProductoRepository.findByNombre(estado.trim().toUpperCase()).orElseThrow(() -> new ValidacionNegocioException("Estado no válido."));
        producto.setEstado(estadoProducto);
        producto.setFechaActualizacion(LocalDateTime.now());
        return convertir(producto);
    }
    private void aplicarDatos(Producto producto, ProductoRequest request) {
        Grupo grupo = grupoRepository.findById(request.getGrupoId()).orElseThrow(() -> new RecursoNoEncontradoException("Grupo no encontrado."));
        Rama rama = ramaRepository.findById(request.getRamaId()).orElseThrow(() -> new RecursoNoEncontradoException("Rama no encontrada."));
        producto.setTitulo(request.getTitulo().trim());
        producto.setDetalle(request.getDetalle().trim());
        producto.setPrecio(request.getPrecio());
        producto.setStock(request.getStock());
        producto.setGrupo(grupo);
        producto.setRama(rama);
    }
    private void validarFotos(List<MultipartFile> archivos) {
        if (archivos == null || archivos.isEmpty()) {throw new ValidacionNegocioException("Debe subir al menos una imagen.");}
        if (archivos.size() > MAXIMO_FOTOS) {throw new ValidacionNegocioException("El producto puede tener máximo 3 imágenes.");}
        for (MultipartFile archivo : archivos) {
            if (archivo == null || archivo.isEmpty()) {throw new ValidacionNegocioException("Una de las imágenes está vacía.");}
            if (archivo.getSize() > MAXIMO_BYTES) {throw new ValidacionNegocioException("Cada imagen puede pesar hasta 10 MB.");}
            String nombre = archivo.getOriginalFilename();
            String extension = obtenerExtension(nombre == null ? "" : nombre).toLowerCase();
            boolean extensionValida = extension.equals("jpg") || extension.equals("jpeg") || extension.equals("png");
            String contentType = archivo.getContentType();
            boolean contentTypeValido = "image/jpeg".equals(contentType) || "image/jpg".equals(contentType) || "image/png".equals(contentType);
            if (!extensionValida || !contentTypeValido) {
                throw new ValidacionNegocioException("Solo se permiten imágenes JPG y PNG.");
            }
        }
    }
    private void guardarFotos(Producto producto, List<MultipartFile> archivos) {
        try {
            Path carpeta = directorioBase.resolve(String.valueOf(producto.getId()));
            Files.createDirectories(carpeta);
            List<FotoProducto> fotosExistentes = fotoProductoRepository.findByProductoIdOrderByOrdenVisualizacionAsc(producto.getId());
            short orden = (short) (fotosExistentes.stream()
                .mapToInt(FotoProducto::getOrdenVisualizacion)
                .max()
                .orElse(0) + 1);
            for (MultipartFile archivo : archivos) {
                String nombreOriginal = Paths.get(archivo.getOriginalFilename()).getFileName().toString();
                String extension = obtenerExtension(nombreOriginal);
                String nombreGuardado = UUID.randomUUID() + "." + extension;
                String tipoContenido = archivo.getContentType();
                if ("image/jpg".equalsIgnoreCase(tipoContenido)) {tipoContenido = "image/jpeg";}
                Path destino = carpeta.resolve(nombreGuardado).normalize();
                archivo.transferTo(destino);
                FotoProducto foto = new FotoProducto();
                foto.setProducto(producto);
                foto.setNombreArchivo(nombreOriginal);
                foto.setRutaArchivo(destino.toString());
                foto.setTipoContenido(tipoContenido);
                foto.setTamanioBytes(archivo.getSize());
                foto.setOrdenVisualizacion(orden++);
                foto.setFechaCarga(LocalDateTime.now());
                producto.agregarFoto(foto);
            }
            productoRepository.save(producto);
        } catch (IOException e) {throw new ValidacionNegocioException("No fue posible guardar las imágenes.");}
    }
    private String obtenerExtension(String nombre) {
        if (nombre == null || nombre.isBlank()) {throw new ValidacionNegocioException("El archivo no tiene nombre válido.");}
        int posicion = nombre.lastIndexOf(".");
        if (posicion < 0 || posicion == nombre.length() - 1) {throw new ValidacionNegocioException("El archivo no tiene extensión válida.");}
        return nombre.substring(posicion + 1);
    }
    private Producto buscar(Long id) {return productoRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado."));}
    private ProductoResponse convertir(Producto producto) {
        ProductoResponse response = new ProductoResponse();
        response.setId(producto.getId());
        response.setTitulo(producto.getTitulo());
        response.setDetalle(producto.getDetalle());
        // El precio almacenado ya incluye IVA.
        response.setPrecio(producto.getPrecio());
        response.setPrecioConIva(producto.getPrecio());
        response.setStock(producto.getStock());
        response.setGrupoId(producto.getGrupo().getId());
        response.setGrupoNombre(producto.getGrupo().getNombre());
        response.setRamaId(producto.getRama().getId());
        response.setRamaNombre(producto.getRama().getNombre());
        response.setEstado(producto.getEstado().getNombre());
        response.setFechaCreacion(producto.getFechaCreacion());
        response.setFechaActualizacion(producto.getFechaActualizacion());
        List<FotoProductoResponse> fotos = new ArrayList<>();
        for (FotoProducto foto : producto.getFotos()) {
            FotoProductoResponse fotoResponse = new FotoProductoResponse();
            fotoResponse.setId(foto.getId());
            fotoResponse.setNombreArchivo(foto.getNombreArchivo());
            fotoResponse.setTipoContenido(foto.getTipoContenido());
            fotoResponse.setTamanioBytes(foto.getTamanioBytes());
            fotoResponse.setOrdenVisualizacion(foto.getOrdenVisualizacion());
            fotoResponse.setFechaCarga(foto.getFechaCarga());
            fotoResponse.setUrl("/api/productos/" + producto.getId() + "/fotos/" + foto.getId());
            fotos.add(fotoResponse);
        }
        response.setFotos(fotos);
        return response;
    }
    // private BigDecimal calcularPrecioConIva(BigDecimal precioNeto) {
    //     Impuesto iva = impuestoRepository
    //         .findFirstByEstadoNombreOrderByVigenteDesdeDesc("ACTIVO")
    //         .orElseThrow(() -> new RecursoNoEncontradoException("No existe un impuesto activo."));
    //     BigDecimal montoImpuesto = precioNeto
    //         .multiply(iva.getPorcentaje())
    //         .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);
    //     return precioNeto.add(montoImpuesto);
    // }
    private void validarUnaFoto(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {throw new ValidacionNegocioException("Debe seleccionar una imagen.");}
        if (archivo.getSize() > MAXIMO_BYTES) {throw new ValidacionNegocioException("La imagen puede pesar hasta 10 MB.");}
        String nombre = archivo.getOriginalFilename();
        String extension = obtenerExtension(nombre == null ? "" : nombre).toLowerCase();
        boolean extensionValida = extension.equals("jpg") || extension.equals("jpeg") || extension.equals("png");
        String contentType = archivo.getContentType();
        boolean contentTypeValido = "image/jpeg".equals(contentType) || "image/jpg".equals(contentType) || "image/png".equals(contentType);
        if (!extensionValida || !contentTypeValido) {throw new ValidacionNegocioException("Solo se permiten imágenes JPG y PNG.");}
    }
    private void eliminarArchivoFisico(String rutaArchivo) {
        try {
            if (rutaArchivo != null && !rutaArchivo.isBlank()) {Files.deleteIfExists(Paths.get(rutaArchivo));}
        } catch (IOException ignored) {
            // No debe impedir la operación si el archivo físico ya no existe.
        }
    }
    private void eliminarArchivosFisicos(List<FotoProducto> fotos) {
        for (FotoProducto foto : fotos) {eliminarArchivoFisico(foto.getRutaArchivo());}
    }
    private void guardarArchivo(
        Producto producto,
        FotoProducto fotoAntigua,
        MultipartFile archivo
    ) {
        try {
            Path carpeta = directorioBase.resolve(String.valueOf(producto.getId()));
            Files.createDirectories(carpeta);
            String nombreOriginal = Paths.get(archivo.getOriginalFilename())
                .getFileName()
                .toString();
            String extension = obtenerExtension(nombreOriginal);
            String nombreGuardado = UUID.randomUUID() + "." + extension;
            String tipoContenido = archivo.getContentType();
            if ("image/jpg".equalsIgnoreCase(tipoContenido)) {tipoContenido = "image/jpeg";}
            Path destino = carpeta.resolve(nombreGuardado).normalize();
            archivo.transferTo(destino);
            fotoAntigua.setNombreArchivo(nombreOriginal);
            fotoAntigua.setRutaArchivo(destino.toString());
            fotoAntigua.setTipoContenido(tipoContenido);
            fotoAntigua.setTamanioBytes(archivo.getSize());
            fotoAntigua.setFechaCarga(LocalDateTime.now());
            fotoProductoRepository.save(fotoAntigua);
        } catch (IOException e) {throw new ValidacionNegocioException("No fue posible reemplazar la imagen.");}
    }
    public ProductoResponse agregarFotos(Long productoId, List<MultipartFile> archivos) {
        Producto producto = buscar(productoId);
        if (archivos == null || archivos.isEmpty()) {throw new ValidacionNegocioException("Debe seleccionar al menos una imagen.");}
        int cantidadActual = producto.getFotos().size();
        int cantidadFinal = cantidadActual + archivos.size();
        if (cantidadFinal > MAXIMO_FOTOS) {
            throw new ValidacionNegocioException(
                "El producto ya tiene " + cantidadActual +
                " imagen(es). Solo puede tener máximo 3."
            );
        }
        validarFotos(archivos);
        guardarFotos(producto, archivos);
        return convertir(producto);
    }
    public ProductoResponse eliminarFoto(Long productoId, Long fotoId) {
        Producto producto = buscar(productoId);
        if (producto.getFotos().size() <= 1) {
            throw new ValidacionNegocioException("El producto debe tener al menos una imagen.");
        }
        FotoProducto foto = producto.getFotos().stream()
            .filter(f -> f.getId().equals(fotoId))
            .findFirst()
            .orElseThrow(() -> new RecursoNoEncontradoException("Imagen no encontrada."));
        String rutaArchivo = foto.getRutaArchivo();
        producto.quitarFoto(foto);
        fotoProductoRepository.flush();
        List<FotoProducto> fotosRestantes = producto.getFotos()
            .stream()
            .sorted(java.util.Comparator.comparingInt(FotoProducto::getOrdenVisualizacion))
            .toList();
        short orden = 1;
        for (FotoProducto fotoRestante : fotosRestantes) {fotoRestante.setOrdenVisualizacion(orden++);}
        fotoProductoRepository.saveAll(fotosRestantes);
        fotoProductoRepository.flush();
        eliminarArchivoFisico(rutaArchivo);
        return convertir(producto);
    }
    public ProductoResponse reemplazarFoto(Long productoId, Long fotoId, MultipartFile archivo) {
        Producto producto = buscar(productoId);
        FotoProducto foto = producto.getFotos().stream()
            .filter(f -> f.getId().equals(fotoId))
            .findFirst()
            .orElseThrow(() -> new RecursoNoEncontradoException("Imagen no encontrada."));
        validarUnaFoto(archivo);
        eliminarArchivoFisico(foto.getRutaArchivo());
        guardarArchivo(producto, foto, archivo);
        return convertir(producto);
    }
    public ProductoResponse reemplazarTodasLasFotos(
        Long productoId,
        List<MultipartFile> archivos
    ) {
        Producto producto = buscar(productoId);
        if (archivos == null || archivos.isEmpty() || archivos.size() > MAXIMO_FOTOS) {
            throw new ValidacionNegocioException("Debe subir entre 1 y 3 imágenes.");
        }
        validarFotos(archivos);
        List<FotoProducto> fotosAntiguas = new ArrayList<>(producto.getFotos());
        producto.getFotos().clear();
        if (!fotosAntiguas.isEmpty()) {
            fotoProductoRepository.deleteAll(fotosAntiguas);
            fotoProductoRepository.flush();
        }
        eliminarArchivosFisicos(fotosAntiguas);
        guardarFotos(producto, archivos);
        return convertir(producto);
    }
}