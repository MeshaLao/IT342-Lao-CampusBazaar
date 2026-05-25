package edu.cit.lao.campusbazaar.feature.order;

import edu.cit.lao.campusbazaar.feature.auth.dto.AuthResponse;
import edu.cit.lao.campusbazaar.feature.notification.NotificationService;
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
    private final PayMongoService payMongoService;
    private final NotificationService notificationService;

    @Transactional
    public AuthResponse placeOrder(Long productId, Integer quantity,
                                   String paymentMethod,
                                   String meetupLocation, String meetupTime,
                                   String buyerEmail) {
        try {
            User buyer = userRepository.findByEmail(buyerEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Product product = productRepository.findByIdWithSeller(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            if (product.getStatus() != Product.ProductStatus.ACTIVE)
                throw new RuntimeException("Product is not available for purchase");

            if (product.getStock() < quantity)
                throw new RuntimeException("Insufficient stock. Available: " + product.getStock());

            if (product.getSeller().getEmail().equals(buyerEmail))
                throw new RuntimeException("You cannot buy your own product");

            BigDecimal total = product.getPrice().multiply(BigDecimal.valueOf(quantity));

            Order.PaymentMethod method = paymentMethod.equalsIgnoreCase("MEETUP")
                    ? Order.PaymentMethod.MEETUP
                    : Order.PaymentMethod.PAYMONGO;

            Order order = Order.builder()
                    .buyer(buyer)
                    .totalAmount(total)
                    .paymentMethod(method)
                    .status(Order.OrderStatus.PENDING)
                    .meetupLocation(meetupLocation)
                    .meetupTime(meetupTime)
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

            // ── Generate QR for BOTH payment methods ──────────────────────────
            String qrCodeUrl = generateQrCode(savedOrder, product, buyer);

            String checkoutUrl = null;

            if (method == Order.PaymentMethod.PAYMONGO) {
                try {
                    Map paymongoResponse = payMongoService.createPaymentLink(
                            savedOrder.getOrderNumber(),
                            total.doubleValue(),
                            "Campus Bazaar - " + product.getName()
                    );
                    Map data = (Map) paymongoResponse.get("data");
                    Map attributes = (Map) data.get("attributes");
                    String linkId = (String) data.get("id");
                    checkoutUrl = (String) attributes.get("checkout_url");

                    savedOrder.setPaymongoLinkId(linkId);
                    savedOrder.setPaymongoCheckoutUrl(checkoutUrl);
                    orderRepository.save(savedOrder);
                } catch (Exception e) {
                    System.out.println("PayMongo error: " + e.getMessage());
                    throw new RuntimeException("Failed to create payment link. Please try again.");
                }
            }

            // ── Seller info ───────────────────────────────────────────────────
            String sellerName = "";
            String sellerEmail = "";
            try {
                User seller = product.getSeller();
                sellerEmail = seller.getEmail();
                sellerName = seller.getFullName();
                if (sellerName == null || sellerName.isBlank())
                    sellerName = seller.getFirstName() + " " + seller.getLastName();
            } catch (Exception e) {
                sellerName = "Unknown";
            }

            String buyerName = buyer.getFullName();
            if (buyerName == null || buyerName.isBlank())
                buyerName = buyer.getFirstName() + " " + buyer.getLastName();

            // ── Notify seller ─────────────────────────────────────────────────
            try {
                notificationService.createNotification(
                        product.getSeller(),
                        "New order for \"" + product.getName() + "\" from " + buyerName,
                        "ORDER_PLACED",
                        savedOrder.getId()
                );
            } catch (Exception e) {
                System.out.println("Notification error (non-critical): " + e.getMessage());
            }

            // ── Send emails ───────────────────────────────────────────────────
            try {
                emailService.sendOrderConfirmationEmail(
                        buyer.getEmail(), buyerName,
                        savedOrder.getOrderNumber(), product.getName(),
                        method.name(), total.doubleValue()
                );
                if (!sellerEmail.isBlank()) {
                    emailService.sendSellerNotificationEmail(
                            sellerEmail, sellerName,
                            savedOrder.getOrderNumber(), product.getName(),
                            buyerName, method.name()
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
            response.put("qrCodeUrl", qrCodeUrl);           // always returned now
            response.put("checkoutUrl", checkoutUrl);
            response.put("productName", product.getName());
            response.put("quantity", quantity);
            response.put("sellerName", sellerName);
            response.put("meetupLocation", savedOrder.getMeetupLocation());
            response.put("meetupTime", savedOrder.getMeetupTime());

            return AuthResponse.builder()
                    .success(true)
                    .data(response)
                    .timestamp(LocalDateTime.now().toString())
                    .build();

        } catch (RuntimeException e) {
            System.out.println("=== ORDER ERROR: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    private String generateQrCode(Order order, Product product, User buyer) {
        try {
            String buyerName = buyer.getFullName() != null && !buyer.getFullName().isBlank()
                    ? buyer.getFullName()
                    : buyer.getFirstName() + " " + buyer.getLastName();

            String qrData = String.format(
                    "ORDER:%s|PRODUCT:%s|BUYER:%s|AMOUNT:%.2f|METHOD:%s",
                    order.getOrderNumber(),
                    product.getName(),
                    buyerName,
                    order.getTotalAmount(),
                    order.getPaymentMethod().name()
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

    @Transactional(readOnly = true)
    public AuthResponse getMyOrders(String buyerEmail) {
        User buyer = userRepository.findByEmail(buyerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Order> orders = orderRepository.findByBuyerOrderByCreatedAtDesc(buyer);
        List<Map<String, Object>> orderList = orders.stream()
                .map(this::mapOrder).collect(Collectors.toList());
        Map<String, Object> response = new HashMap<>();
        response.put("orders", orderList);
        response.put("total", orderList.size());
        return AuthResponse.builder()
                .success(true).data(response)
                .timestamp(LocalDateTime.now().toString()).build();
    }

    @Transactional(readOnly = true)
    public AuthResponse getSellerOrders(String sellerEmail) {
        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Order> orders = orderRepository.findBySellerOrderByCreatedAtDesc(seller);
        List<Map<String, Object>> orderList = orders.stream()
                .map(this::mapOrder).collect(Collectors.toList());
        Map<String, Object> response = new HashMap<>();
        response.put("orders", orderList);
        response.put("total", orderList.size());
        return AuthResponse.builder()
                .success(true).data(response)
                .timestamp(LocalDateTime.now().toString()).build();
    }

    @Transactional
    public AuthResponse updateOrderStatus(Long orderId, String status, String userEmail) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(Order.OrderStatus.valueOf(status));
        orderRepository.save(order);

        try {
            notificationService.createNotification(
                    order.getBuyer(),
                    "Your order " + order.getOrderNumber() + " is now " + status,
                    "ORDER_STATUS", order.getId()
            );
        } catch (Exception e) {
            System.out.println("Notification error (non-critical): " + e.getMessage());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", order.getId());
        response.put("status", order.getStatus().name());
        return AuthResponse.builder()
                .success(true).data(response)
                .timestamp(LocalDateTime.now().toString()).build();
    }

    @Transactional(readOnly = true)
    public AuthResponse getOrderById(Long orderId, String userEmail) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        Map<String, Object> response = new HashMap<>();
        response.put("order", mapOrder(order));
        return AuthResponse.builder()
                .success(true).data(response)
                .timestamp(LocalDateTime.now().toString()).build();
    }

    // ── Get order by order number (for PaymentSuccess page) ──────────────────
    @Transactional(readOnly = true)
    public AuthResponse getOrderByNumber(String orderNumber, String userEmail) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        Map<String, Object> response = new HashMap<>();
        response.put("order", mapOrder(order));
        return AuthResponse.builder()
                .success(true).data(response)
                .timestamp(LocalDateTime.now().toString()).build();
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
                            if (sName == null || sName.isBlank())
                                sName = item.getProduct().getSeller().getFirstName()
                                        + " " + item.getProduct().getSeller().getLastName();
                            seller.put("fullName", sName);
                            i.put("seller", seller);
                        }
                        return i;
                    }).collect(Collectors.toList());
            map.put("items", items);
        }

        // QR code for ALL orders (both MEETUP and PAYMONGO)
        qrCodeRepository.findByOrderId(o.getId())
                .ifPresent(qr -> map.put("qrCodeUrl", qr.getQrImageUrl()));

        if (o.getPaymongoCheckoutUrl() != null)
            map.put("checkoutUrl", o.getPaymongoCheckoutUrl());

        return map;
    }

    @Transactional
    public AuthResponse completeOrderByQr(String qrData, String sellerEmail) {
        if (qrData == null || !qrData.contains("ORDER:"))
            throw new RuntimeException("Invalid QR code");

        String parsedOrderNumber = null;
        for (String part : qrData.split("\\|")) {
            if (part.startsWith("ORDER:")) {
                parsedOrderNumber = part.substring("ORDER:".length()).trim();
                break;
            }
        }

        if (parsedOrderNumber == null)
            throw new RuntimeException("Could not read order number from QR");

        final String orderNumber = parsedOrderNumber;
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderNumber));

        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isSeller = order.getItems().stream()
                .anyMatch(item -> item.getProduct().getSeller().getId().equals(seller.getId()));

        if (!isSeller)
            throw new RuntimeException("You are not the seller of this order");

        // ── Allow QR scan for both MEETUP (PENDING) and PAYMONGO (PAID) ──────
        if (order.getPaymentMethod() == Order.PaymentMethod.MEETUP
                && order.getStatus() != Order.OrderStatus.PENDING)
            throw new RuntimeException("Order is already " + order.getStatus().name());

        if (order.getPaymentMethod() == Order.PaymentMethod.PAYMONGO
                && order.getStatus() != Order.OrderStatus.PAID)
            throw new RuntimeException("Order is not yet paid. Cannot complete.");

        order.setStatus(Order.OrderStatus.COMPLETED);
        orderRepository.save(order);

        qrCodeRepository.findByOrderId(order.getId()).ifPresent(qr -> {
            qr.setScannedAt(LocalDateTime.now());
            qrCodeRepository.save(qr);
        });

        try {
            notificationService.createNotification(order.getBuyer(),
                    "Your order " + order.getOrderNumber() + " has been completed!",
                    "ORDER_STATUS", order.getId());
            notificationService.createNotification(seller,
                    "You completed order " + order.getOrderNumber() + " via QR scan!",
                    "ORDER_STATUS", order.getId());
        } catch (Exception e) {
            System.out.println("Notification error (non-critical): " + e.getMessage());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", order.getId());
        response.put("orderNumber", order.getOrderNumber());
        response.put("status", "COMPLETED");
        response.put("message", "Order completed successfully!");

        return AuthResponse.builder()
                .success(true).data(response)
                .timestamp(LocalDateTime.now().toString()).build();
    }
}