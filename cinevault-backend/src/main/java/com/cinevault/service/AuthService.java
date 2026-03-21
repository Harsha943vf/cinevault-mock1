package com.cinevault.service;
 
import com.cinevault.dto.AuthResponse;
import com.cinevault.dto.LoginRequest;
import com.cinevault.dto.RegisterRequest;
import com.cinevault.entity.User;
import com.cinevault.repository.UserRepository;
import com.cinevault.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
 
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
 
    private final UserRepository        userRepository;
    private final PasswordEncoder       passwordEncoder;
    private final JwtUtils              jwtUtils;
    private final AuthenticationManager authenticationManager;
 
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + request.getEmail());
        }
 
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();
 
        userRepository.save(user);
        log.info("New user registered: {} with role {}", user.getEmail(), user.getRole());
 
        String token = jwtUtils.generateToken(user);
        return buildAuthResponse(token, user);
    }
 
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
 
        User user = (User) authentication.getPrincipal();
        String token = jwtUtils.generateToken(user);
 
        log.info("User logged in: {} [{}]", user.getEmail(), user.getRole());
        return buildAuthResponse(token, user);
    }
 
    private AuthResponse buildAuthResponse(String token, User user) {
        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}
 