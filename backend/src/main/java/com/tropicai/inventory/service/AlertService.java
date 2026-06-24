package com.tropicai.inventory.service;

import com.tropicai.inventory.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {

    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final VendorPurchaseRepository purchaseRepository;

    // Runs every day at 7 AM
    @Scheduled(cron = "0 0 7 * * *")
    public void checkLowStock() {
        productRepository.findByActiveTrue().forEach(product -> {
            BigDecimal sold = orZero(orderItemRepository.sumQuantitySoldByProduct(product.getId()));
            BigDecimal purchased = purchaseRepository.findByProductId(product.getId()).stream()
                    .map(vp -> vp.getQuantityKg().subtract(vp.getWastageKg()))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal remaining = purchased.subtract(sold);

            if (remaining.compareTo(product.getLowStockAlert()) <= 0) {
                log.warn("LOW STOCK ALERT: {} — only {} {} remaining (threshold: {})",
                        product.getName(), remaining, product.getUnit(), product.getLowStockAlert());
                // TODO: integrate WhatsApp / email notification here
            }
        });
    }

    private BigDecimal orZero(BigDecimal val) {
        return val != null ? val : BigDecimal.ZERO;
    }
}
