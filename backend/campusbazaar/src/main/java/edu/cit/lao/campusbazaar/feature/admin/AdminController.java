package edu.cit.lao.campusbazaar.feature.admin;

import edu.cit.lao.campusbazaar.feature.auth.dto.AuthResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;

    // ─── Users ───────────────────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<AuthResponse> getAllUsers(Authentication auth) {
        return ResponseEntity.ok(adminService.getAllUsers());
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

    // ─── Stats ────────────────────────────────────────────────────────────────

    @GetMapping("/stats")
    public ResponseEntity<AuthResponse> getStats(Authentication auth) {
        return ResponseEntity.ok(adminService.getStats());
    }

    // ─── Orders ───────────────────────────────────────────────────────────────

    @GetMapping("/orders")
    public ResponseEntity<AuthResponse> getAllOrders(
            @RequestParam(required = false, defaultValue = "ALL") String status,
            Authentication auth) {
        return ResponseEntity.ok(adminService.getAllOrders(status));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<AuthResponse> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        return ResponseEntity.ok(adminService.adminUpdateOrderStatus(id, body.get("status")));
    }
}