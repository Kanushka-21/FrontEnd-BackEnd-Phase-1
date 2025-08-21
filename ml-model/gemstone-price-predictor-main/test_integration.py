import sys
import os
import pandas as pd

# Add the current directory to Python path
sys.path.append('.')

try:
    from src.pipeline.predict_pipeline import PredictPipeline, CustomData
    
    print("✅ Successfully imported prediction pipeline")
    
    # Test with sample data similar to your database items
    test_cases = [
        {
            "carat": 2.5,
            "cut": "Premium", 
            "color": "G",
            "clarity": "VS1",
            "depth": 62.0,
            "table": 58.0,
            "x": 7.5,
            "y": 7.5, 
            "z": 4.65
        },
        {
            "carat": 1.2,
            "cut": "Ideal",
            "color": "F", 
            "clarity": "VVS1",
            "depth": 61.5,
            "table": 57.0,
            "x": 6.8,
            "y": 6.8,
            "z": 4.2
        }
    ]
    
    predict_pipeline = PredictPipeline()
    
    for i, test_case in enumerate(test_cases):
        print(f"\n🧪 Test Case {i+1}:")
        print(f"Input: {test_case}")
        
        # Create custom data object
        data = CustomData(
            carat=test_case["carat"],
            depth=test_case["depth"],
            table=test_case["table"],
            x=test_case["x"],
            y=test_case["y"],
            z=test_case["z"],
            cut=test_case["cut"],
            color=test_case["color"],
            clarity=test_case["clarity"]
        )
        
        # Get prediction
        pred_df = data.get_data_as_dataframe()
        print(f"DataFrame: {pred_df.to_dict()}")
        
        results = predict_pipeline.predict(pred_df)
        prediction = results[0]
        
        print(f"💎 Predicted Price: ${prediction:.2f}")
        
except ImportError as e:
    print(f"❌ Import Error: {e}")
    print("📦 Make sure all required packages are installed:")
    print("   pip install -r requirements.txt")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
