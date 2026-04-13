package edu.cit.lao.campusbazaar.service;

import edu.cit.lao.campusbazaar.dto.AuthResponse;
import edu.cit.lao.campusbazaar.model.Product;
import edu.cit.lao.campusbazaar.model.User;
import edu.cit.lao.campusbazaar.repository.ProductRepository;
import edu.cit.lao.campusbazaar.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public AuthResponse getAllUsers() {
        List<User> users = userRepository.findAll();

        List<Map<String, Object>> userList = users.stream()
                .filter(u -> u.getRole() == User.Role.STUDENT)
                .map(this::mapUser)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("users", userList);
        response.put("total", userList.size());

        return AuthResponse.builder()
                .success(true)
                .data(response)
                .timestamp(LocalDateTime.now().toString())
                .build();
    }

    public AuthResponse getStats() {
        List<User> allUsers = userRepository.findAll();
        List<Product> allProducts = productRepository.findAll();

        long totalUsers = allUsers.stream()
                .filter(u -> u.getRole() == User.Role.STUDENT)
                .count();
        long totalProducts = allProducts.size();
        long pendingCount = allProducts.stream()
                .filter(p -> p.getStatus() == Product.ProductStatus.PENDING_APPROVAL)
                .count();
        long activeCount = allProducts.stream()
                .filter(p -> p.getStatus() == Product.ProductStatus.ACTIVE)
                .count();
        long rejectedCount = allProducts.stream()
                .filter(p -> p.getStatus() == Product.ProductStatus.REJECTED)
                .count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalProducts", totalProducts);
        stats.put("pendingCount", pendingCount);
        stats.put("approvedCount", activeCount);
        stats.put("rejectedCount", rejectedCount);
        stats.put("totalOrders", 0);

        return AuthResponse.builder()
                .success(true)
                .data(stats)
                .timestamp(LocalDateTime.now().toString())
                .build();
    }

    public AuthResponse suspendUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setSuspended(true);
        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("suspended", true);

        return AuthResponse.builder()
                .success(true)
                .data(response)
                .timestamp(LocalDateTime.now().toString())
                .build();
    }

    public AuthResponse activateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setSuspended(false);
        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("suspended", false);

        return AuthResponse.builder()
                .success(true)
                .data(response)
                .timestamp(LocalDateTime.now().toString())
                .build();
    }

    private Map<String, Object> mapUser(User u) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", u.getId());
        String fullName = u.getFullName();
        if (fullName == null || fullName.isBlank()) {
            fullName = (u.getFirstName() != null ? u.getFirstName() : "") +
                    " " +
                    (u.getLastName() != null ? u.getLastName() : "");
        }
        map.put("fullName", fullName.trim());
        map.put("email", u.getEmail());
        map.put("role", u.getRole().name());
        map.put("suspended", u.getSuspended() != null ? u.getSuspended() : false);
        map.put("createdAt", u.getCreatedAt() != null ?
                u.getCreatedAt().toString() : "");
        return map;
    }
}