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

    Optional<Order> findByOrderNumber(String orderNumber);

    long countByBuyerAndStatus(User buyer, Order.OrderStatus status);

    @Query("SELECT COUNT(o) FROM Order o JOIN o.items i WHERE i.product.seller = :seller AND o.status = :status")
    long countBySellerAndStatus(User seller, Order.OrderStatus status);
}