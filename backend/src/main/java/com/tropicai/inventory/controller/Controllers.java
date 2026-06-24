package com.tropicai.inventory.controller;

import com.tropicai.inventory.dto.*;
import com.tropicai.inventory.entity.*;
import com.tropicai.inventory.repository.*;
import com.tropicai.inventory.security.JwtUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

// ─── Auth ────────────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
class AuthController {

    private final AuthenticationManager authManager;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.username(), req.password()));
        String token = jwtUtils.generateToken(auth.getName());
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();
        return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getRole()));
    }

    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        if (userRepository.existsByUsername(req.username())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already taken"));
        }
        User user = User.builder()
                .username(req.username())
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .role(req.role())
                .build();
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User created"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(Map.of("username", user.getUsername(), "role", user.getRole(), "email", user.getEmail()));
    }
}

// ─── Products ────────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
class ProductController {

    private final ProductRepository productRepository;

    @GetMapping
    public List<Product> getAll() {
        return productRepository.findByActiveTrue();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Product create(@Valid @RequestBody ProductRequest req) {
        return productRepository.save(Product.builder()
                .name(req.name())
                .unit(req.unit() != null ? req.unit() : "kg")
                .lowStockAlert(req.lowStockAlert() != null ? req.lowStockAlert() : BigDecimal.valueOf(5))
                .build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Product update(@PathVariable Long id, @RequestBody ProductRequest req) {
        Product p = productRepository.findById(id).orElseThrow();
        if (req.name() != null) p.setName(req.name());
        if (req.lowStockAlert() != null) p.setLowStockAlert(req.lowStockAlert());
        return productRepository.save(p);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deactivate(@PathVariable Long id) {
        Product p = productRepository.findById(id).orElseThrow();
        p.setActive(false);
        productRepository.save(p);
        return ResponseEntity.ok(Map.of("message", "Product deactivated"));
    }
}

// ─── Vendors ─────────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/vendors")
@RequiredArgsConstructor
class VendorController {

    private final VendorRepository vendorRepository;

    @GetMapping
    public List<Vendor> getAll() {
        return vendorRepository.findByActiveTrue();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Vendor create(@RequestBody VendorRequest req) {
        return vendorRepository.save(Vendor.builder().name(req.name()).location(req.location()).phone(req.phone()).build());
    }
}

// ─── Customers ───────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
class CustomerController {

    private final CustomerRepository customerRepository;

    @GetMapping
    public List<Customer> getAll() {
        return customerRepository.findByActiveTrue();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Customer create(@RequestBody CustomerRequest req) {
        return customerRepository.save(Customer.builder()
                .name(req.name()).location(req.location())
                .phone(req.phone()).customerType(req.customerType() != null ? req.customerType() : "RETAIL")
                .build());
    }
}

// ─── Vendor Purchases ────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/purchases")
@RequiredArgsConstructor
class PurchaseController {

    private final VendorPurchaseRepository purchaseRepository;
    private final VendorRepository vendorRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @GetMapping
    public List<VendorPurchase> getAll(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        LocalDate start = from != null ? from : LocalDate.now().withDayOfMonth(1);
        LocalDate end   = to   != null ? to   : LocalDate.now();
        return purchaseRepository.findByPurchaseDateBetweenOrderByPurchaseDateDesc(start, end);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<?> create(@Valid @RequestBody PurchaseRequest req,
                                    @AuthenticationPrincipal UserDetails userDetails) {
        Vendor vendor   = vendorRepository.findById(req.vendorId()).orElseThrow();
        Product product = productRepository.findById(req.productId()).orElseThrow();
        User user       = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();

        VendorPurchase purchase = VendorPurchase.builder()
                .purchaseDate(req.purchaseDate())
                .vendor(vendor).product(product)
                .quantityKg(req.quantityKg())
                .buyingPricePerKg(req.buyingPricePerKg())
                .wastageKg(req.wastageKg() != null ? req.wastageKg() : BigDecimal.ZERO)
                .notes(req.notes())
                .createdBy(user)
                .build();
        return ResponseEntity.ok(purchaseRepository.save(purchase));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        purchaseRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }
}

// ─── Customer Orders ─────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
class OrderController {

    private final CustomerOrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @GetMapping
    public List<CustomerOrder> getAll(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        LocalDate start = from != null ? from : LocalDate.now().withDayOfMonth(1);
        LocalDate end   = to   != null ? to   : LocalDate.now();
        return orderRepository.findByOrderDateBetweenOrderByOrderDateDesc(start, end);
    }

    @GetMapping("/customer/{customerId}")
    public List<CustomerOrder> getByCustomer(@PathVariable Long customerId) {
        return orderRepository.findByCustomerIdOrderByOrderDateDesc(customerId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<?> create(@Valid @RequestBody OrderRequest req,
                                    @AuthenticationPrincipal UserDetails userDetails) {
        Customer customer = customerRepository.findById(req.customerId()).orElseThrow();
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();

        CustomerOrder order = CustomerOrder.builder()
                .orderDate(req.orderDate())
                .customer(customer)
                .status(req.status() != null ? req.status() : "PENDING")
                .notes(req.notes())
                .createdBy(user)
                .build();

        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalSettled = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : req.items()) {
            Product product = productRepository.findById(itemReq.productId()).orElseThrow();
            BigDecimal settled = itemReq.settledAmount() != null ? itemReq.settledAmount() : BigDecimal.ZERO;
            OrderItem item = OrderItem.builder()
                    .order(order).product(product)
                    .quantityKg(itemReq.quantityKg())
                    .sellingPricePerKg(itemReq.sellingPricePerKg())
                    .settledAmount(settled)
                    .build();
            order.getItems().add(item);
            totalRevenue = totalRevenue.add(item.getRevenue());
            totalSettled = totalSettled.add(settled);
        }

        order.setTotalRevenue(totalRevenue);
        order.setSettledAmount(totalSettled);
        order.setTotalCredit(totalRevenue.subtract(totalSettled));

        return ResponseEntity.ok(orderRepository.save(order));
    }

    @PatchMapping("/{id}/settle")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<?> settleCredit(@PathVariable Long id, @RequestBody Map<String, BigDecimal> body) {
        CustomerOrder order = orderRepository.findById(id).orElseThrow();
        BigDecimal payment = body.get("amount");
        order.setSettledAmount(order.getSettledAmount().add(payment));
        order.setTotalCredit(order.getTotalRevenue().subtract(order.getSettledAmount()));
        if (order.getTotalCredit().compareTo(BigDecimal.ZERO) <= 0) {
            order.setStatus("PAID");
        }
        return ResponseEntity.ok(orderRepository.save(order));
    }
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
class DashboardController {

    private final VendorPurchaseRepository purchaseRepository;
    private final CustomerOrderRepository orderRepository;
    private final OtherCostRepository otherCostRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;

    @GetMapping("/summary")
    public ResponseEntity<?> summary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        LocalDate start = from != null ? from : LocalDate.now().withDayOfMonth(1);
        LocalDate end   = to   != null ? to   : LocalDate.now();

        BigDecimal totalPurchaseCost = orZero(purchaseRepository.sumTotalCostBetween(start, end));
        BigDecimal totalRevenue      = orZero(orderRepository.sumRevenueBetween(start, end));
        BigDecimal totalCredit       = orZero(orderRepository.sumCreditBetween(start, end));
        BigDecimal totalOtherCosts   = orZero(otherCostRepository.sumCostBetween(start, end));
        BigDecimal receivedCash      = totalRevenue.subtract(totalCredit);
        BigDecimal grossProfit       = totalRevenue.subtract(totalPurchaseCost);
        BigDecimal netProfit         = grossProfit.subtract(totalOtherCosts);

        return ResponseEntity.ok(Map.of(
                "dateRange", Map.of("from", start, "to", end),
                "totalPurchaseCost", totalPurchaseCost,
                "totalRevenue", totalRevenue,
                "totalCredit", totalCredit,
                "receivedCash", receivedCash,
                "grossProfit", grossProfit,
                "totalOtherCosts", totalOtherCosts,
                "netProfit", netProfit
        ));
    }

    @GetMapping("/stock")
    public ResponseEntity<?> stock() {
        List<Product> products = productRepository.findByActiveTrue();
        List<Map<String, Object>> stockList = products.stream().map(p -> {
            BigDecimal sold = orZero(orderItemRepository.sumQuantitySoldByProduct(p.getId()));
            BigDecimal purchased = purchaseRepository.findByProductId(p.getId()).stream()
                    .map(vp -> vp.getQuantityKg().subtract(vp.getWastageKg()))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal remaining = purchased.subtract(sold);
            return Map.of(
                    "productId", p.getId(),
                    "productName", p.getName(),
                    "unit", p.getUnit(),
                    "remaining", remaining,
                    "lowStockAlert", p.getLowStockAlert(),
                    "isLowStock", remaining.compareTo(p.getLowStockAlert()) <= 0
            );
        }).toList();
        return ResponseEntity.ok(stockList);
    }

    private BigDecimal orZero(BigDecimal val) {
        return val != null ? val : BigDecimal.ZERO;
    }
}
