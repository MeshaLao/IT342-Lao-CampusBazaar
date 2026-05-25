package edu.cit.lao.campusbazaar.feature.messaging;

import edu.cit.lao.campusbazaar.feature.messaging.model.Message;
import edu.cit.lao.campusbazaar.feature.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("""
        SELECT m FROM Message m
        WHERE m.productId = :productId
        AND ((m.sender = :user1 AND m.receiver = :user2)
          OR (m.sender = :user2 AND m.receiver = :user1))
        ORDER BY m.createdAt ASC
    """)
    List<Message> findConversation(
        @Param("productId") Long productId,
        @Param("user1") User user1,
        @Param("user2") User user2
    );

    @Query(value = """
        SELECT * FROM messages m
        WHERE (m.sender_id = :userId OR m.receiver_id = :userId)
        AND m.id IN (
            SELECT MAX(m2.id) FROM messages m2
            WHERE m2.sender_id = :userId OR m2.receiver_id = :userId
            GROUP BY m2.product_id,
                LEAST(m2.sender_id, m2.receiver_id),
                GREATEST(m2.sender_id, m2.receiver_id)
        )
        ORDER BY m.created_at DESC
    """, nativeQuery = true)
    List<Message> findInbox(@Param("userId") Long userId);

    long countByReceiverAndReadFalse(User receiver);
}
