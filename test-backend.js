// Simple test to check backend connectivity
const axios = require('axios');

async function testBackend() {
    console.log('Testing backend connectivity...');
    
    try {
        // Test 1: Health check
        console.log('\n1. Testing health endpoint...');
        const healthResponse = await axios.get('http://localhost:9092/health');
        console.log('✅ Health check successful:', healthResponse.data);
        
        // Test 2: Get advertisements
        console.log('\n2. Testing GET /api/advertisements...');
        const getResponse = await axios.get('http://localhost:9092/api/advertisements');
        console.log('✅ GET advertisements successful, count:', getResponse.data.length);
        
        // Test 3: POST with minimal data (this should fail but tell us why)
        console.log('\n3. Testing POST /api/advertisements...');
        const formData = new FormData();
        formData.append('title', 'Test Advertisement');
        formData.append('category', 'Test Category');
        formData.append('description', 'Test Description');
        formData.append('price', '100');
        formData.append('userId', 'test-user-id');
        formData.append('mobileNo', '1234567890');
        formData.append('email', 'test@test.com');
        
        // Create a small dummy image file
        const dummyImage = new Blob(['dummy image content'], { type: 'image/jpeg' });
        formData.append('images', dummyImage, 'test.jpg');
        
        const postResponse = await axios.post('http://localhost:9092/api/advertisements', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        console.log('✅ POST advertisement successful:', postResponse.data);
        
    } catch (error) {
        console.error('❌ Error occurred:');
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Error message:', error.message);
        }
    }
}

testBackend();