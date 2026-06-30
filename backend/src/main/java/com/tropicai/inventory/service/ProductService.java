package com.tropicai.inventory.service;

import com.tropicai.inventory.entity.Product;
import com.tropicai.inventory.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<Product> findAll() {
        return productRepository.findAll();
    }

    public Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Product not found: " + id));
    }

    public Product create(Product product) {
        if (productRepository.findBySku(product.getSku()).isPresent()) {
            throw new IllegalArgumentException("SKU already exists: " + product.getSku());
        }
        return productRepository.save(product);
    }

    public Product update(Long id, Product incoming) {
        Product existing = findById(id);
        existing.setSku(incoming.getSku());
        existing.setName(incoming.getName());
        existing.setDescription(incoming.getDescription());
        existing.setCategory(incoming.getCategory());
        existing.setUnitPrice(incoming.getUnitPrice());
        existing.setActive(incoming.isActive());
        return productRepository.save(existing);
    }

    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new NoSuchElementException("Product not found: " + id);
        }
        productRepository.deleteById(id);
    }
}
