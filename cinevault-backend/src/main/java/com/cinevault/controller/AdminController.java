package com.cinevault.controller;

import com.cinevault.dto.AdminStatsResponse;
import com.cinevault.dto.ApiResponse;
import com.cinevault.dto.UserResponse;
import com.cinevault.repository.*;
import com.cinevault.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")   // All endpoints in this controller require ADMIN
public class AdminController {

    private final UserService      userService;
    private final MovieRepository  movieRepository;
    private final UserRepository   userRepository;
    private final GenreRepository  genreRepository;
    private final DirectorRepository directorRepository;
    private final ProducerRepository producerRepository;

    /**
     * GET /api/admin/stats
     * Returns dashboard statistics for the admin panel.
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getStats() {
        AdminStatsResponse stats = AdminStatsResponse.builder()
                .totalUsers(userRepository.count())
                .totalMovies(movieRepository.count())
                .totalGenres(genreRepository.count())
                .totalDirectors(directorRepository.count())
                .totalProducers(producerRepository.count())
                .build();

        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    /**
     * GET /api/admin/users
     * Returns list of all registered users.
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getAllUsers()));
    }

    /**
     * GET /api/admin/users/{id}
     * Returns a single user by ID.
     */
    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getUserById(id)));
    }
}
