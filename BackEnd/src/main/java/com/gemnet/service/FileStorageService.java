package com.gemnet.service;

import org.opencv.core.Mat;
import org.opencv.imgcodecs.Imgcodecs;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {
    
    @Value("${app.file-storage.base-path:./uploads}")
    private String baseStoragePath;
    
    private Path faceImagesPath;
    private Path nicImagesPath;
    private Path extractedPhotosPath;
    private Path advertisementImagesPath;
    private Path gemImagesPath;
    private Path gemCertificatesPath;
    
    @PostConstruct
    public void init() {
        try {
            // Create directory structure
            Path basePath = Paths.get(baseStoragePath).toAbsolutePath().normalize();
            faceImagesPath = basePath.resolve("face-images");
            nicImagesPath = basePath.resolve("nic-images");
            extractedPhotosPath = basePath.resolve("extracted-photos");
            advertisementImagesPath = basePath.resolve("advertisement-images");
            gemImagesPath = basePath.resolve("gems");
            gemCertificatesPath = basePath.resolve("gemstone-certificates");
            
            // Create directories if they don't exist
            Files.createDirectories(faceImagesPath);
            Files.createDirectories(nicImagesPath);
            Files.createDirectories(extractedPhotosPath);
            Files.createDirectories(advertisementImagesPath);
            Files.createDirectories(gemImagesPath);
            Files.createDirectories(gemCertificatesPath);
            
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize file storage directories", e);
        }
    }
    
    /**
     * Store face image
     */
    public String storeFaceImage(MultipartFile file, String userId) throws IOException {
        validateImageFile(file);
        
        String filename = generateFileName(userId, "face", getFileExtension(file.getOriginalFilename()));
        Path targetPath = faceImagesPath.resolve(filename);
        
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        
        return targetPath.toString();
    }
    
    /**
     * Store NIC image
     */
    public String storeNicImage(MultipartFile file, String userId) throws IOException {
        validateImageFile(file);
        
        String filename = generateFileName(userId, "nic", getFileExtension(file.getOriginalFilename()));
        Path targetPath = nicImagesPath.resolve(filename);
        
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        
        return targetPath.toString();
    }
    
    /**
     * Store advertisement images
     */
    public List<String> storeAdvertisementImages(List<MultipartFile> files, String userId) throws IOException {
        List<String> imagePaths = new ArrayList<>();
        
        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            validateImageFile(file);
            
            String filename = generateFileName(userId, "advertisement_" + i, getFileExtension(file.getOriginalFilename()));
            Path targetPath = advertisementImagesPath.resolve(filename);
            
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            imagePaths.add(targetPath.toString());
        }
        
        return imagePaths;
    }
    
    /**
     * Store single advertisement image
     */
    public String storeAdvertisementImage(MultipartFile file, String userId) throws IOException {
        validateImageFile(file);
        
        String filename = generateFileName(userId, "advertisement", getFileExtension(file.getOriginalFilename()));
        Path targetPath = advertisementImagesPath.resolve(filename);
        
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        
        return targetPath.toString();
    }
    
    /**
     * Save extracted photo from NIC
     */
    public String saveExtractedNicPhoto(Mat photoMat, String userId) {
        String filename = generateFileName(userId, "extracted", "jpg");
        Path targetPath = extractedPhotosPath.resolve(filename);
        
        // Save Mat as image file
        Imgcodecs.imwrite(targetPath.toString(), photoMat);
        
        return targetPath.toString();
    }
    
    /**
     * Store gemstone image
     */
    public String storeGemImage(MultipartFile file, String imageId) throws IOException {
        validateImageFile(file);
        
        String filename = imageId + "." + getFileExtension(file.getOriginalFilename());
        Path targetPath = gemImagesPath.resolve(filename);
        
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        
        // Return relative URL path for database storage
        return "/uploads/gems/" + filename;
    }
    
    /**
     * Store gemstone certificate image
     */
    public String storeGemCertificateImage(MultipartFile file, String certificateId) throws IOException {
        validateImageFile(file);
        
        String filename = certificateId + "." + getFileExtension(file.getOriginalFilename());
        Path targetPath = gemCertificatesPath.resolve(filename);
        
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        
        // Return relative URL path for database storage
        return "/uploads/gemstone-certificates/" + filename;
    }
    
    /**
     * Generate unique filename
     */
    private String generateFileName(String userId, String type, String extension) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uniqueId = UUID.randomUUID().toString().substring(0, 8);
        return String.format("%s_%s_%s_%s.%s", userId, type, timestamp, uniqueId, extension);
    }
    
    /**
     * Get file extension
     */
    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf('.') == -1) {
            return "jpg"; // default extension
        }
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }
    
    /**
     * Validate image file
     */
    private void validateImageFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("File is empty");
        }
        
        // Check file size (max 10MB)
        long maxSizeBytes = 10 * 1024 * 1024; // 10MB
        if (file.getSize() > maxSizeBytes) {
            throw new IOException("File size exceeds maximum limit of 10MB");
        }
        
        // Check file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IOException("File must be an image");
        }
        
        // Check allowed image types
        String[] allowedTypes = {"image/jpeg", "image/jpg", "image/png", "image/gif"};
        boolean isAllowedType = false;
        for (String allowedType : allowedTypes) {
            if (allowedType.equals(contentType)) {
                isAllowedType = true;
                break;
            }
        }
        
        if (!isAllowedType) {
            throw new IOException("Only JPEG, PNG, and GIF images are allowed");
        }
    }
    
    /**
     * Delete file
     */
    public boolean deleteFile(String filePath) {
        try {
            Path path;
            
            // Check if the input is a URL (starts with http:// or https://)
            if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
                // Extract the filename from the URL
                String filename = extractFilenameFromUrl(filePath);
                
                // Determine which directory to use based on URL path
                if (filePath.contains("/advertisement-images/")) {
                    path = advertisementImagesPath.resolve(filename);
                } else if (filePath.contains("/face-images/")) {
                    path = faceImagesPath.resolve(filename);
                } else if (filePath.contains("/nic-images/")) {
                    path = nicImagesPath.resolve(filename);
                } else if (filePath.contains("/extracted-photos/")) {
                    path = extractedPhotosPath.resolve(filename);
                } else if (filePath.contains("/gems/")) {
                    path = gemImagesPath.resolve(filename);
                } else if (filePath.contains("/gemstone-certificates/")) {
                    path = gemCertificatesPath.resolve(filename);
                } else {
                    // Default to advertisement images if can't determine
                    path = advertisementImagesPath.resolve(filename);
                }
            } else {
                // Treat as a direct file path
                path = Paths.get(filePath);
            }
            
            return Files.deleteIfExists(path);
        } catch (IOException e) {
            System.err.println("❌ Error deleting file: " + filePath + " - " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Extract filename from URL
     */
    private String extractFilenameFromUrl(String url) {
        try {
            // Get the part after the last '/'
            int lastSlashIndex = url.lastIndexOf('/');
            if (lastSlashIndex != -1 && lastSlashIndex < url.length() - 1) {
                return url.substring(lastSlashIndex + 1);
            }
            return url; // Return original if can't extract
        } catch (Exception e) {
            System.err.println("❌ Error extracting filename from URL: " + url + " - " + e.getMessage());
            return url;
        }
    }
    
    /**
     * Check if file exists
     */
    public boolean fileExists(String filePath) {
        return Files.exists(Paths.get(filePath));
    }
    
    /**
     * Get file path for reading
     */
    public Path getFilePath(String filePath) {
        return Paths.get(filePath);
    }
}
