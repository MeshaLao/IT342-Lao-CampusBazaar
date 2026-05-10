package edu.cit.lao.campusbazaar.feature.order;

import edu.cit.lao.campusbazaar.feature.auth.dto.AuthResponse;
import edu.cit.lao.campusbazaar.feature.order.model.Order;
import edu.cit.lao.campusbazaar.feature.order.model.OrderItem;
import edu.cit.lao.campusbazaar.feature.order.model.QrCode;
import edu.cit.lao.campusbazaar.feature.product.ProductRepository;
import edu.cit.lao.campusbazaar.feature.product.model.Product;
import edu.cit.lao.campusbazaar.feature.user.UserRepository;
import edu.cit.lao.campusbazaar.feature.user.model.User;
import edu.cit.lao.campusbazaar.shared.config.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
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
    private final EmailService emailService;

    @Transactional
    public AuthResponse placeOrder(Long productId, Integer quantity,
                                   String paymentMethod, String buyerEmail) {
        try {
            User buyer = userRepository.findByEmail(buyerEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Product product = productRepository.findByIdWithSeller(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            if (product.getStatus() != Product.ProductStatus.ACTIVE) {
                throw new RuntimeException("Product is not available for purchase");
            }

            if (product.getStock() < quantity) {
                throw new RuntimeException("Insufficient stock. Available: " + product.getStock());
            }

            if (product.getSeller().getEmail().equals(buyerEmail)) {
                throw new RuntimeException("You cannot buy your own product");
            }

            BigDecimal total = product.getPrice().multiply(BigDecimal.valueOf(quantity));

            Order.PaymentMethod method = paymentMethod.equalsIgnoreCase("MEETUP")
                    ? Order.PaymentMethod.MEETUP
                    : Order.PaymentMethod.PAYMONGO;

            Order order = Order.builder()
                    .buyer(buyer)
                    .totalAmount(total)
                    .paymentMethod(method)
                    .status(Order.OrderStatus.PENDING)
                    .items(new ArrayList<>())
                    .build();

            Order savedOrder = orderRepository.save(order);

            OrderItem item = OrderItem.builder()
                    .order(savedOrder)
                    .product(product)
                    .productName(product.getName())
                    .quantity(quantity)
                    .unitPrice(product.getPrice())
                    .build();

            savedOrder.getItems().add(item);
            orderRepository.save(savedOrder);

            product.setStock(product.getStock() - quantity);
            productRepository.save(product);

            String qrCodeUrl = null;
            if (method == Order.PaymentMethod.MEETUP) {
                qrCodeUrl = generateQrCode(savedOrder, product, buyer);
            }

            // Get seller name safely
            String sellerName = "";
            String sellerEmail = "";
            try {
                User seller = product.getSeller();
                sellerEmail = seller.getEmail();
                sellerName = seller.getFullName();
                if (sellerName == null || sellerName.isBlank()) {
                    sellerName = seller.getFirstName() + " " + seller.getLastName();
                }
            } catch (Exception e) {
                sellerName = "Unknown";
            }

            // Get buyer name safely
            String buyerName = buyer.getFullName();
            if (buyerName == null || buyerName.isBlank()) {
                buyerName = buyer.getFirstName() + " " + buyer.getLastName();
            }

            // Send emails
            try {
                emailService.sendOrderConfirmationEmail(
                        buyer.getEmail(),
                        buyerName,
                        savedOrder.getOrderNumber(),
                        product.getName(),
                        method.name(),
                        total.doubleValue()
                );

                if (!sellerEmail.isBlank()) {
                    emailService.sendSellerNotificationEmail(
                            sellerEmail,
                            sellerName,
                            savedOrder.getOrderNumber(),
                            product.getName(),
                            buyerName,
                            method.name()
                    );
                }
            } catch (Exception e) {
                System.out.println("Email sending failed (non-critical): " + e.getMessage());
            }

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
            String qrData = String.format(
                    "ORDER:%s|PRODUCT:%s|BUYER:%s|AMOUNT:%.2f|METHOD:MEETUP",
                    order.getOrderNumber(),
                    product.getName(),
                    buyer.getFullName() != null
                            ? buyer.getFullName()
                            : buyer.getFirstName() + " " + buyer.getLastName(),
                    order.getTotalAmount()
            );

            String encoded = URLEncoder.encode(qrData, StandardCharsets.UTF_8);
            String qrImageUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + encoded;

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
    public AuthResponse updateOrderStatus(Long orderId, String status, String userEmail) {
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
        map.put("createdAt", o.getCreatedAt() != null ? o.getCreatedAt().toString() : "");

        if (o.getBuyer() != null) {
            Map<String, Object> buyer = new HashMap<>();
            buyer.put("id", o.getBuyer().getId());
            String name = o.getBuyer().getFullName();
            if (name == null || name.isBlank()) {
                name = o.getBuyer().getFirstName() + " " + o.getBuyer().getLastName();
            }
            buyer.put("fullName", name);
            map.put("buyer", buyer);
        }

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
                            i.put("imageUrl", item.getProduct().getImageUrl() != null
                                    ? item.getProduct().getImageUrl() : "");
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

        if (o.getPaymentMethod() == Order.PaymentMethod.MEETUP) {
            qrCodeRepository.findByOrderId(o.getId())
                    .ifPresent(qr -> map.put("qrCodeUrl", qr.getQrImageUrl()));
        }

        return map;
    }
}
