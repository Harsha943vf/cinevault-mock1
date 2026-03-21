package com.cinevault.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovieResponse {

    private Long id;
    private String title;
    private String description;
    private String genre;
    private List<String> cast;
    private String castType;
    private String director;
    private String producer;
    private String posterUrl;
    private Integer releaseYear;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
