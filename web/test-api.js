// Gemini API 테스트
const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = 'AIzaSyANNCuPuIsAfUBdk2Y1TN0vixI2lGWoJ5Q';
const genAI = new GoogleGenerativeAI(API_KEY);

async function testAPI() {
  try {
    console.log('🔍 API 키 테스트 중...\n');

    // 간단한 텍스트 생성 테스트
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const result = await model.generateContent('Hello, say hi in Korean');
    const response = await result.response;
    const text = response.text();

    console.log('✅ API 작동 확인!');
    console.log('응답:', text);
  } catch (error) {
    console.error('❌ 오류 발생:');
    console.error('메시지:', error.message);
    console.error('\n상세:', error);
  }
}

testAPI();
