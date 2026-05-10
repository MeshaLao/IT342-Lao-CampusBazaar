package edu.cit.lao.campusbazaar.feature.order;

import edu.cit.lao.campusbazaar.feature.order.model.QrCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface QrCodeRepository extends JpaRepository<QrCode, Long> {
    Optional<QrCode> findByOrderId(Long orderId);
}