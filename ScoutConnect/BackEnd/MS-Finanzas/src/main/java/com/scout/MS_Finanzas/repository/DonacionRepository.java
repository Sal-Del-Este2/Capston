package com.scout.MS_Finanzas.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import com.scout.MS_Finanzas.model.Donacion;

public interface DonacionRepository extends JpaRepository<Donacion, Long>, JpaSpecificationExecutor<Donacion> {
    Page<Donacion> findAll(Pageable pageable);
}