package com.tropicai.inventory.controller;

import com.tropicai.inventory.entity.InventoryItem;
import com.tropicai.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public List<InventoryItem> getAll() {
        return inventoryService.findAll();
    }

    @GetMapping("/{id}")
    public InventoryItem getById(@PathVariable Long id) {
        return inventoryService.findById(id);
    }

    @PostMapping
    public ResponseEntity<InventoryItem> create(@RequestBody InventoryItem item) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventoryService.create(item));
    }

    @PutMapping("/{id}")
    public InventoryItem update(@PathVariable Long id, @RequestBody InventoryItem item) {
        return inventoryService.update(id, item);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        inventoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
