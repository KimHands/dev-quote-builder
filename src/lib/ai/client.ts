import OpenAI from "openai";

export const AI_MODEL = "claude-sonnet-4-6";

export function mindlogic(): OpenAI {
  return new OpenAI({
    apiKey: process.env.MINDLOGIC_API_KEY,
    baseURL: process.env.MINDLOGIC_BASE_URL,
  });
}

export const SYSTEM_PROMPT = `당신은 비개발 창업자의 아이디어를 개발 견적용으로 정리하는 도우미입니다.
사용자의 자유로운 설명을 듣고, 한국어로 다음을 간결히 정리하세요:
1) 한 줄 요약 2) 핵심 화면/기능 목록(불릿)
그리고 마지막 줄에 반드시 추천 기능모듈을 JSON으로 출력:
{"features":[ "login"|"pay"|"chat"|"admin"|"noti"|"ai"|"sec" 중 해당되는 것 ]}
과장하지 말고, 불확실한 건 추측하지 말고 "상담에서 확인"이라고 쓰세요.`;
