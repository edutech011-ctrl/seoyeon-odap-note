import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SUBJECT_NAMES: Record<string, string> = {
  korean: "국어",
  english: "영어",
  math: "수학",
  science: "과학",
  history: "역사",
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File;
    const subject = formData.get("subject") as string;
    const count = parseInt(formData.get("count") as string) || 5;

    if (!image || !subject) {
      return NextResponse.json({ error: "이미지와 과목을 모두 입력해주세요." }, { status: 400 });
    }

    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = image.type || "image/jpeg";
    const subjectName = SUBJECT_NAMES[subject] || subject;

    const systemPrompt = `당신은 중학교 ${subjectName} 전문 교사입니다.
학생이 업로드한 문제 사진을 분석하고, 비슷한 유형의 문제를 만들어주세요.
반드시 JSON 형식으로만 응답하세요.`;

    const userPrompt = `이 중학교 ${subjectName} 문제 사진을 분석해주세요.

다음 JSON 형식으로 정확히 응답하세요:
{
  "analysis": {
    "topic": "문제의 주제 (예: 조선시대, 이차방정식 등)",
    "unit": "해당 단원명",
    "concepts": ["핵심개념1", "핵심개념2", "핵심개념3"],
    "problemType": "문제 유형 (예: 선택형, 서술형, 빈칸채우기 등)"
  },
  "conceptSummary": "이 단원의 핵심 개념을 체계적으로 요약 (200자 이상, 중요 내용 포함)",
  "problems": [
    {
      "question": "유사 문제 내용",
      "choices": ["① 보기1", "② 보기2", "③ 보기3", "④ 보기4", "⑤ 보기5"],
      "answer": "정답",
      "explanation": "해설"
    }
  ],
  "fillInTheBlanks": [
    {
      "sentence": "빈칸이 포함된 문장 (빈칸은 _____로 표시)",
      "answer": "정답"
    }
  ]
}

조건:
- problems는 정확히 ${count}개 생성
- fillInTheBlanks는 정확히 10개 생성
- 문제는 중학교 수준에 맞게 작성
- 선택형의 경우 choices 5개 포함, 서술형은 choices 빈 배열
- 모든 내용은 한국어로 작성`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 4000,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${base64}`, detail: "high" },
            },
            { type: "text", text: userPrompt },
          ],
        },
      ],
    });

    const content = response.choices[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI 응답을 파싱할 수 없습니다.");

    const data = JSON.parse(jsonMatch[0]);
    return NextResponse.json(data);
  } catch (e: unknown) {
    console.error(e);
    const message = e instanceof Error ? e.message : "서버 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
