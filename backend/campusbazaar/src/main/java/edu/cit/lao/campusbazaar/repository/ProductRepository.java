package edu.cit.lao.campusbazaar.repository;

import edu.cit.lao.campusbazaar.model.Product;
import edu.cit.lao.campusbazaar.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p JOIN FETCH p.seller WHERE p.status = :status")
    List<Product> findByStatus(@Param("status") Product.ProductStatus status);

    @Query("SELECT p FROM Product p JOIN FETCH p.seller WHERE p.seller = :seller")
    List<Product> findBySeller(@Param("seller") User seller);

    @Query("SELECT p FROM Product p JOIN FETCH p.seller " +
            "WHERE p.status = :status AND LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Product> findByStatusAndNameContainingIgnoreCase(
            @Param("status") Product.ProductStatus status,
            @Param("name") String name);

    @Query("SELECT p FROM Product p JOIN FETCH p.seller WHERE p.id = :id")
    Optional<Product> findByIdWithSeller(@Param("id") Long id);

    @Query("SELECT p FROM Product p JOIN FETCH p.seller")
    List<Product> findAllWithSeller();
}