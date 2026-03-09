package com.fileexchanger.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class UserDto {
    private UUID id;
    private String username;
    private String role;
    private LocalDateTime createdAt;
}
