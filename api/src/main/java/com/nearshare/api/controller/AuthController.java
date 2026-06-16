package com.nearshare.api.controller;

import com.nearshare.api.entity.User;
import com.nearshare.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    // --- HELPER METHOD: SHA-256 Hashing ---
    private String hashPassword(String plainPassword) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedHash = digest.digest(plainPassword.getBytes(StandardCharsets.UTF_8));

            // Convert byte array to Hex String
            StringBuilder hexString = new StringBuilder();
            for (byte b : encodedHash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }

    // --- REGISTER API ---
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()) != null) {
            return ResponseEntity.badRequest().body("Error: Email already exists!");
        }

        // 1. Hash the password before saving
        String hashedPassword = hashPassword(user.getPassword());
        user.setPassword(hashedPassword);

        // 2. Save user
        userRepository.save(user);
        return ResponseEntity.ok("Success: User registered successfully!");
    }

    // --- LOGIN API ---
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginData) {
        // 1. Find user by email
        User user = userRepository.findByEmail(loginData.email);

        // 2. Hash the incoming password to compare with stored hash
        if (user != null) {
            String incomingPasswordHash = hashPassword(loginData.password);

            if (user.getPassword().equals(incomingPasswordHash)) {
                // Security: Remove password before sending back to frontend
                user.setPassword(null);
                return ResponseEntity.ok(user);
            }
        }

        // 3. If login fails
        return ResponseEntity.status(401).body("Invalid Email or Password");
    }

    // --- INTERNAL CLASS FOR LOGIN DATA ---
    public static class LoginRequest {
        public String email;
        public String password;
    }
}