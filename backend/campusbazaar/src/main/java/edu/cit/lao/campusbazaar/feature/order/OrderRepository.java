package edu.cit.lao.campusbazaar.feature.order;

import edu.cit.lao.campusbazaar.feature.order.model.Order;
import edu.cit.lao.campusbazaar.feature.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByBuyerOrderByCreatedAtDesc(User buyer);

    @Query("SELECT o FROM Order o JOIN o.items i " +
            "WHERE i.product.seller = :seller " +
            "ORDER BY o.createdAt DESC")
    List<Order> findBySellerOrderByCreatedAtDesc(User seller);

    @Query("SELECT DISTINCT o FROM Order o " +
            "LEFT JOIN FETCH o.buyer " +
            "LEFT JOIN FETCH o.items i " +
            "LEFT JOIN FETCH i.product p " +
            "LEFT JOIN FETCH p.seller " +
            "ORDER BY o.createdAt DESC")
    List<Order> findAllByOrderByCreatedAtDesc();

    @Query("SELECT DISTINCT o FROM Order o " +
            "LEFT JOIN FETCH o.buyer " +
            "LEFT JOIN FETCH o.items i " +
            "LEFT JOIN FETCH i.product p " +
            "LEFT JOIN FETCH p.seller " +
            "WHERE o.status = :status " +
            "ORDER BY o.createdAt DESC")
    List<Order> findByStatusOrderByCreatedAtDesc(Order.OrderStatus status);

    Optional<Order> findByOrderNumber(String orderNumber);

    // Used by webhook to find order by PayMongo link ID
    Optional<Order> findByPaymongoLinkId(String paymongoLinkId);

    long countByBuyerAndStatus(User buyer, Order.OrderStatus status);

    @Query("SELECT COUNT(o) FROM Order o JOIN o.items i WHERE i.product.seller = :seller AND o.status = :status")
    long countBySellerAndStatus(User seller, Order.OrderStatus status);
}