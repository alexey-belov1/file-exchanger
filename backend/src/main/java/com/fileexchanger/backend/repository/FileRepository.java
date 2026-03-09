package com.fileexchanger.backend.repository;

import com.fileexchanger.backend.model.FileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface FileRepository extends JpaRepository<FileEntity, UUID> {
    List<FileEntity> findAllByUploaderId(UUID uploaderId);
    List<FileEntity> findAllByExpiresAtBefore(LocalDateTime time);
}
