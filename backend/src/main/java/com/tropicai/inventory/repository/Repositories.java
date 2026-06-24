package com.tropicai.inventory.repository;

import com.tropicai.inventory.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByActiveTrue();
    Optional<Product> findByNameIgnoreCase(String name);
}

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Long> {
    List<Vendor> findByActiveTrue();
}

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByActiveTrue();
}

@Repository
public interface VendorPurchaseRepository extends JpaRepository<VendorPurchase, Long> {
    List<VendorPurchase> findByPurchaseDateBetweenOrderByPurchaseDateDesc(LocalDate from, LocalDate to);

    @Query("SELECT vp FROM VendorPurchase vp WHERE vp.product.id = :productId ORDER BY vp.purchaseDate DESC")
    List<VendorPurchase> findByProductId(@Param("productId") Long productId);

    @Query("SELECT SUM(vp.quantityKg * vp.buyingPricePerKg) FROM VendorPurchase vp WHERE vp.purchaseDate BETWEEN :from AND :to")
    java.math.BigDecimal sumTotalCostBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);
}

@Repository
public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {
    List<CustomerOrder> findByOrderDateBetweenOrderByOrderDateDesc(LocalDate from, LocalDate to);
    List<CustomerOrder> findByCustomerIdOrderByOrderDateDesc(Long customerId);

    @Query("SELECT SUM(co.totalRevenue) FROM CustomerOrder co WHERE co.orderDate BETWEEN :from AND :to")
    java.math.BigDecimal sumRevenueBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT SUM(co.totalCredit) FROM CustomerOrder co WHERE co.orderDate BETWEEN :from AND :to")
    java.math.BigDecimal sumCreditBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);
}

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    @Query("SELECT SUM(oi.quantityKg) FROM OrderItem oi WHERE oi.product.id = :productId")
    java.math.BigDecimal sumQuantitySoldByProduct(@Param("productId") Long productId);
}

@Repository
public interface OtherCostRepository extends JpaRepository<OtherCost, Long> {
    List<OtherCost> findByCostDateBetweenOrderByCostDateDesc(LocalDate from, LocalDate to);

    @Query("SELECT SUM(oc.amount) FROM OtherCost oc WHERE oc.costDate BETWEEN :from AND :to")
    java.math.BigDecimal sumCostBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);
}
