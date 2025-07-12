package com.gemnet.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import jakarta.annotation.PostConstruct;
import java.io.File;

@Configuration
public class StaticFileConfig implements WebMvcConfigurer {

    @Value("${app.file-storage.base-path:./uploads}")
    private String baseStoragePath;

    @PostConstruct
    public void logConfiguration() {
        // Convert relative path to absolute path
        File uploadsDir = new File(baseStoragePath);
        String absolutePath = uploadsDir.getAbsolutePath();
        
        System.out.println("\n🗂️ Static File Configuration:");
        System.out.println("   📁 Base storage path: " + baseStoragePath);
        System.out.println("   📁 Absolute path: " + absolutePath);
        System.out.println("   📁 Directory exists: " + uploadsDir.exists());
        System.out.println("   📁 Directory readable: " + uploadsDir.canRead());
        System.out.println("   🌐 URL mapping: /uploads/** -> file:" + absolutePath);
        System.out.println("   🔗 Example URL: http://localhost:9092/uploads/advertisement-images/filename.jpg\n");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Convert relative path to absolute path
        File uploadsDir = new File(baseStoragePath);
        String absolutePath = uploadsDir.getAbsolutePath();
        
        // Ensure the path ends with a slash for proper file serving
        if (!absolutePath.endsWith(File.separator)) {
            absolutePath += File.separator;
        }
        
        // Map /uploads/** URLs to the actual uploads directory
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + absolutePath)
                .setCachePeriod(3600); // Cache for 1 hour
        
        System.out.println("✅ Static file handler registered for /uploads/** -> " + absolutePath);
    }
}