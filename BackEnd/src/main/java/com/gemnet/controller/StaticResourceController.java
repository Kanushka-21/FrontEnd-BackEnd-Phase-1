package com.gemnet.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/uploads")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"})
public class StaticResourceController {

    private final Path uploadsLocation;

    public StaticResourceController() {
        this.uploadsLocation = Paths.get("uploads").toAbsolutePath().normalize();
        System.out.println("📁 Static Resource Controller initialized");
        System.out.println("📁 Uploads location: " + uploadsLocation.toString());
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
