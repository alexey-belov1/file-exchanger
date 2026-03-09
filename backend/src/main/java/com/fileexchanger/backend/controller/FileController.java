package com.fileexchanger.backend.controller;

import com.fileexchanger.backend.dto.FileDto;
import com.fileexchanger.backend.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FileDto> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "retentionMinutes", required = false) Integer retentionMinutes,
            Authentication authentication) throws IOException {
        
        FileDto fileDto = fileService.uploadFile(file, retentionMinutes, authentication.getName());
        return ResponseEntity.ok(fileDto);
    }

    @GetMapping
    public ResponseEntity<List<FileDto>> getFiles(Authentication authentication) {
        return ResponseEntity.ok(fileService.getFiles(authentication.getName()));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<InputStreamResource> downloadFile(@PathVariable UUID id, Authentication authentication) {
        ResponseInputStream<GetObjectResponse> s3Object = fileService.downloadFile(id, authentication.getName());
        String contentType = s3Object.response().contentType();
        String originalName = fileService.getFileWithAccessCheck(id, authentication.getName()).getOriginalName();
        
        String encodedFileName = URLEncoder.encode(originalName, StandardCharsets.UTF_8).replace("+", "%20");

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encodedFileName)
                .body(new InputStreamResource(s3Object));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFile(@PathVariable UUID id, Authentication authentication) {
        fileService.deleteFile(id, authentication.getName());
        return ResponseEntity.ok().build();
    }
}
