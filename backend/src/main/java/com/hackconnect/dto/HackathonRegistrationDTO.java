package com.hackconnect.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class HackathonRegistrationDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private Long hackathonId;
    private String hackathonTitle;
    private String status;
    private LocalDateTime registrationDate;
}
