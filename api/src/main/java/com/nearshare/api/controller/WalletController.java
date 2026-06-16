package com.nearshare.api.controller;

import com.nearshare.api.entity.User;
import com.nearshare.api.entity.WalletTransaction;
import com.nearshare.api.repository.UserRepository;
import com.nearshare.api.repository.WalletTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@CrossOrigin(origins = "http://localhost:5173")
public class WalletController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletTransactionRepository transactionRepository;

    // 1. Get Wallet Balance
    @GetMapping("/{userId}")
    public ResponseEntity<?> getWalletBalance(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("User not found");
        return ResponseEntity.ok(Map.of("balance", user.getWalletBalance()));
    }

    // 2. Add Money
    @PostMapping("/add")
    public ResponseEntity<?> addMoney(@RequestBody Map<String, Object> payload) {
        Long userId = ((Number) payload.get("userId")).longValue();
        Double amount = ((Number) payload.get("amount")).doubleValue();

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("User not found");

        user.setWalletBalance(user.getWalletBalance() + amount);
        userRepository.save(user);

        // Log Transaction
        WalletTransaction txn = new WalletTransaction(userId, amount, "CREDIT", "Wallet Top-up");
        transactionRepository.save(txn);

        return ResponseEntity.ok(Map.of("message", "Money added", "newBalance", user.getWalletBalance()));
    }

    // ✅ 3. Get Transaction History (THIS WAS MISSING)
    @GetMapping("/history/{userId}")
    public List<WalletTransaction> getHistory(@PathVariable Long userId) {
        return transactionRepository.findByUserIdOrderByTimestampDesc(userId);
    }
}