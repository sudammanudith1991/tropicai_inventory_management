package com.tropicai.inventory.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record LoginRequest(
        @NotBlank String username,
        @NotBlank String password) {}

public record RegisterRequest(
        @NotBlank @Size(min = 3, max = 50) String username,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 6) String password,
        @NotBlank String role) {}

public record AuthResponse(
        String token,
        String username,
        String role) {}

public record ProductRequest(
        @NotBlank String name,
        String unit,
        BigDecimal lowStockAlert) {}

public record VendorRequest(
        @NotBlank String name,
        String location,
        String phone) {}

public record CustomerRequest(
        @NotBlank String name,
        String location,
        String phone,
        String customerType) {}

public record PurchaseRequest(
        @NotNull LocalDate purchaseDate,
        @NotNull Long vendorId,
        @NotNull Long productId,
        @NotNull @Positive BigDecimal quantityKg,
        @NotNull @Positive BigDecimal buyingPricePerKg,
        BigDecimal wastageKg,
        String notes) {}

public record OrderRequest(
        @NotNull LocalDate orderDate,
        @NotNull Long customerId,
        String status,
        String notes,
        @NotEmpty List<OrderItemRequest> items) {}

public record OrderItemRequest(
        @NotNull Long productId,
        @NotNull @Positive BigDecimal quantityKg,
        @NotNull @Positive BigDecimal sellingPricePerKg,
        BigDecimal settledAmount) {}
