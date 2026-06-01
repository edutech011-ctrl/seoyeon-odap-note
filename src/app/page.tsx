"use client";

import { useState, useRef } from "react";

const SUBJECTS = [
  { id: "korean", label: "국어", emoji: "📖" },
  { id: "english", label: "영어", emoji: "🔤" },
  { id: "math", label: "수학", emoji: "➗" },
  { id: "science", label: "과학", emoji: "🔬" },
  { id: "history", label: "역사", emoji: "🏛️" },
];

const COUNTS = [1, 3, 5, 7, 10];

type AnalysisResult = {
  topic: string;
  unit: string;
  concepts: string[];
  problemType: string;
};

type Problem = {
  question: string;
  choices?: string[];
  answer: string;
  explanation: string;
};

type FillBlank = {
  sentence: string;
  answer: string;
};

type GenerateResult = {
  analysis: AnalysisResult;
  problems: Problem[];
  conceptSummary: string;
  fillInTheBlanks: FillBlank[];
};

export default function Home() {
  const [subject, setSubject] = useState<string>("");
  const [count, setCount] = useState<number>(5);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState<string>("");
  const [shownAnswers, setShownAnswers] = useState<Record<number, boolean>>({});
  const [shownFillAnswers, setShownFillAnswers] = useState<Record<number, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!subject) { setError("과목을 선택해주세요! 🐱"); return; }
    if (!imageFile) { setError("문제 사진을 업로드해주세요! 📸"); return; }
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("subject", subject);
      formData.append("count", String(count));

      const res = await fetch("/api/generate", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "오류가 발생했어요");
      }
      const data = await res.json();
      setResult(data);
      setShownAnswers({});
      setShownFillAnswers({});
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "오류가 발생했어요");
    } finally {
      setLoading(false);
    }
  };

  const toggleAnswer = (i: number) => setShownAnswers(prev => ({ ...prev, [i]: !prev[i] }));
  const toggleFillAnswer = (i: number) => setShownFillAnswers(prev => ({ ...prev, [i]: !prev[i] }));

  return (
    <main className="min-h-screen py-8 px-4" style={{ backgroundColor: "#F5EFE0" }}>
      {/* 배경 기니피그 장식 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {["10%,5%","85%,8%","5%,50%","92%,45%","8%,90%","88%,88%"].map((pos, i) => (
          <span key={i} className="absolute text-4xl opacity-10 float-anim"
            style={{ left: pos.split(",")[0], top: pos.split(",")[1], animationDelay: `${i * 0.5}s` }}>
            🐱
          </span>
        ))}
      </div>

      <div className="relative max-w-2xl mx-auto" style={{ zIndex: 1 }}>
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3 float-anim">🐱</div>
          <h1 className="text-3xl font-bold mb-1" style={{ color: "#7A5530" }}>
            서연이의 오답노트
          </h1>
          <p className="text-base" style={{ color: "#9B7040" }}>
            문제 사진을 올리면 AI가 비슷한 문제를 만들어줘요! ✨
          </p>
        </div>

        {/* 카드 */}
        <div className="rounded-3xl shadow-lg p-6 mb-6" style={{ backgroundColor: "#FFFDF7", border: "2px solid #C4956A" }}>
          {/* 과목 선택 */}
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3" style={{ color: "#7A5530" }}>
              🐾 과목 선택
            </h2>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSubject(s.id)}
                  className="px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: subject === s.id ? "#9B7040" : "#EDD9B5",
                    color: subject === s.id ? "#FFFFFF" : "#7A5530",
                    border: subject === s.id ? "2px solid #7A5530" : "2px solid #C4956A",
                  }}
                >
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* 이미지 업로드 */}
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3" style={{ color: "#7A5530" }}>
              📸 문제 사진 업로드
            </h2>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 hover:opacity-80 flex items-center justify-center overflow-hidden"
              style={{ borderColor: "#C4956A", backgroundColor: "#FAF3E8", minHeight: "160px" }}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="업로드된 문제" className="max-h-64 object-contain rounded-xl" />
              ) : (
                <div className="text-center p-8">
                  <div className="text-4xl mb-2">🐱</div>
                  <p className="font-bold" style={{ color: "#9B7040" }}>클릭해서 사진 올리기</p>
                  <p className="text-xs mt-1" style={{ color: "#C4956A" }}>JPG, PNG, WEBP 가능</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {imageFile && (
              <p className="text-xs mt-2 text-center" style={{ color: "#9B7040" }}>
                ✅ {imageFile.name}
              </p>
            )}
          </div>

          {/* 문제 개수 선택 */}
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3" style={{ color: "#7A5530" }}>
              🔢 생성할 문제 개수
            </h2>
            <div className="flex gap-2 flex-wrap">
              {COUNTS.map(n => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className="w-12 h-12 rounded-full text-sm font-bold transition-all duration-200 hover:scale-110 active:scale-95"
                  style={{
                    backgroundColor: count === n ? "#9B7040" : "#EDD9B5",
                    color: count === n ? "#FFFFFF" : "#7A5530",
                    border: count === n ? "2px solid #7A5530" : "2px solid #C4956A",
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* 오류 메시지 */}
          {error && (
            <div className="rounded-2xl px-4 py-3 mb-4 text-sm font-bold" style={{ backgroundColor: "#F0E4D0", color: "#7A5530", border: "1px solid #C4956A" }}>
              {error}
            </div>
          )}

          {/* 생성 버튼 */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-4 rounded-full text-lg font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: loading ? "#C4956A" : "#9B7040", color: "#FFFFFF", boxShadow: "0 4px 15px rgba(155,112,64,0.4)" }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block animate-spin">🐱</span> AI가 문제 만드는 중...
              </span>
            ) : (
              "🐱 문제 생성하기"
            )}
          </button>
        </div>

        {/* 결과 */}
        {result && (
          <div className="bounce-in space-y-5">
            {/* 분석 결과 */}
            <div className="rounded-3xl shadow p-5" style={{ backgroundColor: "#FFFDF7", border: "2px solid #C4956A" }}>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "#7A5530" }}>
                🔍 문제 분석
              </h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <InfoBox label="주제" value={result.analysis.topic} />
                <InfoBox label="단원" value={result.analysis.unit} />
                <InfoBox label="문제 유형" value={result.analysis.problemType} />
              </div>
              <div className="rounded-2xl p-3" style={{ backgroundColor: "#FAF3E8" }}>
                <p className="text-xs font-bold mb-2" style={{ color: "#7A5530" }}>📌 핵심 개념</p>
                <div className="flex flex-wrap gap-2">
                  {result.analysis.concepts.map((c, i) => (
                    <span key={i} className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: "#EDD9B5", color: "#7A5530" }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 개념 요약 */}
            <div className="rounded-3xl shadow p-5" style={{ backgroundColor: "#FFFDF7", border: "2px solid #C4956A" }}>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2" style={{ color: "#7A5530" }}>
                📚 단원 핵심 개념 요약
              </h2>
              <div className="rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap" style={{ backgroundColor: "#FAF3E8", color: "#444" }}>
                {result.conceptSummary}
              </div>
            </div>

            {/* 유사 문제 */}
            <div className="rounded-3xl shadow p-5" style={{ backgroundColor: "#FFFDF7", border: "2px solid #C4956A" }}>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "#7A5530" }}>
                ✏️ 유사 문제 ({result.problems.length}개)
              </h2>
              <div className="space-y-4">
                {result.problems.map((p, i) => (
                  <div key={i} className="rounded-2xl p-4" style={{ backgroundColor: "#FAF3E8", border: "1px solid #EDD9B5" }}>
                    <p className="font-bold text-sm mb-2" style={{ color: "#7A5530" }}>문제 {i + 1}</p>
                    <p className="text-sm mb-3 leading-relaxed" style={{ color: "#333" }}>{p.question}</p>
                    {p.choices && p.choices.length > 0 && (
                      <div className="space-y-1 mb-3">
                        {p.choices.map((ch, ci) => (
                          <p key={ci} className="text-sm pl-2" style={{ color: "#555" }}>{ch}</p>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => toggleAnswer(i)}
                      className="text-xs px-3 py-1 rounded-full font-bold transition-all hover:scale-105"
                      style={{ backgroundColor: shownAnswers[i] ? "#9B7040" : "#EDD9B5", color: shownAnswers[i] ? "#FFF" : "#7A5530" }}
                    >
                      {shownAnswers[i] ? "정답 숨기기 🙈" : "정답 보기 👀"}
                    </button>
                    {shownAnswers[i] && (
                      <div className="mt-3 rounded-xl p-3" style={{ backgroundColor: "#EDD9B5" }}>
                        <p className="text-xs font-bold mb-1" style={{ color: "#7A5530" }}>정답: {p.answer}</p>
                        <p className="text-xs leading-relaxed" style={{ color: "#555" }}>{p.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 빈칸 채우기 */}
            <div className="rounded-3xl shadow p-5" style={{ backgroundColor: "#FFFDF7", border: "2px solid #C4956A" }}>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "#7A5530" }}>
                🐾 빈칸 채우기 문제 (10개)
              </h2>
              <div className="space-y-3">
                {result.fillInTheBlanks.map((f, i) => (
                  <div key={i} className="rounded-2xl p-4" style={{ backgroundColor: "#FAF3E8", border: "1px solid #EDD9B5" }}>
                    <p className="text-sm font-bold mb-2" style={{ color: "#7A5530" }}>{i + 1}.</p>
                    <p className="text-sm mb-2 leading-relaxed" style={{ color: "#333" }}>{f.sentence}</p>
                    <button
                      onClick={() => toggleFillAnswer(i)}
                      className="text-xs px-3 py-1 rounded-full font-bold transition-all hover:scale-105"
                      style={{ backgroundColor: shownFillAnswers[i] ? "#9B7040" : "#EDD9B5", color: shownFillAnswers[i] ? "#FFF" : "#7A5530" }}
                    >
                      {shownFillAnswers[i] ? "정답 숨기기 🙈" : "정답 보기 👀"}
                    </button>
                    {shownFillAnswers[i] && (
                      <div className="mt-2 rounded-xl px-3 py-2" style={{ backgroundColor: "#EDD9B5" }}>
                        <p className="text-xs font-bold" style={{ color: "#7A5530" }}>정답: {f.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 푸터 */}
        <p className="text-center text-xs mt-8 pb-4" style={{ color: "#C4956A" }}>
          🐱 서연이의 오답노트 · AI가 만들어주는 맞춤 문제
        </p>
      </div>
    </main>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl p-3" style={{ backgroundColor: "#FAF3E8", border: "1px solid #EDD9B5" }}>
      <p className="text-xs font-bold mb-1" style={{ color: "#C4956A" }}>{label}</p>
      <p className="text-sm font-bold" style={{ color: "#444" }}>{value}</p>
    </div>
  );
}
