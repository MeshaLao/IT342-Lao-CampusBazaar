package edu.cit.lao.campusbazaar.feature.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<?> getNotifications(Authentication auth) {
        return ResponseEntity.ok(notificationService.getNotifications(auth.getName()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(Authentication auth) {
        return ResponseEntity.ok(
                Map.of("unreadCount", notificationService.getUnreadCount(auth.getName()))
        );
    }

    @PutMapping("/mark-all-read")
    public ResponseEntity<?> markAllRead(Authentication auth) {
        notificationService.markAllRead(auth.getName());
        return ResponseEntity.ok(Map.of("success", true));
    }
}