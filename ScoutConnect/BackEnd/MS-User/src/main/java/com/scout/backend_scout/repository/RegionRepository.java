package com.scout.backend_scout.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.scout.backend_scout.model.Region;
import java.util.Optional;

public interface RegionRepository extends JpaRepository<Region, Long>{
    Optional <Region> findByNombre(String nombre);

}