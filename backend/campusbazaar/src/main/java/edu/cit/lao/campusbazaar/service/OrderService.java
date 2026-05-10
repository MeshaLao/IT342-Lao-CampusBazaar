package edu.cit.lao.campusbazaar.service;

import edu.cit.lao.campusbazaar.dto.AuthResponse;
import edu.cit.lao.campusbazaar.model.*;
import edu.cit.lao.campusbazaar.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.math.BigDecimal;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final QrCodeRepository qrCodeRepository;

    @Transactional
    public AuthResponse placeOrder(Long productId, Integer quantity,
                                   String paymentMethod, String buyerEmail) {
        try {
            // Get buyer
            User buyer = userRepository.findByEmail(buyerEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Get product
            Product product = productRepository.findByIdWithSeller(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            // Validate product is active
            if (product.getStatus() != Product.ProductStatus.ACTIVE) {
                throw new RuntimeException("Product is not available for purchase");
            }

            // Validate stock
            if (product.getStock() < quantity) {
                throw new RuntimeException("Insufficient stock. Available: "
                        + product.getStock());
            }

            // Prevent buying own product
            if (product.getSeller().getEmail().equals(buyerEmail)) {
                throw new RuntimeException("You cannot buy your own product");
            }

            // Calculate total
            BigDecimal total = product.getPrice()
                    .multiply(BigDecimal.valueOf(quantity));

            // Determine payment method
            Order.PaymentMethod method = paymentMethod.equalsIgnoreCase("MEETUP")
                    ? Order.PaymentMethod.MEETUP
                    : Order.PaymentMethod.PAYMONGO;

            // Create and save order first
            Order order = Order.builder()
                    .buyer(buyer)
                    .totalAmount(total)
                    .paymentMethod(method)
                    .status(Order.OrderStatus.PENDING)
                    .items(new ArrayList<>())
                    .build();

            Order savedOrder = orderRepository.save(order);

            // Create and save order item separately
            OrderItem item = OrderItem.builder()
                    .order(savedOrder)
                    .product(product)
                    .productName(product.getName())
                    .quantity(quantity)
                    .unitPrice(product.getPrice())
                    .build();

            // Save item directly — don't rely on cascade
            savedOrder.getItems().add(item);
            orderRepository.save(savedOrder);

            // Reduce stock
            product.setStock(product.getStock() - quantity);
            productRepository.save(product);

            // Generate QR code for MEETUP
            String qrCodeUrl = null;
            if (method == Order.PaymentMethod.MEETUP) {
                qrCodeUrl = generateQrCode(savedOrder, product, buyer);
            }

            // Get seller name safely
            String sellerName = "";
            try {
                sellerName = product.getSeller().getFullName();
                if (sellerName == null || sellerName.isBlank()) {
                    sellerName = product.getSeller().getFirstName()
                            + " " + product.getSeller().getLastName();
                }
            } catch (Exception e) {
                sellerName = "Unknown";
            }

            // Build response
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", savedOrder.getId());
            response.put("orderNumber", savedOrder.getOrderNumber());
            response.put("status", savedOrder.getStatus().name());
            response.put("paymentMethod", savedOrder.getPaymentMethod().name());
            response.put("totalAmount", savedOrder.getTotalAmount());
            response.put("qrCodeUrl", qrCodeUrl);
            response.put("productName", product.getName());
            response.put("quantity", quantity);
            response.put("sellerName", sellerName);

            return AuthResponse.builder()
                    .success(true)
                    .data(response)
                    .timestamp(LocalDateTime.now().toString())
                    .build();

        } catch (RuntimeException e) {
            System.out.println("=== ORDER ERROR ===");
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    private String generateQrCode(Order order, Product product, User buyer) {
        try {
            // Build QR data
            String qrData = String.format(
                    "ORDER:%s|PRODUCT:%s|BUYER:%s|AMOUNT:%.2f|METHOD:MEETUP",
                    order.getOrderNumber(),
                    product.getName(),
                    buyer.getFullName() != null
                            ? buyer.getFullName()
                            : buyer.getFirstName() + " " + buyer.getLastName(),
                    order.getTotalAmount()
            );

            // Call goqr.me API
            String encoded = URLEncoder.encode(qrData, StandardCharsets.UTF_8);
            String qrImageUrl = "https://api.qrserver.com/v1/create-qr-code/?"
                    + "size=300x300&data=" + encoded;

            // Save QR code to DB
            QrCode qrCode = QrCode.builder()
                    .order(order)
                    .qrData(qrData)
                    .qrImageUrl(qrImageUrl)
                    .build();

            qrCodeRepository.save(qrCode);

            return qrImageUrl;

        } catch (Exception e) {
            System.out.println("QR generation failed: " + e.getMessage());
            return null;
        }
    }

    public AuthResponse getOrderById(Long orderId, String userEmail) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Map<String, Object> response = new HashMap<>();
        response.put("order", mapOrder(order));

        return AuthResponse.builder()
                .success(true)
                .data(response)
                .timestamp(LocalDateTime.now().toString())
                .build();
    }

    public AuthResponse getMyOrders(String buyerEmail) {
        User buyer = userRepository.findByEmail(buyerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Map<String, Object>> orders = orderRepository
                .findByBuyerOrderByCreatedAtDesc(buyer)
                .stream()
                .map(this::mapOrder)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("orders", orders);
        response.put("total", orders.size());

        return AuthResponse.builder()
                .success(true)
                .data(response)
                .timestamp(LocalDateTime.now().toString())
                .build();
    }

    public AuthResponse getSellerOrders(String sellerEmail) {
        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Map<String, Object>> orders = orderRepository
                .findBySellerOrderByCreatedAtDesc(seller)
                .stream()
                .map(this::mapOrder)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("orders", orders);
        response.put("total", orders.size());

        return AuthResponse.builder()
                .success(true)
                .data(response)
                .timestamp(LocalDateTime.now().toString())
                .build();
    }

    @Transactional
    public AuthResponse updateOrderStatus(Long orderId,
                                          String status, String userEmail) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(Order.OrderStatus.valueOf(status));
        orderRepository.save(order);

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", order.getId());
        response.put("status", order.getStatus().name());

        return AuthResponse.builder()
                .success(true)
                .data(response)
                .timestamp(LocalDateTime.now().toString())
                .build();
    }

    private Map<String, Object> mapOrder(Order o) {
        Map<String, Object> map = new HashMap<>();
        map.put("orderId", o.getId());
        map.put("orderNumber", o.getOrderNumber());
        map.put("status", o.getStatus().name());
        map.put("paymentMethod", o.getPaymentMethod().name());
        map.put("totalAmount", o.getTotalAmount());
        map.put("createdAt", o.getCreatedAt() != null
                ? o.getCreatedAt().toString() : "");

        // Buyer
        if (o.getBuyer() != null) {
            Map<String, Object> buyer = new HashMap<>();
            buyer.put("id", o.getBuyer().getId());
            String name = o.getBuyer().getFullName();
            if (name == null || name.isBlank()) {
                name = o.getBuyer().getFirstName()
                        + " " + o.getBuyer().getLastName();
            }
            buyer.put("fullName", name);
            map.put("buyer", buyer);
        }

        // Items
        if (o.getItems() != null) {
            List<Map<String, Object>> items = o.getItems().stream()
                    .map(item -> {
                        Map<String, Object> i = new HashMap<>();
                        i.put("id", item.getId());
                        i.put("productName", item.getProductName());
                        i.put("quantity", item.getQuantity());
                        i.put("unitPrice", item.getUnitPrice());
                        if (item.getProduct() != null) {
                            i.put("productId", item.getProduct().getId());
                            i.put("imageUrl",
                                    item.getProduct().getImageUrl() != null
                                            ? item.getProduct().getImageUrl() : "");
                            // Seller info
                            Map<String, Object> seller = new HashMap<>();
                            seller.put("id", item.getProduct().getSeller().getId());
                            String sName = item.getProduct().getSeller().getFullName();
                            if (sName == null || sName.isBlank()) {
                                sName = item.getProduct().getSeller().getFirstName()
                                        + " " + item.getProduct().getSeller().getLastName();
                            }
                            seller.put("fullName", sName);
                            i.put("seller", seller);
                        }
                        return i;
                    })
                    .collect(Collectors.toList());
            map.put("items", items);
        }

        // QR code for MEETUP
        if (o.getPaymentMethod() == Order.PaymentMethod.MEETUP) {
            qrCodeRepository.findByOrderId(o.getId())
                    .ifPresent(qr -> map.put("qrCodeUrl", qr.getQrImageUrl()));
        }

        return map;
    }
}