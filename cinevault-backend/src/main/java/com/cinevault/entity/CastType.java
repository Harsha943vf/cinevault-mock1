package com.cinevault.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "cast_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CastType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true)
    private String type;   // e.g. "Lead", "Supporting", "Ensemble"
}
