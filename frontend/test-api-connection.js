// Simple test to verify API connection
const API_BASE_URL = 'http://127.0.0.1:8000/api';

async function testConnection() {
  console.log('🧪 Testing API connection...');
  console.log('📡 API Base URL:', API_BASE_URL);
  
  try {
    // Test public endpoint first
    const response = await fetch(`${API_BASE_URL}/courses`);
    console.log('✅ Public courses endpoint status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📚 Public courses data:', data);
    } else {
      console.log('❌ Public courses error:', await response.text());
    }
    
  } catch (error) {
    console.error('❌ Connection error:', error);
  }
  
  // Test instructor endpoint (should return 401)
  try {
    const response = await fetch(`${API_BASE_URL}/instructor/courses`);
    console.log('🔒 Instructor courses endpoint status:', response.status);
    
    if (response.status === 401) {
      console.log('✅ Instructor endpoint correctly requires authentication');
    } else {
      console.log('❌ Unexpected response:', await response.text());
    }
    
  } catch (error) {
    console.error('❌ Instructor endpoint error:', error);
  }
}

testConnection();