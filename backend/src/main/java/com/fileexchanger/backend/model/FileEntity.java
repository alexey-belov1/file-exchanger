package com.fileexchanger.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "files")
@Getter
@Setter
@NoArgsConstructor
public class FileEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "original_name", nullable = false)
    private String originalName;

    @Column(name = "s3_key", nullable = false)
    private String s3Key;

    @Column(nullable = false)
    private Long size;

    @Column(name = "retention_minutes", nullable = false)
    private Integer retentionMinutes;

    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploader_id", nullable = false)
    private User uploader;

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
        if (expiresAt == null && retentionMinutes != null) {
            expiresAt = uploadedAt.plusMinutes(retentionMinutes);
        }
    }
}
