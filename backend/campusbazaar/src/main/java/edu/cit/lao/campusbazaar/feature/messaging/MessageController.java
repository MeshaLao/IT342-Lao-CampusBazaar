package edu.cit.lao.campusbazaar.feature.messaging;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@RequestMapping("/api/v1/messages")
public class MessageController {

    private final MessageService messageService;

    @PostMapping
    public ResponseEntity<?> sendMessage(
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        Long receiverId = Long.valueOf(body.get("receiverId").toString());
        Long productId = Long.valueOf(body.get("productId").toString());
        String msgBody = body.get("body").toString();
        return ResponseEntity.ok(
            messageService.sendMessage(auth.getName(), receiverId, productId, msgBody));
    }

    @GetMapping("/conversation")
    public ResponseEntity<?> getConversation(
            @RequestParam Long otherUserId,
            @RequestParam Long productId,
            Authentication auth) {
        return ResponseEntity.ok(
            messageService.getConversation(auth.getName(), otherUserId, productId));
    }

    @GetMapping("/inbox")
    public ResponseEntity<?> getInbox(Authentication auth) {
        return ResponseEntity.ok(messageService.getInbox(auth.getName()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markRead(
            @PathVariable Long id, Authentication auth) {
        messageService.markRead(id, auth.getName());
        return ResponseEntity.ok(Map.of("success", true));
    }
}
