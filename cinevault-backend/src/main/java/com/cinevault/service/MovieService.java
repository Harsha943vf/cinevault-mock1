package com.cinevault.service;

import com.cinevault.dto.MovieRequest;
import com.cinevault.dto.MovieResponse;
import com.cinevault.entity.*;
import com.cinevault.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MovieService {

    private final MovieRepository    movieRepository;
    private final GenreRepository    genreRepository;
    private final DirectorRepository directorRepository;
    private final ProducerRepository producerRepository;
    private final CastRepository     castRepository;
    private final CastTypeRepository castTypeRepository;

    // ─── Get All ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<MovieResponse> getAllMovies() {
        return movieRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ─── Get by ID ───────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public MovieResponse getMovieById(Long id) {
        Movie movie = findMovieOrThrow(id);
        return toResponse(movie);
    }

    // ─── Search ──────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<MovieResponse> searchMovies(String title, String genre) {
        List<Movie> results;

        boolean hasTitle = title != null && !title.isBlank();
        boolean hasGenre = genre != null && !genre.isBlank();

        if (hasTitle && hasGenre) {
            results = movieRepository.findByTitleContainingIgnoreCaseAndGenreName(title, genre);
        } else if (hasTitle) {
            results = movieRepository.findByTitleContainingIgnoreCase(title);
        } else if (hasGenre) {
            results = movieRepository.findByGenreName(genre);
        } else {
            results = movieRepository.findAll();
        }

        return results.stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ─── Create ──────────────────────────────────────────────────────────────────

    @Transactional
    public MovieResponse createMovie(MovieRequest request) {
        Movie movie = Movie.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .genre(resolveGenre(request.getGenreName()))
                .director(resolveDirector(request.getDirectorName()))
                .producer(resolveProducer(request.getProducerName()))
                .castType(resolveCastType(request.getCastTypeName()))
                .cast(resolveCast(request.getCastNames()))
                .posterUrl(request.getPosterUrl())
                .releaseYear(request.getReleaseYear())
                .build();

        Movie saved = movieRepository.save(movie);
        log.info("Movie created: {} (id={})", saved.getTitle(), saved.getId());
        return toResponse(saved);
    }

    // ─── Update ──────────────────────────────────────────────────────────────────

    @Transactional
    public MovieResponse updateMovie(Long id, MovieRequest request) {
        Movie movie = findMovieOrThrow(id);

        movie.setTitle(request.getTitle());
        movie.setDescription(request.getDescription());
        movie.setGenre(resolveGenre(request.getGenreName()));
        movie.setDirector(resolveDirector(request.getDirectorName()));
        movie.setProducer(resolveProducer(request.getProducerName()));
        movie.setCastType(resolveCastType(request.getCastTypeName()));
        movie.setCast(resolveCast(request.getCastNames()));
        movie.setPosterUrl(request.getPosterUrl());
        movie.setReleaseYear(request.getReleaseYear());

        Movie saved = movieRepository.save(movie);
        log.info("Movie updated: {} (id={})", saved.getTitle(), saved.getId());
        return toResponse(saved);
    }

    // ─── Delete ──────────────────────────────────────────────────────────────────

    @Transactional
    public void deleteMovie(Long id) {
        Movie movie = findMovieOrThrow(id);
        movieRepository.delete(movie);
        log.info("Movie deleted: {} (id={})", movie.getTitle(), id);
    }

    // ─── Lookup resolvers (find-or-create pattern) ────────────────────────────────

    private Genre resolveGenre(String name) {
        if (name == null || name.isBlank()) return null;
        return genreRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> genreRepository.save(Genre.builder().name(name).build()));
    }

    private Director resolveDirector(String name) {
        if (name == null || name.isBlank()) return null;
        return directorRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> directorRepository.save(Director.builder().name(name).build()));
    }

    private Producer resolveProducer(String name) {
        if (name == null || name.isBlank()) return null;
        return producerRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> producerRepository.save(Producer.builder().name(name).build()));
    }

    private CastType resolveCastType(String type) {
        if (type == null || type.isBlank()) return null;
        return castTypeRepository.findByTypeIgnoreCase(type)
                .orElseGet(() -> castTypeRepository.save(CastType.builder().type(type).build()));
    }

    private List<Cast> resolveCast(List<String> names) {
        if (names == null || names.isEmpty()) return new ArrayList<>();
        return names.stream()
                .map(name -> castRepository.findByNameIgnoreCase(name)
                        .orElseGet(() -> castRepository.save(Cast.builder().name(name).build())))
                .collect(Collectors.toList());
    }

    // ─── Entity → Response mapper ─────────────────────────────────────────────────

    public MovieResponse toResponse(Movie movie) {
        return MovieResponse.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .description(movie.getDescription())
                .genre(movie.getGenre() != null ? movie.getGenre().getName() : null)
                .cast(movie.getCast() != null
                        ? movie.getCast().stream().map(Cast::getName).collect(Collectors.toList())
                        : new ArrayList<>())
                .castType(movie.getCastType() != null ? movie.getCastType().getType() : null)
                .director(movie.getDirector() != null ? movie.getDirector().getName() : null)
                .producer(movie.getProducer() != null ? movie.getProducer().getName() : null)
                .posterUrl(movie.getPosterUrl())
                .releaseYear(movie.getReleaseYear())
                .createdAt(movie.getCreatedAt())
                .updatedAt(movie.getUpdatedAt())
                .build();
    }

    // ─── Helper ───────────────────────────────────────────────────────────────────

    private Movie findMovieOrThrow(Long id) {
        return movieRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException(
                        "Movie not found with id: " + id));
    }
}
