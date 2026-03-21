package com.cinevault.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class MovieRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    // IDs reference existing lookup rows; the service will resolve them.
    // If the name doesn't exist yet, the service creates it automatically.

    @NotNull(message = "Genre is required")
    private String genreName;           // e.g. "Action"

    private List<String> castNames;     // e.g. ["Tom Hanks", "Meg Ryan"]

    private String castTypeName;        // e.g. "Lead"

    private String directorName;        // e.g. "Steven Spielberg"

    private String producerName;        // e.g. "Kathleen Kennedy"

    private String posterUrl;

    private Integer releaseYear;
}
