package edu.cit.lao.campusbazaar.feature.notification;

import edu.cit.lao.campusbazaar.feature.notification.model.Notification;
import edu.cit.lao.campusbazaar.feature.user.UserRepository;
import edu.cit.lao.campusbazaar.feature.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public void createNotification(User user, String message, String type, Long referenceId) {
        Notification n = Notification.builder()
                .user(user)
                .message(message)
                .type(type)
                .referenceId(referenceId)
                .build();
        notificationRepository.save(n);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getNotifications(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Notification> notifications = notificationRepository
                .findByUserOrderByCreatedAtDesc(user);
        long unreadCount = notificationRepository.countByUserAndReadFalse(user);

        List<Map<String, Object>> list = notifications.stream().map(n -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", n.getId());
            map.put("message", n.getMessage());
            map.put("type", n.getType());
            map.put("read", n.isRead());
            map.put("referenceId", n.getReferenceId());
            map.put("createdAt", n.getCreatedAt().toString());
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("notifications", list);
        response.put("unreadCount", unreadCount);
        return response;
    }

    @Transactional
    public void markAllRead(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        notificationRepository.markAllReadByUser(user);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.countByUserAndReadFalse(user);
    }
}