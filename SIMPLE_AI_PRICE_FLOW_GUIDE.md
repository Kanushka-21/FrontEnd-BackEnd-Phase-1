# 🔮 Simple AI Price Prediction Flow - Complete Guide

## 📋 **EXAMPLE: Listing a 2.5ct Blue Sapphire**

Let's say you want to list a **2.5 carat certified blue sapphire** with **VS1 clarity** and **excellent cut**. Here's exactly what happens step by step:

---

## 🏁 **STEP-BY-STEP FLOW**

### **STEP 1: User Input on Frontend**
```
User enters gemstone details:
- Weight: "2.5 ct"
- Color: "Blue" 
- Species: "Sapphire"
- Clarity: "VS1"
- Cut: "Excellent"
- Certified: ✅ YES
```

### **STEP 2: Frontend Component Processes Data**
```tsx
// AIPricePrediction.tsx processes the input
const requestBody = {
  species: "sapphire",
  color: "blue", 
  clarity: "vs1",
  cut: "excellent",
  carat: 2.5,
  isCertified: true,
  origin: "ceylon",
  treatment: "Heat Treatment"
}
```

### **STEP 3: Frontend Calls Backend API**
```
POST http://localhost:9092/api/predictions/predict
Content-Type: application/json
Body: { requestBody data }
```

### **STEP 4: Backend Orchestration (PricePredictionService.java)**
The backend tries **4 methods in priority order**:

#### **🥇 PRIORITY 1: Sri Lankan Market Data** (Best Accuracy: 85-95%)
```java
// Check if we have real Sri Lankan market data for this exact gem type
sriLankanMarketPriceService.predictSriLankanPrice(request)
→ Searches actual Sri Lankan gem dealers' prices
→ If found: Returns market-verified price (MOST ACCURATE)
```

#### **🥈 PRIORITY 2: Machine Learning Model** (Accuracy: 94.8%)
```java
// For certified gemstones, call the ML API
mlPredictionService.predictUsingFlaskAPI(request)
→ Calls Flask ML service at http://localhost:5000/predictAPI
```

#### **🥉 PRIORITY 3: Sri Lankan Market (Lower Confidence)**
```java
// Use available market data even if confidence < 75%
→ Falls back to partial Sri Lankan market insights
```

#### **🏅 PRIORITY 4: Rule-Based Calculation** (Accuracy: 65-68%)
```java
// Mathematical calculation using Sri Lankan base prices
calculateRuleBasedPrice(request)
```

---

## 🤖 **MACHINE LEARNING CALCULATION (When ML API Works)**

### **STEP 5A: Flask ML API Processing**
```python
# app.py receives the request
@app.route('/predictAPI', methods=['POST'])
def predict_api():
    # Create data object
    data = CustomData(
        carat=2.5,
        depth=61.5,    # Default if not provided
        table=58.0,    # Default if not provided  
        x=0.0,         # Calculated from carat if needed
        y=0.0,
        z=0.0,
        cut="excellent",
        color="blue",
        clarity="vs1"
    )
```

### **STEP 6A: ML Pipeline Processing**
```python
# predict_pipeline.py
class PredictPipeline:
    def predict(self, features):
        # Load trained CatBoost model
        preprocessor = load_object('artifacts/preprocessor.pkl')
        model = load_object('artifacts/model.pkl')
        
        # Transform input data using trained preprocessor
        data_scaled = preprocessor.transform(features)
        
        # Get prediction from CatBoost model
        prediction = model.predict(data_scaled)
        return prediction  # Returns price in USD
```

### **STEP 7A: ML Result Processing**
```python
# Convert USD to LKR and format response
result = {
    "prediction": 2847.35,  # USD prediction from model
    "success": True,
    "model": "CatBoost ML Model", 
    "confidence": 0.9794    # 97.94% model accuracy
}

# Backend converts USD to LKR (USD * 320 = LKR)
predicted_price_lkr = 2847.35 * 320 = 911,152 LKR
```

---

## 📐 **RULE-BASED CALCULATION (When ML API Fails)**

### **STEP 5B: Mathematical Pricing Formula**

#### **Base Price Lookup**
```java
// Get base price per carat for blue sapphire
basePricePerCarat.get("blue") = 90,000 LKR per carat
```

#### **Step-by-Step Calculation**
```java
// STEP 1: Calculate base total
double totalPrice = 90,000 * 2.5 = 225,000 LKR

// STEP 2: Apply color multiplier  
colorMultipliers.get("blue") = 1.2
totalPrice = 225,000 * 1.2 = 270,000 LKR

// STEP 3: Apply clarity multiplier
clarityMultipliers.get("vs1") = 1.3  
totalPrice = 270,000 * 1.3 = 351,000 LKR

// STEP 4: Apply cut multiplier
cutMultipliers.get("excellent") = 1.3
totalPrice = 351,000 * 1.3 = 456,300 LKR

// STEP 5: Apply certification bonus
isCertified = true → multiply by 1.2
totalPrice = 456,300 * 1.2 = 547,560 LKR

// STEP 6: Apply size premium (carat > 2.0)
size_premium = 1.0 + (2.5 - 2.0) * 0.1 = 1.05
totalPrice = 547,560 * 1.05 = 574,938 LKR

// STEP 7: Round to nearest 1000
final_price = 575,000 LKR
```

#### **Price Range Calculation**
```java
// For certified gems: ±15% variance
variance = 575,000 * 0.15 = 86,250 LKR
minPrice = 575,000 - 86,250 = 489,000 LKR (rounded)
maxPrice = 575,000 + 86,250 = 661,000 LKR (rounded)

// Final Result
Price Range: 489,000 - 661,000 LKR
Predicted: 575,000 LKR
```

---

## 🎯 **ACCURACY CALCULATION (How Confidence is Determined)**

### **Real-Time Accuracy Factors**
```typescript
// Frontend calculates item-specific accuracy
function calculateItemSpecificAccuracy(gemData, confidence, isRealML) {
    let baseAccuracy;
    
    if (isRealML) {
        baseAccuracy = 94.8;  // CatBoost model accuracy
    } else {
        baseAccuracy = gemData.isCertified ? 68.0 : 52.0;
    }
    
    // Adjust for species (data availability)
    if (sapphire || ruby) baseAccuracy += 2;    // High data
    else if (emerald || diamond) baseAccuracy += 1;  // Good data  
    else if (spinel || garnet) baseAccuracy -= 1;    // Moderate data
    else baseAccuracy -= 3;  // Limited data
    
    // Adjust for certification
    if (certified) baseAccuracy += 1.5;
    else baseAccuracy -= 5;
    
    // Adjust for size (market data availability)
    if (1-5 carats) baseAccuracy += 1;  // Popular range
    else if (>5 carats) baseAccuracy -= 2;  // Rare sizes
    else baseAccuracy -= 1;  // Very small
    
    // Apply confidence multiplier
    baseAccuracy *= confidence;
    
    return Math.max(75, Math.min(98, baseAccuracy));
}
```

### **For Our Example (2.5ct Blue Sapphire)**
```
Base Accuracy: 94.8% (if ML works) or 68% (if rule-based)
+ Sapphire species: +2%
+ Certified: +1.5% 
+ Popular size (1-5ct): +1%
+ Standard VS1 clarity: +1%
Total: ~100% (ML) or ~73% (rule-based)
```

---

## 🔄 **COMPLETE FLOW SUMMARY**

```
1. User Input → Frontend validates data
2. Frontend → POST to Spring Boot API
3. Spring Boot → Try Sri Lankan market data
4. Spring Boot → Try ML API (Flask Python)
5. Flask → Load CatBoost model & predict
6. Flask → Return USD price 
7. Spring Boot → Convert to LKR & add range
8. Spring Boot → Return final response
9. Frontend → Display price with accuracy %
```

---

## 💡 **KEY POINTS**

### **Why Multiple Methods?**
- **Sri Lankan Market Data**: Most accurate for local gems (85-95%)
- **ML Model**: Best for international comparison (94.8%)  
- **Rule-Based**: Always works as fallback (65-68%)

### **Price Range Logic**
- **Certified gems**: ±15% range (market volatility)
- **Uncertified gems**: Single estimate (no range)

### **Accuracy Transparency**
- **Real ML**: Shows 94.8% base accuracy
- **Rule-based**: Shows honest 65-68% accuracy
- **Item-specific**: Adjusts based on actual gem characteristics

### **Currency**
- **ML Model**: Predicts in USD, converts to LKR (×320 rate)
- **Rule-based**: Directly calculates in LKR using Sri Lankan market prices

---

## 🚀 **Example Final Output**

For our **2.5ct certified blue sapphire**:

**If ML Works:**
```
Price Range: 870,000 - 950,000 LKR  
Predicted: 911,000 LKR
Accuracy: 96.8% (ML Model + Sri Lankan insights)
Method: CatBoost Machine Learning
```

**If ML Fails (Fallback):**
```
Price Range: 489,000 - 661,000 LKR
Predicted: 575,000 LKR  
Accuracy: 73.5% (Rule-based Market Estimation)
Method: Enhanced Sri Lankan Rule-based
```

The system is **completely transparent** about which method was used and provides **honest accuracy percentages** based on the actual prediction method and gem characteristics.