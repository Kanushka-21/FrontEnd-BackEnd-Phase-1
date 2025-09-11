# 🔮 GemNet Price Prediction System - Complete Guide

## 🏗️ **System Architecture Overview**

Your GemNet marketplace uses a sophisticated **2-tier AI price prediction system** that provides accurate pricing estimates for gemstones based on their certification status and characteristics.

---

## 📊 **How Price Prediction Works**

### 🎯 **1. Two-Track Prediction System**

#### **🤖 Track 1: ML-Powered Predictions (Certified Gemstones)**
- **When**: `isCertified: true`
- **Process**: 
  1. Attempts **Flask API ML service** call (localhost:5000)
  2. Uses **CatBoost model** with 97.94% R² accuracy
  3. Provides **price ranges** (±10-15% variance)
  4. Falls back to enhanced rule-based if ML unavailable

#### **📐 Track 2: Rule-Based Estimation (Uncertified Gemstones)**
- **When**: `isCertified: false`
- **Process**:
  1. Uses **market-based calculations** only
  2. Provides **single price estimates** (no ranges)
  3. Lower confidence scores (65-70%)

---

## 🔄 **Backend Processing Flow**

### **PricePredictionService.java Logic:**

```java
// 1. Input Validation
if (request.getCarat() == null || request.getCarat() <= 0) {
    return PricePredictionResponse.error("Invalid carat weight");
}

// 2. Certification Check
if (Boolean.TRUE.equals(request.getIsCertified())) {
    // 3A. Try ML Prediction First
    if (mlPredictionService.isMlServiceAvailable()) {
        PricePredictionResponse mlResponse = mlPredictionService.predictUsingFlaskAPI(request);
        if (mlResponse.isSuccess()) {
            return mlResponse; // ✅ ML prediction successful
        }
    }
}

// 3B. Fallback to Rule-Based
BigDecimal predictedPrice = calculateRuleBasedPrice(request);

// 4. Price Range Logic
if (Boolean.TRUE.equals(request.getIsCertified())) {
    // Certified: Provide range (±15%)
    BigDecimal variance = predictedPrice.multiply(BigDecimal.valueOf(0.15));
    minPrice = predictedPrice.subtract(variance);
    maxPrice = predictedPrice.add(variance);
} else {
    // Uncertified: No range
    minPrice = predictedPrice;
    maxPrice = predictedPrice;
}
```

---

## 🖥️ **Frontend Display Logic**

### **Marketplace Item Cards (GemstoneCard.tsx):**

```tsx
{/* AI-Powered Dynamic Price Prediction */}
<AIPricePrediction 
  gemData={{
    weight: gemstone.weight || '1.0',
    color: gemstone.color || 'Blue',
    cut: gemstone.cut || 'Good',
    clarity: gemstone.clarity || 'SI1',
    species: gemstone.species || 'Sapphire',
    isCertified: gemstone.certified || false, // 🔑 Key decision point
    shape: gemstone.shape || 'Round',
    treatment: gemstone.treatment || 'Heat Treatment'
  }}
  showDetails={false}
  className="transform transition-all duration-300 hover:scale-102"
/>
```

### **Price Display Logic (AIPricePrediction.tsx):**

```tsx
{/* Conditional Display Based on Range */}
<div className="text-lg font-bold text-indigo-800">
  {prediction.minPrice === prediction.maxPrice 
    ? formatPrice(prediction.predictedPrice)     // Single price for uncertified
    : `${formatPrice(prediction.minPrice)} - ${formatPrice(prediction.maxPrice)}`  // Range for certified
  }
</div>
```

---

## 💰 **How Marketplace Items Show Predicted Prices**

### **📍 Display Locations:**

1. **Marketplace Grid/List View**
   - **Location**: Each `GemstoneCard` component
   - **Shows**: AI prediction below starting price
   - **Format**: Single price OR range based on certification

2. **Individual Listing Pages**
   - **Location**: `PricePredictionDisplay` component
   - **Shows**: Detailed prediction with confidence metrics
   - **Format**: Full breakdown with accuracy percentages

3. **Seller Dashboard**
   - **Location**: Listing creation wizard
   - **Shows**: Real-time prediction as user inputs data
   - **Format**: Interactive prediction updates

---

## 🎨 **Visual Examples**

### **✅ Certified Gemstone Display:**
```
┌─────────────────────────────┐
│ 🧠 AI Price Prediction      │
│ [AI/ML Model] [✓ Certified] │
│                             │
│     ₹85,000 - ₹95,000      │ ← RANGE
│     [92% Accuracy]          │
│                             │
│ Method: Machine Learning    │
│ (CatBoost)                  │
└─────────────────────────────┘
```

### **❌ Uncertified Gemstone Display:**
```
┌─────────────────────────────┐
│ 🧠 AI Price Prediction      │
│ [Certification Required]    │
│                             │
│ AI price prediction is only │
│ available for certified     │
│ gemstones                   │
│                             │
│ Get certified to unlock     │
│ accurate AI pricing         │
└─────────────────────────────┘
```

**Alternative for Uncertified (when rule-based used):**
```
┌─────────────────────────────┐
│ 📐 Market Estimation        │
│                             │
│         ₹90,000            │ ← SINGLE PRICE
│     [65% Confidence]        │
│                             │
│ Method: Rule-based Market   │
│ Estimation                  │
└─────────────────────────────┘
```

---

## 🔧 **Implementation Details**

### **1. Base Price Calculation (Rule-Based):**

```javascript
const basePrices = {
  'sapphire': 50000,    // Base price per carat
  'ruby': 80000,
  'emerald': 45000,
  'diamond': 150000,
  'spinel': 30000
};

// Calculation Formula:
let totalPrice = basePrice * carat;

// Premiums Applied:
if (cut === 'Excellent') totalPrice *= 1.2;
if (clarity.includes('VVS')) totalPrice *= 1.3;
if (treatment === 'Natural') totalPrice *= 1.4;
if (isCertified) totalPrice *= 1.2; // 20% premium
```

### **2. ML Model Integration (Flask API):**

```python
# app.py endpoint
@app.route('/predictAPI', methods=['POST'])
def predict_api():
    data = CustomData(
        carat = float(request.json['carat']),
        cut = request.json['cut'],
        color = request.json['color'],
        clarity = request.json['clarity']
    )
    
    pred_df = data.get_data_as_dataframe()
    predict_pipeline = PredictPipeline()
    pred = predict_pipeline.predict(pred_df)
    
    return jsonify({'price': round(pred[0], 2)})
```

### **3. Frontend Service Integration:**

```typescript
// PricePredictionService.ts
static async predictPrice(request: PricePredictionRequest): Promise<PricePredictionResponse> {
  const response = await api.post('/predictions/predict', request);
  return response.data;
}

static formatPriceRange(minPrice: number, maxPrice: number): string {
  if (minPrice === maxPrice) {
    return this.formatPrice(minPrice);
  }
  return `${this.formatPrice(minPrice)} - ${this.formatPrice(maxPrice)}`;
}
```

---

## 📈 **Marketplace Integration Points**

### **🏪 Where Users See Predictions:**

1. **Homepage Featured Items** - Quick AI predictions
2. **Search/Browse Results** - Price guidance for each item
3. **Auction Pages** - Starting vs predicted value comparison  
4. **Seller Listings** - Pricing assistance during creation
5. **Item Detail Pages** - Comprehensive prediction analysis

### **📊 Data Flow:**

```
User Views Item → 
GemstoneCard Loads → 
AIPricePrediction Component → 
Calls Backend API → 
PricePredictionService → 
ML Service (if certified) OR Rule-based → 
Returns Prediction → 
Frontend Displays Price/Range
```

---

## 🎯 **Current System Status**

✅ **Certified Gemstones**: Full ML integration with Flask API
✅ **Uncertified Gemstones**: Rule-based estimation (no ranges)  
✅ **Real-time Updates**: Dynamic predictions as data changes
✅ **Fallback System**: Graceful degradation when ML unavailable
✅ **Transparent Methods**: Users know which prediction method used

Your marketplace now provides **honest, intelligent pricing guidance** that helps both buyers and sellers make informed decisions while maintaining system integrity! 🚀
