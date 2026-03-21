package com.cinevault.repository;

import com.cinevault.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {

    // Search by title (case-insensitive)
    List<Movie> findByTitleContainingIgnoreCase(String title);

    // Filter by genre name
    @Query("SELECT m FROM Movie m WHERE m.genre.name = :genreName")
    List<Movie> findByGenreName(@Param("genreName") String genreName);

    // Search by title AND genre
    @Query("SELECT m FROM Movie m WHERE " +
           "LOWER(m.title) LIKE LOWER(CONCAT('%', :title, '%')) AND " +
           "m.genre.name = :genreName")
    List<Movie> findByTitleContainingIgnoreCaseAndGenreName(
            @Param("title") String title,
            @Param("genreName") String genreName);
}
