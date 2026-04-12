package com.hackconnect.controller;

import com.hackconnect.dto.UserDTO;
import com.hackconnect.model.User;
import com.hackconnect.repository.UserRepository;
import com.hackconnect.repository.HackathonRegistrationRepository;
import com.hackconnect.model.HackathonRegistration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HackathonRegistrationRepository hackathonRegistrationRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public List<UserDTO> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream().map(user -> {
            UserDTO dto = new UserDTO();
            dto.setId(user.getId());
            dto.setName(user.getName());
            dto.setEmail(user.getEmail());
            dto.setSkills(user.getSkills());
            dto.setCertifications(user.getCertifications());
            dto.setGithub(user.getGithub());
            dto.setLinkedin(user.getLinkedin());
            dto.setAvailability(user.getAvailability());
            return dto;
        }).collect(Collectors.toList());
    }

    @PutMapping("/profile")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> updateProfile(@RequestBody UserDTO profileUpdate) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();

        Optional<User> optionalUser = userRepository.findByEmail(currentPrincipalName);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }

        User user = optionalUser.get();
        if (profileUpdate.getSkills() != null)
            user.setSkills(profileUpdate.getSkills());
        if (profileUpdate.getCertifications() != null)
            user.setCertifications(profileUpdate.getCertifications());
        if (profileUpdate.getGithub() != null)
            user.setGithub(profileUpdate.getGithub());
        if (profileUpdate.getLinkedin() != null)
            user.setLinkedin(profileUpdate.getLinkedin());
        if (profileUpdate.getAvailability() != null) {
            user.setAvailability(profileUpdate.getAvailability());
        }

        userRepository.save(user);
        return ResponseEntity.ok("Profile updated successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.badRequest().body("User not found");
        }
        
        List<HackathonRegistration> registrations = hackathonRegistrationRepository.findByUserId(id);
        if (!registrations.isEmpty()) {
            hackathonRegistrationRepository.deleteAll(registrations);
        }

        userRepository.deleteById(id);
        return ResponseEntity.ok("User deleted successfully");
    }
}
