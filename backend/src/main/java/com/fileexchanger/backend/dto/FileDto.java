package com.fileexchanger.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class FileDto {
    private UUID id;
    private String originalName;
    private Long size;
    private Integer retentionMinutes;
    private LocalDateTime uploadedAt;
    private LocalDateTime expiresAt;
    private String uploaderUsername;
}
