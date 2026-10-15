package com.scout.backend_scout.repository;

import com.scout.backend_scout.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByCorreo(String correo);
    List<Usuario> findByRolNombreIgnoreCaseAndEstadoNombreIgnoreCase(
        String rolNombre,
        String estadoNombre);
    Optional<Usuario> findByNickname(String nickname);
    Optional<Usuario> findByNombre(String nombre);
}