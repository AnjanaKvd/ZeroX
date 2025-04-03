package com.zerox.csm.service;

import com.zerox.csm.exception.FileStorageException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class ImageStorageService {

    private final Path fileStorageLocation;

    public ImageStorageService(@Value("${app.upload.dir:uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException ex) {
            throw new FileStorageException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public String storeImage(MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return null;
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !isValidImageType(contentType)) {
                throw new FileStorageException("Invalid file type. Only JPG, PNG and WebP are allowed.");
            }

            // Create safe filename
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            if (originalFilename.contains("..")) {
                throw new FileStorageException("Invalid file path sequence in filename: " + originalFilename);
            }

            // Generate unique filename with original extension
            String extension = "";
            if (originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String newFileName = UUID.randomUUID().toString() + extension;

            // Save file
            Path targetLocation = this.fileStorageLocation.resolve(newFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Return URL path
            return "/uploads/" + newFileName;
        } catch (IOException ex) {
            throw new FileStorageException("Could not store file", ex);
        }
    }

    public void deleteImage(String imageUrl) {
        if (imageUrl != null && imageUrl.startsWith("/uploads/")) {
            try {
                String fileName = imageUrl.substring("/uploads/".length());
                Path targetLocation = this.fileStorageLocation.resolve(fileName);
                Files.deleteIfExists(targetLocation);
            } catch (IOException ex) {
                throw new FileStorageException("Could not delete file", ex);
            }
        }
    }

    private boolean isValidImageType(String contentType) {
        return contentType.equals("image/jpeg") ||
               contentType.equals("image/png") ||
               contentType.equals("image/webp");
    }
}

