package edu.cit.lao.campusbazaar.feature.admin;

import edu.cit.lao.campusbazaar.feature.auth.dto.AuthResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<AuthResponse> getAllUsers(Authentication auth) {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/stats")
    public ResponseEntity<AuthResponse> getStats(Authentication auth) {
        return ResponseEntity.ok(adminService.getStats());
    }

    @PutMapping("/users/{id}/suspend")
    public ResponseEntity<AuthResponse> suspendUser(
            @PathVariable Long id,
            Authentication auth) {
        return ResponseEntity.ok(adminService.suspendUser(id));
    }

    @PutMapping("/users/{id}/activate")
    public ResponseEntity<AuthResponse> activateUser(
            @PathVariable Long id,
            Authentication auth) {
        return ResponseEntity.ok(adminService.activateUser(id));
    }
}