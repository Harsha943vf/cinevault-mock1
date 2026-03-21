package com.cinevault.controller;

import com.cinevault.dto.ApiResponse;
import com.cinevault.dto.MovieRequest;
import com.cinevault.dto.MovieResponse;
import com.cinevault.service.MovieService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;

    // ─── GET All / Search ─────────────────────────────────────────────────────────
    /**
     * GET /api/movies
     * GET /api/movies?title=inception
     * GET /api/movies?genre=Action
     * GET /api/movies?title=dark&genre=Action
     *
     * Public – no auth required.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<MovieResponse>>> getMovies(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String genre) {

        List<MovieResponse> movies = movieService.searchMovies(title, genre);
        return ResponseEntity.ok(ApiResponse.ok(movies));
    }

    // ─── GET by ID ────────────────────────────────────────────────────────────────
    /**
     * GET /api/movies/{id}
     * Public – no auth required.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MovieResponse>> getMovieById(@PathVariable Long id) {
        MovieResponse movie = movieService.getMovieById(id);
        return ResponseEntity.ok(ApiResponse.ok(movie));
    }

    // ─── POST (Create) ────────────────────────────────────────────────────────────
    /**
     * POST /api/movies
     * ADMIN only.
     * Body: MovieRequest JSON
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MovieResponse>> createMovie(
            @Valid @RequestBody MovieRequest request) {

        MovieResponse created = movieService.createMovie(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Movie created successfully", created));
    }

    // ─── PUT (Update) ─────────────────────────────────────────────────────────────
    /**
     * PUT /api/movies/{id}
     * ADMIN only.
     * Body: MovieRequest JSON (all fields; partial updates not supported here)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MovieResponse>> updateMovie(
            @PathVariable Long id,
            @Valid @RequestBody MovieRequest request) {

        MovieResponse updated = movieService.updateMovie(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Movie updated successfully", updated));
    }

    // ─── DELETE ───────────────────────────────────────────────────────────────────
    /**
     * DELETE /api/movies/{id}
     * ADMIN only.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteMovie(@PathVariable Long id) {
        movieService.deleteMovie(id);
        return ResponseEntity.ok(ApiResponse.ok("Movie deleted successfully", null));
    }
}
