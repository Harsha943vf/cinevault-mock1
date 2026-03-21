package com.cinevault.config;

import com.cinevault.entity.*;
import com.cinevault.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Runs once at startup to seed essential reference data and a default admin account.
 * Safe to run multiple times – uses findOrCreate logic.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final GenreRepository    genreRepository;
    private final CastTypeRepository castTypeRepository;
    private final UserRepository     userRepository;
    private final PasswordEncoder    passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedGenres();
        seedCastTypes();
        seedAdminUser();
    }

    // ─── Genres ──────────────────────────────────────────────────────────────────

    private void seedGenres() {
        List<String> genres = List.of(
                "Action", "Drama", "Comedy", "Thriller",
                "Horror", "Romance", "Sci-Fi", "Animation",
                "Documentary", "Fantasy", "Mystery", "Biography"
        );

        genres.forEach(name -> {
            if (genreRepository.findByNameIgnoreCase(name).isEmpty()) {
                genreRepository.save(Genre.builder().name(name).build());
                log.debug("Seeded genre: {}", name);
            }
        });

        log.info("Genres seeded successfully.");
    }

    // ─── Cast Types ───────────────────────────────────────────────────────────────

    private void seedCastTypes() {
        List<String> types = List.of("Lead", "Supporting", "Ensemble", "Cameo");

        types.forEach(type -> {
            if (castTypeRepository.findByTypeIgnoreCase(type).isEmpty()) {
                castTypeRepository.save(CastType.builder().type(type).build());
                log.debug("Seeded cast type: {}", type);
            }
        });

        log.info("Cast types seeded successfully.");
    }

    // ─── Default Admin User ───────────────────────────────────────────────────────

    private void seedAdminUser() {
        String adminEmail = "admin@cinevault.com";

        if (userRepository.existsByEmail(adminEmail)) {
            log.info("Admin user already exists – skipping seed.");
            return;
        }

        User admin = User.builder()
                .name("CineVault Admin")
                .email(adminEmail)
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .build();

        userRepository.save(admin);
        log.info("Default admin created → email: {} | password: admin123", adminEmail);
        log.warn("SECURITY: Change the default admin password before deploying to production!");
    }
}
