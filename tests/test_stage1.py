"""
Stage 1: 아이디어 해체 분석 테스트
"""

import os
import json
import anthropic
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv()

# Initialize Anthropic client
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def load_prompt_template(stage: str) -> str:
    """프롬프트 템플릿 파일 로드"""
    prompt_path = Path(__file__).parent.parent / "prompts" / f"{stage}.md"
    with open(prompt_path, "r", encoding="utf-8") as f:
        return f.read()

def load_schema(stage: str) -> dict:
    """JSON 스키마 로드"""
    schema_path = Path(__file__).parent.parent / "schemas" / f"{stage}.json"
    with open(schema_path, "r", encoding="utf-8") as f:
        return json.load(f)

def test_stage1(user_idea: str, tier: str = "pro") -> dict:
    """
    Stage 1 프롬프트 테스트

    Args:
        user_idea: 사용자 아이디어 입력
        tier: light/pro/heavy

    Returns:
        AI 응답 결과 (JSON)
    """

    # 프롬프트 템플릿 로드
    template = load_prompt_template("stage1-idea-breakdown")

    # {USER_IDEA} 치환
    prompt = template.replace("{USER_IDEA}", user_idea)

    print("=" * 80)
    print(f"🧪 Stage 1 테스트 시작")
    print("=" * 80)
    print(f"📝 입력 아이디어: {user_idea}")
    print(f"🎯 티어: {tier}")
    print("-" * 80)

    # Claude API 호출
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2000,
        temperature=0.7,
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    # 응답 추출
    response_text = message.content[0].text

    print("📤 AI 응답:")
    print(response_text)
    print("-" * 80)

    # JSON 파싱 시도
    try:
        # JSON만 추출 (```json ``` 제거)
        if "```json" in response_text:
            json_start = response_text.find("```json") + 7
            json_end = response_text.find("```", json_start)
            json_text = response_text[json_start:json_end].strip()
        elif "```" in response_text:
            json_start = response_text.find("```") + 3
            json_end = response_text.find("```", json_start)
            json_text = response_text[json_start:json_end].strip()
        else:
            json_text = response_text.strip()

        result = json.loads(json_text)

        print("✅ JSON 파싱 성공")
        print(json.dumps(result, indent=2, ensure_ascii=False))
        print("-" * 80)

        # 스키마 검증
        schema = load_schema("stage1-idea-breakdown")
        from jsonschema import validate, ValidationError

        try:
            validate(instance=result, schema=schema)
            print("✅ 스키마 검증 성공")
        except ValidationError as e:
            print(f"❌ 스키마 검증 실패: {e.message}")

        return result

    except json.JSONDecodeError as e:
        print(f"❌ JSON 파싱 실패: {e}")
        print(f"원본 응답: {response_text}")
        return None

def save_result(result: dict, filename: str):
    """결과를 파일로 저장"""
    output_dir = Path(__file__).parent / "outputs"
    output_dir.mkdir(exist_ok=True)

    output_path = output_dir / filename
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"💾 결과 저장: {output_path}")

if __name__ == "__main__":
    # 테스트 케이스 1: 명확한 아이디어
    print("\n🔬 테스트 케이스 1: 명확한 아이디어")
    result1 = test_stage1(
        user_idea="요즘 사람들 너무 바빠서 운동 못 하잖아요. 집에서 쉽게 할 수 있는 15분 피트니스 앱 만들고 싶어요.",
        tier="pro"
    )

    if result1:
        save_result(result1, "stage1_test1.json")

    print("\n" + "=" * 80)
    input("엔터를 눌러 다음 테스트 진행...")

    # 테스트 케이스 2: 모호한 아이디어
    print("\n🔬 테스트 케이스 2: 모호한 아이디어")
    result2 = test_stage1(
        user_idea="AI 스타트업 붐이잖아요. 창업 초보자들 도와주는 플랫폼 만들고 싶어요.",
        tier="pro"
    )

    if result2:
        save_result(result2, "stage1_test2.json")

    print("\n✨ 테스트 완료!")
