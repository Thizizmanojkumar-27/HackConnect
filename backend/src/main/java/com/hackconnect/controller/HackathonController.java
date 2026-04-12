package com.hackconnect.controller;

import com.hackconnect.dto.HackathonDTO;
import com.hackconnect.dto.HackathonRegistrationDTO;
import com.hackconnect.model.Hackathon;
import com.hackconnect.model.HackathonRegistration;
import com.hackconnect.repository.HackathonRepository;
import com.hackconnect.repository.HackathonRegistrationRepository;
import com.hackconnect.model.User;
import com.hackconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hackathons")
public class HackathonController {

    @Autowired
    private HackathonRepository hackathonRepository;

    @Autowired
    private HackathonRegistrationRepository registrationRepository;

    @Autowired
    private UserRepository userRepository;

    // Helper method to map entities to DTOs
    private HackathonRegistrationDTO convertToDTO(HackathonRegistration reg) {
        HackathonRegistrationDTO dto = new HackathonRegistrationDTO();
        dto.setId(reg.getId());
        dto.setUserId(reg.getUser().getId());
        dto.setUserName(reg.getUser().getName());
        dto.setUserEmail(reg.getUser().getEmail());
        dto.setHackathonId(reg.getHackathon().getId());
        dto.setHackathonTitle(reg.getHackathon().getTitle());
        dto.setStatus(reg.getStatus());
        dto.setRegistrationDate(reg.getRegistrationDate());
        return dto;
    }

    // Public route: View all hackathons
    @GetMapping
    public ResponseEntity<List<Hackathon>> getAllHackathons() {
        return new ResponseEntity<>(hackathonRepository.findAll(), HttpStatus.OK);
    }

    // Public route: View details
    @GetMapping("/{id}")
    public ResponseEntity<?> getHackathonById(@PathVariable Long id) {
        Optional<Hackathon> hackathon = hackathonRepository.findById(id);
        if (hackathon.isPresent()) {
            return new ResponseEntity<>(hackathon.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Hackathon not found", HttpStatus.NOT_FOUND);
        }
    }

    // Admin only
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createHackathon(@RequestBody HackathonDTO hackathonDTO) {
        Hackathon hackathon = new Hackathon();
        hackathon.setTitle(hackathonDTO.getTitle());
        hackathon.setDescription(hackathonDTO.getDescription());
        hackathon.setStartDate(hackathonDTO.getStartDate());
        hackathon.setEndDate(hackathonDTO.getEndDate());
        hackathon.setLocation(hackathonDTO.getLocation());

        Hackathon saved = hackathonRepository.save(hackathon);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // Admin only
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateHackathon(@PathVariable Long id, @RequestBody HackathonDTO hackathonDTO) {
        Optional<Hackathon> existing = hackathonRepository.findById(id);
        if (existing.isPresent()) {
            Hackathon hackathon = existing.get();
            hackathon.setTitle(hackathonDTO.getTitle());
            hackathon.setDescription(hackathonDTO.getDescription());
            hackathon.setStartDate(hackathonDTO.getStartDate());
            hackathon.setEndDate(hackathonDTO.getEndDate());
            hackathon.setLocation(hackathonDTO.getLocation());
            return new ResponseEntity<>(hackathonRepository.save(hackathon), HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Hackathon not found", HttpStatus.NOT_FOUND);
        }
    }

    // Admin only
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteHackathon(@PathVariable Long id) {
        if (hackathonRepository.existsById(id)) {
            hackathonRepository.deleteById(id);
            return new ResponseEntity<>("Hackathon deleted", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Hackathon not found", HttpStatus.NOT_FOUND);
        }
    }

    // --- NEW: Hackathon Approval Workflow Endpoints ---

    // USER: Join a Hackathon
    @PostMapping("/{id}/join")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> joinHackathon(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(currentPrincipalName);
        Optional<Hackathon> hackathonOpt = hackathonRepository.findById(id);

        if (userOpt.isEmpty() || hackathonOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User or Hackathon not found");
        }

        User user = userOpt.get();
        Hackathon hackathon = hackathonOpt.get();

        // Check if already applied
        Optional<HackathonRegistration> existing = registrationRepository.findByUserIdAndHackathonId(user.getId(),
                hackathon.getId());
        if (existing.isPresent()) {
            return ResponseEntity.badRequest().body("Already applied to this hackathon.");
        }

        HackathonRegistration registration = new HackathonRegistration();
        registration.setUser(user);
        registration.setHackathon(hackathon);
        registration.setStatus("PENDING");

        registrationRepository.save(registration);
        return ResponseEntity.ok("Application submitted successfully. Pending Admin approval.");
    }

    // USER: Get My Registrations
    @GetMapping("/my-registrations")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getMyRegistrations() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(currentPrincipalName);

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }

        List<HackathonRegistration> registrations = registrationRepository.findByUserId(userOpt.get().getId());
        List<HackathonRegistrationDTO> dtos = registrations.stream().map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // ADMIN: Get Pending Registrations
    @GetMapping("/registrations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPendingRegistrations() {
        // Fetch all pending requests to show directly on Admin dashboard
        List<HackathonRegistration> registrations = registrationRepository.findByStatus("PENDING");
        List<HackathonRegistrationDTO> dtos = registrations.stream().map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // ADMIN: Approve/Reject Registration
    @PutMapping("/registrations/{regId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateRegistrationStatus(@PathVariable Long regId,
            @RequestBody java.util.Map<String, String> body) {
        String newStatus = body.get("status"); // Expected: "APPROVED" or "REJECTED"
        if (newStatus == null || (!newStatus.equals("APPROVED") && !newStatus.equals("REJECTED"))) {
            return ResponseEntity.badRequest().body("Invalid status.");
        }

        Optional<HackathonRegistration> regOpt = registrationRepository.findById(regId);
        if (regOpt.isPresent()) {
            HackathonRegistration registration = regOpt.get();
            registration.setStatus(newStatus);
            registrationRepository.save(registration);
            return ResponseEntity.ok("Registration " + newStatus);
        } else {
            return ResponseEntity.badRequest().body("Registration not found");
        }
    }
}
