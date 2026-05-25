package edu.cit.lao.campusbazaar.feature.order;

import edu.cit.lao.campusbazaar.feature.notification.NotificationService;
import edu.cit.lao.campusbazaar.feature.order.model.Order;
import edu.cit.lao.campusbazaar.feature.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/webhooks")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PayMongoWebhookController {

    private final OrderRepository orderRepository;
    private final NotificationService notificationService;

    @PostMapping("/paymongo")
    public ResponseEntity<?> handleWebhook(@RequestBody Map<String, Object> payload) {
        try {
            System.out.println("=== PAYMONGO WEBHOOK RECEIVED ===");

            Map<String, Object> data = (Map<String, Object>) payload.get("data");
            if (data == null) return ResponseEntity.ok("OK");

            Map<String, Object> attributes = (Map<String, Object>) data.get("attributes");
            if (attributes == null) return ResponseEntity.ok("OK");

            String type = (String) attributes.get("type");
            System.out.println("Webhook type: " + type);

            if (!"link.payment.paid".equals(type)) return ResponseEntity.ok("OK");

            // Navigate: data.attributes.data
            Map<String, Object> innerData = (Map<String, Object>) attributes.get("data");
            if (innerData == null) return ResponseEntity.ok("OK");

            // The link ID — e.g. "link_3594d7588c06edc009115bb2"
            String linkId = (String) innerData.get("id");
            System.out.println("PayMongo link ID from webhook: " + linkId);

            // Also try to get description to help with debugging
            Map<String, Object> innerAttributes = (Map<String, Object>) innerData.get("attributes");
            String description = innerAttributes != null ? (String) innerAttributes.get("description") : "";
            System.out.println("Description: " + description);

            if (linkId == null || linkId.isBlank()) {
                System.out.println("No link ID found in webhook");
                return ResponseEntity.ok("OK");
            }

            // Find order by PayMongo link ID
            orderRepository.findByPaymongoLinkId(linkId).ifPresentOrElse(order -> {
                System.out.println("Found order: " + order.getOrderNumber() + " status: " + order.getStatus());
                if (order.getStatus() == Order.OrderStatus.PENDING) {
                    order.setStatus(Order.OrderStatus.PAID);
                    orderRepository.save(order);
                    System.out.println("✅ Order " + order.getOrderNumber() + " marked as PAID");

                    try {
                        notificationService.createNotification(
                                order.getBuyer(),
                                "Your payment for order " + order.getOrderNumber() + " is confirmed! Check your QR code.",
                                "ORDER_STATUS",
                                order.getId()
                        );
                    } catch (Exception e) {
                        System.out.println("Notification error: " + e.getMessage());
                    }

                    try {
                        order.getItems().forEach(item -> {
                            try {
                                notificationService.createNotification(
                                        item.getProduct().getSeller(),
                                        "Payment received for order " + order.getOrderNumber() + "! Prepare for meet-up.",
                                        "ORDER_STATUS",
                                        order.getId()
                                );
                            } catch (Exception e) {
                                System.out.println("Seller notification error: " + e.getMessage());
                            }
                        });
                    } catch (Exception e) {
                        System.out.println("Seller notification error: " + e.getMessage());
                    }
                } else {
                    System.out.println("Order already in status: " + order.getStatus());
                }
            }, () -> System.out.println("❌ No order found for linkId: " + linkId));

            return ResponseEntity.ok("OK");

        } catch (Exception e) {
            System.out.println("Webhook error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok("OK");
        }
    }
}