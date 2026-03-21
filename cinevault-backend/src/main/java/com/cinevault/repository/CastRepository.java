package com.cinevault.repository;

import com.cinevault.entity.Cast;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CastRepository extends JpaRepository<Cast, Long> {
    Optional<Cast> findByNameIgnoreCase(String name);
}
