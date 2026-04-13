package edu.cit.lao.campusbazaar.service;

import edu.cit.lao.campusbazaar.dto.AuthResponse;
import edu.cit.lao.campusbazaar.dto.LoginRequest;
import edu.cit.lao.campusbazaar.dto.RegisterRequest;
import edu.cit.lao.campusbazaar.model.User;
import edu.cit.lao.campusbazaar.repository.UserRepository;
import edu.cit.lao.campusbazaar.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .fullName(request.getFirstName() + " " + request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.STUDENT)
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);

        String token = jwtUtil.generateToken(
                user.getEmail(), user.getRole().name());

        AuthResponse.UserData userData = AuthResponse.UserData.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .accessToken(token)
                .build();

        return AuthResponse.builder()
                .success(true)
                .data(userData)
                .timestamp(LocalDateTime.now().toString())
                .build();
    }

    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(
                request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(
                user.getEmail(), user.getRole().name());

        String fullName = user.getFullName();
        if (fullName == null || fullName.isBlank()) {
            fullName = user.getFirstName() + " " + user.getLastName();
        }

        AuthResponse.UserData userData = AuthResponse.UserData.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(fullName)
                .role(user.getRole().name())
                .accessToken(token)
                .build();

        return AuthResponse.builder()
                .success(true)
                .data(userData)
                .timestamp(LocalDateTime.now().toString())
                .build();
    }
}