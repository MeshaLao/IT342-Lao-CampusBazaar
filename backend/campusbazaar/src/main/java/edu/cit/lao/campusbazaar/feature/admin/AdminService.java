package edu.cit.lao.campusbazaar.feature.admin;

import edu.cit.lao.campusbazaar.feature.auth.dto.AuthResponse;
import edu.cit.lao.campusbazaar.feature.order.OrderRepository;
import edu.cit.lao.campusbazaar.feature.order.QrCodeRepository;
import edu.cit.lao.campusbazaar.feature.order.model.Order;
import edu.cit.lao.campusbazaar.feature.product.ProductRepository;
import edu.cit.lao.campusbazaar.feature.product.model.Product;
import edu.cit.lao.campusbazaar.feature.user.UserRepository;
import edu.cit.lao.campusbazaar.feature.user.model.User;
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
    private final OrderRepository orderRepository;
    private final QrCodeRepository qrCodeRepository;

    // ─── Users ───────────────────────────────────────────────────────────────

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

    // ─── Stats ────────────────────────────────────────────────────────────────

    public AuthResponse getStats() {
        List<User> allUsers = userRepository.findAll();
        List<Product> allProducts = productRepository.findAll();
        List<Order> allOrders = orderRepository.findAll();

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

        long totalOrders     = allOrders.size();
        long pendingOrders   = allOrders.stream().filter(o -> o.getStatus() == Order.OrderStatus.PENDING).count();
        long completedOrders = allOrders.stream().filter(o -> o.getStatus() == Order.OrderStatus.COMPLETED).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalProducts", totalProducts);
        stats.put("pendingCount", pendingCount);
        stats.put("approvedCount", activeCount);
        stats.put("rejectedCount", rejectedCount);
        stats.put("totalOrders", totalOrders);
        stats.put("pendingOrders", pendingOrders);
        stats.put("completedOrders", completedOrders);

        return AuthResponse.builder()
                .success(true)
                .data(stats)
                .timestamp(LocalDateTime.now().toString())
                .build();
    }

    // ─── Orders ───────────────────────────────────────────────────────────────

    public AuthResponse getAllOrders(String statusFilter) {
        List<Order> orders;

        if (statusFilter != null && !statusFilter.isBlank() && !statusFilter.equalsIgnoreCase("ALL")) {
            try {
                Order.OrderStatus status = Order.OrderStatus.valueOf(statusFilter.toUpperCase());
                orders = orderRepository.findByStatusOrderByCreatedAtDesc(status);
            } catch (IllegalArgumentException e) {
                orders = orderRepository.findAllByOrderByCreatedAtDesc();
            }
        } else {
            orders = orderRepository.findAllByOrderByCreatedAtDesc();
        }

        List<Map<String, Object>> orderList = orders.stream()
                .map(this::mapOrder)
                .collect(Collectors.toList());

        long pending   = orders.stream().filter(o -> o.getStatus() == Order.OrderStatus.PENDING).count();
        long paid      = orders.stream().filter(o -> o.getStatus() == Order.OrderStatus.PAID).count();
        long fulfilled = orders.stream().filter(o -> o.getStatus() == Order.OrderStatus.FULFILLED).count();
        long completed = orders.stream().filter(o -> o.getStatus() == Order.OrderStatus.COMPLETED).count();
        long cancelled = orders.stream().filter(o -> o.getStatus() == Order.OrderStatus.CANCELLED).count();

        Map<String, Object> response = new HashMap<>();
        response.put("orders", orderList);
        response.put("total", orderList.size());
        response.put("summary", Map.of(
                "pending", pending,
                "paid", paid,
                "fulfilled", fulfilled,
                "completed", completed,
                "cancelled", cancelled
        ));

        return AuthResponse.builder()
                .success(true)
                .data(response)
                .timestamp(LocalDateTime.now().toString())
                .build();
    }

    public AuthResponse adminUpdateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(Order.OrderStatus.valueOf(status.toUpperCase()));
        orderRepository.save(order);

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", order.getId());
        response.put("orderNumber", order.getOrderNumber());
        response.put("status", order.getStatus().name());

        return AuthResponse.builder()
                .success(true)
                .data(response)
                .timestamp(LocalDateTime.now().toString())
                .build();
    }

    // ─── Mappers ──────────────────────────────────────────────────────────────

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
        map.put("createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : "");
        return map;
    }

    private Map<String, Object> mapOrder(Order o) {
        Map<String, Object> map = new HashMap<>();
        map.put("orderId", o.getId());
        map.put("orderNumber", o.getOrderNumber());
        map.put("status", o.getStatus().name());
        map.put("paymentMethod", o.getPaymentMethod().name());
        map.put("totalAmount", o.getTotalAmount());
        map.put("createdAt", o.getCreatedAt() != null ? o.getCreatedAt().toString() : "");
        map.put("meetupLocation", o.getMeetupLocation());
        map.put("meetupTime", o.getMeetupTime());

        if (o.getBuyer() != null) {
            Map<String, Object> buyer = new HashMap<>();
            buyer.put("id", o.getBuyer().getId());
            String name = o.getBuyer().getFullName();
            if (name == null || name.isBlank())
                name = o.getBuyer().getFirstName() + " " + o.getBuyer().getLastName();
            buyer.put("fullName", name.trim());
            buyer.put("email", o.getBuyer().getEmail());
            map.put("buyer", buyer);
        }

        if (o.getItems() != null) {
            List<Map<String, Object>> items = o.getItems().stream().map(item -> {
                Map<String, Object> i = new HashMap<>();
                i.put("id", item.getId());
                i.put("productName", item.getProductName());
                i.put("quantity", item.getQuantity());
                i.put("unitPrice", item.getUnitPrice());
                if (item.getProduct() != null) {
                    i.put("imageUrl", item.getProduct().getImageUrl() != null
                            ? item.getProduct().getImageUrl() : "");
                    Map<String, Object> seller = new HashMap<>();
                    seller.put("id", item.getProduct().getSeller().getId());
                    String sName = item.getProduct().getSeller().getFullName();
                    if (sName == null || sName.isBlank())
                        sName = item.getProduct().getSeller().getFirstName()
                                + " " + item.getProduct().getSeller().getLastName();
                    seller.put("fullName", sName.trim());
                    seller.put("email", item.getProduct().getSeller().getEmail());
                    i.put("seller", seller);
                }
                return i;
            }).collect(Collectors.toList());
            map.put("items", items);
        }

        if (o.getPaymentMethod() == Order.PaymentMethod.MEETUP) {
            qrCodeRepository.findByOrderId(o.getId())
                    .ifPresent(qr -> map.put("qrCodeUrl", qr.getQrImageUrl()));
        }

        return map;
    }
}