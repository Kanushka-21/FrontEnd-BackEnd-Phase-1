package com.gemnet.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // Get the absolute path to the uploads directory
        String currentDir = System.getProperty("user.dir");
        String uploadsPath = Paths.get(currentDir, "uploads").toAbsolutePath().toString();
        File uploadsDir = new File(uploadsPath);
        
        System.out.println("=== Static Resource Configuration ===");
        System.out.println("📁 Current working directory: " + currentDir);
        System.out.println("📁 Uploads path: " + uploadsPath);
        System.out.println("📁 Uploads directory exists: " + uploadsDir.exists());
        System.out.println("📁 Uploads directory is directory: " + uploadsDir.isDirectory());
        System.out.println("📁 Uploads directory readable: " + uploadsDir.canRead());
        
        // Serve uploaded files as static resources with multiple location mappings
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(
                    "file:" + uploadsPath + File.separator,
                    "file:" + uploadsPath + "/",
                    "file:uploads/",
                    "file:./uploads/"
                )
                .setCachePeriod(3600); // Cache for 1 hour
        
        System.out.println("✅ Static resource handler configured for /uploads/**");
        System.out.println("🌐 Files will be served from multiple locations");
        System.out.println("=====================================");
    }
}
