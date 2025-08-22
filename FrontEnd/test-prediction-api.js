// Test script to directly test prediction API endpoints
const https = require('https');
const http = require('http');

// Test health endpoint first
function testHealthEndpoint() {
    console.log('\n=== Testing Health Endpoint ===');
    
    const options = {
        hostname: 'localhost',
        port: 9092,
        path: '/api/predictions/health',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Origin': 'http://localhost:3000'
        }
    };

    const req = http.request(options, (res) => {
        console.log(`Status: ${res.statusCode}`);
        console.log('Headers:', res.headers);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('Response Body:', data);
            console.log('✅ Health endpoint test completed');
            
            // Test prediction endpoint next
            testPredictionEndpoint();
        });
    });

    req.on('error', (e) => {
        console.error(`❌ Health endpoint error: ${e.message}`);
        testPredictionEndpoint();
    });

    req.end();
}

// Test prediction endpoint
function testPredictionEndpoint() {
    console.log('\n=== Testing Prediction Endpoint ===');
    
    const requestData = JSON.stringify({
        gemType: "Ruby",
        color: "Red",
        clarity: "VS1",
        cut: "Round",
        carat: 2.5,
        treatment: "Heated",
        origin: "Myanmar"
    });

    const options = {
        hostname: 'localhost',
        port: 9092,
        path: '/api/predictions/predict',
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestData),
            'Origin': 'http://localhost:3000'
        }
    };

    const req = http.request(options, (res) => {
        console.log(`Status: ${res.statusCode}`);
        console.log('Headers:', res.headers);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('Response Body:', data);
            console.log('✅ Prediction endpoint test completed');
        });
    });

    req.on('error', (e) => {
        console.error(`❌ Prediction endpoint error: ${e.message}`);
    });

    req.write(requestData);
    req.end();
}

// Start testing
console.log('🚀 Starting prediction API tests...');
testHealthEndpoint();
