package com.busbooker.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret) {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret
        ));
    }

    /**
     * Upload single file to Cloudinary
     */
    public String uploadFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        try {
            // Convert MultipartFile to byte array
            byte[] fileBytes = file.getBytes();
            String originalFilename = file.getOriginalFilename();
            String fileName = originalFilename != null ? 
                    originalFilename.split("\\.")[0] : "file_" + System.currentTimeMillis();

            // Upload to Cloudinary
            Map<String, Object> uploadResult = cloudinary.uploader().upload(
                    fileBytes,
                    ObjectUtils.asMap(
                            "public_id", fileName,
                            "resource_type", "auto"
                    )
            );

            return (String) uploadResult.get("url");
        } catch (Exception ex) {
            log.error("Error uploading file to Cloudinary", ex);
            throw new IOException("Error uploading file: " + ex.getMessage(), ex);
        }
    }

    /**
     * Upload multiple files to Cloudinary
     */
    public List<String> uploadFiles(MultipartFile[] files) throws IOException {
        List<String> urls = new ArrayList<>();

        if (files == null || files.length == 0) {
            return urls;
        }

        for (MultipartFile file : files) {
            if (file != null && !file.isEmpty()) {
                String url = uploadFile(file);
                urls.add(url);
            }
        }

        return urls;
    }

    /**
     * Upload avatar (single file with auto resource type)
     */
    public String uploadAvatar(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        try {
            byte[] fileBytes = file.getBytes();

            Map<String, Object> uploadResult = cloudinary.uploader().upload(
                    fileBytes,
                    ObjectUtils.asMap("resource_type", "auto")
            );

            return (String) uploadResult.get("url");
        } catch (Exception ex) {
            log.error("Error uploading avatar to Cloudinary", ex);
            throw new IOException("Error uploading avatar: " + ex.getMessage(), ex);
        }
    }
}

 