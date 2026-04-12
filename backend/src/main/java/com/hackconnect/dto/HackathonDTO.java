package com.hackconnect.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class HackathonDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private String location;
}
