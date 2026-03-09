package com.fileexchanger.backend.service;

import com.fileexchanger.backend.model.FileEntity;
import com.fileexchanger.backend.repository.FileRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FileCleanupService {

    private static final Logger logger = LoggerFactory.getLogger(FileCleanupService.class);

    private final FileRepository fileRepository;
    private final S3Service s3Service;

    @Scheduled(fixedRate = 60000) // Every minute
    @Transactional
    public void cleanupExpiredFiles() {
        LocalDateTime now = LocalDateTime.now();
        List<FileEntity> expiredFiles = fileRepository.findAllByExpiresAtBefore(now);

        if (!expiredFiles.isEmpty()) {
            logger.info("Found {} expired files to clean up.", expiredFiles.size());

            for (FileEntity file : expiredFiles) {
                try {
                    s3Service.deleteFile(file.getS3Key());
                    fileRepository.delete(file);
                    logger.info("Deleted expired file: {} (ID: {})", file.getOriginalName(), file.getId());
                } catch (Exception e) {
                    logger.error("Failed to delete expired file {}: {}", file.getId(), e.getMessage());
                }
            }
        }
    }
}
