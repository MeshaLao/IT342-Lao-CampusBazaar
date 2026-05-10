package edu.cit.lao.campusbazaar.feature.order;

import edu.cit.lao.campusbazaar.feature.auth.dto.AuthResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/api/v1/orders")
    public ResponseEntity<AuthResponse> placeOrder(
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        Long productId = Long.valueOf(body.get("productId").toString());
        Integer quantity = Integer.valueOf(body.get("quantity").toString());
        String paymentMethod = body.get("paymentMethod").toString();
        return ResponseEntity.ok(
                orderService.placeOrder(
                        productId, quantity, paymentMethod, auth.getName()));
    }

    @GetMapping("/api/v1/orders/my")
    public ResponseEntity<AuthResponse> getMyOrders(Authentication auth) {
        return ResponseEntity.ok(
                orderService.getMyOrders(auth.getName()));
    }

    @GetMapping("/api/v1/orders/seller")
    public ResponseEntity<AuthResponse> getSellerOrders(Authentication auth) {
        return ResponseEntity.ok(
                orderService.getSellerOrders(auth.getName()));
    }

    @GetMapping("/api/v1/orders/{id}")
    public ResponseEntity<AuthResponse> getOrderById(
            @PathVariable Long id,
            Authentication auth) {
        return ResponseEntity.ok(
                orderService.getOrderById(id, auth.getName()));
    }

    @PutMapping("/api/v1/orders/{id}/status")
    public ResponseEntity<AuthResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        return ResponseEntity.ok(
                orderService.updateOrderStatus(
                        id, body.get("status"), auth.getName()));
    }
}