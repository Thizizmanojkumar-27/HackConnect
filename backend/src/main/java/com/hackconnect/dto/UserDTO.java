package com.hackconnect.dto;

import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private String skills;
    private String certifications;
    private String github;
    private String linkedin;
    private String availability;
}
