package com.gemnet.service;

import com.gemnet.dto.ApiResponse;
import com.gemnet.dto.GemCertificateDataDto;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.opencv.core.*;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.Imgproc;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.awt.image.BufferedImage;
import java.awt.image.DataBufferByte;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.imageio.ImageIO;

/**
 * Service for processing gem certificates and extracting data using OCR
 */
@Service
public class GemCertificateService {
    
    @Autowired
    private FileStorageService fileStorageService;
    
    // Tesseract configuration
    @Value("${tesseract.datapath:/opt/homebrew/share/tessdata}")
    private String tesseractDataPath;
    
    @Value("${tesseract.language:eng}")
    private String tesseractLanguage;
    
    @Value("${tesseract.ocrEngineMode:1}")
    private int ocrEngineMode;
    
    @Value("${tesseract.pageSegMode:6}")
    private int pageSegMode;
    
    private Tesseract tesseract;
    private boolean tesseractInitialized = false;
    private String tesseractStatus = "Not initialized";
    
    @PostConstruct
    public void init() {
        try {
            // Load OpenCV native library
            nu.pattern.OpenCV.loadLocally();
            System.out.println("✅ OpenCV loaded successfully for certificate processing");
            
            // Initialize Tesseract OCR
            initializeTesseractSafely();
            
        } catch (Exception e) {
            System.err.println("⚠️ Warning: Error initializing certificate processing: " + e.getMessage());
            System.err.println("📋 Certificate processing will continue with limited functionality");
        }
    }
    
    private void initializeTesseractSafely() {
        try {
            System.out.println("🔧 Attempting to initialize Tesseract for certificate processing...");
            System.out.println("   • Data path: " + tesseractDataPath);
            System.out.println("   • Language: " + tesseractLanguage);
            
            // Set up environment variables
            setupEnvironmentForTesseract();
            
            // Create Tesseract instance
            tesseract = new Tesseract();
            
            // Verify tessdata directory exists
            Path tessPath = Paths.get(tesseractDataPath);
            Path engFile = tessPath.resolve(tesseractLanguage + ".traineddata");
            
            if (!Files.exists(tessPath)) {
                throw new RuntimeException("Tesseract data path does not exist: " + tesseractDataPath);
            }
            
            if (!Files.exists(engFile)) {
                throw new RuntimeException("Language file not found: " + engFile.toString());
            }
            
            // Configure Tesseract for certificate text recognition
            tesseract.setDatapath(tesseractDataPath);
            tesseract.setLanguage(tesseractLanguage);
            tesseract.setOcrEngineMode(ocrEngineMode);
            tesseract.setPageSegMode(pageSegMode);
            
            // Set OCR configuration for certificate documents
            tesseract.setVariable("tessedit_char_whitelist", 
                "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:-/ ()[]");
            tesseract.setVariable("classify_bln_numeric_mode", "0");
            tesseract.setVariable("tessedit_pageseg_mode", String.valueOf(pageSegMode));
            
            tesseractInitialized = true;
            tesseractStatus = "Initialized successfully";
            System.out.println("✅ Tesseract configured successfully for certificate processing");
            
        } catch (Exception e) {
            System.err.println("⚠️ Tesseract initialization failed: " + e.getMessage());
            tesseractInitialized = false;
            tesseractStatus = "Failed to initialize: " + e.getMessage();
        }
    }
    
    private void setupEnvironmentForTesseract() {
        try {
            System.setProperty("jna.library.path", "/opt/homebrew/lib:/usr/local/lib:/usr/lib");
            System.setProperty("java.library.path", 
                System.getProperty("java.library.path") + ":/opt/homebrew/lib:/usr/local/lib");
            System.setProperty("TESSDATA_PREFIX", tesseractDataPath);
            
            System.out.println("🔧 Environment configured for certificate Tesseract processing");
        } catch (Exception e) {
            System.err.println("⚠️ Failed to setup Tesseract environment: " + e.getMessage());
        }
    }

    
    /**
     * Main method to extract certificate data from uploaded image
     */
    public ApiResponse<GemCertificateDataDto> extractCertificateData(MultipartFile certificateImage) {
        System.out.println("💎 Starting gem certificate data extraction...");
        System.out.println("📁 Image details: " + certificateImage.getOriginalFilename() + 
                          " (" + certificateImage.getSize() + " bytes)");
        
        try {
            // Validate input
            if (certificateImage.isEmpty()) {
                return ApiResponse.error("Certificate image is required");
            }
            
            // Check file size (max 10MB)
            if (certificateImage.getSize() > 10 * 1024 * 1024) {
                return ApiResponse.error("Image too large. Maximum size is 10MB");
            }
            
            // Check file type
            String contentType = certificateImage.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ApiResponse.error("Invalid file type. Please upload an image");
            }
            
            // Convert MultipartFile to BufferedImage
            BufferedImage bufferedImage = ImageIO.read(certificateImage.getInputStream());
            if (bufferedImage == null) {
                throw new IOException("Could not read image file");
            }
            
            System.out.println("📐 Original image size: " + bufferedImage.getWidth() + "x" + bufferedImage.getHeight());
            
            // Preprocess image for better OCR results
            BufferedImage preprocessedImage = preprocessImageForOCR(bufferedImage);
            
            // Perform OCR
            String ocrResult = performOCR(preprocessedImage);
            
            if (ocrResult == null || ocrResult.trim().isEmpty()) {
                return ApiResponse.error("Could not extract text from certificate image");
            }
            
            System.out.println("📄 OCR Raw Result Preview: " + 
                ocrResult.substring(0, Math.min(300, ocrResult.length())) + "...");
            
            // Extract structured data from OCR text
            GemCertificateDataDto certificateData = extractStructuredData(ocrResult);
            
            if (!certificateData.hasValidData()) {
                return ApiResponse.error("Could not extract valid certificate data from image", certificateData);
            }
            
            System.out.println("✅ Certificate data successfully extracted: " + certificateData.getReportNumber());
            return ApiResponse.success("Certificate data extracted successfully", certificateData);
            
        } catch (Exception e) {
            System.err.println("❌ Certificate extraction failed: " + e.getMessage());
            e.printStackTrace();
            return ApiResponse.error("Certificate extraction failed: " + e.getMessage());
        }
    }
    
    /**
     * Perform OCR on preprocessed image
     */
    private String performOCR(BufferedImage image) {
        if (!tesseractInitialized) {
            System.out.println("⚠️ Tesseract not available, using fallback extraction");
            return performFallbackTextExtraction(image);
        }
        
        try {
            System.out.println("🔍 Performing OCR with Tesseract...");
            String result = tesseract.doOCR(image);
            System.out.println("✅ OCR completed successfully");
            return result;
        } catch (TesseractException e) {
            System.err.println("❌ Tesseract OCR error: " + e.getMessage());
            tesseractInitialized = false; // Disable for future calls
            return performFallbackTextExtraction(image);
        } catch (Exception e) {
            System.err.println("❌ Unexpected OCR error: " + e.getMessage());
            tesseractInitialized = false;
            return performFallbackTextExtraction(image);
        }
    }
    
    /**
     * Fallback text extraction when Tesseract is not available
     */
    private String performFallbackTextExtraction(BufferedImage image) {
        System.out.println("🔄 Using fallback text extraction method");
        
        // For demo purposes, return a sample structure that indicates fallback was used
        // In a real implementation, you might use alternative OCR libraries or services
        return "FALLBACK_MODE: Please ensure Tesseract is properly installed for full OCR functionality.\n" +
               "National Gem and Jewellery Authority\n" +
               "SAMPLE_REPORT_NO: PC1001694\n" +
               "SAMPLE_DATE: 29/05/2023\n" +
               "This is a fallback response. Install Tesseract for accurate data extraction.";
    }

    
    /**
     * Preprocess image for better OCR results
     */
    private BufferedImage preprocessImageForOCR(BufferedImage originalImage) {
        try {
            System.out.println("🔧 Preprocessing image for certificate OCR...");
            
            // Convert BufferedImage to Mat for OpenCV processing
            byte[] imageData = ((DataBufferByte) originalImage.getRaster().getDataBuffer()).getData();
            Mat mat = new Mat(originalImage.getHeight(), originalImage.getWidth(), CvType.CV_8UC3);
            mat.put(0, 0, imageData);
            
            // Convert to grayscale
            Mat grayMat = new Mat();
            Imgproc.cvtColor(mat, grayMat, Imgproc.COLOR_BGR2GRAY);
            
            // Increase contrast and brightness for certificate documents
            Mat enhancedMat = new Mat();
            grayMat.convertTo(enhancedMat, -1, 1.2, 30); // alpha=1.2 (contrast), beta=30 (brightness)
            
            // Apply Gaussian blur to reduce noise
            Mat blurredMat = new Mat();
            Imgproc.GaussianBlur(enhancedMat, blurredMat, new Size(1, 1), 0);
            
            // Apply adaptive threshold for text extraction
            Mat thresholdMat = new Mat();
            Imgproc.adaptiveThreshold(blurredMat, thresholdMat, 255, 
                Imgproc.ADAPTIVE_THRESH_GAUSSIAN_C, Imgproc.THRESH_BINARY, 11, 2);
            
            // Convert back to BufferedImage
            MatOfByte matOfByte = new MatOfByte();
            Imgcodecs.imencode(".png", thresholdMat, matOfByte);
            byte[] processedImageData = matOfByte.toArray();
            
            BufferedImage processedImage = ImageIO.read(new java.io.ByteArrayInputStream(processedImageData));
            System.out.println("✅ Image preprocessing completed");
            
            return processedImage;
            
        } catch (Exception e) {
            System.err.println("⚠️ Image preprocessing failed, using original image: " + e.getMessage());
            return originalImage;
        }
    }
    
    /**
     * Extract structured data from OCR text using pattern matching
     */
    private GemCertificateDataDto extractStructuredData(String ocrText) {
        System.out.println("📊 Extracting structured data from OCR text...");
        
        GemCertificateDataDto certificateData = new GemCertificateDataDto();
        certificateData.setRawOcrText(ocrText);
        certificateData.setExtractionMethod(tesseractInitialized ? "Tesseract OCR" : "Fallback");
        
        // Extract authority information
        String authority = extractAuthority(ocrText);
        certificateData.setAuthority(authority);
        
        // Extract report number
        String reportNumber = extractReportNumber(ocrText);
        certificateData.setReportNumber(reportNumber);
        
        // Extract date
        String issueDate = extractDate(ocrText);
        certificateData.setIssueDate(issueDate);
        
        // Extract gem identification details
        certificateData.setSpecies(extractField(ocrText, "Species", "Variety"));
        certificateData.setVariety(extractField(ocrText, "Variety", "Weight"));
        certificateData.setWeight(extractField(ocrText, "Weight", "Dimensions"));
        certificateData.setDimensions(extractField(ocrText, "Dimensions", "Colour"));
        certificateData.setColour(extractField(ocrText, "Colour", "Transparency"));
        certificateData.setTransparency(extractField(ocrText, "Transparency", "Cut"));
        certificateData.setCut(extractField(ocrText, "Cut", "Shape"));
        certificateData.setShape(extractField(ocrText, "Shape", "Comments"));
        
        // Extract test results
        certificateData.setRefractiveIndex(extractTestResult(ocrText, "Refractive Index"));
        certificateData.setSpecificGravity(extractTestResult(ocrText, "Specific Gravity"));
        certificateData.setPolariscopeTest(extractTestResult(ocrText, "Polariscope Test"));
        certificateData.setAbsorptionSpectrum(extractTestResult(ocrText, "Absorption Spectrum"));
        certificateData.setMicroscopeExamination(extractTestResult(ocrText, "Microscope Examination"));
        certificateData.setFluorescenceLongWave(extractTestResult(ocrText, "Long Wave U.V."));
        certificateData.setFluorescenceShortWave(extractTestResult(ocrText, "Short Wave U.V."));
        certificateData.setPleochroism(extractTestResult(ocrText, "Pleochroism"));
        
        // Extract comments
        certificateData.setComments(extractField(ocrText, "Comments", "Gemologist"));
        
        // Extract gemologist information
        certificateData.setGemologists(extractGemologists(ocrText));
        
        // Set confidence based on extraction success
        certificateData.setConfidence(calculateConfidence(certificateData));
        
        System.out.println("✅ Structured data extraction completed");
        System.out.println("📋 Report Number: " + certificateData.getReportNumber());
        System.out.println("📋 Authority: " + certificateData.getAuthority());
        System.out.println("📋 Species: " + certificateData.getSpecies());
        System.out.println("📋 Confidence: " + certificateData.getConfidence());
        
        return certificateData;
    }

    
    /**
     * Extract authority information from OCR text
     */
    private String extractAuthority(String text) {
        // Look for authority patterns
        Pattern authorityPattern = Pattern.compile("(?i)(National\\s+Gem\\s+and\\s+Jewellery\\s+Authority|NGJA|Sri\\s+Lanka)", 
            Pattern.CASE_INSENSITIVE);
        Matcher matcher = authorityPattern.matcher(text);
        if (matcher.find()) {
            return matcher.group().trim();
        }
        
        // Check for fallback mode
        if (text.contains("FALLBACK_MODE")) {
            return "National Gem and Jewellery Authority (Fallback)";
        }
        
        return "Unknown Authority";
    }
    
    /**
     * Extract report number from OCR text
     */
    private String extractReportNumber(String text) {
        // Pattern for report numbers like PC1001694
        Pattern reportPattern = Pattern.compile("(?i)(?:Report\\s+No\\.?\\s*[:.]?\\s*)([A-Z]{1,3}\\d{6,8})", 
            Pattern.CASE_INSENSITIVE);
        Matcher matcher = reportPattern.matcher(text);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        
        // Alternative pattern for just the report number
        Pattern altPattern = Pattern.compile("\\b([A-Z]{1,3}\\d{6,8})\\b");
        matcher = altPattern.matcher(text);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        
        // Check for fallback sample
        if (text.contains("SAMPLE_REPORT_NO:")) {
            Pattern fallbackPattern = Pattern.compile("SAMPLE_REPORT_NO:\\s*([A-Z0-9]+)");
            matcher = fallbackPattern.matcher(text);
            if (matcher.find()) {
                return matcher.group(1).trim() + " (Fallback)";
            }
        }
        
        return null;
    }
    
    /**
     * Extract date from OCR text
     */
    private String extractDate(String text) {
        // Pattern for dates like 29/05/2023 or 29-05-2023
        Pattern datePattern = Pattern.compile("(?i)(?:Date\\s*[:.]?\\s*)?(\\d{1,2}[/-]\\d{1,2}[/-]\\d{4})", 
            Pattern.CASE_INSENSITIVE);
        Matcher matcher = datePattern.matcher(text);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        
        // Check for fallback sample
        if (text.contains("SAMPLE_DATE:")) {
            Pattern fallbackPattern = Pattern.compile("SAMPLE_DATE:\\s*([0-9/]+)");
            matcher = fallbackPattern.matcher(text);
            if (matcher.find()) {
                return matcher.group(1).trim();
            }
        }
        
        return null;
    }
    
    /**
     * Extract field value between two field names
     */
    private String extractField(String text, String fieldName, String nextField) {
        try {
            // Create pattern to find the field and its value
            String pattern = "(?i)" + Pattern.quote(fieldName) + "\\s*[:.]?\\s*([^\\n\\r]*?)(?=\\s*" + 
                           Pattern.quote(nextField) + "|$)";
            Pattern fieldPattern = Pattern.compile(pattern, Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
            Matcher matcher = fieldPattern.matcher(text);
            
            if (matcher.find()) {
                String value = matcher.group(1).trim();
                // Clean up the value
                value = value.replaceAll("\\s+", " ");
                value = value.replaceAll("^[:.\\-_\\s]+", "");
                value = value.replaceAll("[:.\\-_\\s]+$", "");
                
                if (!value.isEmpty() && value.length() > 1) {
                    return value;
                }
            }
            
            // Try alternative pattern with line breaks
            pattern = "(?i)" + Pattern.quote(fieldName) + "\\s*[:.]?\\s*\\n?\\s*([^\\n]+)";
            fieldPattern = Pattern.compile(pattern, Pattern.CASE_INSENSITIVE);
            matcher = fieldPattern.matcher(text);
            
            if (matcher.find()) {
                String value = matcher.group(1).trim();
                if (!value.isEmpty() && value.length() > 1) {
                    return value;
                }
            }
            
        } catch (Exception e) {
            System.err.println("⚠️ Error extracting field " + fieldName + ": " + e.getMessage());
        }
        
        return null;
    }
    
    /**
     * Extract test result with number prefix
     */
    private String extractTestResult(String text, String testName) {
        try {
            // Pattern for numbered test results like "1. Refractive Index : 1.762 - 1.770"
            String pattern = "(?i)\\d+\\.\\s*" + Pattern.quote(testName) + "\\s*[:.]?\\s*([^\\n\\r]*?)(?=\\d+\\.|$)";
            Pattern testPattern = Pattern.compile(pattern, Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
            Matcher matcher = testPattern.matcher(text);
            
            if (matcher.find()) {
                String value = matcher.group(1).trim();
                value = value.replaceAll("\\s+", " ");
                value = value.replaceAll("^[:.\\-_\\s]+", "");
                value = value.replaceAll("[:.\\-_\\s]+$", "");
                
                if (!value.isEmpty() && value.length() > 1) {
                    return value;
                }
            }
            
            // Try without number prefix
            return extractField(text, testName, "");
            
        } catch (Exception e) {
            System.err.println("⚠️ Error extracting test result " + testName + ": " + e.getMessage());
        }
        
        return null;
    }
    
    /**
     * Extract gemologist information
     */
    private String extractGemologists(String text) {
        // Look for gemologist names and signatures
        Pattern gemologistPattern = Pattern.compile("(?i)(Gemologist|Gemmologist)\\s*[:.]?\\s*([A-Za-z\\s.]+)", 
            Pattern.CASE_INSENSITIVE);
        Matcher matcher = gemologistPattern.matcher(text);
        
        StringBuilder gemologists = new StringBuilder();
        while (matcher.find()) {
            if (gemologists.length() > 0) {
                gemologists.append(", ");
            }
            gemologists.append(matcher.group(2).trim());
        }
        
        return gemologists.length() > 0 ? gemologists.toString() : null;
    }
    
    /**
     * Calculate confidence score based on extracted data
     */
    private Double calculateConfidence(GemCertificateDataDto data) {
        int totalFields = 0;
        int extractedFields = 0;
        
        // Core identification fields
        if (data.getReportNumber() != null) extractedFields++;
        totalFields++;
        
        if (data.getAuthority() != null) extractedFields++;
        totalFields++;
        
        if (data.getSpecies() != null) extractedFields++;
        totalFields++;
        
        if (data.getVariety() != null) extractedFields++;
        totalFields++;
        
        if (data.getWeight() != null) extractedFields++;
        totalFields++;
        
        // Additional fields
        if (data.getColour() != null) extractedFields++;
        totalFields++;
        
        if (data.getDimensions() != null) extractedFields++;
        totalFields++;
        
        if (data.getRefractiveIndex() != null) extractedFields++;
        totalFields++;
        
        // Calculate confidence percentage
        double confidence = (double) extractedFields / totalFields * 100.0;
        
        // Adjust for fallback mode
        if ("Fallback".equals(data.getExtractionMethod())) {
            confidence = Math.min(confidence, 30.0); // Max 30% confidence for fallback
        }
        
        return Math.round(confidence * 100.0) / 100.0; // Round to 2 decimal places
    }
    
    /**
     * Get Tesseract status for diagnostics
     */
    public Map<String, Object> getTesseractStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("initialized", tesseractInitialized);
        status.put("status", tesseractStatus);
        status.put("dataPath", tesseractDataPath);
        status.put("language", tesseractLanguage);
        status.put("ocrEngineMode", ocrEngineMode);
        status.put("pageSegMode", pageSegMode);
        return status;
    }
}
