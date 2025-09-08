package com.gemnet.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/uploads")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://localhost:3004"})
public class StaticResourceController {

    private final Path uploadsLocation;

    public StaticResourceController() {
        // Try multiple possible paths for uploads directory
        Path uploadsPath = null;
        String[] possiblePaths = {
            "uploads",              // Current directory
            "../uploads",           // Parent directory
            "./uploads",            // Explicit current directory
            "BackEnd/../uploads",   // From BackEnd to parent
            "../../uploads"         // Two levels up
        };
        
        for (String pathStr : possiblePaths) {
            Path testPath = Paths.get(pathStr).toAbsolutePath().normalize();
            if (Files.exists(testPath) && Files.isDirectory(testPath)) {
                uploadsPath = testPath;
                System.out.println("✅ Found uploads directory at: " + testPath);
                break;
            } else {
                System.out.println("⚠️ Checked path: " + testPath + " - " + (Files.exists(testPath) ? "exists but not directory" : "does not exist"));
            }
        }
        
        // If none of the standard paths work, try to find it dynamically
        if (uploadsPath == null) {
            try {
                Path currentDir = Paths.get("").toAbsolutePath();
                System.out.println("🔍 Current working directory: " + currentDir);
                
                // Look for uploads directory in current and parent directories
                Path currentUploads = currentDir.resolve("uploads");
                Path parentUploads = currentDir.getParent().resolve("uploads");
                
                if (Files.exists(currentUploads) && Files.isDirectory(currentUploads)) {
                    uploadsPath = currentUploads;
                    System.out.println("✅ Found uploads in current directory: " + uploadsPath);
                } else if (Files.exists(parentUploads) && Files.isDirectory(parentUploads)) {
                    uploadsPath = parentUploads;
                    System.out.println("✅ Found uploads in parent directory: " + uploadsPath);
                }
            } catch (Exception e) {
                System.err.println("❌ Error during dynamic path resolution: " + e.getMessage());
            }
        }
        
        // Final fallback - create uploads directory if it doesn't exist
        if (uploadsPath == null) {
            uploadsPath = Paths.get("uploads").toAbsolutePath().normalize();
            try {
                Files.createDirectories(uploadsPath);
                System.out.println("📁 Created uploads directory: " + uploadsPath);
            } catch (Exception e) {
                System.err.println("❌ Failed to create uploads directory: " + e.getMessage());
            }
        }
        
        this.uploadsLocation = uploadsPath;
        System.out.println("📁 Static Resource Controller initialized");
        System.out.println("📁 Final uploads location: " + uploadsLocation.toString());
        System.out.println("📁 Directory exists: " + Files.exists(uploadsLocation));
        System.out.println("📁 Is directory: " + Files.isDirectory(uploadsLocation));
    }

    @GetMapping("/**")
    public ResponseEntity<Resource> getFile(HttpServletRequest request) {
        try {
            // Extract the file path from the request
            String requestPath = request.getRequestURI().substring("/uploads/".length());
            
            System.out.println("📥 File request received: " + requestPath);
            
            // Resolve the file path
            Path filePath = uploadsLocation.resolve(requestPath).normalize();
            
            System.out.println("📁 Resolved file path: " + filePath.toString());
            System.out.println("📁 File exists: " + Files.exists(filePath));
            System.out.println("📁 File is readable: " + Files.isReadable(filePath));
            
            // Check if the file exists and is readable
            if (!Files.exists(filePath) || !Files.isReadable(filePath)) {
                System.out.println("❌ File not found or not readable: " + filePath);
                return ResponseEntity.notFound().build();
            }

            // Load file as Resource
            Resource resource = new UrlResource(filePath.toUri());
            
            if (!resource.exists() || !resource.isReadable()) {
                System.out.println("❌ Resource not readable: " + filePath);
                return ResponseEntity.notFound().build();
            }

            // Determine content type
            String contentType = null;
            try {
                contentType = Files.probeContentType(filePath);
            } catch (IOException ex) {
                System.out.println("⚠️ Could not determine file type: " + ex.getMessage());
            }

            // Fallback content type
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            System.out.println("✅ Serving file: " + requestPath + " (Type: " + contentType + ")");

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (MalformedURLException ex) {
            System.out.println("❌ Malformed URL error: " + ex.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception ex) {
            System.out.println("❌ Error serving file: " + ex.getMessage());
            ex.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
