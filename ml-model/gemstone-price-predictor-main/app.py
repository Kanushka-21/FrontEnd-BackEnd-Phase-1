from flask import Flask, request, render_template,jsonify
from flask_cors import CORS,cross_origin
from src.pipeline.predict_pipeline import CustomData, PredictPipeline
import warnings
import traceback

warnings.filterwarnings("ignore", category=UserWarning, module=".*sklearn.*")


application = Flask(__name__)
CORS(application)

app = application

@app.route('/')
@cross_origin()
def home_page():
    return render_template('index.html')

@app.route('/health')
@cross_origin() 
def health_check():
    """Health check endpoint for ML service"""
    try:
        # Test model loading
        predict_pipeline = PredictPipeline()
        return jsonify({
            "status": "healthy",
            "service": "ML Price Prediction",
            "message": "Service is running and model loaded successfully"
        }), 200
    except Exception as e:
        return jsonify({
            "status": "unhealthy", 
            "error": str(e),
            "message": "Service is not functioning properly"
        }), 500

@app.route('/predict',methods=['GET','POST'])
@cross_origin()
def predict_datapoint():
    if request.method == 'GET':
        return render_template('index.html')
    else:
        data = CustomData(
            carat = float(request.form.get('carat')),
            depth = float(request.form.get('depth')),
            table = float(request.form.get('table')),
            x = float(request.form.get('x')),
            y = float(request.form.get('y')),
            z = float(request.form.get('z')),
            cut = request.form.get('cut'),
            color= request.form.get('color'),
            clarity = request.form.get('clarity')
        )

        pred_df = data.get_data_as_dataframe()
        
        print(pred_df)

        predict_pipeline = PredictPipeline()
        pred = predict_pipeline.predict(pred_df)
        results = round(pred[0],2)
        return render_template('index.html',results=results,pred_df = pred_df)
    
@app.route('/predictAPI',methods=['POST'])
@cross_origin()
def predict_api():
    """Enhanced API endpoint for ML predictions"""
    try:
        if request.method == 'POST':
            # Get JSON data from request
            json_data = request.get_json()
            
            if not json_data:
                return jsonify({
                    "error": "No JSON data provided",
                    "success": False
                }), 400
                
            # Validate required fields
            required_fields = ['carat', 'cut', 'color', 'clarity']
            for field in required_fields:
                if field not in json_data:
                    return jsonify({
                        "error": f"Missing required field: {field}",
                        "success": False
                    }), 400
            
            # Create CustomData object
            data = CustomData(
                carat=float(json_data['carat']),
                depth=float(json_data.get('depth', 61.5)),  # Default depth
                table=float(json_data.get('table', 58.0)),  # Default table  
                x=float(json_data.get('x', 0.0)),
                y=float(json_data.get('y', 0.0)),
                z=float(json_data.get('z', 0.0)),
                cut=str(json_data['cut']),
                color=str(json_data['color']),
                clarity=str(json_data['clarity'])
            )
            
            # Get prediction dataframe
            pred_df = data.get_data_as_dataframe()
            
            # Make prediction
            predict_pipeline = PredictPipeline()
            prediction = predict_pipeline.predict(pred_df)
            
            # Format response
            result = {
                "prediction": float(prediction[0]),
                "success": True,
                "model": "CatBoost ML Model",
                "input_data": json_data,
                "confidence": 0.9794  # Model accuracy
            }
            
            return jsonify(result), 200
            
    except ValueError as ve:
        return jsonify({
            "error": f"Invalid data format: {str(ve)}",
            "success": False
        }), 400
        
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            "error": f"Prediction failed: {str(e)}",
            "success": False
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)