package com.tropicai.inventory.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

// ─── User ────────────────────────────────────────────────────────────────────

@Entity @Table(name = "users")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true, length = 50)
    private String username;
    @Column(nullable = false, unique = true, length = 100)
    private String email;
    @Column(nullable = false)
    private String password;
    @Column(nullable = false, length = 20)
    private String role; // ADMIN, STAFF
    @Column(nullable = false)
    private Boolean active = true;
    @CreationTimestamp private LocalDateTime createdAt;
    @UpdateTimestamp  private LocalDateTime updatedAt;
}

// ─── Product ─────────────────────────────────────────────────────────────────

@Entity @Table(name = "products")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true, length = 100)
    private String name;
    @Column(nullable = false, length = 20)
    private String unit = "kg";
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal lowStockAlert = BigDecimal.valueOf(5);
    @Column(nullable = false)
    private Boolean active = true;
    @CreationTimestamp private LocalDateTime createdAt;
}

// ─── Vendor ──────────────────────────────────────────────────────────────────

@Entity @Table(name = "vendors")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
class Vendor {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true, length = 150)
    private String name;
    @Column(length = 150)
    private String location;
    @Column(length = 20)
    private String phone;
    @Column(nullable = false)
    private Boolean active = true;
    @CreationTimestamp private LocalDateTime createdAt;
}

// ─── Customer ────────────────────────────────────────────────────────────────

@Entity @Table(name = "customers")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
class Customer {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true, length = 150)
    private String name;
    @Column(length = 150)
    private String location;
    @Column(length = 20)
    private String phone;
    @Column(nullable = false, length = 20)
    private String customerType = "RETAIL"; // RETAIL, WHOLESALE
    @Column(nullable = false)
    private Boolean active = true;
    @CreationTimestamp private LocalDateTime createdAt;
}

// ─── VendorPurchase ───────────────────────────────────────────────────────────

@Entity @Table(name = "vendor_purchases")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
class VendorPurchase {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private LocalDate purchaseDate;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantityKg;
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal buyingPricePerKg;
    @Column(precision = 10, scale = 2)
    private BigDecimal wastageKg = BigDecimal.ZERO;
    private String notes;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "created_by")
    private User createdBy;
    @CreationTimestamp private LocalDateTime createdAt;

    public BigDecimal getTotalCost() {
        return quantityKg.multiply(buyingPricePerKg);
    }
}

// ─── CustomerOrder ────────────────────────────────────────────────────────────

@Entity @Table(name = "customer_orders")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
class CustomerOrder {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private LocalDate orderDate;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;
    @Column(nullable = false, length = 20)
    private String status = "PENDING"; // PENDING, PAID, CREDIT
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalRevenue = BigDecimal.ZERO;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalCredit = BigDecimal.ZERO;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal settledAmount = BigDecimal.ZERO;
    private String notes;
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "created_by")
    private User createdBy;
    @CreationTimestamp private LocalDateTime createdAt;
    @UpdateTimestamp  private LocalDateTime updatedAt;
}

// ─── OrderItem ────────────────────────────────────────────────────────────────

@Entity @Table(name = "order_items")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
class OrderItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "order_id", nullable = false)
    private CustomerOrder order;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantityKg;
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal sellingPricePerKg;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal settledAmount = BigDecimal.ZERO;

    public BigDecimal getRevenue() {
        return quantityKg.multiply(sellingPricePerKg);
    }
    public BigDecimal getCreditAmount() {
        return getRevenue().subtract(settledAmount);
    }
}

// ─── OtherCost ────────────────────────────────────────────────────────────────

@Entity @Table(name = "other_costs")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
class OtherCost {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private LocalDate costDate;
    @Column(nullable = false, length = 100)
    private String costType;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;
    private String notes;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "created_by")
    private User createdBy;
    @CreationTimestamp private LocalDateTime createdAt;
}
