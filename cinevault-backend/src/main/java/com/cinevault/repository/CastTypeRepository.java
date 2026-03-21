package com.cinevault.repository;

import com.cinevault.entity.CastType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CastTypeRepository extends JpaRepository<CastType, Long> {
    Optional<CastType> findByTypeIgnoreCase(String type);
}
