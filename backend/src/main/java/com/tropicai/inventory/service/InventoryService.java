package com.tropicai.inventory.service;

import com.tropicai.inventory.entity.InventoryItem;
import com.tropicai.inventory.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    public List<InventoryItem> findAll() {
        return inventoryRepository.findAll();
    }

    public InventoryItem findById(Long id) {
        return inventoryRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Inventory item not found: " + id));
    }

    public InventoryItem create(InventoryItem item) {
        if (inventoryRepository.existsBySku(item.getSku())) {
            throw new IllegalArgumentException("SKU already exists: " + item.getSku());
        }
        return inventoryRepository.save(item);
    }

    public InventoryItem update(Long id, InventoryItem incoming) {
        InventoryItem existing = findById(id);
        existing.setSku(incoming.getSku());
        existing.setName(incoming.getName());
        existing.setDescription(incoming.getDescription());
        existing.setQuantity(incoming.getQuantity());
        existing.setUnitPrice(incoming.getUnitPrice());
        existing.setReorderLevel(incoming.getReorderLevel());
        return inventoryRepository.save(existing);
    }

    public void delete(Long id) {
        if (!inventoryRepository.existsById(id)) {
            throw new NoSuchElementException("Inventory item not found: " + id);
        }
        inventoryRepository.deleteById(id);
    }
}
