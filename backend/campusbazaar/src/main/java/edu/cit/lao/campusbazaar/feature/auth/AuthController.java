package edu.cit.lao.campusbazaar.feature.auth;

import edu.cit.lao.campusbazaar.feature.auth.dto.AuthResponse;
import edu.cit.lao.campusbazaar.feature.auth.dto.LoginRequest;
import edu.cit.lao.campusbazaar.feature.auth.dto.RegisterRequest;
import edu.cit.lao.campusbazaar.feature.user.UserRepository;
import edu.cit.lao.campusbazaar.feature.user.model.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> data = new HashMap<>();
        data.put("id", user.getId());
        data.put("email", user.getEmail());
        data.put("fullName", user.getFullName());
        data.put("role", user.getRole());
        data.put("profileImageUrl", user.getProfileImageUrl());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", data,
                "timestamp", Instant.now().toString()
        ));
    }
}