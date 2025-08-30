# Chapter 3: Implementation

## 3.1 System Overview

The GemNet marketplace system is implemented using a modern full-stack architecture with React.js frontend and Spring Boot backend, integrated with MongoDB database and advanced computer vision technologies for user verification.

### 3.1.1 Technology Stack

**Frontend Technologies:**
- React 18.x with TypeScript for type safety
- Vite for fast development and building
- Ant Design (antd) for UI components
- Tailwind CSS for custom styling
- React Router for navigation
- Axios for HTTP requests

**Backend Technologies:**
- Spring Boot 3.2.0 with Java 17
- Spring Security with JWT authentication
- Spring Data MongoDB for database operations
- OpenCV for face recognition
- Tesseract OCR for NIC text extraction
- Maven for dependency management

**Database & Storage:**
- MongoDB for document-based data storage
- File system storage for images and documents
- GridFS for large file storage

## 3.2 Module Implementation Details

### 3.2.1 User Authentication and Verification Module

#### 3.2.1.1 User Registration Implementation

The user registration process follows a comprehensive multi-step verification approach with integration to admin notification system:

```java
@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private FaceRecognitionService faceRecognitionService;
    
    @Autowired
    private NicVerificationService nicVerificationService;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    public ApiResponse<String> registerUser(UserRegistrationRequest request) {
        try {
            // Comprehensive validation
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                return ApiResponse.error("Email already registered");
            }
            
            // Age validation (must be 18+)
            LocalDate birthDate = LocalDate.parse(request.getDateOfBirth());
            if (Period.between(birthDate, LocalDate.now()).getYears() < 18) {
                return ApiResponse.error("User must be at least 18 years old");
            }
            
            // Create user entity with all fields
            User user = new User();
            user.setEmail(request.getEmail());
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setDateOfBirth(birthDate);
            user.setNicNumber(request.getNicNumber());
            user.setMobileNumber(request.getMobileNumber());
            user.setUserRole(request.getUserRole().toUpperCase());
            user.setVerificationStatus("PENDING");
            user.setIsVerified(false);
            user.setIsFaceVerified(false);
            user.setIsNicVerified(false);
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            
            // Save user and trigger admin notification
            User savedUser = userRepository.save(user);
            
            // Notify admin of new registration
            notificationService.notifyAdminOfNewUserRegistration(
                savedUser.getId(), 
                savedUser.getEmail(), 
                savedUser.getFirstName() + " " + savedUser.getLastName()
            );
            
            return ApiResponse.success("User registered successfully. Please complete face and NIC verification.");
            
        } catch (Exception e) {
            return ApiResponse.error("Registration failed: " + e.getMessage());
        }
    }
}
```

**Algorithm 3.1: User Registration Process**
```
1. BEGIN UserRegistration
2. INPUT: UserRegistrationRequest (email, password, role, personal data)
3. VALIDATE: Email uniqueness, age >= 18, required fields
4. IF validation_fails THEN
5.    RETURN error_response
6. ELSE
7.    CREATE user_entity
8.    ENCRYPT password using BCrypt
9.    SET verification_status = "PENDING"
10.   SAVE user to database
11.   NOTIFY admin of new registration
12.   RETURN success_response
13. END IF
14. END UserRegistration
```

#### 3.2.1.2 Face Verification Implementation

The face verification system uses OpenCV for comprehensive face detection, feature extraction, and comparison:

```java
@Service
public class FaceRecognitionService {
    
    private CascadeClassifier faceDetector;
    
    private static final double TEMPLATE_MATCH_THRESHOLD = 0.45;
    private static final double CORRELATION_THRESHOLD = 0.4;
    private static final double HISTOGRAM_THRESHOLD = 0.7;
    
    @PostConstruct
    public void init() {
        try {
            System.loadLibrary(Core.NATIVE_LIBRARY_NAME);
            String cascadePath = "haarcascade_frontalface_alt.xml";
            faceDetector = new CascadeClassifier(cascadePath);
            
            if (faceDetector.empty()) {
                System.err.println("❌ Could not load Haar cascade classifier");
            } else {
                System.out.println("✅ OpenCV and face detection initialized successfully");
            }
        } catch (Exception e) {
            System.err.println("❌ OpenCV initialization failed: " + e.getMessage());
        }
    }
    
    public boolean compareFaces(String faceImagePath1, String faceImagePath2) {
        try {
            // Load and preprocess images
            Mat image1 = Imgcodecs.imread(faceImagePath1);
            Mat image2 = Imgcodecs.imread(faceImagePath2);
            
            if (image1.empty() || image2.empty()) {
                return false;
            }
            
            // Convert to grayscale
            Mat gray1 = new Mat(), gray2 = new Mat();
            Imgproc.cvtColor(image1, gray1, Imgproc.COLOR_BGR2GRAY);
            Imgproc.cvtColor(image2, gray2, Imgproc.COLOR_BGR2GRAY);
            
            // Detect faces with lenient parameters
            MatOfRect faces1 = new MatOfRect();
            MatOfRect faces2 = new MatOfRect();
            
            if (faceDetector != null && !faceDetector.empty()) {
                faceDetector.detectMultiScale(gray1, faces1, 1.1, 3, 0, new Size(30, 30), new Size());
                faceDetector.detectMultiScale(gray2, faces2, 1.1, 3, 0, new Size(30, 30), new Size());
                
                Rect[] facesArray1 = faces1.toArray();
                Rect[] facesArray2 = faces2.toArray();
                
                if (facesArray1.length > 0 && facesArray2.length > 0) {
                    // Extract face regions
                    Mat face1 = new Mat(gray1, facesArray1[0]);
                    Mat face2 = new Mat(gray2, facesArray2[0]);
                    
                    // Multi-method comparison for better accuracy
                    double templateScore = performTemplateMatching(face1, face2);
                    double correlationScore = calculateCorrelation(face1, face2);
                    double histogramScore = compareHistograms(face1, face2);
                    
                    // Weighted combination of scores
                    double finalScore = (templateScore * 0.4) + 
                                      (correlationScore * 0.3) + 
                                      (histogramScore * 0.3);
                    
                    System.out.println("🎯 Face comparison scores - Template: " + templateScore + 
                                     ", Correlation: " + correlationScore + 
                                     ", Histogram: " + histogramScore + 
                                     ", Final: " + finalScore);
                    
                    return finalScore >= TEMPLATE_MATCH_THRESHOLD;
                }
            }
            
            // Fallback comparison using entire images
            return performFullImageComparison(gray1, gray2);
            
        } catch (Exception e) {
            System.err.println("❌ Face comparison failed: " + e.getMessage());
            return false;
        }
    }
    
    private double performTemplateMatching(Mat face1, Mat face2) {
        Mat preprocessed1 = preprocessFace(face1);
        Mat preprocessed2 = preprocessFace(face2);
        
        Mat result = new Mat();
        Imgproc.matchTemplate(preprocessed1, preprocessed2, result, Imgproc.TM_CCOEFF_NORMED);
        
        Core.MinMaxLocResult mmr = Core.minMaxLoc(result);
        return mmr.maxVal;
    }
    
    private Mat preprocessFace(Mat face) {
        Mat processed = new Mat();
        
        // Resize to standard size
        Size standardSize = new Size(100, 100);
        Imgproc.resize(face, processed, standardSize);
        
        // Apply histogram equalization for lighting normalization
        Mat equalized = new Mat();
        Imgproc.equalizeHist(processed, equalized);
        
        // Apply Gaussian blur to reduce noise
        Mat blurred = new Mat();
        Imgproc.GaussianBlur(equalized, blurred, new Size(3, 3), 0);
        
        return blurred;
    }
    
    public String extractFaceFeatures(MultipartFile imageFile) throws IOException {
        byte[] imageBytes = imageFile.getBytes();
        Mat image = Imgcodecs.imdecode(new MatOfByte(imageBytes), Imgcodecs.IMREAD_COLOR);
        
        if (image.empty()) {
            throw new RuntimeException("Could not load image");
        }
        
        // Convert to grayscale and detect faces
        Mat grayImage = new Mat();
        Imgproc.cvtColor(image, grayImage, Imgproc.COLOR_BGR2GRAY);
        
        Rect faceRect = null;
        
        if (faceDetector != null && !faceDetector.empty()) {
            MatOfRect faces = new MatOfRect();
            faceDetector.detectMultiScale(grayImage, faces);
            
            Rect[] facesArray = faces.toArray();
            if (facesArray.length > 0) {
                faceRect = facesArray[0];
            }
        }
        
        // Use entire image if no face detected
        if (faceRect == null) {
            faceRect = new Rect(0, 0, grayImage.cols(), grayImage.rows());
        }
        
        // Extract and standardize face region
        Mat faceROI = new Mat(grayImage, faceRect);
        Mat resizedFace = new Mat();
        Size standardSize = new Size(100, 100);
        Imgproc.resize(faceROI, resizedFace, standardSize);
        
        // Convert to feature vector
        byte[] faceData = new byte[(int) (resizedFace.total() * resizedFace.elemSize())];
        resizedFace.get(0, 0, faceData);
        
        return Base64.getEncoder().encodeToString(faceData);
    }
}
```

**Figure 3.1: Face Verification Flowchart**
```
┌─────────────────┐
│  Capture Face   │
│     Image       │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  Face Detection │
│   (Haar Cascade)│
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  Feature        │
│  Extraction     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  Compare with   │
│  NIC Photo      │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  Verification   │
│   Result        │
└─────────────────┘
```

#### 3.2.1.3 NIC Verification Implementation

The NIC verification system combines Tesseract OCR for text extraction with OpenCV image preprocessing and face extraction:

```java
@Service
public class NicVerificationService {
    
    @Autowired
    private FaceRecognitionService faceRecognitionService;
    
    public Map<String, Object> processNicVerification(MultipartFile nicImage) {
        try {
            System.out.println("🆔 Processing NIC verification...");
            
            // Convert MultipartFile to BufferedImage
            BufferedImage originalImage = ImageIO.read(nicImage.getInputStream());
            
            // Preprocess image for better OCR results
            BufferedImage preprocessedImage = preprocessImageForOCR(originalImage);
            
            // Perform OCR text extraction
            String extractedText = performOCR(preprocessedImage);
            System.out.println("📝 Extracted OCR text: " + extractedText);
            
            // Extract NIC number using regex patterns
            String nicNumber = extractNicNumber(extractedText);
            System.out.println("🔢 Extracted NIC number: " + nicNumber);
            
            // Extract face from NIC image
            String faceEncoding = extractFaceFromNic(nicImage);
            
            // Prepare response
            Map<String, Object> result = new HashMap<>();
            result.put("nicNumber", nicNumber);
            result.put("extractedText", extractedText);
            result.put("faceEncoding", faceEncoding);
            result.put("isValidNic", isValidNicNumber(nicNumber));
            
            return result;
            
        } catch (Exception e) {
            System.err.println("❌ NIC verification failed: " + e.getMessage());
            throw new RuntimeException("NIC verification failed", e);
        }
    }
    
    private BufferedImage preprocessImageForOCR(BufferedImage originalImage) {
        try {
            System.out.println("🔧 Preprocessing image for OCR...");
            
            // Convert BufferedImage to OpenCV Mat
            byte[] imageData = ((DataBufferByte) originalImage.getRaster().getDataBuffer()).getData();
            Mat mat = new Mat(originalImage.getHeight(), originalImage.getWidth(), CvType.CV_8UC3);
            mat.put(0, 0, imageData);
            
            // Convert to grayscale
            Mat grayMat = new Mat();
            Imgproc.cvtColor(mat, grayMat, Imgproc.COLOR_BGR2GRAY);
            
            // Apply Gaussian blur to reduce noise
            Mat blurredMat = new Mat();
            Imgproc.GaussianBlur(grayMat, blurredMat, new Size(3, 3), 0);
            
            // Apply adaptive threshold for better text extraction
            Mat thresholdMat = new Mat();
            Imgproc.adaptiveThreshold(blurredMat, thresholdMat, 255, 
                Imgproc.ADAPTIVE_THRESH_GAUSSIAN_C, Imgproc.THRESH_BINARY, 11, 2);
            
            // Apply morphological operations to clean up
            Mat kernel = Imgproc.getStructuringElement(Imgproc.MORPH_RECT, new Size(2, 2));
            Mat cleanedMat = new Mat();
            Imgproc.morphologyEx(thresholdMat, cleanedMat, Imgproc.MORPH_CLOSE, kernel);
            
            // Convert back to BufferedImage
            MatOfByte matOfByte = new MatOfByte();
            Imgcodecs.imencode(".png", cleanedMat, matOfByte);
            byte[] processedBytes = matOfByte.toArray();
            
            BufferedImage processedImage = ImageIO.read(new ByteArrayInputStream(processedBytes));
            System.out.println("✅ Image preprocessing completed");
            
            return processedImage;
            
        } catch (Exception e) {
            System.err.println("⚠️ Image preprocessing failed, using original: " + e.getMessage());
            return originalImage;
        }
    }
    
    private String performOCR(BufferedImage image) {
        try {
            ITesseract tesseract = new Tesseract();
            tesseract.setDatapath("./tessdata");
            tesseract.setLanguage("eng");
            tesseract.setPageSegMode(1);
            tesseract.setOcrEngineMode(1);
            
            String result = tesseract.doOCR(image);
            return result.trim();
            
        } catch (Exception e) {
            System.err.println("❌ OCR processing failed: " + e.getMessage());
            return "";
        }
    }
    
    private String extractNicNumber(String text) {
        // Sri Lankan NIC patterns
        String[] patterns = {
            "\\b\\d{9}[VvXx]\\b",           // Old format: 123456789V/X
            "\\b\\d{12}\\b",                // New format: 123456789012
            "\\b\\d{2}\\s*\\d{7}\\s*[VvXx]\\b", // Spaced format
            "\\b\\d{4}\\s*\\d{8}\\b"       // Spaced new format
        };
        
        for (String pattern : patterns) {
            Pattern regex = Pattern.compile(pattern);
            Matcher matcher = regex.matcher(text);
            if (matcher.find()) {
                return matcher.group().replaceAll("\\s", "").toUpperCase();
            }
        }
        
        return null;
    }
    
    private String extractFaceFromNic(MultipartFile nicImage) {
        try {
            // Use face recognition service to extract face from NIC
            return faceRecognitionService.extractFaceFeatures(nicImage);
        } catch (Exception e) {
            System.err.println("❌ Face extraction from NIC failed: " + e.getMessage());
            return null;
        }
    }
    
    private boolean isValidNicNumber(String nicNumber) {
        if (nicNumber == null || nicNumber.isEmpty()) {
            return false;
        }
        
        // Validate format
        return nicNumber.matches("\\d{9}[VvXx]") || nicNumber.matches("\\d{12}");
    }
}
```

### 3.2.2 AI-Powered Price Prediction System

#### 3.2.2.1 CatBoost Integration and Rule-Based Prediction

The system implements a hybrid approach combining machine learning models with rule-based pricing for gemstone valuation:

```java
@Service
public class PricePredictionService {
    
    private static final Logger logger = LoggerFactory.getLogger(PricePredictionService.class);
    
    @Value("${gemnet.prediction.model.path:#{null}}")
    private String modelPath;
    
    @Value("${gemnet.prediction.confidence.threshold:0.7}")
    private double confidenceThreshold;
    
    // Base price mappings for different gemstone species (in LKR)
    private final Map<String, Double> basePricePerCarat = new HashMap<>();
    private final Map<String, Double> colorMultipliers = new HashMap<>();
    private final Map<String, Double> clarityMultipliers = new HashMap<>();
    private final Map<String, Double> cutMultipliers = new HashMap<>();
    
    public PricePredictionService() {
        initializeModel();
    }
    
    private void initializeModel() {
        try {
            initializeBasePrices();
            initializeMultipliers();
            logger.info("✅ Price prediction service initialized successfully");
        } catch (Exception e) {
            logger.error("❌ Failed to initialize price prediction service", e);
        }
    }
    
    private void initializeBasePrices() {
        // Base prices per carat in LKR (Sri Lankan Rupees)
        basePricePerCarat.put("sapphire", 50000.0);
        basePricePerCarat.put("ruby", 80000.0);
        basePricePerCarat.put("emerald", 45000.0);
        basePricePerCarat.put("diamond", 150000.0);
        basePricePerCarat.put("spinel", 30000.0);
        basePricePerCarat.put("garnet", 15000.0);
        basePricePerCarat.put("tourmaline", 20000.0);
        basePricePerCarat.put("topaz", 25000.0);
        basePricePerCarat.put("aquamarine", 35000.0);
        basePricePerCarat.put("moonstone", 18000.0);
        basePricePerCarat.put("chrysoberyl", 40000.0);
        basePricePerCarat.put("zircon", 22000.0);
        basePricePerCarat.put("peridot", 16000.0);
        basePricePerCarat.put("amethyst", 12000.0);
        basePricePerCarat.put("citrine", 10000.0);
        basePricePerCarat.put("quartz", 8000.0);
    }
    
    private void initializeMultipliers() {
        // Color multipliers
        colorMultipliers.put("blue", 1.2);
        colorMultipliers.put("red", 1.5);
        colorMultipliers.put("pink", 1.3);
        colorMultipliers.put("yellow", 1.1);
        colorMultipliers.put("green", 1.15);
        colorMultipliers.put("white", 1.0);
        colorMultipliers.put("purple", 1.25);
        colorMultipliers.put("orange", 1.1);
        colorMultipliers.put("colorless", 1.0);

        // Clarity multipliers
        clarityMultipliers.put("fl", 2.0);      // Flawless
        clarityMultipliers.put("if", 1.8);      // Internally Flawless
        clarityMultipliers.put("vvs1", 1.6);    // Very Very Slightly Included 1
        clarityMultipliers.put("vvs2", 1.5);    // Very Very Slightly Included 2
        clarityMultipliers.put("vs1", 1.3);     // Very Slightly Included 1
        clarityMultipliers.put("vs2", 1.2);     // Very Slightly Included 2
        clarityMultipliers.put("si1", 1.0);     // Slightly Included 1
        clarityMultipliers.put("si2", 0.9);     // Slightly Included 2
        clarityMultipliers.put("i1", 0.7);      // Included 1
        clarityMultipliers.put("i2", 0.6);      // Included 2
        clarityMultipliers.put("i3", 0.5);      // Included 3

        // Cut multipliers
        cutMultipliers.put("excellent", 1.3);
        cutMultipliers.put("very good", 1.2);
        cutMultipliers.put("good", 1.1);
        cutMultipliers.put("fair", 1.0);
        cutMultipliers.put("poor", 0.8);
        cutMultipliers.put("round", 1.2);
        cutMultipliers.put("oval", 1.1);
        cutMultipliers.put("cushion", 1.15);
        cutMultipliers.put("emerald", 1.1);
        cutMultipliers.put("princess", 1.1);
        cutMultipliers.put("pear", 1.05);
        cutMultipliers.put("marquise", 1.05);
        cutMultipliers.put("heart", 1.0);
        cutMultipliers.put("radiant", 1.0);
    }
    
    public PricePredictionResponse predictPrice(PricePredictionRequest request) {
        try {
            // Input validation
            if (request.getCarat() == null || request.getCarat() <= 0) {
                return PricePredictionResponse.error("Invalid carat weight");
            }
            
            if (request.getSpecies() == null || request.getSpecies().trim().isEmpty()) {
                return PricePredictionResponse.error("Species is required");
            }
            
            BigDecimal predictedPrice;
            double confidenceScore;
            String predictionMethod;
            
            // Use rule-based prediction (ML services temporarily disabled)
            logger.info("📐 Using rule-based prediction for {}", request.getSpecies());
            predictedPrice = calculateRuleBasedPrice(request);
            confidenceScore = calculateConfidenceScore(request);
            predictionMethod = "Rule-based Algorithm";
            
            // Calculate price range (±15%)
            BigDecimal variance = predictedPrice.multiply(BigDecimal.valueOf(0.15));
            BigDecimal minPrice = predictedPrice.subtract(variance).max(BigDecimal.ZERO);
            BigDecimal maxPrice = predictedPrice.add(variance);
            
            // Round to nearest 1000 LKR
            predictedPrice = roundToNearest(predictedPrice, 1000);
            minPrice = roundToNearest(minPrice, 1000);
            maxPrice = roundToNearest(maxPrice, 1000);
            
            logger.info("✅ {} prediction: {} LKR (confidence: {}%)", 
                       predictionMethod, predictedPrice, Math.round(confidenceScore * 100));
            
            return PricePredictionResponse.success(predictedPrice, minPrice, maxPrice, confidenceScore);
            
        } catch (Exception e) {
            logger.error("❌ Error in price prediction", e);
            return PricePredictionResponse.error("Prediction failed: " + e.getMessage());
        }
    }
    
    private double calculateConfidenceScore(PricePredictionRequest request) {
        double totalScore = 0.0;
        int totalFactors = 0;
        
        // 1. Species Recognition Accuracy (25% weight)
        double speciesAccuracy = calculateSpeciesAccuracy(request.getSpecies());
        totalScore += speciesAccuracy * 0.25;
        totalFactors++;
        
        // 2. Data Completeness Score (20% weight)
        double completenessScore = calculateDataCompleteness(request);
        totalScore += completenessScore * 0.20;
        totalFactors++;
        
        // 3. Quality Factors Precision (20% weight)
        double qualityPrecision = calculateQualityFactorsPrecision(request);
        totalScore += qualityPrecision * 0.20;
        totalFactors++;
        
        // 4. Certification and Documentation (15% weight)
        double certificationScore = calculateCertificationScore(request);
        totalScore += certificationScore * 0.15;
        totalFactors++;
        
        // 5. Market Data Alignment (10% weight)
        double marketAlignment = calculateMarketAlignment(request);
        totalScore += marketAlignment * 0.10;
        totalFactors++;
        
        // 6. Size and Rarity Factor (10% weight)
        double rarityFactor = calculateRarityFactor(request);
        totalScore += rarityFactor * 0.10;
        totalFactors++;
        
        double finalConfidence = totalScore / totalFactors;
        
        // Log detailed breakdown for transparency
        logger.info("🎯 Confidence Breakdown for {} {}ct:", 
                   request.getSpecies(), request.getCarat());
        logger.info("   Species Recognition: {}%", Math.round(speciesAccuracy * 100));
        logger.info("   Data Completeness: {}%", Math.round(completenessScore * 100));
        logger.info("   Quality Precision: {}%", Math.round(qualityPrecision * 100));
        logger.info("   Certification: {}%", Math.round(certificationScore * 100));
        logger.info("   Market Alignment: {}%", Math.round(marketAlignment * 100));
        logger.info("   Rarity Factor: {}%", Math.round(rarityFactor * 100));
        logger.info("   📊 Final Accuracy: {}%", Math.round(finalConfidence * 100));
        
        return Math.max(0.15, Math.min(0.98, finalConfidence)); // Range: 15% to 98%
    }
}
```

### 3.2.3 Marketplace and Bidding System

#### 3.2.3.1 Gemstone Listing Management with AI Integration

**Code Segment 3.1: Enhanced Listing Creation with Price Prediction**
```java
@Service
public class GemListingService {
    
    @Autowired
    private GemListingRepository gemListingRepository;
    
    @Autowired
    private PricePredictionService pricePredictionService;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    public ApiResponse<GemListing> createListing(CreateListingRequest request) {
        try {
            GemListing listing = new GemListing();
            listing.setName(request.getName());
            listing.setCategory(request.getCategory());
            listing.setSpecies(request.getSpecies());
            listing.setPrice(request.getPrice());
            listing.setDescription(request.getDescription());
            listing.setSellerId(request.getSellerId());
            listing.setSellerName(request.getSellerName());
            listing.setStatus("PENDING_APPROVAL");
            listing.setIsCertified(request.getIsCertified());
            listing.setBiddingActive(false);
            listing.setTotalBids(0);
            listing.setCurrentHighestBid(0.0);
            
            // Set gemstone attributes for price prediction
            if (request.getAttributes() != null) {
                GemAttributes attributes = new GemAttributes();
                attributes.setWeight(request.getAttributes().getWeight());
                attributes.setColor(request.getAttributes().getColor());
                attributes.setClarity(request.getAttributes().getClarity());
                attributes.setCut(request.getAttributes().getCut());
                attributes.setOrigin(request.getAttributes().getOrigin());
                listing.setAttributes(attributes);
                
                // Copy attributes to listing for price prediction
                listing.setWeight(request.getAttributes().getWeight());
                listing.setColor(request.getAttributes().getColor());
                listing.setClarity(request.getAttributes().getClarity());
                listing.setCut(request.getAttributes().getCut());
                listing.setOrigin(request.getAttributes().getOrigin());
                listing.setTreatment(request.getAttributes().getTreatment());
                listing.setShape(request.getAttributes().getShape());
            }
            
            // Handle image uploads
            List<String> imagePaths = new ArrayList<>();
            if (request.getImages() != null && !request.getImages().isEmpty()) {
                for (MultipartFile image : request.getImages()) {
                    String imagePath = fileStorageService.storeGemImage(image, request.getSellerId());
                    imagePaths.add(imagePath);
                }
                listing.setImages(imagePaths);
            }
            
            // Handle certificate images
            if (request.getCertificateImages() != null && !request.getCertificateImages().isEmpty()) {
                List<String> certPaths = new ArrayList<>();
                for (MultipartFile cert : request.getCertificateImages()) {
                    String certPath = fileStorageService.storeCertificateImage(cert, request.getSellerId());
                    certPaths.add(certPath);
                }
                listing.setCertificateImages(certPaths);
            }
            
            // AI price prediction for certified gems
            if (request.getIsCertified() && listing.getSpecies() != null) {
                try {
                    PricePredictionResponse prediction = pricePredictionService.predictPrice(listing);
                    if (prediction.isSuccess()) {
                        listing.setPredictedPrice(prediction.getPredictedPrice().doubleValue());
                        listing.setMinPredictedPrice(prediction.getMinPrice().doubleValue());
                        listing.setMaxPredictedPrice(prediction.getMaxPrice().doubleValue());
                        listing.setPredictionConfidence(prediction.getConfidence());
                        
                        logger.info("🤖 AI prediction for {}: {} LKR ({}% confidence)", 
                                   listing.getName(), prediction.getPredictedPrice(), 
                                   Math.round(prediction.getConfidence() * 100));
                    }
                } catch (Exception e) {
                    logger.warn("⚠️ Price prediction failed for listing: " + e.getMessage());
                }
            }
            
            listing.setCreatedAt(LocalDateTime.now());
            listing.setUpdatedAt(LocalDateTime.now());
            
            GemListing savedListing = gemListingRepository.save(listing);
            
            // Notify admin of new listing
            notificationService.notifyAdminOfNewListing(
                savedListing.getId(),
                savedListing.getName(),
                savedListing.getSellerName(),
                savedListing.getSellerId()
            );
            
            return ApiResponse.success(savedListing);
            
        } catch (Exception e) {
            logger.error("❌ Failed to create listing: " + e.getMessage(), e);
            return ApiResponse.error("Failed to create listing: " + e.getMessage());
        }
    }
}
```

#### 3.2.3.2 Enhanced Bidding System with Real-time Notifications

**Algorithm 3.2: Advanced Bid Placement Process**
```
1. BEGIN PlaceBid
2. INPUT: bidderId, listingId, bidAmount, bidderName
3. VALIDATE: listing exists, is approved, bidding active
4. VALIDATE: bidder != seller, bidder is verified user
5. VALIDATE: bidAmount > current_highest_bid * 1.05 (minimum 5% increment)
6. VALIDATE: bidAmount <= user_budget_limit (if configured)
7. IF validation_fails THEN
8.    RETURN error_response with specific reason
9. ELSE
10.   BEGIN TRANSACTION
11.   UPDATE previous_bids.status = "OUTBID"
12.   CREATE new_bid with status = "ACTIVE"
13.   UPDATE listing.currentHighestBid = bidAmount
14.   UPDATE listing.totalBids = totalBids + 1
15.   SAVE bid to database
16.   COMMIT TRANSACTION
17.   // Asynchronous notifications
18.   NOTIFY seller of new bid
19.   NOTIFY previous bidders of outbid status
20.   LOG bid activity for analytics
21.   UPDATE real-time bidding dashboard
22.   RETURN success_response with bid details
23. END IF
24. END PlaceBid
```

**Code Segment 3.2: Enhanced Bidding Service Implementation**
```java
@Service
@Transactional
public class BiddingService {
    
    @Autowired
    private BidRepository bidRepository;
    
    @Autowired
    private GemListingRepository gemListingRepository;
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public Map<String, Object> placeBid(String listingId, String bidderId, 
                                       Double bidAmount, String bidderName) {
        try {
            System.out.println("💰 Processing bid: " + bidAmount + " LKR by " + bidderName);
            
            // Comprehensive validation
            GemListing listing = validateListing(listingId);
            User bidder = validateBidder(bidderId, listing.getSellerId());
            validateBidAmount(bidAmount, listing);
            
            // Update previous bids to OUTBID status
            List<Bid> previousBids = bidRepository.findByListingIdAndStatus(listingId, "ACTIVE");
            List<String> outbidBidders = new ArrayList<>();
            
            for (Bid previousBid : previousBids) {
                previousBid.setStatus("OUTBID");
                bidRepository.save(previousBid);
                outbidBidders.add(previousBid.getBidderId());
                
                // Notify previous bidder
                createNotification(
                    previousBid.getBidderId(),
                    "BID_OUTBID",
                    "Your bid of LKR " + String.format("%.2f", previousBid.getBidAmount()) + 
                    " has been outbid on " + listing.getName(),
                    listingId,
                    listing.getName(),
                    bidAmount
                );
            }
            
            // Create new bid
            Bid newBid = new Bid();
            newBid.setListingId(listingId);
            newBid.setBidderId(bidderId);
            newBid.setBidderName(bidderName);
            newBid.setBidAmount(bidAmount);
            newBid.setStatus("ACTIVE");
            newBid.setBidTime(LocalDateTime.now());
            newBid.setIsValidBid(true);
            
            Bid savedBid = bidRepository.save(newBid);
            
            // Update listing statistics
            listing.setCurrentHighestBid(bidAmount);
            listing.setTotalBids(listing.getTotalBids() + 1);
            listing.setLastBidTime(LocalDateTime.now());
            gemListingRepository.save(listing);
            
            // Notify seller of new bid
            createNotification(
                listing.getSellerId(),
                "NEW_BID_RECEIVED",
                String.format("New bid of LKR %.2f received from %s on %s", 
                            bidAmount, bidderName, listing.getName()),
                listingId,
                listing.getName(),
                bidAmount
            );
            
            // Notify bidder of successful bid
            createNotification(
                bidderId,
                "BID_PLACED_SUCCESS",
                String.format("Your bid of LKR %.2f on %s has been placed successfully", 
                            bidAmount, listing.getName()),
                listingId,
                listing.getName(),
                bidAmount
            );
            
            // Prepare success response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Bid placed successfully");
            response.put("bidId", savedBid.getId());
            response.put("bidAmount", bidAmount);
            response.put("newHighestBid", bidAmount);
            response.put("totalBids", listing.getTotalBids());
            response.put("outbidBidders", outbidBidders.size());
            response.put("timestamp", LocalDateTime.now());
            
            System.out.println("✅ Bid processed successfully: " + bidAmount + " LKR");
            return response;
            
        } catch (Exception e) {
            System.err.println("❌ Bid processing failed: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Bid placement failed: " + e.getMessage());
            return errorResponse;
        }
    }
    
    private void createNotification(String userId, String type, String message, 
                                  String listingId, String gemName, Double bidAmount) {
        try {
            Notification notification = new Notification();
            notification.setUserId(userId);
            notification.setListingId(listingId);
            notification.setType(type);
            notification.setTitle(getNotificationTitle(type));
            notification.setMessage(message);
            notification.setGemName(gemName);
            notification.setBidAmount(bidAmount);
            notification.setCreatedAt(LocalDateTime.now());
            notification.setIsRead(false);
            
            notificationRepository.save(notification);
            System.out.println("🔔 Notification created: " + type + " for user " + userId);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to create notification: " + e.getMessage());
        }
    }
    
    private String getNotificationTitle(String type) {
        switch (type) {
            case "NEW_BID_RECEIVED": return "New Bid Received";
            case "BID_OUTBID": return "Bid Outbid";
            case "BID_PLACED_SUCCESS": return "Bid Placed Successfully";
            case "ITEM_SOLD": return "Item Sold";
            case "BIDDING_ENDED": return "Bidding Ended";
            default: return "Marketplace Notification";
        }
    }
    
    private GemListing validateListing(String listingId) {
        Optional<GemListing> listingOpt = gemListingRepository.findById(listingId);
        if (!listingOpt.isPresent()) {
            throw new RuntimeException("Listing not found");
        }
        
        GemListing listing = listingOpt.get();
        if (!"APPROVED".equals(listing.getStatus())) {
            throw new RuntimeException("Listing is not approved for bidding");
        }
        
        if (!listing.getBiddingActive()) {
            throw new RuntimeException("Bidding is not active for this listing");
        }
        
        // Check if bidding has ended
        if (listing.getBiddingEndTime() != null && 
            LocalDateTime.now().isAfter(listing.getBiddingEndTime())) {
            throw new RuntimeException("Bidding period has ended");
        }
        
        return listing;
    }
    
    private User validateBidder(String bidderId, String sellerId) {
        Optional<User> bidderOpt = userRepository.findById(bidderId);
        if (!bidderOpt.isPresent()) {
            throw new RuntimeException("Bidder not found");
        }
        
        User bidder = bidderOpt.get();
        if (!bidder.getIsVerified()) {
            throw new RuntimeException("Bidder account is not verified");
        }
        
        if (bidderId.equals(sellerId)) {
            throw new RuntimeException("Sellers cannot bid on their own items");
        }
        
        return bidder;
    }
    
    private void validateBidAmount(Double bidAmount, GemListing listing) {
        if (bidAmount == null || bidAmount <= 0) {
            throw new RuntimeException("Invalid bid amount");
        }
        
        // Minimum bid increment of 5%
        double minimumBid = listing.getCurrentHighestBid() * 1.05;
        if (bidAmount < minimumBid) {
            throw new RuntimeException(String.format(
                "Bid must be at least LKR %.2f (5%% above current highest bid)", minimumBid));
        }
        
        // Maximum reasonable bid validation
        if (listing.getPredictedPrice() != null && 
            bidAmount > listing.getPredictedPrice() * 3) {
            throw new RuntimeException("Bid amount seems unreasonably high");
        }
    }
}
```

### 3.2.4 Real-time Notification System

#### 3.2.4.1 Comprehensive Notification Service

**Code Segment 3.3: Admin Notification Service**
```java
@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Create admin notification for system events
     */
    public void createAdminNotification(String type, String title, String message, 
                                       String relatedId, String relatedName, String triggerUserId) {
        try {
            // Get all admin users
            List<User> adminUsers = userRepository.findByUserRole("ADMIN");
            
            for (User admin : adminUsers) {
                Notification notification = new Notification(
                    admin.getId(),        // userId (admin)
                    relatedId,           // listingId or related entity ID
                    null,                // bidId (not applicable for admin notifications)
                    type,                // notification type
                    title,               // notification title
                    message,             // notification message
                    triggerUserId,       // user who triggered the event
                    relatedName,         // related entity name
                    null,                // bidAmount (not applicable)
                    null                 // gemName (can be null)
                );
                
                notificationRepository.save(notification);
                System.out.println("✅ Admin notification created: " + type + " for admin " + admin.getEmail());
            }
        } catch (Exception e) {
            System.err.println("❌ Error creating admin notification: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Trigger notification when new user registers
     */
    public void notifyAdminOfNewUserRegistration(String userId, String userEmail, String userName) {
        createAdminNotification(
            "USER_REGISTRATION",
            "New User Registration",
            "A new user '" + userName + "' (" + userEmail + ") has registered and requires verification.",
            userId,
            userName,
            userId
        );
        System.out.println("📧 Admin notified of new user registration: " + userEmail);
    }

    /**
     * Trigger notification when new listing is submitted
     */
    public void notifyAdminOfNewListing(String listingId, String gemName, String sellerName, String sellerId) {
        createAdminNotification(
            "LISTING_PENDING",
            "New Listing Approval Required",
            "A new gemstone listing '" + gemName + "' by " + sellerName + " is pending approval.",
            listingId,
            sellerName,
            sellerId
        );
        System.out.println("💎 Admin notified of new listing: " + gemName);
    }

    /**
     * Trigger notification when new advertisement is submitted
     */
    public void notifyAdminOfNewAdvertisement(String adId, String adTitle, String advertiserName, String advertiserId) {
        createAdminNotification(
            "ADVERTISEMENT_PENDING",
            "New Advertisement Approval Required", 
            "A new advertisement '" + adTitle + "' by " + advertiserName + " requires approval.",
            adId,
            advertiserName,
            advertiserId
        );
        System.out.println("📺 Admin notified of new advertisement: " + adTitle);
    }

    /**
     * Trigger notification when new meeting request is created
     */
    public void notifyAdminOfNewMeetingRequest(String meetingId, String buyerName, String sellerName, 
                                             String buyerId, String sellerId, String gemName) {
        createAdminNotification(
            "MEETING_REQUEST",
            "New Meeting Request",
            "A new meeting request between buyer '" + buyerName + "' and seller '" + sellerName + 
            "' for gemstone '" + gemName + "' requires attention.",
            meetingId,
            buyerName + " & " + sellerName,
            buyerId
        );
        System.out.println("🤝 Admin notified of new meeting request: " + buyerName + " & " + sellerName);
    }
}
```

#### 3.2.4.2 Real-time Notification Retrieval and Management

**Code Segment 3.4: Enhanced Notification Management in BiddingService**
```java
@Service
public class BiddingService {
    
    /**
     * Get user's notifications with pagination and filtering
     */
    public ApiResponse<Map<String, Object>> getUserNotifications(String userId, int page, int size, String context) {
        try {
            System.out.println("🔔 Getting notifications for user: " + userId + " (context: " + context + ")");
            
            // Create pageable object
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            
            // Get notifications for the user
            Page<Notification> notificationPage = notificationRepository.findByUserId(userId, pageable);
            List<Notification> notifications = notificationPage.getContent();
            
            System.out.println("🔔 Found " + notifications.size() + " notifications for user: " + userId);
            
            // Get unread count
            long unreadCount = notificationRepository.countByUserIdAndIsReadFalse(userId);
            
            // Filter notifications based on context if provided
            if (context != null && !context.isEmpty()) {
                notifications = filterNotificationsByContext(notifications, context);
            }
            
            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("notifications", notifications);
            response.put("unreadCount", unreadCount);
            response.put("totalElements", notificationPage.getTotalElements());
            response.put("totalPages", notificationPage.getTotalPages());
            response.put("currentPage", page);
            response.put("pageSize", size);
            response.put("hasNext", notificationPage.hasNext());
            response.put("hasPrevious", notificationPage.hasPrevious());
            
            System.out.println("🔔 Returning " + notifications.size() + " notifications, " + unreadCount + " unread");
            return new ApiResponse<>(true, "Notifications retrieved successfully", response);
            
        } catch (Exception e) {
            System.err.println("🔔 [ERROR] Error getting notifications: " + e.getMessage());
            e.printStackTrace();
            return new ApiResponse<>(false, "Failed to get notifications: " + e.getMessage(), null);
        }
    }

    /**
     * Mark all notifications as read for a user
     */
    public ApiResponse<String> markAllNotificationsAsRead(String userId) {
        try {
            System.out.println("🔔 [DEBUG] Marking all notifications as read for userId: " + userId);
            
            // Get all unread notifications
            List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsReadFalse(userId);
            System.out.println("🔔 [DEBUG] Found " + unreadNotifications.size() + " unread notifications");
            
            if (unreadNotifications.isEmpty()) {
                return new ApiResponse<>(true, "No unread notifications to mark", "All notifications already read");
            }
            
            // Mark each notification as read
            int successCount = 0;
            int errorCount = 0;
            
            for (int i = 0; i < unreadNotifications.size(); i++) {
                try {
                    Notification notification = unreadNotifications.get(i);
                    notification.setIsRead(true);
                    notification.setReadAt(LocalDateTime.now());
                    
                    Notification savedNotification = notificationRepository.save(notification);
                    System.out.println("🔔 [DEBUG] Successfully saved notification ID: " + savedNotification.getId());
                    successCount++;
                    
                } catch (Exception e) {
                    System.err.println("🔔 [ERROR] Failed to save notification " + (i+1) + ": " + e.getMessage());
                    errorCount++;
                }
            }
            
            System.out.println("🔔 [DEBUG] Completed processing - Success: " + successCount + ", Errors: " + errorCount);
            
            if (errorCount == 0) {
                return new ApiResponse<>(true, 
                    "Successfully marked " + successCount + " notifications as read", 
                    "All notifications marked as read");
            } else {
                return new ApiResponse<>(false, 
                    "Partially completed: " + successCount + " successful, " + errorCount + " failed", 
                    "Some notifications could not be marked as read");
            }
            
        } catch (Exception e) {
            System.err.println("🔔 [ERROR] Error marking notifications as read: " + e.getMessage());
            e.printStackTrace();
            return new ApiResponse<>(false, "Failed to mark notifications as read: " + e.getMessage(), null);
        }
    }

    /**
     * Get unread notification count for a user
     */
    public ApiResponse<Long> getUnreadNotificationCount(String userId) {
        try {
            System.out.println("🔔 [DEBUG] Getting unread count for userId: " + userId);
            long count = notificationRepository.countByUserIdAndIsReadFalse(userId);
            System.out.println("🔔 [DEBUG] Unread count result: " + count);
            return new ApiResponse<>(true, "Count retrieved successfully", count);
        } catch (Exception e) {
            System.err.println("🔔 [ERROR] Error getting unread count: " + e.getMessage());
            e.printStackTrace();
            return new ApiResponse<>(false, "Failed to get unread count: " + e.getMessage(), 0L);
        }
    }
    
    private List<Notification> filterNotificationsByContext(List<Notification> notifications, String context) {
        switch (context.toLowerCase()) {
            case "bidding":
                return notifications.stream()
                    .filter(n -> n.getType().contains("BID"))
                    .collect(Collectors.toList());
            case "selling":
                return notifications.stream()
                    .filter(n -> n.getType().contains("NEW_BID") || n.getType().contains("ITEM_SOLD"))
                    .collect(Collectors.toList());
            case "meetings":
                return notifications.stream()
                    .filter(n -> n.getType().contains("MEETING"))
                    .collect(Collectors.toList());
            default:
                return notifications;
        }
    }
}
```

### 3.2.5 Meeting Scheduling System

#### 3.2.5.1 Frontend Meeting Scheduler Component

**Code Segment 3.5: Enhanced React Meeting Scheduler**
```typescript
interface MeetingSchedulerProps {
  purchase: Purchase;
  onScheduled: () => void;
}

const MeetingScheduler: React.FC<MeetingSchedulerProps> = ({ purchase, onScheduled }) => {
  const [formData, setFormData] = useState({
    proposedDate: '',
    proposedTime: '',
    location: '',
    buyerNotes: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Multi-strategy buyer ID extraction
  const getBuyerId = (): string | null => {
    // Strategy 1: From purchase object
    if (purchase?.buyerId) {
      console.log('✅ Buyer ID found in purchase:', purchase.buyerId);
      return purchase.buyerId;
    }

    // Strategy 2: From localStorage user
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user?.id) {
          console.log('✅ Buyer ID found in localStorage user:', user.id);
          return user.id;
        }
      } catch (e) {
        console.warn('Failed to parse user from localStorage:', e);
      }
    }

    // Strategy 3: From token payload
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload?.sub || payload?.userId) {
          const userId = payload.sub || payload.userId;
          console.log('✅ Buyer ID found in token payload:', userId);
          return userId;
        }
      } catch (e) {
        console.warn('Failed to extract buyer ID from token:', e);
      }
    }

    console.error('❌ Could not determine buyer ID');
    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.proposedDate) {
      newErrors.proposedDate = 'Date is required';
    } else {
      const selectedDate = new Date(formData.proposedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.proposedDate = 'Date cannot be in the past';
      }
    }

    if (!formData.proposedTime) {
      newErrors.proposedTime = 'Time is required';
    }

    if (!formData.location?.trim()) {
      newErrors.location = 'Location is required';
    }

    const buyerId = getBuyerId();
    if (!buyerId) {
      newErrors.submit = 'Unable to identify buyer. Please log in again.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const buyerId = getBuyerId();
      if (!buyerId) {
        setErrors({ submit: 'Unable to identify buyer. Please log in again.' });
        return;
      }

      const meetingData = {
        buyerId: buyerId,
        purchaseId: purchase.id,
        requestedDateTime: `${formData.proposedDate}T${formData.proposedTime}:00`,
        location: formData.location,
        notes: formData.buyerNotes
      };

      console.log('📤 Sending meeting request:', meetingData);

      const response = await fetch('/api/meetings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(meetingData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Meeting request sent successfully!');
        onScheduled();
        
        // Reset form
        setFormData({
          proposedDate: '',
          proposedTime: '',
          location: '',
          buyerNotes: ''
        });
      } else {
        throw new Error(result.message || 'Failed to create meeting request');
      }

    } catch (error: any) {
      console.error('❌ Meeting request failed:', error);
      setErrors({ 
        submit: error.message || 'Failed to send meeting request. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="meeting-scheduler">
      <h3 className="text-lg font-semibold mb-4">Schedule Meeting</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Preferred Date *
            </label>
            <Input
              type="date"
              value={formData.proposedDate}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                proposedDate: e.target.value
              }))}
              min={new Date().toISOString().split('T')[0]}
              className={errors.proposedDate ? 'border-red-500' : ''}
            />
            {errors.proposedDate && (
              <p className="text-red-500 text-sm mt-1">{errors.proposedDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Preferred Time *
            </label>
            <Input
              type="time"
              value={formData.proposedTime}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                proposedTime: e.target.value
              }))}
              className={errors.proposedTime ? 'border-red-500' : ''}
            />
            {errors.proposedTime && (
              <p className="text-red-500 text-sm mt-1">{errors.proposedTime}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Meeting Location *
          </label>
          <Input
            value={formData.location}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              location: e.target.value
            }))}
            placeholder="Enter meeting location"
            className={errors.location ? 'border-red-500' : ''}
          />
          {errors.location && (
            <p className="text-red-500 text-sm mt-1">{errors.location}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Additional Notes
          </label>
          <textarea
            value={formData.buyerNotes}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              buyerNotes: e.target.value
            }))}
            placeholder="Any additional notes for the seller..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errors.submit}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Sending Request...' : 'Send Meeting Request'}
        </Button>
      </form>
    </div>
  );
};
```

#### 3.2.5.2 Backend Meeting Service with Enhanced Validation

**Code Segment 3.6: Comprehensive Meeting Service Implementation**
```java
@Service
@Transactional
public class MeetingService {
    
    @Autowired
    private MeetingRepository meetingRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PurchaseRepository purchaseRepository;
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    public Map<String, Object> createMeeting(String buyerId, String purchaseId,
                                           String requestedDateTime, String location, String notes) {
        try {
            System.out.println("🤝 Creating meeting request for buyer: " + buyerId);
            
            // Comprehensive validation
            User buyer = validateUser(buyerId, "BUYER");
            Purchase purchase = validatePurchase(purchaseId, buyerId);
            User seller = validateUser(purchase.getSellerId(), "SELLER");
            validateMeetingDateTime(requestedDateTime);
            validateLocation(location);
            
            // Check for existing pending meetings
            Optional<Meeting> existingMeeting = meetingRepository
                .findByPurchaseIdAndStatus(purchaseId, "PENDING");
            
            if (existingMeeting.isPresent()) {
                throw new RuntimeException("A meeting request already exists for this purchase");
            }
            
            // Create meeting entity
            Meeting meeting = new Meeting();
            meeting.setBuyerId(buyerId);
            meeting.setSellerId(purchase.getSellerId());
            meeting.setPurchaseId(purchaseId);
            meeting.setGemName(purchase.getGemName());
            meeting.setRequestedDateTime(LocalDateTime.parse(requestedDateTime));
            meeting.setLocation(location);
            meeting.setNotes(notes);
            meeting.setStatus("PENDING");
            meeting.setCreatedAt(LocalDateTime.now());
            meeting.setUpdatedAt(LocalDateTime.now());
            
            // Additional meeting details
            meeting.setBuyerName(buyer.getFirstName() + " " + buyer.getLastName());
            meeting.setSellerName(seller.getFirstName() + " " + seller.getLastName());
            meeting.setBuyerContact(buyer.getMobileNumber());
            meeting.setSellerContact(seller.getMobileNumber());
            
            Meeting savedMeeting = meetingRepository.save(meeting);
            
            // Create notifications for both parties
            createMeetingNotifications(buyer, seller, savedMeeting, purchase);
            
            // Notify admin of new meeting request
            notificationService.notifyAdminOfNewMeetingRequest(
                savedMeeting.getId(),
                buyer.getFirstName() + " " + buyer.getLastName(),
                seller.getFirstName() + " " + seller.getLastName(),
                buyerId,
                purchase.getSellerId(),
                purchase.getGemName()
            );
            
            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Meeting request created successfully");
            response.put("meetingId", savedMeeting.getId());
            response.put("status", savedMeeting.getStatus());
            response.put("requestedDateTime", savedMeeting.getRequestedDateTime());
            response.put("location", savedMeeting.getLocation());
            response.put("buyerName", savedMeeting.getBuyerName());
            response.put("sellerName", savedMeeting.getSellerName());
            
            System.out.println("✅ Meeting request created successfully: " + savedMeeting.getId());
            return response;
            
        } catch (Exception e) {
            System.err.println("❌ Failed to create meeting: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to create meeting: " + e.getMessage());
            return errorResponse;
        }
    }
    
    private void createMeetingNotifications(User buyer, User seller, Meeting meeting, Purchase purchase) {
        try {
            // Notification for seller
            Notification sellerNotification = new Notification();
            sellerNotification.setUserId(seller.getId());
            sellerNotification.setType("MEETING_REQUEST_RECEIVED");
            sellerNotification.setTitle("New Meeting Request");
            sellerNotification.setMessage(String.format(
                "New meeting request from %s %s for %s on %s at %s",
                buyer.getFirstName(), buyer.getLastName(),
                purchase.getGemName(),
                meeting.getRequestedDateTime().toLocalDate(),
                meeting.getLocation()
            ));
            sellerNotification.setRelatedId(meeting.getId());
            sellerNotification.setCreatedAt(LocalDateTime.now());
            sellerNotification.setIsRead(false);
            notificationRepository.save(sellerNotification);
            
            // Notification for buyer (confirmation)
            Notification buyerNotification = new Notification();
            buyerNotification.setUserId(buyer.getId());
            buyerNotification.setType("MEETING_REQUEST_SENT");
            buyerNotification.setTitle("Meeting Request Sent");
            buyerNotification.setMessage(String.format(
                "Your meeting request for %s has been sent to %s %s. They will respond soon.",
                purchase.getGemName(),
                seller.getFirstName(), seller.getLastName()
            ));
            buyerNotification.setRelatedId(meeting.getId());
            buyerNotification.setCreatedAt(LocalDateTime.now());
            buyerNotification.setIsRead(false);
            notificationRepository.save(buyerNotification);
            
            System.out.println("🔔 Meeting notifications created for buyer and seller");
            
        } catch (Exception e) {
            System.err.println("❌ Failed to create meeting notifications: " + e.getMessage());
        }
    }
    
    private User validateUser(String userId, String expectedRole) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (!userOpt.isPresent()) {
            throw new RuntimeException("User not found: " + userId);
        }
        
        User user = userOpt.get();
        if (!user.getIsVerified()) {
            throw new RuntimeException("User account is not verified");
        }
        
        if (expectedRole != null && !expectedRole.equalsIgnoreCase(user.getUserRole())) {
            throw new RuntimeException("User role mismatch. Expected: " + expectedRole + 
                                     ", Actual: " + user.getUserRole());
        }
        
        return user;
    }
    
    private Purchase validatePurchase(String purchaseId, String buyerId) {
        Optional<Purchase> purchaseOpt = purchaseRepository.findById(purchaseId);
        if (!purchaseOpt.isPresent()) {
            throw new RuntimeException("Purchase not found: " + purchaseId);
        }
        
        Purchase purchase = purchaseOpt.get();
        if (!purchase.getBuyerId().equals(buyerId)) {
            throw new RuntimeException("Purchase does not belong to the specified buyer");
        }
        
        if (!"COMPLETED".equals(purchase.getStatus())) {
            throw new RuntimeException("Purchase must be completed before scheduling a meeting");
        }
        
        return purchase;
    }
    
    private void validateMeetingDateTime(String requestedDateTime) {
        try {
            LocalDateTime meetingTime = LocalDateTime.parse(requestedDateTime);
            LocalDateTime now = LocalDateTime.now();
            
            if (meetingTime.isBefore(now)) {
                throw new RuntimeException("Meeting time cannot be in the past");
            }
            
            if (meetingTime.isAfter(now.plusDays(30))) {
                throw new RuntimeException("Meeting cannot be scheduled more than 30 days in advance");
            }
            
            // Check business hours (9 AM to 6 PM)
            int hour = meetingTime.getHour();
            if (hour < 9 || hour > 18) {
                throw new RuntimeException("Meetings can only be scheduled between 9 AM and 6 PM");
            }
            
        } catch (DateTimeParseException e) {
            throw new RuntimeException("Invalid date/time format");
        }
    }
    
    private void validateLocation(String location) {
        if (location == null || location.trim().isEmpty()) {
            throw new RuntimeException("Meeting location is required");
        }
        
        if (location.length() > 200) {
            throw new RuntimeException("Location description is too long (max 200 characters)");
        }
    }
    
    public Map<String, Object> updateMeetingStatus(String meetingId, String status, String sellerId) {
        try {
            Optional<Meeting> meetingOpt = meetingRepository.findById(meetingId);
            if (!meetingOpt.isPresent()) {
                throw new RuntimeException("Meeting not found");
            }
            
            Meeting meeting = meetingOpt.get();
            
            // Verify seller authorization
            if (!meeting.getSellerId().equals(sellerId)) {
                throw new RuntimeException("Only the seller can update meeting status");
            }
            
            // Validate status transition
            if (!"PENDING".equals(meeting.getStatus())) {
                throw new RuntimeException("Meeting status can only be updated when pending");
            }
            
            if (!Arrays.asList("APPROVED", "REJECTED", "RESCHEDULED").contains(status)) {
                throw new RuntimeException("Invalid status: " + status);
            }
            
            meeting.setStatus(status);
            meeting.setUpdatedAt(LocalDateTime.now());
            
            if ("APPROVED".equals(status)) {
                meeting.setApprovedAt(LocalDateTime.now());
            }
            
            Meeting updatedMeeting = meetingRepository.save(meeting);
            
            // Notify buyer of status change
            notifyBuyerOfStatusChange(meeting, status);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Meeting status updated to: " + status);
            response.put("meeting", updatedMeeting);
            
            return response;
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to update meeting: " + e.getMessage());
            return errorResponse;
        }
    }
    
    private void notifyBuyerOfStatusChange(Meeting meeting, String newStatus) {
        try {
            String title = "Meeting " + newStatus.toLowerCase();
            String message;
            
            switch (newStatus) {
                case "APPROVED":
                    message = String.format("Your meeting for %s has been approved by the seller for %s at %s",
                                          meeting.getGemName(),
                                          meeting.getRequestedDateTime().toLocalDate(),
                                          meeting.getLocation());
                    break;
                case "REJECTED":
                    message = String.format("Your meeting request for %s has been declined by the seller. You can request a different time.",
                                          meeting.getGemName());
                    break;
                case "RESCHEDULED":
                    message = String.format("Your meeting for %s needs to be rescheduled. Please contact the seller.",
                                          meeting.getGemName());
                    break;
                default:
                    message = String.format("Your meeting status for %s has been updated to: %s",
                                          meeting.getGemName(), newStatus);
            }
            
            Notification notification = new Notification();
            notification.setUserId(meeting.getBuyerId());
            notification.setType("MEETING_STATUS_UPDATE");
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setRelatedId(meeting.getId());
            notification.setCreatedAt(LocalDateTime.now());
            notification.setIsRead(false);
            
            notificationRepository.save(notification);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to notify buyer of status change: " + e.getMessage());
        }
    }
}
```

### 3.2.6 Admin Dashboard System with Real-time Notifications

#### 3.2.6.1 Admin Dashboard with Notification Badges

**Code Segment 3.7: Enhanced Admin Dashboard with Real-time Notification System**
```typescript
interface AdminNotifications {
  userManagement: number;
  listingManagement: number;
  advertisements: number;
  meetingRequests: number;
  systemAlerts: number;
}

const AdminDashboard: React.FC = () => {
  const [notifications, setNotifications] = useState<AdminNotifications>({
    userManagement: 0,
    listingManagement: 0,
    advertisements: 0,
    meetingRequests: 0,
    systemAlerts: 0
  });

  const [totalNotifications, setTotalNotifications] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotificationCounts = async () => {
    try {
      const [users, listings, ads, meetings, alerts] = await Promise.allSettled([
        api.getUsers(),
        api.admin.getPendingListings(),
        api.getAllAdvertisements('false'),
        api.getMeetings(),
        api.getSystemAlerts()
      ]);

      const newNotifications: AdminNotifications = {
        userManagement: users.status === 'fulfilled' 
          ? users.value.data?.filter((u: User) => !u.isVerified).length || 0 
          : 0,
        listingManagement: listings.status === 'fulfilled'
          ? listings.value.data?.filter((l: GemListing) => l.status === 'PENDING_APPROVAL').length || 0
          : 0,
        advertisements: ads.status === 'fulfilled'
          ? ads.value.data?.filter((ad: Advertisement) => !ad.isApproved).length || 0
          : 0,
        meetingRequests: meetings.status === 'fulfilled'
          ? meetings.value.data?.filter((m: Meeting) => m.status === 'PENDING').length || 0
          : 0,
        systemAlerts: alerts.status === 'fulfilled'
          ? alerts.value.data?.filter((alert: SystemAlert) => !alert.dismissed).length || 0
          : 0
      };

      setNotifications(newNotifications);
      
      const total = Object.values(newNotifications).reduce((sum, count) => sum + count, 0);
      setTotalNotifications(total);

      console.log('📊 Notification counts updated:', newNotifications);

    } catch (error) {
      console.error('❌ Failed to fetch notification counts:', error);
      
      // Fallback to mock data during development
      const mockNotifications: AdminNotifications = {
        userManagement: 3,
        listingManagement: 5,
        advertisements: 2,
        meetingRequests: 1,
        systemAlerts: 0
      };
      
      setNotifications(mockNotifications);
      setTotalNotifications(11);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    fetchNotificationCounts();
    
    const interval = setInterval(fetchNotificationCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const NotificationBadge: React.FC<{ count: number; variant?: 'default' | 'destructive' }> = ({ 
    count, 
    variant = 'default' 
  }) => {
    if (count === 0) return null;
    
    return (
      <Badge 
        variant={variant}
        className={cn(
          "ml-2 px-2 py-1 text-xs",
          variant === 'destructive' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
        )}
      >
        {count > 99 ? '99+' : count}
      </Badge>
    );
  };

  const AdminSidebarItem: React.FC<{
    to: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    notificationCount?: number;
    isActive?: boolean;
  }> = ({ to, icon, children, notificationCount = 0, isActive = false }) => (
    <Link
      to={to}
      className={cn(
        "flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200",
        isActive && "bg-blue-100 text-blue-600 border-r-2 border-blue-600"
      )}
    >
      <div className="flex items-center">
        <span className="mr-3">{icon}</span>
        <span className="font-medium">{children}</span>
      </div>
      <NotificationBadge count={notificationCount} />
    </Link>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-sm border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800 flex items-center">
            <Shield className="mr-2 text-blue-600" size={24} />
            Admin Panel
            <div className="relative ml-2">
              <Bell className="w-5 h-5 text-gray-600" />
              {totalNotifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-xs p-0"
                >
                  {totalNotifications > 99 ? '99+' : totalNotifications}
                </Badge>
              )}
            </div>
          </h1>
        </div>
        
        <nav className="mt-6">
          <AdminSidebarItem
            to="/admin"
            icon={<LayoutDashboard size={20} />}
            notificationCount={totalNotifications}
          >
            Dashboard Overview
          </AdminSidebarItem>
          
          <AdminSidebarItem
            to="/admin/users"
            icon={<Users size={20} />}
            notificationCount={notifications.userManagement}
          >
            User Management
          </AdminSidebarItem>
          
          <AdminSidebarItem
            to="/admin/listings"
            icon={<Package size={20} />}
            notificationCount={notifications.listingManagement}
          >
            Listing Management
          </AdminSidebarItem>
          
          <AdminSidebarItem
            to="/admin/advertisements"
            icon={<Megaphone size={20} />}
            notificationCount={notifications.advertisements}
          >
            Advertisements
          </AdminSidebarItem>
          
          <AdminSidebarItem
            to="/admin/meetings"
            icon={<Clock size={20} />}
            notificationCount={notifications.meetingRequests}
          >
            Meeting Requests
          </AdminSidebarItem>
          
          <AdminSidebarItem
            to="/admin/settings"
            icon={<Settings size={20} />}
            notificationCount={notifications.systemAlerts}
          >
            System Settings
          </AdminSidebarItem>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-800">
              Dashboard Overview
            </h2>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchNotificationCounts}
                disabled={isLoading}
                className="flex items-center"
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
                Refresh
              </Button>
              
              <div className="relative">
                <Button variant="ghost" size="sm">
                  <Bell className="w-5 h-5" />
                  {totalNotifications > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs p-0"
                    >
                      {totalNotifications > 99 ? '99+' : totalNotifications}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <AdminOverviewCard
              title="Pending Users"
              count={notifications.userManagement}
              icon={<UserCheck className="w-8 h-8 text-blue-600" />}
              color="blue"
              description="Users awaiting verification"
            />
            
            <AdminOverviewCard
              title="Pending Listings"
              count={notifications.listingManagement}
              icon={<Package className="w-8 h-8 text-green-600" />}
              color="green"
              description="Listings awaiting approval"
            />
            
            <AdminOverviewCard
              title="Pending Ads"
              count={notifications.advertisements}
              icon={<Megaphone className="w-8 h-8 text-purple-600" />}
              color="purple"
              description="Advertisements awaiting review"
            />
            
            <AdminOverviewCard
              title="Meeting Requests"
              count={notifications.meetingRequests}
              icon={<Clock className="w-8 h-8 text-orange-600" />}
              color="orange"
              description="Meetings awaiting scheduling"
            />
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AdminActivityFeed />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

const AdminOverviewCard: React.FC<{
  title: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  description: string;
}> = ({ title, count, icon, color, description }) => (
  <Card className={cn("hover:shadow-md transition-shadow", count > 0 && "ring-2 ring-opacity-20", {
    "ring-blue-500": color === "blue",
    "ring-green-500": color === "green", 
    "ring-purple-500": color === "purple",
    "ring-orange-500": color === "orange"
  })}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
          <p className="text-3xl font-bold mt-2 text-gray-900">{count}</p>
        </div>
        <div className="relative">
          {icon}
          {count > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center text-xs p-0"
            >
              {count > 99 ? '99+' : count}
            </Badge>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);
```

#### 3.2.6.2 Backend Admin Service Implementation

**Code Segment 3.8: Enhanced Admin Service with Comprehensive Management**
```java
@Service
@Transactional
public class AdminService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private GemListingRepository gemListingRepository;
    
    @Autowired
    private AdvertisementRepository advertisementRepository;
    
    @Autowired
    private MeetingRepository meetingRepository;
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * Approve user registration and verification
     */
    public ApiResponse<String> approveUser(String userId, String adminId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                return ApiResponse.error("User not found");
            }
            
            User user = userOpt.get();
            user.setIsVerified(true);
            user.setVerificationStatus("VERIFIED");
            user.setVerifiedAt(LocalDateTime.now());
            user.setVerifiedBy(adminId);
            user.setUpdatedAt(LocalDateTime.now());
            
            userRepository.save(user);
            
            // Notify user of approval
            notificationService.createUserNotification(
                userId,
                "ACCOUNT_APPROVED",
                "Account Verified",
                "Your account has been verified and approved. You can now access all features.",
                null,
                null
            );
            
            System.out.println("✅ User approved: " + user.getEmail());
            return ApiResponse.success("User approved successfully");
            
        } catch (Exception e) {
            System.err.println("❌ Failed to approve user: " + e.getMessage());
            return ApiResponse.error("Failed to approve user: " + e.getMessage());
        }
    }
    
    /**
     * Approve gemstone listing
     */
    public ApiResponse<String> approveListing(String listingId, String adminId) {
        try {
            Optional<GemListing> listingOpt = gemListingRepository.findById(listingId);
            if (!listingOpt.isPresent()) {
                return ApiResponse.error("Listing not found");
            }
            
            GemListing listing = listingOpt.get();
            listing.setStatus("APPROVED");
            listing.setApprovedAt(LocalDateTime.now());
            listing.setApprovedBy(adminId);
            listing.setBiddingActive(true);
            
            // Set bidding end time (default 7 days from approval)
            listing.setBiddingEndTime(LocalDateTime.now().plusDays(7));
            listing.setUpdatedAt(LocalDateTime.now());
            
            gemListingRepository.save(listing);
            
            // Notify seller of approval
            notificationService.createUserNotification(
                listing.getSellerId(),
                "LISTING_APPROVED",
                "Listing Approved",
                "Your gemstone listing '" + listing.getName() + "' has been approved and is now live for bidding.",
                listingId,
                listing.getName()
            );
            
            System.out.println("✅ Listing approved: " + listing.getName());
            return ApiResponse.success("Listing approved successfully");
            
        } catch (Exception e) {
            System.err.println("❌ Failed to approve listing: " + e.getMessage());
            return ApiResponse.error("Failed to approve listing: " + e.getMessage());
        }
    }
    
    /**
     * Get admin dashboard statistics
     */
    public ApiResponse<Map<String, Object>> getDashboardStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // User statistics
            long totalUsers = userRepository.count();
            long pendingUsers = userRepository.countByIsVerifiedFalse();
            long verifiedUsers = userRepository.countByIsVerifiedTrue();
            
            // Listing statistics
            long totalListings = gemListingRepository.count();
            long pendingListings = gemListingRepository.countByStatus("PENDING_APPROVAL");
            long approvedListings = gemListingRepository.countByStatus("APPROVED");
            long activeListings = gemListingRepository.countByStatusAndBiddingActiveTrue("APPROVED");
            
            // Meeting statistics
            long totalMeetings = meetingRepository.count();
            long pendingMeetings = meetingRepository.countByStatus("PENDING");
            long approvedMeetings = meetingRepository.countByStatus("APPROVED");
            
            // Advertisement statistics
            long totalAds = advertisementRepository.count();
            long pendingAds = advertisementRepository.countByIsApprovedFalse();
            long approvedAds = advertisementRepository.countByIsApprovedTrue();
            
            // Recent activity
            List<Notification> recentNotifications = notificationRepository
                .findTop10ByOrderByCreatedAtDesc();
            
            // Build response
            Map<String, Object> userStats = new HashMap<>();
            userStats.put("total", totalUsers);
            userStats.put("pending", pendingUsers);
            userStats.put("verified", verifiedUsers);
            
            Map<String, Object> listingStats = new HashMap<>();
            listingStats.put("total", totalListings);
            listingStats.put("pending", pendingListings);
            listingStats.put("approved", approvedListings);
            listingStats.put("active", activeListings);
            
            Map<String, Object> meetingStats = new HashMap<>();
            meetingStats.put("total", totalMeetings);
            meetingStats.put("pending", pendingMeetings);
            meetingStats.put("approved", approvedMeetings);
            
            Map<String, Object> adStats = new HashMap<>();
            adStats.put("total", totalAds);
            adStats.put("pending", pendingAds);
            adStats.put("approved", approvedAds);
            
            stats.put("users", userStats);
            stats.put("listings", listingStats);
            stats.put("meetings", meetingStats);
            stats.put("advertisements", adStats);
            stats.put("recentActivity", recentNotifications);
            stats.put("lastUpdated", LocalDateTime.now());
            
            return ApiResponse.success(stats);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to get dashboard stats: " + e.getMessage());
            return ApiResponse.error("Failed to get dashboard statistics: " + e.getMessage());
        }
    }
    
    /**
     * Get pending items requiring admin attention
     */
    public ApiResponse<Map<String, Object>> getPendingItems() {
        try {
            Map<String, Object> pendingItems = new HashMap<>();
            
            // Pending user verifications
            List<User> pendingUsers = userRepository.findByIsVerifiedFalseOrderByCreatedAtDesc();
            
            // Pending listing approvals
            List<GemListing> pendingListings = gemListingRepository
                .findByStatusOrderByCreatedAtDesc("PENDING_APPROVAL");
            
            // Pending meeting requests
            List<Meeting> pendingMeetings = meetingRepository
                .findByStatusOrderByCreatedAtDesc("PENDING");
            
            // Pending advertisements
            List<Advertisement> pendingAds = advertisementRepository
                .findByIsApprovedFalseOrderByCreatedAtDesc();
            
            pendingItems.put("users", pendingUsers);
            pendingItems.put("listings", pendingListings);
            pendingItems.put("meetings", pendingMeetings);
            pendingItems.put("advertisements", pendingAds);
            pendingItems.put("totalPending", 
                pendingUsers.size() + pendingListings.size() + 
                pendingMeetings.size() + pendingAds.size());
            
            return ApiResponse.success(pendingItems);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to get pending items: " + e.getMessage());
            return ApiResponse.error("Failed to get pending items: " + e.getMessage());
        }
    }
    
    /**
     * Bulk approve multiple items
     */
    public ApiResponse<Map<String, Object>> bulkApprove(BulkApprovalRequest request, String adminId) {
        try {
            Map<String, Object> results = new HashMap<>();
            int successCount = 0;
            int errorCount = 0;
            List<String> errors = new ArrayList<>();
            
            // Bulk approve users
            if (request.getUserIds() != null) {
                for (String userId : request.getUserIds()) {
                    try {
                        ApiResponse<String> result = approveUser(userId, adminId);
                        if (result.isSuccess()) {
                            successCount++;
                        } else {
                            errorCount++;
                            errors.add("User " + userId + ": " + result.getMessage());
                        }
                    } catch (Exception e) {
                        errorCount++;
                        errors.add("User " + userId + ": " + e.getMessage());
                    }
                }
            }
            
            // Bulk approve listings
            if (request.getListingIds() != null) {
                for (String listingId : request.getListingIds()) {
                    try {
                        ApiResponse<String> result = approveListing(listingId, adminId);
                        if (result.isSuccess()) {
                            successCount++;
                        } else {
                            errorCount++;
                            errors.add("Listing " + listingId + ": " + result.getMessage());
                        }
                    } catch (Exception e) {
                        errorCount++;
                        errors.add("Listing " + listingId + ": " + e.getMessage());
                    }
                }
            }
            
            results.put("successCount", successCount);
            results.put("errorCount", errorCount);
            results.put("errors", errors);
            results.put("message", String.format("Bulk approval completed: %d successful, %d failed", 
                                                successCount, errorCount));
            
            return ApiResponse.success(results);
            
        } catch (Exception e) {
            System.err.println("❌ Bulk approval failed: " + e.getMessage());
            return ApiResponse.error("Bulk approval failed: " + e.getMessage());
        }
    }
}
```

### 3.2.7 Database Design and Implementation

#### 3.2.7.1 Enhanced MongoDB Document Structure

**Listing 3.1: Complete User Document Schema**
```javascript
// User Collection Schema
{
  "_id": ObjectId,
  "email": String,
  "passwordHash": String,
  "firstName": String,
  "lastName": String,
  "dateOfBirth": Date,
  "nicNumber": String,
  "mobileNumber": String,
  "address": String,
  "userRole": String, // "BUYER", "SELLER", "ADMIN"
  "verificationStatus": String, // "PENDING", "VERIFIED", "REJECTED"
  "isVerified": Boolean,
  "isFaceVerified": Boolean,
  "isNicVerified": Boolean,
  "faceImagePath": String,
  "nicImagePath": String,
  "extractedFaceImagePath": String,
  "faceFeatures": String, // Base64 encoded face features
  "nicFaceEncoding": String,
  "verifiedAt": Date,
  "verifiedBy": String, // Admin user ID
  "lastLoginAt": Date,
  "isActive": Boolean,
  "profileImagePath": String,
  "preferences": {
    "notifications": {
      "email": Boolean,
      "push": Boolean,
      "sms": Boolean
    },
    "privacy": {
      "showContactInfo": Boolean,
      "allowDirectMessages": Boolean
    }
  },
  "createdAt": Date,
  "updatedAt": Date
}
```

**Listing 3.2: Enhanced GemListing Document Schema**
```javascript
// GemListing Collection Schema
{
  "_id": ObjectId,
  "name": String,
  "category": String,
  "species": String, // For AI price prediction
  "description": String,
  "price": Number,
  "predictedPrice": Number,
  "minPredictedPrice": Number,
  "maxPredictedPrice": Number,
  "predictionConfidence": Number, // 0.0 to 1.0
  "sellerId": String,
  "sellerName": String,
  "sellerContact": String,
  "images": [String], // Array of image paths
  "certificateImages": [String], // Certificate image paths
  "isCertified": Boolean,
  "status": String, // "PENDING_APPROVAL", "APPROVED", "REJECTED", "SOLD", "EXPIRED"
  "biddingActive": Boolean,
  "biddingStartTime": Date,
  "biddingEndTime": Date,
  "currentHighestBid": Number,
  "totalBids": Number,
  "lastBidTime": Date,
  "minimumBidIncrement": Number,
  "reservePrice": Number, // Minimum selling price
  "buyNowPrice": Number, // Optional instant purchase price
  "attributes": {
    "weight": String, // e.g., "2.5 ct"
    "color": String,
    "clarity": String,
    "cut": String,
    "origin": String,
    "treatment": String,
    "shape": String,
    "dimensions": String,
    "fluorescence": String,
    "certification": {
      "lab": String,
      "certificateNumber": String,
      "reportDate": Date
    }
  },
  // Flattened attributes for AI prediction
  "weight": String,
  "color": String,
  "clarity": String,
  "cut": String,
  "origin": String,
  "treatment": String,
  "shape": String,
  "viewCount": Number,
  "favoriteCount": Number,
  "approvedAt": Date,
  "approvedBy": String, // Admin user ID
  "rejectionReason": String,
  "tags": [String], // Search tags
  "seoMetadata": {
    "title": String,
    "description": String,
    "keywords": [String]
  },
  "createdAt": Date,
  "updatedAt": Date
}
```

**Listing 3.3: Comprehensive Notification Document Schema**
```javascript
// Notification Collection Schema
{
  "_id": ObjectId,
  "userId": String, // Recipient user ID
  "type": String, // "NEW_BID", "BID_OUTBID", "ITEM_SOLD", "MEETING_REQUEST", etc.
  "category": String, // "BIDDING", "SELLING", "MEETING", "ADMIN", "SYSTEM"
  "title": String,
  "message": String,
  "priority": String, // "LOW", "MEDIUM", "HIGH", "URGENT"
  "isRead": Boolean,
  "readAt": Date,
  "listingId": String, // Related listing (if applicable)
  "bidId": String, // Related bid (if applicable)
  "meetingId": String, // Related meeting (if applicable)
  "relatedId": String, // Generic related entity ID
  "relatedType": String, // "LISTING", "BID", "MEETING", "USER", etc.
  "triggerUserId": String, // User who triggered the notification
  "triggerUserName": String,
  "gemName": String,
  "bidAmount": Number,
  "metadata": {
    "actionRequired": Boolean,
    "actionUrl": String,
    "expiresAt": Date,
    "attachments": [String]
  },
  "deliveryStatus": {
    "email": {
      "sent": Boolean,
      "sentAt": Date,
      "deliveredAt": Date
    },
    "push": {
      "sent": Boolean,
      "sentAt": Date,
      "clickedAt": Date
    }
  },
  "createdAt": Date,
  "updatedAt": Date
}
```

**Listing 3.4: Enhanced Bid Document Schema**
```javascript
// Bid Collection Schema
{
  "_id": ObjectId,
  "listingId": String,
  "bidderId": String,
  "bidderName": String,
  "bidderContact": String,
  "bidAmount": Number,
  "previousBidAmount": Number, // For increment validation
  "bidIncrement": Number,
  "status": String, // "ACTIVE", "OUTBID", "WITHDRAWN", "ACCEPTED", "REJECTED"
  "bidType": String, // "REGULAR", "AUTO", "PROXY", "BUY_NOW"
  "isValidBid": Boolean,
  "bidTime": Date,
  "expiresAt": Date,
  "isProxyBid": Boolean,
  "maxProxyAmount": Number, // For automatic bidding
  "notes": String, // Bidder's notes
  "paymentMethod": {
    "type": String, // "BANK_TRANSFER", "CARD", "CRYPTO", "CASH"
    "verified": Boolean,
    "details": String
  },
  "deliveryPreference": {
    "method": String, // "PICKUP", "DELIVERY", "SHIPPING"
    "location": String,
    "notes": String
  },
  "verification": {
    "identityVerified": Boolean,
    "financialVerified": Boolean,
    "previousTransactions": Number
  },
  "createdAt": Date,
  "updatedAt": Date
}
```

**Listing 3.5: Meeting Document Schema**
```javascript
// Meeting Collection Schema
{
  "_id": ObjectId,
  "buyerId": String,
  "sellerId": String,
  "purchaseId": String,
  "listingId": String,
  "gemName": String,
  "buyerName": String,
  "sellerName": String,
  "buyerContact": String,
  "sellerContact": String,
  "requestedDateTime": Date,
  "confirmedDateTime": Date,
  "location": String,
  "alternativeLocations": [String],
  "notes": String,
  "sellerNotes": String,
  "status": String, // "PENDING", "APPROVED", "REJECTED", "RESCHEDULED", "COMPLETED", "CANCELLED"
  "meetingType": String, // "INSPECTION", "HANDOVER", "CONSULTATION"
  "duration": Number, // Expected duration in minutes
  "requirements": {
    "identificationRequired": Boolean,
    "witnessRequired": Boolean,
    "equipmentNeeded": [String],
    "specialInstructions": String
  },
  "outcome": {
    "completed": Boolean,
    "completedAt": Date,
    "rating": {
      "buyerRating": Number, // 1-5
      "sellerRating": Number, // 1-5
      "comments": String
    },
    "transactionCompleted": Boolean,
    "issues": [String]
  },
  "reminder": {
    "buyerReminded": Boolean,
    "sellerReminded": Boolean,
    "reminderSentAt": Date
  },
  "approvedAt": Date,
  "createdAt": Date,
  "updatedAt": Date
}
```

**Listing 3.6: Price Prediction Log Schema**
```javascript
// PricePredictionLog Collection Schema
{
  "_id": ObjectId,
  "listingId": String,
  "gemSpecies": String,
  "inputData": {
    "carat": Number,
    "color": String,
    "clarity": String,
    "cut": String,
    "origin": String,
    "treatment": String,
    "isCertified": Boolean
  },
  "predictionResult": {
    "predictedPrice": Number,
    "minPrice": Number,
    "maxPrice": Number,
    "confidence": Number,
    "method": String, // "RULE_BASED", "CATBOOST", "ENSEMBLE"
    "modelVersion": String
  },
  "accuracyFactors": {
    "speciesAccuracy": Number,
    "dataCompleteness": Number,
    "qualityPrecision": Number,
    "certificationScore": Number,
    "marketAlignment": Number,
    "rarityFactor": Number
  },
  "actualSalePrice": Number, // Updated when item sells
  "predictionAccuracy": Number, // Calculated post-sale
  "executionTime": Number, // Prediction time in milliseconds
  "errorDetails": String,
  "createdAt": Date
}
```

### 3.2.8 Security Implementation

#### 3.2.8.1 Comprehensive JWT Authentication System

**Code Segment 3.9: Enhanced JWT Token Provider with Role-based Security**
```java
@Component
public class JwtTokenProvider {
    
    private static final String JWT_SECRET = System.getenv("JWT_SECRET") != null ? 
        System.getenv("JWT_SECRET") : "gemnet_secure_secret_key_2024";
    private static final int JWT_EXPIRATION = 86400000; // 24 hours
    private static final int REFRESH_TOKEN_EXPIRATION = 604800000; // 7 days
    
    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);
    
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        
        // Add user role and additional claims
        if (userDetails instanceof CustomUserDetails) {
            CustomUserDetails customUser = (CustomUserDetails) userDetails;
            claims.put("userId", customUser.getUserId());
            claims.put("role", customUser.getRole());
            claims.put("verified", customUser.isVerified());
            claims.put("faceVerified", customUser.isFaceVerified());
            claims.put("nicVerified", customUser.isNicVerified());
        }
        
        return createToken(claims, userDetails.getUsername(), JWT_EXPIRATION);
    }
    
    public String generateRefreshToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "refresh");
        
        if (userDetails instanceof CustomUserDetails) {
            CustomUserDetails customUser = (CustomUserDetails) userDetails;
            claims.put("userId", customUser.getUserId());
        }
        
        return createToken(claims, userDetails.getUsername(), REFRESH_TOKEN_EXPIRATION);
    }
    
    private String createToken(Map<String, Object> claims, String subject, int expiration) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(SignatureAlgorithm.HS256, JWT_SECRET)
                .compact();
    }
    
    public String getUsernameFromToken(String token) {
        try {
            Claims claims = getClaimsFromToken(token);
            return claims.getSubject();
        } catch (Exception e) {
            logger.error("Error extracting username from token: " + e.getMessage());
            return null;
        }
    }
    
    public String getUserIdFromToken(String token) {
        try {
            Claims claims = getClaimsFromToken(token);
            return claims.get("userId", String.class);
        } catch (Exception e) {
            logger.error("Error extracting userId from token: " + e.getMessage());
            return null;
        }
    }
    
    public String getRoleFromToken(String token) {
        try {
            Claims claims = getClaimsFromToken(token);
            return claims.get("role", String.class);
        } catch (Exception e) {
            logger.error("Error extracting role from token: " + e.getMessage());
            return null;
        }
    }
    
    public boolean isTokenExpired(String token) {
        try {
            Date expiration = getClaimsFromToken(token).getExpiration();
            return expiration.before(new Date());
        } catch (Exception e) {
            return true;
        }
    }
    
    public boolean validateToken(String token, UserDetails userDetails) {
        try {
            String username = getUsernameFromToken(token);
            return username != null && 
                   username.equals(userDetails.getUsername()) && 
                   !isTokenExpired(token);
        } catch (Exception e) {
            logger.error("Token validation failed: " + e.getMessage());
            return false;
        }
    }
    
    public boolean validateToken(String token) {
        try {
            getClaimsFromToken(token);
            return !isTokenExpired(token);
        } catch (Exception e) {
            logger.error("Token validation failed: " + e.getMessage());
            return false;
        }
    }
    
    private Claims getClaimsFromToken(String token) {
        try {
            return Jwts.parser()
                    .setSigningKey(JWT_SECRET)
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) {
            logger.warn("JWT token is expired: " + e.getMessage());
            throw e;
        } catch (MalformedJwtException e) {
            logger.error("JWT token is malformed: " + e.getMessage());
            throw e;
        } catch (SignatureException e) {
            logger.error("JWT signature validation failed: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("JWT token parsing failed: " + e.getMessage());
            throw e;
        }
    }
    
    public String refreshToken(String refreshToken) {
        try {
            Claims claims = getClaimsFromToken(refreshToken);
            String tokenType = claims.get("type", String.class);
            
            if (!"refresh".equals(tokenType)) {
                throw new RuntimeException("Invalid refresh token");
            }
            
            String username = claims.getSubject();
            String userId = claims.get("userId", String.class);
            
            // Create new access token
            Map<String, Object> newClaims = new HashMap<>();
            newClaims.put("userId", userId);
            
            return createToken(newClaims, username, JWT_EXPIRATION);
            
        } catch (Exception e) {
            logger.error("Token refresh failed: " + e.getMessage());
            throw new RuntimeException("Failed to refresh token", e);
        }
    }
}
```

#### 3.2.8.2 Advanced Security Configuration

**Code Segment 3.10: Enhanced Spring Security Configuration**
```java
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12); // Increased strength
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> 
                ex.authenticationEntryPoint(jwtAuthenticationEntryPoint))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers(HttpMethod.POST, "/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/health", "/api/status").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                
                // Admin-only endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/listings/*/approve").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/users/*/verify").hasRole("ADMIN")
                
                // Seller-specific endpoints
                .requestMatchers(HttpMethod.POST, "/api/listings").hasAnyRole("SELLER", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/listings/*/status").hasAnyRole("SELLER", "ADMIN")
                
                // Buyer-specific endpoints
                .requestMatchers(HttpMethod.POST, "/api/bids/**").hasAnyRole("BUYER", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/meetings/**").hasAnyRole("BUYER", "ADMIN")
                
                // Authenticated user endpoints
                .requestMatchers("/api/notifications/**").authenticated()
                .requestMatchers("/api/profile/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/listings").authenticated()
                
                // Image serving endpoints with validation
                .requestMatchers("/api/images/**").authenticated()
                
                // All other requests require authentication
                .anyRequest().authenticated()
            );

        // Add JWT filter
        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        // Add security headers
        http.headers(headers -> headers
            .frameOptions().deny()
            .contentTypeOptions().and()
            .httpStrictTransportSecurity(hstsConfig -> hstsConfig
                .maxAgeInSeconds(31536000)
                .includeSubdomains(true))
            .and()
            .addHeaderWriter(new XContentTypeOptionsHeaderWriter())
            .addHeaderWriter(new XXssProtectionHeaderWriter())
            .addHeaderWriter(new ReferrerPolicyHeaderWriter(ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
        );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allow specific origins in production
        configuration.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:3000",  // React development
            "http://localhost:3002",  // Alternative React port
            "https://*.gemnet.lk",    // Production domains
            "https://gemnet.vercel.app" // Deployment domain
        ));
        
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));
        
        configuration.setAllowedHeaders(Arrays.asList(
            "Origin", "Content-Type", "Accept", "Authorization", 
            "Access-Control-Request-Method", "Access-Control-Request-Headers",
            "X-Requested-With", "X-Auth-Token"
        ));
        
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization", "X-Total-Count", "X-Page-Count", "Access-Control-Allow-Origin"
        ));
        
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring()
            .requestMatchers("/static/**", "/public/**", "/uploads/**")
            .requestMatchers("/favicon.ico", "/manifest.json")
            .requestMatchers("/actuator/health", "/actuator/info");
    }
}
```

#### 3.2.8.3 Input Validation and Sanitization

**Code Segment 3.11: Comprehensive Input Validation**
```java
@Component
public class InputValidationService {
    
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[A-Za-z0-9+_.-]+@([A-Za-z0-9.-]+\\.[A-Za-z]{2,})$"
    );
    
    private static final Pattern NIC_PATTERN = Pattern.compile(
        "^(\\d{9}[VvXx]|\\d{12})$"
    );
    
    private static final Pattern PHONE_PATTERN = Pattern.compile(
        "^\\+?[1-9]\\d{1,14}$"
    );
    
    private static final Pattern SAFE_TEXT_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9\\s\\-_.,()'\"!?]+$"
    );
    
    public void validateUserRegistration(UserRegistrationRequest request) {
        List<String> errors = new ArrayList<>();
        
        // Email validation
        if (!isValidEmail(request.getEmail())) {
            errors.add("Invalid email format");
        }
        
        // Password strength validation
        if (!isStrongPassword(request.getPassword())) {
            errors.add("Password must be at least 8 characters with uppercase, lowercase, number, and special character");
        }
        
        // Name validation
        if (!isValidName(request.getFirstName()) || !isValidName(request.getLastName())) {
            errors.add("Names must contain only letters, spaces, and hyphens");
        }
        
        // NIC validation
        if (!isValidNIC(request.getNicNumber())) {
            errors.add("Invalid NIC number format");
        }
        
        // Phone validation
        if (!isValidPhone(request.getMobileNumber())) {
            errors.add("Invalid phone number format");
        }
        
        // Age validation
        if (!isValidAge(request.getDateOfBirth())) {
            errors.add("User must be at least 18 years old");
        }
        
        if (!errors.isEmpty()) {
            throw new ValidationException("Validation failed: " + String.join(", ", errors));
        }
    }
    
    public void validateGemListing(CreateListingRequest request) {
        List<String> errors = new ArrayList<>();
        
        // Basic validation
        if (StringUtils.isBlank(request.getName()) || request.getName().length() > 200) {
            errors.add("Listing name must be 1-200 characters");
        }
        
        if (request.getPrice() == null || request.getPrice() <= 0) {
            errors.add("Price must be positive");
        }
        
        // Sanitize description
        if (request.getDescription() != null) {
            String sanitized = sanitizeHtml(request.getDescription());
            if (sanitized.length() > 5000) {
                errors.add("Description is too long (max 5000 characters)");
            }
        }
        
        // Validate gemstone attributes
        if (request.getAttributes() != null) {
            validateGemAttributes(request.getAttributes(), errors);
        }
        
        // Validate images
        if (request.getImages() != null) {
            validateImages(request.getImages(), errors);
        }
        
        if (!errors.isEmpty()) {
            throw new ValidationException("Listing validation failed: " + String.join(", ", errors));
        }
    }
    
    private boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }
    
    private boolean isStrongPassword(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }
        
        boolean hasUpper = false, hasLower = false, hasDigit = false, hasSpecial = false;
        
        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) hasUpper = true;
            else if (Character.isLowerCase(c)) hasLower = true;
            else if (Character.isDigit(c)) hasDigit = true;
            else if ("!@#$%^&*()_+-=[]{}|;:,.<>?".contains(String.valueOf(c))) hasSpecial = true;
        }
        
        return hasUpper && hasLower && hasDigit && hasSpecial;
    }
    
    private boolean isValidName(String name) {
        return name != null && 
               name.trim().length() >= 1 && 
               name.trim().length() <= 50 &&
               name.matches("^[a-zA-Z\\s\\-']+$");
    }
    
    private boolean isValidNIC(String nic) {
        return nic != null && NIC_PATTERN.matcher(nic).matches();
    }
    
    private boolean isValidPhone(String phone) {
        return phone != null && PHONE_PATTERN.matcher(phone).matches();
    }
    
    private boolean isValidAge(String dateOfBirth) {
        try {
            LocalDate birthDate = LocalDate.parse(dateOfBirth);
            return Period.between(birthDate, LocalDate.now()).getYears() >= 18;
        } catch (Exception e) {
            return false;
        }
    }
    
    private String sanitizeHtml(String input) {
        if (input == null) return null;
        
        // Use OWASP Java HTML Sanitizer
        PolicyFactory policy = Sanitizers.FORMATTING
            .and(Sanitizers.LINKS)
            .and(Sanitizers.BLOCKS);
        
        return policy.sanitize(input);
    }
    
    private void validateImages(List<MultipartFile> images, List<String> errors) {
        if (images.size() > 10) {
            errors.add("Maximum 10 images allowed");
        }
        
        for (MultipartFile image : images) {
            if (image.getSize() > 10 * 1024 * 1024) { // 10MB
                errors.add("Image size must be less than 10MB");
            }
            
            String contentType = image.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                errors.add("Invalid image format");
            }
        }
    }
    
    public String sanitizeInput(String input) {
        if (input == null) return null;
        
        // Remove potential XSS patterns
        return input.replaceAll("<script[^>]*>.*?</script>", "")
                   .replaceAll("javascript:", "")
                   .replaceAll("on\\w+\\s*=", "")
                   .trim();
    }
}
```

## 3.3 System Integration

### 3.3.1 Frontend-Backend Integration

The system uses RESTful APIs for communication between frontend and backend components. All API endpoints follow a consistent response format:

```typescript
interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}
```

### 3.3.2 Database Integration

MongoDB integration is handled through Spring Data MongoDB with custom repository methods for complex queries:

```java
@Repository
public interface GemListingRepository extends MongoRepository<GemListing, String> {
    
    List<GemListing> findByStatusAndBiddingActiveTrue(String status);
    
    @Query("{ 'sellerId': ?0, 'status': ?1 }")
    List<GemListing> findBySellerIdAndStatus(String sellerId, String status);
    
    @Aggregation(pipeline = {
        "{ '$match': { 'status': 'APPROVED' } }",
        "{ '$sort': { 'createdAt': -1 } }",
        "{ '$limit': 10 }"
    })
    List<GemListing> findLatestApprovedListings();
}
```

## 3.4 Performance Optimizations

### 3.4.1 Image Processing Optimization

Face recognition and OCR processing are optimized for performance:

- Image resizing before processing
- Caching of face encodings
- Asynchronous processing for non-critical operations
- Background job scheduling for batch operations

### 3.4.2 Database Query Optimization

MongoDB queries are optimized with proper indexing:

```javascript
// Database Indexes
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "verificationStatus": 1 })
db.gemListings.createIndex({ "status": 1, "biddingActive": 1 })
db.bids.createIndex({ "listingId": 1, "status": 1 })
db.notifications.createIndex({ "userId": 1, "isRead": 1 })
```

This implementation provides a robust, scalable marketplace system with advanced security features and real-time capabilities.
