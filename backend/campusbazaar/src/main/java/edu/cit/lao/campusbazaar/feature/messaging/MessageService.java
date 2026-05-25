package edu.cit.lao.campusbazaar.feature.messaging;

import edu.cit.lao.campusbazaar.feature.messaging.model.Message;
import edu.cit.lao.campusbazaar.feature.notification.NotificationService;
import edu.cit.lao.campusbazaar.feature.user.UserRepository;
import edu.cit.lao.campusbazaar.feature.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public Map<String, Object> sendMessage(
            String senderEmail, Long receiverId, Long productId, String body) {

        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .productId(productId)
                .body(body)
                .build();

        Message saved = messageRepository.save(message);
        Map<String, Object> msgMap = mapMessage(saved);

        // Push via WebSocket to receiver
        messagingTemplate.convertAndSendToUser(
                receiver.getEmail(),
                "/queue/messages",
                msgMap
        );

        // Notify receiver
        String senderName = sender.getFullName() != null && !sender.getFullName().isBlank()
                ? sender.getFullName()
                : sender.getFirstName() + " " + sender.getLastName();

        notificationService.createNotification(
                receiver,
                "New message from " + senderName + ": " + body,
                "NEW_MESSAGE",
                saved.getId()
        );

        return msgMap;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getConversation(
            String userEmail, Long otherUserId, Long productId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User other = userRepository.findById(otherUserId)
                .orElseThrow(() -> new RuntimeException("Other user not found"));
        return messageRepository.findConversation(productId, user, other)
                .stream().map(this::mapMessage).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getInbox(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return messageRepository.findInbox(user.getId())
                .stream().map(this::mapMessage).collect(Collectors.toList());
    }

    @Transactional
    public void markRead(Long messageId, String userEmail) {
        Message msg = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        msg.setRead(true);
        messageRepository.save(msg);
    }

    private Map<String, Object> mapMessage(Message m) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", m.getId());
        map.put("body", m.getBody());
        map.put("productId", m.getProductId());
        map.put("read", m.isRead());
        map.put("createdAt", m.getCreatedAt() != null ? m.getCreatedAt().toString() : "");
        if (m.getSender() != null) {
            Map<String, Object> sender = new HashMap<>();
            sender.put("id", m.getSender().getId());
            String name = m.getSender().getFullName();
            if (name == null || name.isBlank())
                name = m.getSender().getFirstName() + " " + m.getSender().getLastName();
            sender.put("fullName", name);
            sender.put("email", m.getSender().getEmail());
            map.put("sender", sender);
        }
        if (m.getReceiver() != null) {
            Map<String, Object> receiver = new HashMap<>();
            receiver.put("id", m.getReceiver().getId());
            String name = m.getReceiver().getFullName();
            if (name == null || name.isBlank())
                name = m.getReceiver().getFirstName() + " " + m.getReceiver().getLastName();
            receiver.put("fullName", name);
            receiver.put("email", m.getReceiver().getEmail());
            map.put("receiver", receiver);
        }
        return map;
    }
}
