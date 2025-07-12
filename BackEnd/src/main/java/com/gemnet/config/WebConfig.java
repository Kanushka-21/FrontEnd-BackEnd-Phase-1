package com.gemnet.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // Serve uploaded files (gemstone images, certificates, etc.) as static resources
        String uploadsPath = new File("uploads").getAbsolutePath();
        
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadsPath + "/")
                .setCachePeriod(3600); // Cache for 1 hour
        
        // Also add alternative path handling for more robust file serving
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:./uploads/")
                .setCachePeriod(3600);
        
        System.out.println("✅ Static resource handler configured for uploads");
        System.out.println("📁 Serving files from: " + uploadsPath);
        System.out.println("📁 Alternative path: ./uploads/");
        System.out.println("🌐 Accessible via: /uploads/**");
    }
}
