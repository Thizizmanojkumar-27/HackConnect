package com.hackconnect.controller;

import com.hackconnect.dto.AuthRequest;
import com.hackconnect.dto.AuthResponse;
import com.hackconnect.dto.RegisterRequest;
import com.hackconnect.model.Role;
import com.hackconnect.model.Admin;
import com.hackconnect.model.User;
import com.hackconnect.repository.AdminRepository;
import com.hackconnect.repository.UserRepository;
import com.hackconnect.security.JwtUtil;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return new ResponseEntity<>("Email is already taken!", HttpStatus.BAD_REQUEST);
        }

        User user = new User();
        user.setName(registerRequest.getName());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));

        user.setRole(Role.USER);

        userRepository.save(user);
        return new ResponseEntity<>("User registered successfully", HttpStatus.OK);
    }

    @PostMapping("/register-admin")
    public ResponseEntity<?> registerAdmin(@RequestBody RegisterRequest registerRequest) {
        if (adminRepository.existsByEmail(registerRequest.getEmail())) {
            return new ResponseEntity<>("Admin email is already taken!", HttpStatus.BAD_REQUEST);
        }

        Admin admin = new Admin();
        admin.setName(registerRequest.getName());
        admin.setEmail(registerRequest.getEmail());
        admin.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        admin.setRole(Role.ADMIN);

        adminRepository.save(admin);
        return new ResponseEntity<>("Admin registered successfully", HttpStatus.OK);
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody AuthRequest authRequest) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword()));

        final UserDetails userDetails = userDetailsService.loadUserByUsername(authRequest.getEmail());

        Optional<Admin> adminOpt = adminRepository.findByEmail(authRequest.getEmail());
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            final String jwt = jwtUtil.generateToken(userDetails, admin.getRole().name());
            return ResponseEntity.ok(
                    new AuthResponse(jwt, admin.getId(), admin.getEmail(), admin.getName(), admin.getRole().name()));
        }

        User user = userRepository.findByEmail(authRequest.getEmail()).get();
        final String jwt = jwtUtil.generateToken(userDetails, user.getRole().name());

        return ResponseEntity
                .ok(new AuthResponse(jwt, user.getId(), user.getEmail(), user.getName(), user.getRole().name()));
    }
}
