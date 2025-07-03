package com.gemnet.service;

import com.gemnet.dto.ApiResponse;
import com.gemnet.dto.GemCertificateDataDto;
import com.gemnet.dto.GemListingDataDto;
import com.gemnet.model.GemListing;
import com.gemnet.model.GemImage;
import com.gemnet.repository.GemListingRepository;
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
import java.util.List;
import java.util.ArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.imageio.ImageIO;

/**
 * Service for processing CSL (Colored Stone Laboratory) certificates and extracting data using OCR
 */
@Service
public class GemCertificateService {
    
    @Autowired
    private FileStorageService fileStorageService;
    
    @Autowired
    private GemListingRepository gemListingRepository;
    
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
            System.out.println("✅ OpenCV loaded successfully for CSL certificate processing");
            
            // Initialize Tesseract OCR
            initializeTesseractSafely();
            
        } catch (Exception e) {
            System.err.println("⚠️ Warning: Error initializing CSL certificate processing: " + e.getMessage());
            System.err.println("📋 CSL certificate processing will continue with limited functionality");
        }
    }
    
    private void initializeTesseractSafely() {
        try {
            System.out.println("🔧 Attempting to initialize Tesseract for CSL certificate processing...");
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
            
            // Configure Tesseract for CSL certificate text recognition
            tesseract.setDatapath(tesseractDataPath);
            tesseract.setLanguage(tesseractLanguage);
            tesseract.setOcrEngineMode(ocrEngineMode);
            tesseract.setPageSegMode(pageSegMode);
            
            // Set OCR configuration optimized for CSL certificates
            tesseract.setVariable("tessedit_char_whitelist", 
                "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:-/ ()[]");
            tesseract.setVariable("classify_bln_numeric_mode", "0");
            tesseract.setVariable("tessedit_pageseg_mode", String.valueOf(pageSegMode));
            
            tesseractInitialized = true;
            tesseractStatus = "Initialized successfully for CSL processing";
            System.out.println("✅ Tesseract configured successfully for CSL certificate processing");
            
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
            
            System.out.println("🔧 Environment configured for CSL certificate Tesseract processing");
        } catch (Exception e) {
            System.err.println("⚠️ Failed to setup Tesseract environment: " + e.getMessage());
        }
    }

    
    /**
     * Main method to extract CSL certificate data from uploaded image
     */
    public ApiResponse<GemCertificateDataDto> extractCertificateData(MultipartFile certificateImage) {
        System.out.println("💎 Starting CSL certificate data extraction...");
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
                return ApiResponse.error("Could not extract text from CSL certificate image");
            }
            
            System.out.println("📄 OCR Raw Result Preview: " + 
                ocrResult.substring(0, Math.min(400, ocrResult.length())) + "...");
            
            // Extract structured data from OCR text using CSL-specific logic
            GemCertificateDataDto certificateData = extractCSLStructuredData(ocrResult);
            
            if (!certificateData.hasValidData()) {
                return ApiResponse.error("Could not extract valid CSL certificate data from image", certificateData);
            }
            
            System.out.println("✅ CSL certificate data successfully extracted: " + certificateData.getCslMemoNo());
            return ApiResponse.success("CSL certificate data extracted successfully", certificateData);
            
        } catch (Exception e) {
            System.err.println("❌ CSL certificate extraction failed: " + e.getMessage());
            e.printStackTrace();
            return ApiResponse.error("CSL certificate extraction failed: " + e.getMessage());
        }
    }
    
    /**
     * Perform OCR on preprocessed image
     */
    private String performOCR(BufferedImage image) {
        if (!tesseractInitialized) {
            System.out.println("⚠️ Tesseract not available, using fallback extraction for CSL");
            return performFallbackTextExtraction(image);
        }
        
        try {
            System.out.println("🔍 Performing OCR with Tesseract on CSL certificate...");
            String result = tesseract.doOCR(image);
            System.out.println("✅ OCR completed successfully for CSL certificate");
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
        System.out.println("🔄 Using fallback text extraction method for CSL certificate");
        
        // For demo purposes, return a CSL sample structure
        return "FALLBACK_MODE: Please ensure Tesseract is properly installed for full OCR functionality.\n" +
               "CSL COLORED STONE LABORATORY\n" +
               "GIA ALUMNI MEMBER\n" +
               "Date: 2025-05-14\n" +
               "CSL Memo No: SAMPLE\n" +
               "Color: Sample Color\n" +
               "Shape: Cushion\n" +
               "Weight: 1.00 ct\n" +
               "Measurements: 6.00 x 6.00 x 4.00 mm\n" +
               "Variety: NATURAL SAMPLE SAPPHIRE\n" +
               "Species: NATURAL CORUNDUM\n" +
               "Treatment: Unheated\n" +
               "This is a fallback response. Install Tesseract for accurate CSL data extraction.";
    }

    
    /**
     * Preprocess image for better OCR results on CSL certificates
     */
    private BufferedImage preprocessImageForOCR(BufferedImage originalImage) {
        try {
            System.out.println("🔧 Preprocessing image for CSL certificate OCR...");
            
            // Convert BufferedImage to Mat for OpenCV processing
            byte[] imageData = ((DataBufferByte) originalImage.getRaster().getDataBuffer()).getData();
            Mat mat = new Mat(originalImage.getHeight(), originalImage.getWidth(), CvType.CV_8UC3);
            mat.put(0, 0, imageData);
            
            // Convert to grayscale
            Mat grayMat = new Mat();
            Imgproc.cvtColor(mat, grayMat, Imgproc.COLOR_BGR2GRAY);
            
            // Increase contrast and brightness for CSL card reading
            Mat enhancedMat = new Mat();
            grayMat.convertTo(enhancedMat, -1, 1.3, 20); // Higher contrast for card text
            
            // Apply slight Gaussian blur to reduce noise
            Mat blurredMat = new Mat();
            Imgproc.GaussianBlur(enhancedMat, blurredMat, new Size(1, 1), 0);
            
            // Apply adaptive threshold optimized for card text
            Mat thresholdMat = new Mat();
            Imgproc.adaptiveThreshold(blurredMat, thresholdMat, 255, 
                Imgproc.ADAPTIVE_THRESH_GAUSSIAN_C, Imgproc.THRESH_BINARY, 9, 2);
            
            // Convert back to BufferedImage
            MatOfByte matOfByte = new MatOfByte();
            Imgcodecs.imencode(".png", thresholdMat, matOfByte);
            byte[] processedImageData = matOfByte.toArray();
            
            BufferedImage processedImage = ImageIO.read(new java.io.ByteArrayInputStream(processedImageData));
            System.out.println("✅ CSL certificate image preprocessing completed");
            
            return processedImage;
            
        } catch (Exception e) {
            System.err.println("⚠️ CSL image preprocessing failed, using original image: " + e.getMessage());
            return originalImage;
        }
    }
    
    /**
     * Extract structured data from OCR text using CSL-specific patterns
     */
    private GemCertificateDataDto extractCSLStructuredData(String ocrText) {
        System.out.println("📊 Extracting structured data from CSL certificate OCR text...");
        
        GemCertificateDataDto certificateData = new GemCertificateDataDto();
        certificateData.setRawOcrText(ocrText);
        certificateData.setExtractionMethod(tesseractInitialized ? "Tesseract OCR" : "Fallback");
        
        // Extract CSL authority information
        String authority = extractCSLAuthority(ocrText);
        certificateData.setAuthority(authority);
        
        // Check for GIA Alumni status
        boolean giaAlumni = ocrText.toLowerCase().contains("gia alumni");
        certificateData.setGiaAlumniMember(giaAlumni);
        
        // Extract CSL Memo Number (instead of report number)
        String cslMemoNo = extractCSLMemoNumber(ocrText);
        certificateData.setCslMemoNo(cslMemoNo);
        
        // Extract date
        String issueDate = extractDate(ocrText);
        certificateData.setIssueDate(issueDate);
        
        // Extract gem identification details (CSL format)
        certificateData.setColor(extractCSLField(ocrText, "Color"));
        certificateData.setShape(extractCSLField(ocrText, "Shape"));
        certificateData.setWeight(extractCSLField(ocrText, "Weight"));
        certificateData.setMeasurements(extractCSLField(ocrText, "Measurements"));
        certificateData.setVariety(extractCSLField(ocrText, "Variety"));
        certificateData.setSpecies(extractCSLField(ocrText, "Species"));
        certificateData.setTreatment(extractCSLField(ocrText, "Treatment"));
        
        // Set confidence based on extraction success
        certificateData.setConfidence(calculateCSLConfidence(certificateData));
        
        System.out.println("✅ CSL structured data extraction completed");
        System.out.println("📋 CSL Memo No: " + certificateData.getCslMemoNo());
        System.out.println("📋 Authority: " + certificateData.getAuthority());
        System.out.println("📋 Variety: " + certificateData.getVariety());
        System.out.println("📋 Treatment: " + certificateData.getTreatment());
        System.out.println("📋 GIA Alumni: " + certificateData.isGiaAlumniMember());
        System.out.println("📋 Confidence: " + certificateData.getConfidence());
        
        return certificateData;
    }
    
    /**
     * Extract CSL authority information from OCR text
     */
    private String extractCSLAuthority(String text) {
        // Look for CSL authority patterns
        if (text.toLowerCase().contains("colored stone laboratory") || text.toLowerCase().contains("csl")) {
            return "CSL (Colored Stone Laboratory)";
        }
        
        // Check for fallback mode
        if (text.contains("FALLBACK_MODE")) {
            return "CSL (Colored Stone Laboratory) - Fallback";
        }
        
        return "Unknown Authority";
    }
    
    /**
     * Extract CSL Memo Number from OCR text
     */
    private String extractCSLMemoNumber(String text) {
        // Pattern for CSL Memo No like Y13Z, B9BV (typically alphanumeric, 3-4 characters)
        Pattern memoPattern = Pattern.compile("(?i)(?:CSL\\s+Memo\\s+No\\s*[:.]?\\s*)([A-Z0-9]{3,4})", 
            Pattern.CASE_INSENSITIVE);
        Matcher matcher = memoPattern.matcher(text);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        
        // Alternative pattern - just look for the memo format after "Memo No"
        Pattern altPattern = Pattern.compile("(?i)Memo\\s+No\\s*[:.]?\\s*([A-Z0-9]{3,4})");
        matcher = altPattern.matcher(text);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        
        // Check for fallback sample
        if (text.contains("CSL Memo No: SAMPLE")) {
            return "SAMPLE (Fallback)";
        }
        
        return null;
    }

    
    /**
     * Extract date from CSL certificate OCR text
     */
    private String extractDate(String text) {
        // Pattern for dates like 2025-05-14 (CSL format)
        Pattern datePattern = Pattern.compile("(?i)(?:Date\\s*[:.]?\\s*)?(\\d{4}[-]\\d{1,2}[-]\\d{1,2})", 
            Pattern.CASE_INSENSITIVE);
        Matcher matcher = datePattern.matcher(text);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        
        // Alternative pattern for other date formats
        Pattern altDatePattern = Pattern.compile("(?i)(?:Date\\s*[:.]?\\s*)?(\\d{1,2}[/-]\\d{1,2}[/-]\\d{4})");
        matcher = altDatePattern.matcher(text);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        
        // Check for fallback sample
        if (text.contains("Date: 2025-05-14")) {
            return "2025-05-14";
        }
        
        return null;
    }
    
    /**
     * Extract specific field value from CSL certificate format
     */
    private String extractCSLField(String text, String fieldName) {
        try {
            // CSL certificates have a clean format: "FieldName : Value"
            String pattern = "(?i)" + Pattern.quote(fieldName) + "\\s*[:.]?\\s*([^\\n\\r]+?)(?=\\n|$)";
            Pattern fieldPattern = Pattern.compile(pattern, Pattern.CASE_INSENSITIVE);
            Matcher matcher = fieldPattern.matcher(text);
            
            if (matcher.find()) {
                String value = matcher.group(1).trim();
                // Clean up the value
                value = value.replaceAll("\\s+", " ");
                value = value.replaceAll("^[:.\\-_\\s]+", "");
                value = value.replaceAll("[:.\\-_\\s]+$", "");
                
                // Handle special cases for variety (often in red/emphasized text)
                if ("Variety".equalsIgnoreCase(fieldName)) {
                    value = cleanVarietyText(value);
                }
                
                if (!value.isEmpty() && value.length() > 1) {
                    return value;
                }
            }
            
            // Try alternative pattern for multi-line values
            pattern = "(?i)" + Pattern.quote(fieldName) + "\\s*[:.]?\\s*\\n?\\s*([^\\n]+)";
            fieldPattern = Pattern.compile(pattern, Pattern.CASE_INSENSITIVE);
            matcher = fieldPattern.matcher(text);
            
            if (matcher.find()) {
                String value = matcher.group(1).trim();
                if ("Variety".equalsIgnoreCase(fieldName)) {
                    value = cleanVarietyText(value);
                }
                if (!value.isEmpty() && value.length() > 1) {
                    return value;
                }
            }
            
        } catch (Exception e) {
            System.err.println("⚠️ Error extracting CSL field " + fieldName + ": " + e.getMessage());
        }
        
        return null;
    }
    
    /**
     * Clean up variety text (often emphasized in CSL certificates)
     */
    private String cleanVarietyText(String variety) {
        if (variety == null) return null;
        
        // Remove common OCR artifacts around emphasized text
        variety = variety.replaceAll("^[^A-Za-z]*", ""); // Remove leading non-letters
        variety = variety.replaceAll("[^A-Za-z\\s]$", ""); // Remove trailing non-letters except spaces
        
        // Capitalize properly
        if (variety.length() > 0) {
            variety = variety.toUpperCase();
        }
        
        return variety;
    }
    
    /**
     * Calculate confidence score based on extracted CSL certificate data
     */
    private Double calculateCSLConfidence(GemCertificateDataDto data) {
        int totalFields = 0;
        int extractedFields = 0;
        
        // Core CSL identification fields
        if (data.getCslMemoNo() != null && !data.getCslMemoNo().isEmpty()) extractedFields++;
        totalFields++;
        
        if (data.getAuthority() != null && !data.getAuthority().isEmpty()) extractedFields++;
        totalFields++;
        
        if (data.getVariety() != null && !data.getVariety().isEmpty()) extractedFields++;
        totalFields++;
        
        if (data.getSpecies() != null && !data.getSpecies().isEmpty()) extractedFields++;
        totalFields++;
        
        if (data.getColor() != null && !data.getColor().isEmpty()) extractedFields++;
        totalFields++;
        
        if (data.getWeight() != null && !data.getWeight().isEmpty()) extractedFields++;
        totalFields++;
        
        if (data.getTreatment() != null && !data.getTreatment().isEmpty()) extractedFields++;
        totalFields++;
        
        // Additional fields
        if (data.getShape() != null && !data.getShape().isEmpty()) extractedFields++;
        totalFields++;
        
        if (data.getMeasurements() != null && !data.getMeasurements().isEmpty()) extractedFields++;
        totalFields++;
        
        if (data.getIssueDate() != null && !data.getIssueDate().isEmpty()) extractedFields++;
        totalFields++;
        
        // Calculate confidence percentage
        double confidence = (double) extractedFields / totalFields * 100.0;
        
        // Bonus for GIA Alumni detection
        if (data.isGiaAlumniMember()) {
            confidence += 5.0; // Small bonus for detecting GIA alumni status
        }
        
        // Adjust for fallback mode
        if ("Fallback".equals(data.getExtractionMethod())) {
            confidence = Math.min(confidence, 25.0); // Max 25% confidence for fallback
        }
        
        // Ensure confidence doesn't exceed 100%
        confidence = Math.min(confidence, 100.0);
        
        return Math.round(confidence * 100.0) / 100.0; // Round to 2 decimal places
    }
    
    /**
     * Get Tesseract status for CSL processing diagnostics
     */
    public Map<String, Object> getTesseractStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("initialized", tesseractInitialized);
        status.put("status", tesseractStatus);
        status.put("dataPath", tesseractDataPath);
        status.put("language", tesseractLanguage);
        status.put("ocrEngineMode", ocrEngineMode);
        status.put("pageSegMode", pageSegMode);
        status.put("certificateType", "CSL (Colored Stone Laboratory)");
        status.put("optimizedFor", "Card-based certificates with structured text layout");
        return status;
    }
    
    /**
     * Validate if text appears to be from a CSL certificate
     */
    public boolean isCSLCertificate(String ocrText) {
        if (ocrText == null) return false;
        
        String lowerText = ocrText.toLowerCase();
        return lowerText.contains("csl") || 
               lowerText.contains("colored stone laboratory") ||
               lowerText.contains("csl memo no") ||
               lowerText.contains("gia alumni");
    }
    
    /**
     * Get sample CSL certificate data for testing
     */
    public GemCertificateDataDto getSampleCSLData() {
        GemCertificateDataDto sample = new GemCertificateDataDto();
        sample.setCslMemoNo("Y13Z");
        sample.setAuthority("CSL (Colored Stone Laboratory)");
        sample.setGiaAlumniMember(true);
        sample.setIssueDate("2025-05-14");
        sample.setColor("Orange");
        sample.setShape("Cushion");
        sample.setWeight("2.19 ct");
        sample.setMeasurements("7.94 x 7.46 x 4.50 mm");
        sample.setVariety("NATURAL ORANGE SAPPHIRE");
        sample.setSpecies("NATURAL CORUNDUM");
        sample.setTreatment("Heated");
        sample.setConfidence(95.0);
        sample.setExtractionMethod("Sample Data");
        return sample;
    }
    
    /**
     * Save gem listing data and images to database
     */
    public ApiResponse<Map<String, Object>> saveGemListingData(GemListingDataDto gemListingData, MultipartFile[] gemImages) {
        System.out.println("💎 Starting gem listing data save to database...");
        System.out.println("👤 User: " + gemListingData.getUserName() + " (ID: " + gemListingData.getUserId() + ")");
        System.out.println("🔖 Certification Status: " + (gemListingData.getIsCertified() ? "Certified" : "Non-Certified"));
        
        Map<String, Object> saveResult = new HashMap<>();
        saveResult.put("saveStartTime", System.currentTimeMillis());
        
        try {
            // For non-certified stones, we don't need to check for duplicate CSL memo numbers
            // as they shouldn't have CSL memo numbers
            if (gemListingData.isNonCertifiedStone()) {
                // Skip CSL memo number validation for non-certified stones
                System.out.println("ℹ️ Non-certified gemstone: Skipping certificate validation");
            }
            
            // Check for duplicate certificate number (for certified stones)
            if (gemListingData.isCertifiedStone() && gemListingData.getCertificateNumber() != null) {
                if (gemListingRepository.existsByCertificateNumber(gemListingData.getCertificateNumber())) {
                    System.err.println("❌ Duplicate certificate number: " + gemListingData.getCertificateNumber());
                    return ApiResponse.error("A listing with this certificate number already exists");
                }
            }
            
            // Create GemListing entity from DTO
            GemListing gemListing = convertDtoToEntity(gemListingData);
            
            // Process and save gem images
            List<GemImage> processedImages = new ArrayList<>();
            if (gemImages != null && gemImages.length > 0) {
                System.out.println("🖼️ Processing " + gemImages.length + " gem images for database storage...");
                
                for (int i = 0; i < gemImages.length; i++) {
                    MultipartFile image = gemImages[i];
                    
                    try {
                        // Generate unique image ID
                        String imageId = "IMG_" + System.currentTimeMillis() + "_" + i;
                        
                        // Store image using FileStorageService
                        String imageUrl = fileStorageService.storeGemImage(image, imageId);
                        // For now, use the same image as thumbnail
                        String thumbnailUrl = imageUrl;
                        
                        // Create GemImage entity
                        GemImage gemImage = new GemImage();
                        gemImage.setImageId(imageId);
                        gemImage.setOriginalName(image.getOriginalFilename());
                        gemImage.setContentType(image.getContentType());
                        gemImage.setSize(image.getSize());
                        gemImage.setImageUrl(imageUrl);
                        gemImage.setThumbnailUrl(thumbnailUrl);
                        gemImage.setIsPrimary(i == 0); // First image is primary
                        gemImage.setDisplayOrder(i);
                        
                        processedImages.add(gemImage);
                        
                        System.out.println("✅ Image " + (i + 1) + " processed and stored: " + image.getOriginalFilename());
                        System.out.println("   📁 Stored at: " + imageUrl);
                        
                    } catch (Exception e) {
                        System.err.println("❌ Error processing image " + (i + 1) + ": " + e.getMessage());
                        return ApiResponse.error("Failed to process image " + (i + 1) + ": " + e.getMessage());
                    }
                }
                
                // Set images and primary image URL
                gemListing.setImages(processedImages);
                if (!processedImages.isEmpty()) {
                    gemListing.setPrimaryImageUrl(processedImages.get(0).getImageUrl());
                }
                
                System.out.println("✅ All " + gemImages.length + " images processed for database storage");
            }
            
            // Save to database
            System.out.println("💾 Saving gem listing to database...");
            GemListing savedListing = gemListingRepository.save(gemListing);
            System.out.println("✅ Gem listing saved to database with ID: " + savedListing.getId());
            
            // Prepare success response
            saveResult.put("success", true);
            saveResult.put("listingId", savedListing.getId());
            saveResult.put("userId", savedListing.getUserId());
            saveResult.put("userName", savedListing.getUserName());
            saveResult.put("gemName", savedListing.getGemName());
            saveResult.put("variety", savedListing.getVariety());
            saveResult.put("price", savedListing.getPrice());
            saveResult.put("currency", savedListing.getCurrency());
            saveResult.put("isCertified", savedListing.getIsCertified());
            saveResult.put("listingStatus", savedListing.getListingStatus());
            saveResult.put("createdAt", savedListing.getCreatedAt());
            saveResult.put("databaseId", savedListing.getId());
            
            // Add image information
            saveResult.put("imagesCount", processedImages.size());
            saveResult.put("images", convertImagesToResponseFormat(processedImages));
            if (!processedImages.isEmpty()) {
                saveResult.put("primaryImageUrl", processedImages.get(0).getImageUrl());
            }
            
            // Add specific data based on certification type
            if (savedListing.isNonCertifiedStone()) {
                // For non-certified stones, only include non-certificate properties
                saveResult.put("treatment", savedListing.getTreatment());
                saveResult.put("isHeated", savedListing.isHeated());
                saveResult.put("isUnheated", savedListing.isUnheated());
            } else {
                // For certified stones, include certificate properties
                saveResult.put("certificateNumber", savedListing.getCertificateNumber());
                saveResult.put("certifyingAuthority", savedListing.getCertifyingAuthority());
                saveResult.put("clarity", savedListing.getClarity());
                saveResult.put("cut", savedListing.getCut());
                saveResult.put("origin", savedListing.getOrigin());
                // Include CSL certificate info only for certified stones
                saveResult.put("cslMemoNo", savedListing.getCslMemoNo());
                saveResult.put("authority", savedListing.getAuthority());
                saveResult.put("giaAlumniMember", savedListing.getGiaAlumniMember());
            }
            
            // Gem details
            saveResult.put("color", savedListing.getColor());
            saveResult.put("shape", savedListing.getShape());
            saveResult.put("weight", savedListing.getWeight());
            saveResult.put("measurements", savedListing.getMeasurements());
            saveResult.put("species", savedListing.getSpecies());
            saveResult.put("category", savedListing.getCategory());
            saveResult.put("description", savedListing.getDescription());
            saveResult.put("comments", savedListing.getComments());
            
            saveResult.put("saveEndTime", System.currentTimeMillis());
            saveResult.put("saveDuration", 
                (Long) saveResult.get("saveEndTime") - (Long) saveResult.get("saveStartTime"));
            
            System.out.println("✅ Gem listing data and images saved successfully to database");
            System.out.println("📋 Database ID: " + savedListing.getId());
            System.out.println("💰 Price: " + savedListing.getPrice() + " " + savedListing.getCurrency());
            System.out.println("🖼️ Images saved: " + processedImages.size());
            
            return ApiResponse.success("Gem listing data and images saved successfully to database", saveResult);
            
        } catch (Exception e) {
            System.err.println("❌ Database save error: " + e.getMessage());
            e.printStackTrace();
            
            saveResult.put("error", e.getMessage());
            saveResult.put("saveEndTime", System.currentTimeMillis());
            
            return ApiResponse.error("Failed to save gem listing data to database: " + e.getMessage(), saveResult);
        }
    }
    
    /**
     * Convert DTO to Entity
     */
    private GemListing convertDtoToEntity(GemListingDataDto dto) {
        GemListing entity = new GemListing();
        
        // User information
        entity.setUserId(dto.getUserId().toString()); // Convert Long to String for MongoDB
        entity.setUserName(dto.getUserName());
        entity.setUserRole(dto.getUserRole());
        
        // Certification status
        entity.setIsCertified(dto.getIsCertified());
        
        // Certificate information only for certified stones
        if (dto.getIsCertified()) {
            // CSL Certificate Information (only for certified stones)
            entity.setCslMemoNo(dto.getCslMemoNo());
            entity.setIssueDate(dto.getIssueDate());
            entity.setAuthority(dto.getAuthority());
            entity.setGiaAlumniMember(dto.getGiaAlumniMember());
        } else {
            // For non-certified stones, explicitly set these fields to null
            entity.setCslMemoNo(null);
            entity.setIssueDate(null);
            entity.setAuthority(null);
            entity.setGiaAlumniMember(null);
        }
        
        // Gem identification details
        entity.setColor(dto.getColor());
        entity.setShape(dto.getShape());
        entity.setWeight(dto.getWeight());
        entity.setMeasurements(dto.getMeasurements());
        entity.setVariety(dto.getVariety());
        entity.setSpecies(dto.getSpecies());
        entity.setTreatment(dto.getTreatment());
        
        // Additional information
        entity.setComments(dto.getComments());
        
        // Listing specific information
        entity.setPrice(dto.getPrice());
        entity.setCurrency(dto.getCurrency());
        entity.setGemName(dto.getGemName());
        entity.setCategory(dto.getCategory());
        entity.setDescription(dto.getDescription());
        
        // For certified gemstones
        entity.setCertificateNumber(dto.getCertificateNumber());
        entity.setCertifyingAuthority(dto.getCertifyingAuthority());
        entity.setClarity(dto.getClarity());
        entity.setCut(dto.getCut());
        entity.setOrigin(dto.getOrigin());
        
        // Metadata
        entity.setListingStatus(dto.getListingStatus());
        
        return entity;
    }
    
    /**
     * Convert GemImage entities to response format
     */
    private List<Map<String, Object>> convertImagesToResponseFormat(List<GemImage> images) {
        List<Map<String, Object>> imageList = new ArrayList<>();
        
        for (GemImage image : images) {
            Map<String, Object> imageInfo = new HashMap<>();
            imageInfo.put("imageId", image.getImageId());
            imageInfo.put("originalName", image.getOriginalName());
            imageInfo.put("contentType", image.getContentType());
            imageInfo.put("size", image.getSize());
            imageInfo.put("imageUrl", image.getImageUrl());
            imageInfo.put("thumbnailUrl", image.getThumbnailUrl());
            imageInfo.put("isPrimary", image.getIsPrimary());
            imageInfo.put("displayOrder", image.getDisplayOrder());
            imageInfo.put("uploadedAt", image.getUploadedAt());
            
            imageList.add(imageInfo);
        }
        
        return imageList;
    }
    
    /**
     * Get all gem listings with pagination and filtering
     */
    public ApiResponse<Map<String, Object>> getAllGemListings(int page, int size, String status, Boolean isCertified, Long userId) {
        System.out.println("📋 Retrieving gem listings from database...");
        System.out.println("📄 Page: " + page + ", Size: " + size);
        System.out.println("🔍 Filters - Status: " + status + ", Certified: " + isCertified + ", UserId: " + userId);
        
        try {
            // Create pagination
            org.springframework.data.domain.Pageable pageable = 
                org.springframework.data.domain.PageRequest.of(page, size, 
                    org.springframework.data.domain.Sort.by("createdAt").descending());
            
            // Get listings based on filters
            org.springframework.data.domain.Page<GemListing> listings;
            
            if (userId != null) {
                // Get listings for specific user
                if (status != null && !status.isEmpty()) {
                    if (isCertified != null) {
                        listings = gemListingRepository.findByUserIdAndListingStatusAndIsCertified(
                            userId.toString(), status, isCertified, pageable);
                    } else {
                        listings = gemListingRepository.findByUserIdAndListingStatus(
                            userId.toString(), status, pageable);
                    }
                } else {
                    if (isCertified != null) {
                        listings = gemListingRepository.findByUserIdAndIsCertified(
                            userId.toString(), isCertified, pageable);
                    } else {
                        listings = gemListingRepository.findByUserId(userId.toString(), pageable);
                    }
                }
            } else {
                // Get all listings with filters
                if (status != null && !status.isEmpty()) {
                    if (isCertified != null) {
                        listings = gemListingRepository.findByListingStatusAndIsCertified(
                            status, isCertified, pageable);
                    } else {
                        listings = gemListingRepository.findByListingStatus(status, pageable);
                    }
                } else {
                    if (isCertified != null) {
                        listings = gemListingRepository.findByIsCertified(isCertified, pageable);
                    } else {
                        listings = gemListingRepository.findAll(pageable);
                    }
                }
            }
            
            // Convert to response format
            List<Map<String, Object>> listingsList = new ArrayList<>();
            for (GemListing listing : listings.getContent()) {
                Map<String, Object> listingData = convertEntityToResponseFormat(listing);
                listingsList.add(listingData);
            }
            
            // Prepare response data
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("listings", listingsList);
            responseData.put("totalElements", listings.getTotalElements());
            responseData.put("totalPages", listings.getTotalPages());
            responseData.put("currentPage", page);
            responseData.put("pageSize", size);
            responseData.put("hasNext", listings.hasNext());
            responseData.put("hasPrevious", listings.hasPrevious());
            responseData.put("isFirst", listings.isFirst());
            responseData.put("isLast", listings.isLast());
            
            // Add filter info
            responseData.put("appliedFilters", Map.of(
                "status", status != null ? status : "all",
                "isCertified", isCertified != null ? isCertified : "all",
                "userId", userId != null ? userId : "all"
            ));
            
            System.out.println("✅ Successfully retrieved " + listings.getNumberOfElements() + 
                             " listings from database (Total: " + listings.getTotalElements() + ")");
            
            return ApiResponse.success("Gem listings retrieved successfully", responseData);
            
        } catch (Exception e) {
            System.err.println("❌ Error retrieving gem listings: " + e.getMessage());
            e.printStackTrace();
            return ApiResponse.error("Failed to retrieve gem listings: " + e.getMessage());
        }
    }
    
    /**
     * Convert GemListing entity to response format
     */
    private Map<String, Object> convertEntityToResponseFormat(GemListing listing) {
        Map<String, Object> data = new HashMap<>();
        
        // Basic listing information
        data.put("id", listing.getId());
        data.put("userId", listing.getUserId());
        data.put("userName", listing.getUserName());
        data.put("userRole", listing.getUserRole());
        
        // Gem information
        data.put("gemName", listing.getGemName());
        data.put("category", listing.getCategory());
        data.put("description", listing.getDescription());
        data.put("price", listing.getPrice());
        data.put("currency", listing.getCurrency());
        
        // Certification status
        data.put("isCertified", listing.getIsCertified());
        
        // Gem details
        data.put("color", listing.getColor());
        data.put("shape", listing.getShape());
        data.put("weight", listing.getWeight());
        data.put("measurements", listing.getMeasurements());
        data.put("variety", listing.getVariety());
        data.put("species", listing.getSpecies());
        data.put("treatment", listing.getTreatment());
        
        // For non-certified gems (CSL format)
        if (listing.isNonCertifiedStone()) {
            data.put("cslMemoNo", listing.getCslMemoNo());
            data.put("issueDate", listing.getIssueDate());
            data.put("authority", listing.getAuthority());
            data.put("giaAlumniMember", listing.getGiaAlumniMember());
        }
        
        // For certified gems
        if (listing.isCertifiedStone()) {
            data.put("certificateNumber", listing.getCertificateNumber());
            data.put("certifyingAuthority", listing.getCertifyingAuthority());
            data.put("clarity", listing.getClarity());
            data.put("cut", listing.getCut());
            data.put("origin", listing.getOrigin());
        }
        
        // Listing metadata
        data.put("listingStatus", listing.getListingStatus());
        data.put("createdAt", listing.getCreatedAt());
        data.put("updatedAt", listing.getUpdatedAt());
        
        // Image information
        data.put("primaryImageUrl", listing.getPrimaryImageUrl());
        if (listing.getImages() != null && !listing.getImages().isEmpty()) {
            data.put("imagesCount", listing.getImages().size());
            data.put("images", convertImagesToResponseFormat(listing.getImages()));
        } else {
            data.put("imagesCount", 0);
            data.put("images", new ArrayList<>());
        }
        
        // Additional metadata
        data.put("comments", listing.getComments());
        
        // Add UI-friendly fields
        data.put("name", listing.getGemName()); // For UI compatibility
        data.put("status", listing.getListingStatus()); // For UI compatibility
        data.put("image", listing.getPrimaryImageUrl() != null ? 
                listing.getPrimaryImageUrl() : "https://via.placeholder.com/100"); // Fallback image
        data.put("bids", 0); // TODO: Implement bid counting
        data.put("views", 0); // TODO: Implement view counting
        
        return data;
    }
    
    /**
     * Helper method to get file extension
     */
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }
}
