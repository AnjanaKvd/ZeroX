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
            System.out.println("Image storage location: " + this.fileStorageLocation);
        } catch (IOException ex) {
            throw new FileStorageException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public String storeImage(MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                System.out.println("File is null or empty");
                return null;
            }

            // Validate file type
            String contentType = file.getContentType();
            System.out.println("File content type: " + contentType);
            if (contentType == null || !isValidImageType(contentType)) {
                System.out.println("Invalid file type: " + contentType);
                throw new FileStorageException("Invalid file type. Only JPG, PNG and WebP are allowed.");
            }

            // Create safe filename
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            System.out.println("Original filename: " + originalFilename);
            if (originalFilename.contains("..")) {
                throw new FileStorageException("Invalid file path sequence in filename: " + originalFilename);
            }

            // Generate unique filename with original extension
            String extension = "";
            if (originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String newFileName = UUID.randomUUID().toString() + extension;
            System.out.println("New filename: " + newFileName);

            // Save file
            Path targetLocation = this.fileStorageLocation.resolve(newFileName);
            System.out.println("Saving file to: " + targetLocation);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Return URL path with the correct format
            String imageUrl = "/api/images/" + newFileName;
            System.out.println("Returning image URL: " + imageUrl);
            return imageUrl;
        } catch (IOException ex) {
            ex.printStackTrace();
            throw new FileStorageException("Could not store file", ex);
        }
    }

    public void deleteImage(String imageUrl) {
        System.out.println("Attempting to delete image: " + imageUrl);
        
        if (imageUrl != null) {
            String fileName;
            if (imageUrl.startsWith("/uploads/")) {
                fileName = imageUrl.substring("/uploads/".length());
                System.out.println("Extracted filename from /uploads/ path: " + fileName);
            } else if (imageUrl.startsWith("/api/images/")) {
                // Handle the new URL format
                fileName = imageUrl.substring("/api/images/".length());
                System.out.println("Extracted filename from /api/images/ path: " + fileName);
            } else {
                // Assume it's just a filename
                fileName = imageUrl;
                System.out.println("Using input as filename directly: " + fileName);
            }
            
            try {
                Path targetLocation = this.fileStorageLocation.resolve(fileName);
                System.out.println("Attempting to delete file at: " + targetLocation);
                boolean deleted = Files.deleteIfExists(targetLocation);
                System.out.println("File deletion result: " + (deleted ? "Success" : "File not found"));
            } catch (IOException ex) {
                System.err.println("Error deleting file: " + ex.getMessage());
                ex.printStackTrace();
                throw new FileStorageException("Could not delete file", ex);
            }
        } else {
            System.out.println("No image URL provided for deletion");
        }
    }

    private boolean isValidImageType(String contentType) {
        return contentType.equals("image/jpeg") ||
               contentType.equals("image/png") ||
               contentType.equals("image/webp");
    }
}

