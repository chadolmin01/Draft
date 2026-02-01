// 사용 가능한 Gemini 모델 목록 확인
const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = 'AIzaSyANNCuPuIsAfUBdk2Y1TN0vixI2lGWoJ5Q';
const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
  try {
    console.log('🔍 사용 가능한 모델 목록 확인 중...\n');

    const models = await genAI.listModels();

    console.log('✅ 사용 가능한 모델:');
    console.log('총', models.length, '개\n');

    models.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name}`);
      console.log(`   - Display Name: ${model.displayName}`);
      console.log(`   - Supported: ${model.supportedGenerationMethods?.join(', ')}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ 오류 발생:');
    console.error(error.message);
    console.error('\n혹시 API 키가 잘못되었거나 활성화되지 않았을 수 있습니다.');
    console.error('https://ai.google.dev/ 에서 확인해보세요.');
  }
}

listModels();
