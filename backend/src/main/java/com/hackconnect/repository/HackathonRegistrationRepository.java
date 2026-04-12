package com.hackconnect.repository;

import com.hackconnect.model.HackathonRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HackathonRegistrationRepository extends JpaRepository<HackathonRegistration, Long> {

    // Find a specific registration to check if a user already applied to a
    // hackathon
    Optional<HackathonRegistration> findByUserIdAndHackathonId(Long userId, Long hackathonId);

    // Get all registrations for a specific user (User Dashboard)
    List<HackathonRegistration> findByUserId(Long userId);

    // Get all registrations with a specific status (Admin Dashboard, e.g., PENDING)
    List<HackathonRegistration> findByStatus(String status);
}
