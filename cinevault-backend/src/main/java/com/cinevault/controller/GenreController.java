package com.cinevault.controller;

import com.cinevault.dto.ApiResponse;
import com.cinevault.entity.Genre;
import com.cinevault.repository.GenreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/genres")
@RequiredArgsConstructor
public class GenreController {

    private final GenreRepository genreRepository;

    /**
     * GET /api/genres
     * Public – returns all available genres for filter dropdowns.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Genre>>> getAllGenres() {
        return ResponseEntity.ok(ApiResponse.ok(genreRepository.findAll()));
    }
}
