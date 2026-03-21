package com.cinevault.controller;

import com.cinevault.dto.ApiResponse;
import com.cinevault.dto.UserResponse;
import com.cinevault.entity.User;
import com.cinevault.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * GET /api/users/me
     * Returns the profile of the currently authenticated user.
     * Works for both USER and ADMIN roles.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @AuthenticationPrincipal User currentUser) {

        UserResponse response = userService.getUserByEmail(currentUser.getEmail());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
