package com.tropicai.inventory.service;

import com.tropicai.inventory.entity.Order;
import com.tropicai.inventory.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

    public List<Order> findAll() {
        return orderRepository.findAll();
    }

    public Order findById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Order not found: " + id));
    }

    public Order create(Order order) {
        if (orderRepository.findByOrderNumber(order.getOrderNumber()).isPresent()) {
            throw new IllegalArgumentException("Order number already exists: " + order.getOrderNumber());
        }
        return orderRepository.save(order);
    }

    public Order update(Long id, Order incoming) {
        Order existing = findById(id);
        existing.setOrderNumber(incoming.getOrderNumber());
        existing.setCustomerName(incoming.getCustomerName());
        existing.setCustomerEmail(incoming.getCustomerEmail());
        existing.setStatus(incoming.getStatus());
        existing.setTotalAmount(incoming.getTotalAmount());
        existing.setNotes(incoming.getNotes());
        return orderRepository.save(existing);
    }

    public void delete(Long id) {
        if (!orderRepository.existsById(id)) {
            throw new NoSuchElementException("Order not found: " + id);
        }
        orderRepository.deleteById(id);
    }
}
