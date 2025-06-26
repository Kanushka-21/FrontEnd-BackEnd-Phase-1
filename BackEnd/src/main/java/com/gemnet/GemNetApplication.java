package com.gemnet;

import com.gemnet.config.TesseractConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.core.env.Environment;
import org.springframework.data.mongodb.core.MongoTemplate;

import jakarta.annotation.PostConstruct;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.Enumeration;

@SpringBootApplication
public class GemNetApplication {
    
    @Autowired
    private TesseractConfig tesseractConfig;
    
    @Autowired
    private Environment environment;
    
    @PostConstruct
    public void init() {
        // Setup environment for Tesseract before any services initialize
        tesseractConfig.setupEnvironment();
        
        // Log configuration details
        System.out.println("🚀 GemNet Application initialized with Tesseract configuration");
        System.out.println("📁 Tesseract Data Path: " + tesseractConfig.getDatapath());
        System.out.println("🌐 Language: " + tesseractConfig.getLanguage());
        System.out.println("⚙️ OCR Engine Mode: " + tesseractConfig.getOcrEngineMode());
        System.out.println("📄 Page Segmentation Mode: " + tesseractConfig.getPageSegMode());
        
        // Print network information to help diagnose connectivity issues
        try {
            System.out.println("\n🌐 Network Configuration:");
            String port = environment.getProperty("server.port", "9091");
            System.out.println("🔌 Server port: " + port);
            System.out.println("📡 Available API endpoints:");
            System.out.println("   - Local: http://localhost:" + port + "/api/auth/health");
            
            // Print all IP addresses for easier connection testing
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            while (interfaces.hasMoreElements()) {
                NetworkInterface networkInterface = interfaces.nextElement();
                if (networkInterface.isUp() && !networkInterface.isLoopback()) {
                    Enumeration<InetAddress> addresses = networkInterface.getInetAddresses();
                    while (addresses.hasMoreElements()) {
                        InetAddress addr = addresses.nextElement();
                        if (addr.getHostAddress().contains(".")) { // IPv4
                            System.out.println("   - Network: http://" + addr.getHostAddress() + ":" + port + "/api/auth/health");
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.out.println("⚠️ Error retrieving network information: " + e.getMessage());
        }
    }
    
    // Customize Tomcat for better connection handling
    @Bean
    public WebServerFactoryCustomizer<TomcatServletWebServerFactory> tomcatCustomizer() {
        return factory -> {
            factory.addConnectorCustomizers(connector -> {
                // Increase connection timeout to handle slow network requests
                connector.setProperty("connectionTimeout", "30000");
            });
        };
    }
    
    public static void main(String[] args) {
        // Print startup banner
        System.out.println("🚀 Starting GemNet - Face Recognition Identity Verification System");
        System.out.println("📋 Checking system dependencies...");
        
        // Check if Tesseract is available
        try {
            ProcessBuilder pb = new ProcessBuilder("tesseract", "--version");
            Process process = pb.start();
            int exitCode = process.waitFor();
            
            if (exitCode == 0) {
                System.out.println("✅ Tesseract OCR is available on the system");
            } else {
                System.out.println("⚠️ Tesseract OCR may not be properly installed");
            }
        } catch (Exception e) {
            System.out.println("⚠️ Could not verify Tesseract installation: " + e.getMessage());
        }
          // Check if tessdata directory exists based on OS
        String osName = System.getProperty("os.name").toLowerCase();
        String tessDataPath;
        
        if (osName.contains("win")) {
            tessDataPath = "C:/Program Files/Tesseract-OCR/tessdata";
        } else if (osName.contains("mac")) {
            tessDataPath = "/opt/homebrew/share/tessdata";
        } else {
            tessDataPath = "/usr/share/tesseract-ocr/4.00/tessdata";
        }
        
        java.io.File tessDataDir = new java.io.File(tessDataPath);
        if (tessDataDir.exists() && tessDataDir.isDirectory()) {
            System.out.println("✅ Tesseract data directory found: " + tessDataPath);
            
            // Check for English language file
            java.io.File engFile = new java.io.File(tessDataPath, "eng.traineddata");
            if (engFile.exists()) {
                System.out.println("✅ English language file found: " + engFile.getAbsolutePath());
            } else {
                System.out.println("⚠️ English language file not found: " + engFile.getAbsolutePath());
            }
        } else {
            System.out.println("⚠️ Tesseract data directory not found: " + tessDataPath);
            System.out.println("   This is not critical - application will continue with fallback methods");
        }
        
        System.out.println("🎯 Starting Spring Boot application...");
        SpringApplication.run(GemNetApplication.class, args);
    }
}
