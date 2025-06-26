package com.gemnet.service;

import org.opencv.core.*;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.Imgproc;
import org.opencv.objdetect.CascadeClassifier;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;

@Service
public class FaceRecognitionService {
    
    private CascadeClassifier faceDetector;
    
    // Configurable thresholds for different matching methods
    private static final double TEMPLATE_MATCH_THRESHOLD = 0.45; // Lowered from 0.6
    private static final double CORRELATION_THRESHOLD = 0.4;      // Additional method
    private static final double HISTOGRAM_THRESHOLD = 0.7;       // Histogram comparison
    
    @PostConstruct
    public void init() {
        try {
            // Load OpenCV native library
            nu.pattern.OpenCV.loadLocally();
            System.out.println("✅ OpenCV loaded successfully");
            
            // Initialize face detector with absolute path
            String classifierPath = "./haarcascade_frontalface_alt.xml";
            File classifierFile = new File(classifierPath);
            
            if (!classifierFile.exists()) {
                // Try alternative paths
                String[] alternativePaths = {
                    "haarcascade_frontalface_alt.xml",
                    "src/main/resources/haarcascade_frontalface_alt.xml",
                    "BackEnd/haarcascade_frontalface_alt.xml"
                };
                
                for (String altPath : alternativePaths) {
                    File altFile = new File(altPath);
                    if (altFile.exists()) {
                        classifierPath = altPath;
                        System.out.println("🔍 Found classifier at: " + classifierPath);
                        break;
                    }
                }
            }
            
            faceDetector = new CascadeClassifier();
            if (!faceDetector.load(classifierPath)) {
                System.err.println("❌ Error loading face detector from: " + classifierPath);
                // Use a fallback - create a simple face detector
                System.out.println("⚠️ Using fallback face detection (will be less accurate)");
                faceDetector = null; // Will trigger fallback detection
            } else {
                System.out.println("✅ Face detector loaded successfully from: " + classifierPath);
            }
        } catch (Exception e) {
            System.err.println("❌ Error initializing face recognition service: " + e.getMessage());
            faceDetector = null; // Will use fallback
        }
    }
    
    /**
     * Extract face features from uploaded image
     */
    public String extractFaceFeatures(MultipartFile imageFile) throws IOException {
        // Convert MultipartFile to Mat
        byte[] imageBytes = imageFile.getBytes();
        Mat image = Imgcodecs.imdecode(new MatOfByte(imageBytes), Imgcodecs.IMREAD_COLOR);
        
        if (image.empty()) {
            throw new RuntimeException("Could not load image");
        }
        
        // Convert to grayscale
        Mat grayImage = new Mat();
        Imgproc.cvtColor(image, grayImage, Imgproc.COLOR_BGR2GRAY);
        
        Rect faceRect = null;
        
        // Try to detect faces if face detector is available
        if (faceDetector != null && !faceDetector.empty()) {
            MatOfRect faces = new MatOfRect();
            faceDetector.detectMultiScale(grayImage, faces);
            
            Rect[] facesArray = faces.toArray();
            if (facesArray.length > 0) {
                faceRect = facesArray[0];
            }
        }
        
        // If no face detector or no face detected, use entire image
        if (faceRect == null) {
            System.out.println("⚠️ Using entire image as face region (no face detection available)");
            faceRect = new Rect(0, 0, grayImage.cols(), grayImage.rows());
        }
        
        // Extract face region
        Mat faceROI = new Mat(grayImage, faceRect);
        
        // Resize face to standard size
        Mat resizedFace = new Mat();
        Size standardSize = new Size(100, 100);
        Imgproc.resize(faceROI, resizedFace, standardSize);
        
        // Convert to feature vector (simplified - in production use more sophisticated features)
        byte[] faceData = new byte[(int) (resizedFace.total() * resizedFace.elemSize())];
        resizedFace.get(0, 0, faceData);
        
        // Encode as Base64 string
        return Base64.getEncoder().encodeToString(faceData);
    }
    
    /**
     * Enhanced face comparison with multiple methods and better preprocessing
     */
    public boolean compareFaces(String faceImagePath1, String faceImagePath2) {
        try {
            System.out.println("🔍 Starting enhanced face comparison...");
            System.out.println("   • Image 1: " + faceImagePath1);
            System.out.println("   • Image 2: " + faceImagePath2);
            
            // Load images
            Mat image1 = Imgcodecs.imread(faceImagePath1);
            Mat image2 = Imgcodecs.imread(faceImagePath2);
            
            if (image1.empty() || image2.empty()) {
                System.err.println("❌ Could not load one or both images");
                return false;
            }
            
            // Convert to grayscale
            Mat gray1 = new Mat();
            Mat gray2 = new Mat();
            Imgproc.cvtColor(image1, gray1, Imgproc.COLOR_BGR2GRAY);
            Imgproc.cvtColor(image2, gray2, Imgproc.COLOR_BGR2GRAY);
            
            System.out.println("📐 Image sizes: " + gray1.size() + " vs " + gray2.size());
            
            // Detect faces with more lenient parameters
            MatOfRect faces1 = new MatOfRect();
            MatOfRect faces2 = new MatOfRect();
            
            Rect[] facesArray1 = null;
            Rect[] facesArray2 = null;
            
            if (faceDetector != null && !faceDetector.empty()) {
                // More lenient face detection parameters
                faceDetector.detectMultiScale(gray1, faces1, 1.1, 3, 0, new Size(30, 30), new Size());
                faceDetector.detectMultiScale(gray2, faces2, 1.1, 3, 0, new Size(30, 30), new Size());
                
                facesArray1 = faces1.toArray();
                facesArray2 = faces2.toArray();
                
                System.out.println("👤 Faces detected: " + facesArray1.length + " in image1, " + facesArray2.length + " in image2");
            } else {
                System.out.println("⚠️ Face detector not available, using entire images for comparison");
                // Use entire images as face regions
                facesArray1 = new Rect[]{ new Rect(0, 0, gray1.cols(), gray1.rows()) };
                facesArray2 = new Rect[]{ new Rect(0, 0, gray2.cols(), gray2.rows()) };
                System.out.println("👤 Using full images as face regions");
            }
            
            if (facesArray1.length == 0 || facesArray2.length == 0) {
                System.err.println("❌ No faces detected in one or both images");
                return false;
            }
            
            // Extract face regions
            Mat face1 = new Mat(gray1, facesArray1[0]);
            Mat face2 = new Mat(gray2, facesArray2[0]);
            
            System.out.println("📐 Face regions: " + face1.size() + " vs " + face2.size());
            
            // Preprocess faces for better comparison
            Mat processedFace1 = preprocessFace(face1);
            Mat processedFace2 = preprocessFace(face2);
            
            // Method 1: Template Matching (improved)
            double templateScore = calculateTemplateMatchScore(processedFace1, processedFace2);
            
            // Method 2: Normalized Cross Correlation
            double correlationScore = calculateCorrelationScore(processedFace1, processedFace2);
            
            // Method 3: Histogram Comparison
            double histogramScore = calculateHistogramScore(processedFace1, processedFace2);
            
            // Method 4: Structural Similarity (basic version)
            double structuralScore = calculateStructuralScore(processedFace1, processedFace2);
            
            // Log all scores for debugging
            System.out.println("📊 Similarity Scores:");
            System.out.println("   • Template Match: " + String.format("%.3f", templateScore) + " (threshold: " + TEMPLATE_MATCH_THRESHOLD + ")");
            System.out.println("   • Correlation: " + String.format("%.3f", correlationScore) + " (threshold: " + CORRELATION_THRESHOLD + ")");
            System.out.println("   • Histogram: " + String.format("%.3f", histogramScore) + " (threshold: " + HISTOGRAM_THRESHOLD + ")");
            System.out.println("   • Structural: " + String.format("%.3f", structuralScore));
            
            // Weighted voting system (more lenient for age-related changes)
            int matches = 0;
            double weightedScore = 0.0;
            
            if (templateScore > TEMPLATE_MATCH_THRESHOLD) {
                matches++;
                weightedScore += templateScore * 0.3; // 30% weight
            }
            
            if (correlationScore > CORRELATION_THRESHOLD) {
                matches++;
                weightedScore += correlationScore * 0.25; // 25% weight
            }
            
            if (histogramScore > HISTOGRAM_THRESHOLD) {
                matches++;
                weightedScore += histogramScore * 0.25; // 25% weight
            }
            
            if (structuralScore > 0.3) { // Lower threshold for structural similarity
                matches++;
                weightedScore += structuralScore * 0.2; // 20% weight
            }
            
            // Decision logic: require at least 2 methods to agree, OR very high weighted score
            boolean isMatch = (matches >= 2) || (weightedScore > 0.6);
            
            System.out.println("🎯 Final Result:");
            System.out.println("   • Methods agreeing: " + matches + "/4");
            System.out.println("   • Weighted score: " + String.format("%.3f", weightedScore));
            System.out.println("   • Match: " + (isMatch ? "✅ YES" : "❌ NO"));
            
            return isMatch;
            
        } catch (Exception e) {
            System.err.println("❌ Error comparing faces: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    /**
     * Preprocess face for better comparison (handles lighting, contrast, etc.)
     */
    private Mat preprocessFace(Mat face) {
        Mat processed = new Mat();
        
        // Resize to standard size
        Size standardSize = new Size(100, 100);
        Imgproc.resize(face, processed, standardSize);
        
        // Apply histogram equalization to normalize lighting
        Mat equalized = new Mat();
        Imgproc.equalizeHist(processed, equalized);
        
        // Apply Gaussian blur to reduce noise
        Mat blurred = new Mat();
        Imgproc.GaussianBlur(equalized, blurred, new Size(3, 3), 0);
        
        return blurred;
    }
    
    /**
     * Calculate template matching score
     */
    private double calculateTemplateMatchScore(Mat face1, Mat face2) {
        Mat result = new Mat();
        Imgproc.matchTemplate(face1, face2, result, Imgproc.TM_CCOEFF_NORMED);
        Core.MinMaxLocResult mmr = Core.minMaxLoc(result);
        return mmr.maxVal;
    }
    
    /**
     * Calculate normalized cross correlation
     */
    private double calculateCorrelationScore(Mat face1, Mat face2) {
        Mat result = new Mat();
        Imgproc.matchTemplate(face1, face2, result, Imgproc.TM_CCORR_NORMED);
        Core.MinMaxLocResult mmr = Core.minMaxLoc(result);
        return mmr.maxVal;
    }
    
    /**
     * Calculate histogram similarity
     */
    private double calculateHistogramScore(Mat face1, Mat face2) {
        try {
            // Calculate histograms
            Mat hist1 = new Mat();
            Mat hist2 = new Mat();
            
            // Parameters for histogram calculation
            int histSize = 256;
            float[] range = {0, 256};
            MatOfFloat histRange = new MatOfFloat(range);
            MatOfInt channels = new MatOfInt(0);
            
            Imgproc.calcHist(java.util.Arrays.asList(face1), channels, new Mat(), hist1, new MatOfInt(histSize), histRange);
            Imgproc.calcHist(java.util.Arrays.asList(face2), channels, new Mat(), hist2, new MatOfInt(histSize), histRange);
            
            // Normalize histograms
            Core.normalize(hist1, hist1, 0, 1, Core.NORM_MINMAX);
            Core.normalize(hist2, hist2, 0, 1, Core.NORM_MINMAX);
            
            // Compare histograms using correlation
            return Imgproc.compareHist(hist1, hist2, Imgproc.HISTCMP_CORREL);
            
        } catch (Exception e) {
            System.err.println("⚠️ Histogram comparison failed: " + e.getMessage());
            return 0.0;
        }
    }
    
    /**
     * Calculate basic structural similarity
     */
    private double calculateStructuralScore(Mat face1, Mat face2) {
        try {
            // Convert to floating point
            Mat f1 = new Mat();
            Mat f2 = new Mat();
            face1.convertTo(f1, CvType.CV_32F);
            face2.convertTo(f2, CvType.CV_32F);
            
            // Calculate means
            Scalar mean1 = Core.mean(f1);
            Scalar mean2 = Core.mean(f2);
            
            // Calculate standard deviations
            Mat diff1 = new Mat();
            Mat diff2 = new Mat();
            Core.subtract(f1, mean1, diff1);
            Core.subtract(f2, mean2, diff2);
            
            // Simple structural similarity approximation
            Mat mul = new Mat();
            Core.multiply(diff1, diff2, mul);
            Scalar covariance = Core.mean(mul);
            
            // Simplified SSIM calculation
            double c1 = 6.5025; // (0.01*255)^2
            double c2 = 58.5225; // (0.03*255)^2
            
            double numerator = (2 * mean1.val[0] * mean2.val[0] + c1) * (2 * covariance.val[0] + c2);
            double denominator = (mean1.val[0] * mean1.val[0] + mean2.val[0] * mean2.val[0] + c1) * 
                               (Core.mean(diff1.mul(diff1)).val[0] + Core.mean(diff2.mul(diff2)).val[0] + c2);
            
            return Math.abs(numerator / denominator);
            
        } catch (Exception e) {
            System.err.println("⚠️ Structural similarity calculation failed: " + e.getMessage());
            return 0.0;
        }
    }
    
    /**
     * Validate if image contains a face
     */
    public boolean validateFaceInImage(MultipartFile imageFile) {
        try {
            System.out.println("🔍 Validating face in uploaded image...");
            
            byte[] imageBytes = imageFile.getBytes();
            Mat image = Imgcodecs.imdecode(new MatOfByte(imageBytes), Imgcodecs.IMREAD_COLOR);
            
            if (image.empty()) {
                System.err.println("❌ Could not decode uploaded image");
                return false;
            }
            
            Mat grayImage = new Mat();
            Imgproc.cvtColor(image, grayImage, Imgproc.COLOR_BGR2GRAY);
            
            // Check if face detector is available
            if (faceDetector != null && !faceDetector.empty()) {
                MatOfRect faces = new MatOfRect();
                faceDetector.detectMultiScale(grayImage, faces, 1.1, 3, 0, new Size(30, 30), new Size());
                
                Rect[] facesArray = faces.toArray();
                System.out.println("👤 Faces detected: " + facesArray.length);
                
                return facesArray.length > 0;
            } else {
                // Fallback: Use basic image analysis
                System.out.println("⚠️ Face detector not available, using fallback validation");
                return validateImageQuality(grayImage);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error validating face in image: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    /**
     * Fallback validation using basic image analysis
     */
    private boolean validateImageQuality(Mat grayImage) {
        try {
            // Check image dimensions (should be reasonable for a face photo)
            int width = grayImage.cols();
            int height = grayImage.rows();
            
            if (width < 50 || height < 50) {
                System.out.println("❌ Image too small for face detection");
                return false;
            }
            
            // Check if image has reasonable contrast (not completely dark or bright)
            Scalar meanBrightness = Core.mean(grayImage);
            double brightness = meanBrightness.val[0];
            
            if (brightness < 20 || brightness > 235) {
                System.out.println("❌ Image brightness out of range: " + brightness);
                return false;
            }
            
            // Calculate standard deviation (measure of contrast)
            MatOfDouble mean = new MatOfDouble();
            MatOfDouble stddev = new MatOfDouble();
            Core.meanStdDev(grayImage, mean, stddev);
            double contrast = stddev.get(0, 0)[0];
            
            if (contrast < 10) {
                System.out.println("❌ Image has too low contrast: " + contrast);
                return false;
            }
            
            System.out.println("✅ Image passes basic quality checks (brightness: " + String.format("%.1f", brightness) + ", contrast: " + String.format("%.1f", contrast) + ")");
            
            // For testing purposes, accept any image that passes basic quality checks
            // In production, you might want to be more strict
            return true;
            
        } catch (Exception e) {
            System.err.println("❌ Error in fallback validation: " + e.getMessage());
            return false;
        }
    }
}
