package com.nearshare.api.controller;

import com.nearshare.api.entity.RentalRequest;
import com.nearshare.api.entity.User;
import com.nearshare.api.repository.RentalRequestRepository;
import com.nearshare.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "*")
public class RequestController {

    @Autowired
    private RentalRequestRepository requestRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createRequest(@RequestBody RentalRequest request) {
        request.setStatus("PENDING");
        request.setPaymentStatus("UNPAID");
        RentalRequest savedRequest = requestRepository.save(request);
        return ResponseEntity.ok(savedRequest);
    }

    @GetMapping("/borrower/{userId}")
    public List<RentalRequest> getMyBorrows(@PathVariable Long userId) {
        return requestRepository.findByUserId(userId);
    }

    @GetMapping("/lender/{lenderId}")
    public List<RentalRequest> getRequestsForLender(@PathVariable Long lenderId) {
        return requestRepository.findByLenderId(lenderId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RentalRequest> getRequestById(@PathVariable Long id) {
        return requestRepository.findById(id).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<?> processPayment(
            @PathVariable Long id,
            @RequestParam Long userId,
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam Double totalAmount) {

        return requestRepository.findById(id).map(req -> {
            req.setPaymentStatus("PAID");
            req.setStartDate(LocalDate.parse(startDate));
            req.setReturnDate(LocalDate.parse(endDate));
            req.setAmount(totalAmount);
            req.setHandoverToken(String.valueOf((int)(Math.random() * 9000) + 1000));
            requestRepository.save(req);
            return ResponseEntity.ok("Payment Successful!");
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- PHASE 2: DISPUTE & REFUND LOGIC ---

    @PutMapping("/{id}/dispute")
    public ResponseEntity<?> markAsDisputed(@PathVariable Long id) {
        return requestRepository.findById(id).map(req -> {
            if (!"PAID".equals(req.getPaymentStatus()))
                return ResponseEntity.badRequest().body("Only paid transactions can be disputed.");

            req.setPaymentStatus("DISPUTED");
            requestRepository.save(req);
            return ResponseEntity.ok("Dispute raised. Funds are frozen.");
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/refund")
    public ResponseEntity<?> processRefund(@PathVariable Long id) {
        return requestRepository.findById(id).map(req -> {
            if (!"DISPUTED".equals(req.getPaymentStatus()))
                return ResponseEntity.badRequest().body("Only disputed requests can be refunded.");

            // Calculate money split
            double total = req.getAmount();
            double refundToBorrower = total * 0.95;

            // Update Borrower Wallet
            userRepository.findById(req.getUserId()).ifPresent(user -> {
                user.setWalletBalance(user.getWalletBalance() + refundToBorrower);
                userRepository.save(user);
            });

            // Mark as refunded
            req.setPaymentStatus("REFUNDED");
            requestRepository.save(req);

            return ResponseEntity.ok("Refund processed successfully: " + refundToBorrower + " credited to user wallet.");
        }).orElse(ResponseEntity.notFound().build());
    }
}