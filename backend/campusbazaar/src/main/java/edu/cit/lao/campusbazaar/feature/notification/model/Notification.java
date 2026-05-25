package edu.cit.lao.campusbazaar.feature.notification.model;

import edu.cit.lao.campusbazaar.feature.user.model.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private String type; // ORDER_PLACED, ORDER_STATUS, NEW_MESSAGE

    @Column(name = "is_read")
    @Builder.Default
    private boolean read = false;

    @Column(name = "reference_id")
    private Long referenceId; // orderId or messageId

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}