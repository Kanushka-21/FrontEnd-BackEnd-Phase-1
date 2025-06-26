package com.gemnet.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "tesseract")
public class TesseractConfig {
    
    private String datapath = "/opt/homebrew/share/tessdata";
    private String language = "eng";
    private int ocrEngineMode = 1;
    private int pageSegMode = 8;
      // Environment variables setup methods
    public void setupEnvironment() {
        // Set environment variables that some JNI libraries expect
        System.setProperty("TESSDATA_PREFIX", datapath);
        System.setProperty("tesseract.datapath", datapath);
        
        // Set library path based on operating system
        String javaLibraryPath = System.getProperty("java.library.path");
        String osName = System.getProperty("os.name").toLowerCase();
        String tesseractLibPath;
        
        if (osName.contains("win")) {
            // Windows path
            tesseractLibPath = "C:\\Program Files\\Tesseract-OCR";
        } else if (osName.contains("mac")) {
            // macOS path
            tesseractLibPath = "/opt/homebrew/lib";
        } else {
            // Linux path
            tesseractLibPath = "/usr/local/lib";
        }
        
        if (!javaLibraryPath.contains(tesseractLibPath)) {
            System.setProperty("java.library.path", 
                javaLibraryPath + System.getProperty("path.separator") + tesseractLibPath);
            
            // Log the library path setup
            System.out.println("🔧 Updated java.library.path to include: " + tesseractLibPath);
        }
    }
    
    // Getters and Setters
    public String getDatapath() {
        return datapath;
    }
    
    public void setDatapath(String datapath) {
        this.datapath = datapath;
    }
    
    public String getLanguage() {
        return language;
    }
    
    public void setLanguage(String language) {
        this.language = language;
    }
    
    public int getOcrEngineMode() {
        return ocrEngineMode;
    }
    
    public void setOcrEngineMode(int ocrEngineMode) {
        this.ocrEngineMode = ocrEngineMode;
    }
    
    public int getPageSegMode() {
        return pageSegMode;
    }
    
    public void setPageSegMode(int pageSegMode) {
        this.pageSegMode = pageSegMode;
    }
}
