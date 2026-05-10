package edu.cit.lao.campusbazaar.feature.order;

import edu.cit.lao.campusbazaar.feature.order.model.Order;
import edu.cit.lao.campusbazaar.feature.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByBuyerOrderByCreatedAtDesc(User buyer);

    @Query("SELECT o FROM Order o JOIN o.items i " +
            "WHERE i.product.seller = :seller " +
            "ORDER BY o.createdAt DESC")
    List<Order> findBySellerOrderByCreatedAtDesc(User seller);
}