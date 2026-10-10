package com.scout.microservicio_actividades.service;

import com.scout.microservicio_actividades.dto.FotoEventoResponse;
import com.scout.microservicio_actividades.model.Evento;
import com.scout.microservicio_actividades.model.FotoEvento;
import com.scout.microservicio_actividades.repository.EventoRepository;
import com.scout.microservicio_actividades.repository.FotoEventoRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@Transactional
public class FotoEventoService {
    private static final int MAXIMO_FOTOS_POR_EVENTO = 20;
    private static final long TAMANIO_MAXIMO_FOTO = 10L * 1024L * 1024L;
    private final EventoRepository eventoRepository;
    private final FotoEventoRepository fotoEventoRepository;
    private final Path directorioBase;
    public FotoEventoService(EventoRepository eventoRepository, FotoEventoRepository fotoEventoRepository,
        @Value("${app.storage.eventos:uploads/eventos}")
        String rutaBase) {
            this.eventoRepository = eventoRepository;
            this.fotoEventoRepository = fotoEventoRepository;
            this.directorioBase = Paths.get(rutaBase).toAbsolutePath().normalize();
    }
    public List<FotoEventoResponse> subirFotos(Long eventoId, List<MultipartFile> archivos) {
        Evento evento = buscarEvento(eventoId);
        if (archivos == null || archivos.isEmpty()) {throw new IllegalArgumentException("Debes seleccionar al menos una foto.");}
        List<MultipartFile> fotosValidas = archivos.stream().filter(archivo -> archivo != null && !archivo.isEmpty()).toList();
        if (fotosValidas.isEmpty()) {throw new IllegalArgumentException("Los archivos recibidos están vacíos.");}
        long cantidadActual = fotoEventoRepository.countByEvento_Id(eventoId);
        long cantidadFinal = cantidadActual + fotosValidas.size();
        if (cantidadFinal > MAXIMO_FOTOS_POR_EVENTO) {throw new IllegalArgumentException("El evento ya tiene " + cantidadActual + " fotos. No puede superar el máximo " + "de 20 fotografías.");}
        List<FotoEventoResponse> respuestas = new ArrayList<>();
        for (MultipartFile archivo : fotosValidas) {validarArchivo(archivo);
            FotoEvento foto = guardarArchivoYMetadatos(evento, archivo, false);
            respuestas.add(convertirAResponse(foto));
        }
        return respuestas;
    }
    public FotoEventoResponse marcarComoPrincipal(Long eventoId, Long fotoId) {
        buscarEvento(eventoId);
        FotoEvento foto = buscarFotoDelEvento(eventoId, fotoId);
        fotoEventoRepository.findByEvento_IdAndEsPrincipalTrue(eventoId)
            .ifPresent(fotoPrincipalActual -> {fotoPrincipalActual.setEsPrincipal(false);
                fotoEventoRepository.save(fotoPrincipalActual);});
        foto.setEsPrincipal(true);
        FotoEvento fotoActualizada = fotoEventoRepository.save(foto);
        return convertirAResponse(fotoActualizada);
    }
    public void eliminarFoto(Long eventoId, Long fotoId) {
        FotoEvento foto = buscarFotoDelEvento(eventoId, fotoId);
        eliminarArchivoFisico(foto.getRutaArchivo());
        fotoEventoRepository.delete(foto);
    }
    @Transactional(readOnly = true)
    public FotoEvento buscarFotoDelEvento(Long eventoId, Long fotoId) {
        FotoEvento foto = fotoEventoRepository.findById(fotoId).orElseThrow(() -> new IllegalArgumentException("No existe una foto con ID " + fotoId + "."));
        if (!foto.getEvento().getId().equals(eventoId)) {
            throw new IllegalArgumentException("La foto indicada no pertenece al evento.");
        }
        return foto;
    }
    @Transactional(readOnly = true)
    public Path obtenerRutaFoto(Long eventoId, Long fotoId) {FotoEvento foto = buscarFotoDelEvento(eventoId, fotoId);
        Path ruta = Paths.get(foto.getRutaArchivo()).toAbsolutePath().normalize();
        if (!ruta.startsWith(directorioBase)) {throw new IllegalArgumentException("La ruta del archivo no es válida.");}
        if (!Files.exists(ruta)) {throw new IllegalArgumentException("El archivo físico no existe.");}
        return ruta;
    }
    private FotoEvento
    guardarArchivoYMetadatos(Evento evento, MultipartFile archivo, boolean esPrincipal) {
        try {Path carpetaEvento = directorioBase.resolve(String.valueOf(evento.getId()));
            Files.createDirectories(carpetaEvento);
            String nombreOriginal = obtenerNombreSeguro(archivo.getOriginalFilename());
            String extension = obtenerExtension(nombreOriginal);
            String nombreGuardado = UUID.randomUUID() + (extension.isEmpty() ? "" : "." + extension);
            Path destino = carpetaEvento.resolve(nombreGuardado).normalize();
            if (!destino.startsWith(carpetaEvento)) {throw new IllegalArgumentException("La ruta del archivo no es válida.");}
            archivo.transferTo(destino);
            long cantidadActual = fotoEventoRepository.countByEvento_Id(evento.getId());
            FotoEvento foto = new FotoEvento();
            foto.setEvento(evento);
            foto.setNombreArchivo(nombreOriginal);
            foto.setRutaArchivo(destino.toString());
            foto.setTipoContenido(archivo.getContentType());
            foto.setTamanioBytes(archivo.getSize());
            foto.setEsPrincipal(esPrincipal);
            foto.setOrdenVisualizacion((short) (cantidadActual + 1));
            return fotoEventoRepository.save(foto);
        } catch (IOException error) {throw new IllegalStateException("No fue posible guardar la fotografía.", error);}
    }
    private void validarArchivo(MultipartFile archivo) {
        if (archivo.getSize() <= 0) {throw new IllegalArgumentException("Una de las fotografías está vacía.");}
        if (archivo.getSize() > TAMANIO_MAXIMO_FOTO) {
            throw new IllegalArgumentException("Cada fotografía puede tener un máximo " + "de 10 MB.");
        }
        String tipoContenido = archivo.getContentType();
        if (tipoContenido == null || !(tipoContenido.equals("image/jpeg") || tipoContenido.equals("image/png"))) {
            throw new IllegalArgumentException("Solo se permiten imágenes JPG y PNG.");
        }
        String nombre = obtenerNombreSeguro(archivo.getOriginalFilename());
        String extension = obtenerExtension(nombre).toLowerCase(Locale.ROOT);
        if (
            !extension.equals("jpg") &&
            !extension.equals("jpeg") &&
            !extension.equals("png")
        ) {throw new IllegalArgumentException("La extensión del archivo debe ser " + "JPG, JPEG o PNG.");}
    }
    private Evento buscarEvento(Long eventoId) {
        return eventoRepository.findById(eventoId).orElseThrow(() -> new IllegalArgumentException("No existe un evento con ID " + eventoId + ".")
            );
    }
    private String obtenerNombreSeguro(String nombreOriginal) {
        if (nombreOriginal == null || nombreOriginal.isBlank()) {
            throw new IllegalArgumentException("El archivo no tiene un nombre válido.");
        }
        String nombreArchivo = Paths.get(nombreOriginal).getFileName().toString();
        if (nombreArchivo.isBlank()) {throw new IllegalArgumentException("El archivo no tiene un nombre válido.");}
        return nombreArchivo;
    }
    private String obtenerExtension(String nombreArchivo) {
        int ultimaPosicion = nombreArchivo.lastIndexOf(".");
        if (ultimaPosicion < 0 || ultimaPosicion == nombreArchivo.length() - 1) {return "";}
        return nombreArchivo.substring(ultimaPosicion + 1);
    }
    private void eliminarArchivoFisico(String rutaArchivo) {
        try {Path ruta = Paths.get(rutaArchivo).toAbsolutePath().normalize();
            if (!ruta.startsWith(directorioBase)) {throw new IllegalArgumentException("La ruta del archivo no es válida.");}
            Files.deleteIfExists(ruta);
        } catch (IOException error) {throw new IllegalStateException("No fue posible eliminar " + "la fotografía física.", error);}
    }
    private FotoEventoResponse convertirAResponse(FotoEvento foto) {
        FotoEventoResponse response = new FotoEventoResponse();
        response.setId(foto.getId());
        response.setNombreArchivo(foto.getNombreArchivo());
        response.setTipoContenido(foto.getTipoContenido());
        response.setTamanioBytes(foto.getTamanioBytes());
        response.setEsPrincipal(foto.getEsPrincipal());
        response.setOrdenVisualizacion(foto.getOrdenVisualizacion());
        response.setFechaCarga(foto.getFechaCarga());
        response.setUrl("/api/eventos/" + foto.getEvento().getId() + "/fotos/" + foto.getId());
        return response;
    }
}
