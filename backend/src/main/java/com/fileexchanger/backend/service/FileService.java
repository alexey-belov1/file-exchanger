package com.fileexchanger.backend.service;

import com.fileexchanger.backend.dto.FileDto;
import com.fileexchanger.backend.model.FileEntity;
import com.fileexchanger.backend.model.Role;
import com.fileexchanger.backend.model.User;
import com.fileexchanger.backend.repository.FileRepository;
import com.fileexchanger.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FileService {

    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    private final S3Service s3Service;

    @Transactional
    public FileDto uploadFile(MultipartFile file, Integer retentionMinutes, String username) throws IOException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String s3Key = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        
        s3Service.uploadFile(s3Key, file.getInputStream(), file.getSize(), file.getContentType());

        FileEntity fileEntity = new FileEntity();
        fileEntity.setOriginalName(file.getOriginalFilename());
        fileEntity.setS3Key(s3Key);
        fileEntity.setSize(file.getSize());
        fileEntity.setRetentionMinutes(retentionMinutes != null ? retentionMinutes : 30);
        fileEntity.setUploader(user);

        FileEntity saved = fileRepository.save(fileEntity);
        return mapToDto(saved);
    }

    public List<FileDto> getFiles(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<FileEntity> files;
        if (user.getRole() == Role.ROLE_ADMIN) {
            files = fileRepository.findAll();
        } else {
            files = fileRepository.findAllByUploaderId(user.getId());
        }
        
        return files.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public ResponseInputStream<GetObjectResponse> downloadFile(UUID id, String username) {
        FileEntity file = getFileWithAccessCheck(id, username);
        return s3Service.downloadFile(file.getS3Key());
    }

    @Transactional
    public void deleteFile(UUID id, String username) {
        FileEntity file = getFileWithAccessCheck(id, username);
        s3Service.deleteFile(file.getS3Key());
        fileRepository.delete(file);
    }

    public FileEntity getFileWithAccessCheck(UUID id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FileEntity file = fileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found"));

        if (user.getRole() != Role.ROLE_ADMIN && !file.getUploader().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        return file;
    }

    private FileDto mapToDto(FileEntity entity) {
        FileDto dto = new FileDto();
        dto.setId(entity.getId());
        dto.setOriginalName(entity.getOriginalName());
        dto.setSize(entity.getSize());
        dto.setRetentionMinutes(entity.getRetentionMinutes());
        dto.setUploadedAt(entity.getUploadedAt());
        dto.setExpiresAt(entity.getExpiresAt());
        dto.setUploaderUsername(entity.getUploader().getUsername());
        return dto;
    }
}
