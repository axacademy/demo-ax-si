
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { GameState, TriggerCard, TriggerCardOption } from './types';
import { Card, CardContent, CardHeader, CardTitle } from './components/Card';
import { Button } from './components/Button';
import { Progress } from './components/Progress';
import { Trophy, RotateCcw, FileText, ChevronLeft, ChevronRight, Download, Brain, BarChart3, AiIcon, Users, Shield, Wrench } from './components/icons';
import { STAGES, STAGE_NAMES, COMPETENCIES, TRIGGER_CARDS } from './constants';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const getCardsForStage = (stage: number, scenario: GameState['scenario']) => {
  return scenario[stage] || [];
};

const INITIAL_GAME_STATE: GameState = {
  screen: 'intro',
  loadingMessage: null,
  scenario: {},
  currentStage: 0,
  currentCard: 0,
  competencies: { data: 0, strategy: 0, leadership: 0, ethics: 0, technical: 0 },
  totalScore: 0,
  showFeedback: false,
  lastDecision: null,
  finalAnalysis: null,
  decisionHistory: [],
};

const MAX_COMPETENCY_SCORE = 200;
const MAX_TOTAL_SCORE = 1000;

const LOADING_SUBTEXTS = [
  "전략적 결정 분석 중...",
  "역량 데이터 컴파일 중...",
  "인사이트 종합 중...",
  "미래 시나리오 시뮬레이션 중...",
  "맞춤형 조언 생성 중...",
];

const getGradeDetails = (score: number) => {
    const roundedScore = Math.round(score);
    if (roundedScore >= 900) return { grade: "S", description: "최고의 AI 리더", color: "text-yellow-400", reportColor: "text-yellow-500" };
    if (roundedScore >= 750) return { grade: "A", description: "탁월한 AI 전략가", color: "text-green-400", reportColor: "text-green-600" };
    if (roundedScore >= 600) return { grade: "B", description: "유능한 AI 관리자", color: "text-blue-400", reportColor: "text-blue-600" };
    if (roundedScore >= 450) return { grade: "C", description: "성장하는 AI 실무자", color: "text-purple-400", reportColor: "text-purple-600" };
    return { grade: "D", description: "AI 역량 강화 필요", color: "text-red-400", reportColor: "text-red-600" };
};

const SAMPLE_ANALYSIS_REPORT = `## 리더십 유형 분석
**데이터 기반 현실주의자 (Data-Driven Realist)**
당신은 감정이나 직관보다 데이터를 신뢰하며, 모든 결정의 근거를 명확한 지표에서 찾으려는 리더입니다. 현실적인 분석력과 안정적인 실행력이 돋보이지만, 때로는 과감한 혁신보다 현상 유지를 선호하는 경향이 있을 수 있습니다.

## 강점 (Strengths)
- **객관적인 데이터 기반 의사결정 능력:** 시뮬레이션 전반에 걸쳐 감정적인 판단이나 단기적인 유행을 따르기보다, 데이터의 양과 질을 확보하고 이를 바탕으로 결정을 내리는 일관된 패턴을 보였습니다. 예를 들어, **'데이터 품질 개선 방안' 단계에서 '전사적 데이터 정제 프로젝트'라는, 시간과 비용이 들더라도 가장 확실한 선택**을 한 것은 이러한 강점을 명확히 보여줍니다. 이는 AI 프로젝트의 장기적인 성공 기반을 마련하는 핵심적인 역량입니다.
- **안정적인 리스크 관리:** AI 도입에 따른 윤리적, 기술적 리스크를 회피하지 않고 정면으로 관리하려는 성향이 강합니다. 특히 **'AI 윤리 가이드라인 수립' 단계에서 '내부 윤리위원회 구성'을 선택**한 것은, 외부 표준을 따르는 손쉬운 길 대신 조직의 특수성을 고려한 깊이 있는 접근을 시도했다는 점에서 매우 긍정적입니다.

## 개선필요영역 (Areas for Improvement)
- **혁신을 위한 과감성 부족:** 안정성을 지나치게 추구한 나머지, 시장을 선도할 수 있는 혁신적인 기회를 놓치는 경향이 있습니다. 예를 들어, **'AI 투자 규모 결정' 단계에서 '점진적 접근법'을 선택**한 것은 안정적이긴 하나, 경쟁사에게 시장 선점의 기회를 내줄 수 있는 아쉬운 결정이었습니다. 계산된 리스크를 감수하는 대담함이 필요합니다.
- **기술 활용을 통한 가치 창출:** 데이터 인프라 구축과 같은 기반 다지기에는 강점을 보였으나, 확보된 기술과 데이터를 활용하여 새로운 비즈니스 모델이나 서비스를 창출하는 **'기술 이해·활용' 역량**이 상대적으로 부족했습니다. **'PoC 이후의 로드맵' 단계에서 '전사 확대' 대신 '추가 파일럿 진행'을 선택**한 것은, 기술의 잠재력을 비즈니스 전체로 확장하는 데 소극적임을 보여줍니다.

## 실행권장사항 (Action Recommendations)
- **'실패 예산' 도입 제안:** 다음 분기 기획 시, 전체 예산의 5%를 '실패해도 좋은 혁신 시도'를 위한 예산으로 별도 편성할 것을 제안해보세요. 이는 조직 전체에 실패를 용인하고 과감한 도전을 장려하는 문화를 만드는 첫걸음이 될 것입니다.
- **경쟁사가 아닌 '다른 산업'의 AI 도입 사례 분석:** 현재 속한 산업의 경쟁사만 벤치마킹하는 것에서 벗어나, 금융, 헬스케어 등 완전히 다른 산업에서 AI를 어떻게 활용하여 비즈니스를 파괴적으로 혁신했는지 스터디하고, 우리 비즈니스에 적용할 점을 역으로 도출해보세요.
- **사내 'AI 아이디어톤' 개최:** 전 직원을 대상으로 '우리 회사의 데이터와 기술로 어떤 새로운 서비스를 만들 수 있을까?'라는 주제의 아이디어톤을 개최하여, 기술팀 외부의 창의적인 아이디어를 발굴하고 기술의 사업화 가능성을 탐색하는 기회를 만드세요.
`;

const formatReportSection = (markdownText: string) => {
    if (!markdownText) return '';
    return markdownText
        .trim()
        .split('\n')
        .filter(line => line.trim().startsWith('- '))
        .map(line => `<p class="relative pl-6 my-3 text-slate-300 leading-relaxed before:content-['>'] before:absolute before:left-0 before:top-0 before:text-blue-400 before:font-bold">${line.trim().substring(2).replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-blue-400">$1</strong>')}</p>`)
        .join('');
};

const App = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const finalReportRef = useRef<HTMLDivElement>(null);
  const [isSampleReport, setIsSampleReport] = useState(false);

  const handleStartGame = () => {
    setGameState(prev => ({ 
        ...INITIAL_GAME_STATE, 
        screen: 'game', 
        scenario: TRIGGER_CARDS,
    }));
  };

  const handleRestart = () => {
    setGameState(INITIAL_GAME_STATE);
  };
  
  const handleShowSample = () => {
    setGameState(prev => ({
      ...INITIAL_GAME_STATE,
      screen: 'final_report',
      finalAnalysis: SAMPLE_ANALYSIS_REPORT,
      totalScore: 760,
      competencies: { data: 170, strategy: 130, leadership: 150, ethics: 180, technical: 140 }
    }));
    setIsSampleReport(true);
  };
  
  const handleBackToIntro = () => {
    setGameState(INITIAL_GAME_STATE);
    setIsSampleReport(false);
  };

  const handleDecision = async (option: TriggerCardOption) => {
    setGameState(prev => ({ ...prev, loadingMessage: 'AI 컨설턴트가 브리핑 노트를 작성 중입니다...' }));

    let impactDescription = '';
    try {
      const prompt = `당신은 AI 전략 컨설턴트입니다. 사용자가 AI 전환 비즈니스 시뮬레이션에서 '${option.text}'라는 선택을 했습니다. 이 결정이 가져올 '진행방식'과 '기대효과'를 전문가적이고 간결한 보고서 형식으로 작성해주세요. 응답은 반드시 다음 형식에 맞춰 한글로 작성되어야 합니다. 다른 설명은 추가하지 마세요.

## 진행방식
- [箇条書き形式で記述]
- [箇条書き形式で記述]

## 기대효과
- [箇条書き形式で記述]
- [箇条書き形式で記述]
`;
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      impactDescription = result.text;
    } catch (error) {
      console.error("Error generating feedback:", error);
      impactDescription = "AI 컨설턴트의 답변을 가져오는 데 실패했습니다. 기본값으로 진행합니다.\n\n## 진행방식\n- AI 시스템이 분석을 진행합니다.\n\n## 기대효과\n- 역량 점수가 업데이트됩니다.";
    }

    setGameState(prev => {
      const newCompetencies = { ...prev.competencies };
      Object.keys(option.effects).forEach(key => {
        const competencyKey = key as keyof typeof newCompetencies;
        const currentScore = newCompetencies[competencyKey];
        const change = option.effects[key] * 1.25; 
        newCompetencies[competencyKey] = Math.min(MAX_COMPETENCY_SCORE, currentScore + change);
      });
      
      const newTotalScore = Object.values(newCompetencies).reduce((sum, score) => sum + score, 0);

      const currentScenario = getCardsForStage(prev.currentStage, prev.scenario)[prev.currentCard];
      const newHistoryEntry = {
        stage: prev.currentStage,
        title: currentScenario.title,
        choice: option.text,
        allOptions: currentScenario.options.map(o => o.text),
        effects: option.effects,
      };

      return {
        ...prev,
        competencies: newCompetencies,
        totalScore: Math.min(MAX_TOTAL_SCORE, newTotalScore),
        showFeedback: true,
        loadingMessage: null,
        lastDecision: {
          optionText: option.text,
          effects: option.effects,
          impactDescription
        },
        decisionHistory: [...prev.decisionHistory, newHistoryEntry],
      };
    });
  };

  const handleNextFeedback = () => {
    const cardsForCurrentStage = getCardsForStage(gameState.currentStage, gameState.scenario);
    const nextCard = gameState.currentCard + 1;
    const isLastCardOfStage = nextCard >= cardsForCurrentStage.length;
    
    const nextStage = gameState.currentStage + 1;
    const isLastStage = nextStage >= STAGES.length;

    if (isLastCardOfStage && isLastStage) {
      handleFinalAnalysis();
    } else {
      setGameState(prev => {
        if (isLastCardOfStage) {
          return {
            ...prev,
            currentStage: nextStage,
            currentCard: 0,
            showFeedback: false,
            lastDecision: null,
          };
        } else {
          return {
            ...prev,
            currentCard: nextCard,
            showFeedback: false,
            lastDecision: null,
          };
        }
      });
    }
  };

  const handleFinalAnalysis = async () => {
    setGameState(prev => ({ ...prev, showFeedback: false, loadingMessage: 'AI트랜스포메이션 전략추진 역량 분석 결과를 생성 중입니다...' }));
    
    const competencyScores = Object.entries(gameState.competencies)
      .map(([key, value]) => `${COMPETENCIES[key].name}(${Math.round(value)}점)`)
      .join(', ');

    const decisionHistoryText = gameState.decisionHistory.map(h => {
      const effectsText = Object.entries(h.effects)
          .map(([key, value]) => `${COMPETENCIES[key].shortName}: ${value > 0 ? '+' : ''}${value * 1.25}`)
          .join(', ');
      const otherOptionsText = h.allOptions
        .filter(opt => opt !== h.choice)
        .map(opt => `  - (비선택) ${opt}`)
        .join('\n');
  
      return `* **${STAGES[h.stage]} 단계: "${h.title}"**
  - **(선택)** ${h.choice}
  - **(선택의 결과)** ${effectsText}
${otherOptionsText ? `  - **(고려된 다른 선택지)**\n${otherOptionsText}` : ''}`;
    }).join('\n\n');

    try {
        const prompt = `
        당신은 최고 수준의 AI 전략 경영 컨설턴트입니다.
        사용자가 'AI 트랜스포메이션 전략 경영 의사결정' 시뮬레이션을 완료했습니다.
        사용자의 **전체 의사결정 내역**과 최종 결과는 다음과 같습니다. 이 내역을 분석의 **가장 중요한 근거**로 사용해야 합니다.

        ### 사용자의 의사결정 내역 (선택지와 그 결과)
${decisionHistoryText}

        ### 최종 결과 요약
        - 총점: ${Math.round(gameState.totalScore)}/${MAX_TOTAL_SCORE}점
        - 역량별 점수: ${competencyScores}

        **위의 실제 의사결정 내역을 반드시 기반으로 하여**, 사용자의 리더십과 전략적 판단을 심층적으로 분석하는 전문적인 최종 분석 보고서를 작성해주세요.

        **분석 가이드라인:**
        1.  **과정 중심 분석:** 최종 점수뿐만 아니라, **어떤 선택을 통해 그 점수에 도달했는지** 과정에 집중하세요.
        2.  **Trade-off 분석:** 사용자가 선택한 옵션과 **선택하지 않은 다른 옵션들**을 비교하며, 어떤 기회비용이 발생했는지 분석하세요. 예를 들어, 단기 성과를 위해 장기적 투자를 포기한 선택 등을 짚어주세요.
        3.  **패턴 식별:** 개별 결정들을 나열하는 것을 넘어, 10단계 전반에 걸쳐 일관되게 나타나는 **의사결정 패턴이나 성향**을 도출하세요 (예: 기술 중심적, 리더십 우선, 안정 지향 등).
        4.  **구체적 근거 제시:** 모든 분석은 **"예를 들어, 3단계 'AI 투자 규모 결정'에서 과감한 투자를 선택한 것은..."** 와 같이 반드시 사용자의 실제 선택을 근거로 제시해야 합니다.

        보고서는 반드시 다음 형식과 순서를 정확히 지켜 한글로 작성해주세요. 다른 설명은 절대 추가하지 마세요:

        ## 리더십 유형 분석
        [점수와 의사결정 패턴을 종합하여 사용자의 리더십 유형에 대한 **창의적인 이름**과 **2-3문장의 설명**을 작성합니다. 예: "**데이터 기반 현실주의자 (Data-Driven Realist)**\n당신은 감정보다 데이터를 신뢰하며, 모든 결정의 근거를 명확한 지표에서 찾으려는 리더입니다..."]

        ## 강점 (Strengths)
        - [**의사결정 내역을 바탕으로**, 사용자의 가장 두드러진 강점 2-3가지를 글머리 기호('- ')로 시작하여 **매우 상세하게** 분석합니다. **"예를 들어, '${STAGES[2]}' 단계에서 '내부 인재 양성'을 선택한 것은 장기적인 안목과 직원 중심의 리더십을 보여주는 훌륭한 결정이었습니다."** 와 같이 구체적인 선택을 직접 언급하며 설명해야 합니다.]
        - [두 번째 강점 분석]

        ## 개선필요영역 (Areas for Improvement)
        - [**의사결정 내역을 바탕으로**, 성장을 위해 보완이 필요한 역량이나 의사결정 패턴 2-3가지를 글머리 기호('- ')로 시작하여 **매우 상세하게** 지적합니다. **"반면, '${STAGES[0]}' 단계에서 '경쟁사 벤치마킹'에 집중한 것은 단기적인 대응에 그쳐 장기적인 전략 수립 기회를 놓친 아쉬운 선택입니다."** 와 같이 아쉬웠던 선택을 직접 언급하며 설명해야 합니다.]
        - [두 번째 개선 필요 영역 분석]

        ## 실행권장사항 (Action Recommendations)
        - [분석된 강점과 개선점을 바탕으로, 사용자가 당장 실행할 수 있는 **구체적이고 실질적인 권장사항 3가지**를 글머리 기호('- ')로 시작하여 제안합니다. 명확한 행동 계획을 제시해주세요.]
        - [두 번째 권장 사항]
        - [세 번째 권장 사항]

        분석 내용에는 **강조**하고 싶은 핵심 키워드를 Markdown의 bold 형식(\`**텍스트**\`)으로 반드시 포함시켜 주세요.
      `;
      
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      
      setGameState(prev => ({
        ...prev,
        screen: 'final_report',
        loadingMessage: null,
        finalAnalysis: result.text,
      }));

    } catch (error) {
      console.error("Error generating final analysis:", error);
      setGameState(prev => ({
        ...prev,
        screen: 'final_report',
        loadingMessage: null,
        finalAnalysis: "AI트랜스포메이션 전략추진 역량 분석 결과를 생성하는 데 실패했습니다. 네트워크 연결을 확인하고 다시 시도해주세요.",
      }));
    }
  };

  const handleDownloadPdf = () => {
    const reportElement = finalReportRef.current;
    if (!reportElement) return;

    const buttons = reportElement.parentElement?.querySelector('.mt-8.flex.justify-center.gap-4') as HTMLElement;
    if (buttons) buttons.style.display = 'none';

    html2canvas(reportElement, {
        backgroundColor: '#020617',
        scale: 2,
        useCORS: true,
        windowWidth: reportElement.scrollWidth,
        windowHeight: reportElement.scrollHeight,
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / imgHeight;
        const pdfImgHeight = pdfWidth / ratio;
        let heightLeft = pdfImgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfImgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
            position -= pdfHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfImgHeight);
            heightLeft -= pdfHeight;
        }
        pdf.save("AI_Transformation_Strategy_Report.pdf");
    }).catch(error => {
        console.error("PDF generation failed:", error);
        alert("PDF를 생성하는 데 실패했습니다. 다시 시도해 주세요.");
    }).finally(() => {
        if (buttons) buttons.style.display = 'flex';
    });
};


  const renderScreen = () => {
    if (gameState.loadingMessage) {
        return <LoadingScreen text={gameState.loadingMessage} />;
    }
    
    switch (gameState.screen) {
        case 'intro':
            return <IntroScreen onShowSample={handleShowSample} />;
        case 'final_report':
             return <FinalResultScreen 
                gameState={gameState} 
                onRestart={handleRestart} 
                onBackToIntro={handleBackToIntro}
                isSample={isSampleReport}
                onDownload={handleDownloadPdf} 
                reportRef={finalReportRef} 
            />;
        case 'game':
        default:
             const cardsForStage = getCardsForStage(gameState.currentStage, gameState.scenario);
             if (cardsForStage.length === 0) {
                 return <LoadingScreen text={`시뮬레이션을 준비 중입니다...`} />;
             }
             return (
              <div className="max-w-7xl mx-auto">
                 <AppHeader stageTitle={`${STAGE_NAMES[gameState.currentStage]}`} />
                 <ScenarioProgressBar currentStage={gameState.currentStage} currentCardInStage={gameState.currentCard} totalCardsInStage={cardsForStage.length} />
                {gameState.showFeedback ? (
                  <FeedbackScreen gameState={gameState} onNext={handleNextFeedback} />
                ) : (
                  <GameScreen gameState={gameState} onDecision={handleDecision} />
                )}
              </div>
            );
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderScreen()}
      </div>
    </div>
  );
}

const IntroScreen = ({ onShowSample }: { onShowSample: () => void; }) => (
    <div className="animate-fade-in text-slate-300">
        <main className="text-center py-16 md:py-24">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-blue-400 to-slate-100 opacity-0" style={{ animation: 'fade-in 0.5s 0.1s ease-out forwards' }}>
                AI트랜스포메이션전략 경영의사결정
            </h1>
            <p className="mt-4 text-xl md:text-2xl font-light text-blue-300 opacity-0" style={{ textShadow: '0 0 15px rgba(59, 130, 246, 0.4)', animation: 'fade-in 0.5s 0.2s ease-out forwards' }}>
                AI트랜스포메이션 시대!
                <br />
                전략추진 단계별로 어떠한 경영의사결정을 해야 할까요?
            </p>
            <p className="mt-8 max-w-3xl mx-auto text-lg text-slate-400 leading-relaxed opacity-0" style={{ animation: 'fade-in 0.5s 0.3s ease-out forwards' }}>
                AI 트랜스포메이션 시대를 주도할 경영진을 위해 설계되었습니다.
                <br/>
                10단계의 AI트랜스포메이션 전력추진 여정을 통해 현실적인 비즈니스 시나리오를 경험하고,
                <br/>
                AI트랜스포메이션전략을 추진하기 위해 필요한 핵심역량을 직접확인하며,
                <br/>
                최고의 AI 리더로 성장하십시오.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center opacity-0" style={{ animation: 'fade-in 0.5s 0.4s ease-out forwards' }}>
                <a 
                  href="https://digitaltransformation.co.kr/ax-contact/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black transform hover:-translate-y-px active:translate-y-0 bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:bg-blue-500 hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] focus-visible:ring-blue-400 h-11 px-6 text-base animate-pulse-glow !text-base"
                >
                    AX전략 경영의사결정 시뮬레이션 문의하기
                </a>
                <Button onClick={onShowSample} variant="outline" size="lg">샘플 보고서 보기</Button>
            </div>
        </main>

        <section className="py-16">
            <div className="text-center mb-12 opacity-0" style={{ animation: 'fade-in 0.5s 0.5s ease-out forwards' }}>
                <h2 className="text-3xl font-bold tracking-tight text-slate-100">게임 방식</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8 text-left">
                <Card className="opacity-0" style={{ animation: 'fade-in 0.5s 0.6s ease-out forwards' }}>
                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-900/50 p-3 rounded-lg border border-blue-500/30"><Brain className="w-8 h-8 text-blue-400" /></div>
                            <h3 className="text-xl font-semibold text-slate-100">1. 시나리오 기반 진행</h3>
                        </div>
                        <p className="text-slate-400">단계별 시나리오에 맞춰 제시되는 3가지 선택지 중 하나를 선택하여 의사결정을 합니다. 모든 선택은 기업의 미래를 좌우하는 중요한 결정으로 작용합니다.</p>
                    </CardContent>
                </Card>
                <Card className="opacity-0" style={{ animation: 'fade-in 0.5s 0.7s ease-out forwards' }}>
                     <CardContent className="space-y-3">
                        <div className="flex items-center gap-4">
                            <div className="bg-green-900/50 p-3 rounded-lg border border-green-500/30"><BarChart3 className="w-8 h-8 text-green-400" /></div>
                            <h3 className="text-xl font-semibold text-slate-100">2. AX 역량 획득</h3>
                        </div>
                        <p className="text-slate-400">당신의 결정은 '데이터 기반 의사결정', 'AI 전략' 등 5가지 핵심 AX 역량 지표에 실시간으로 반영되어 축적됩니다.</p>
                    </CardContent>
                </Card>
                <Card className="opacity-0" style={{ animation: 'fade-in 0.5s 0.8s ease-out forwards' }}>
                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-4">
                            <div className="bg-purple-900/50 p-3 rounded-lg border border-purple-500/30"><FileText className="w-8 h-8 text-purple-400" /></div>
                            <h3 className="text-xl font-semibold text-slate-100">3. 브리핑 & 평가</h3>
                        </div>
                        <p className="text-slate-400">결정 직후 AI 컨설턴트의 '브리핑 노트'를 통해 기대효과와 리스크를 확인하고, 최종 단계에서 종합 역량 분석 리포트를 받습니다.</p>
                    </CardContent>
                </Card>
            </div>
        </section>

        <section className="py-16">
            <div className="text-center mb-12 opacity-0" style={{ animation: 'fade-in 0.5s 0.9s ease-out forwards' }}>
                <h2 className="text-3xl font-bold tracking-tight text-slate-100">10단계 AI트랜스포메이션 전략 추진 여정</h2>
                <p className="mt-2 text-lg text-slate-400">현황 분석부터 경영 체계화까지, AI 트랜스포메이션의 전 과정을 경험합니다.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center opacity-0" style={{ animation: 'fade-in 0.5s 1.0s ease-out forwards' }}>
                {STAGES.map((stage, index) => (
                    <div key={stage} className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg transition-all duration-300 hover:bg-slate-800/80 hover:border-blue-500/50">
                        <div className="font-mono text-blue-400 text-sm">STAGE {index + 1}</div>
                        <div className="font-semibold mt-1 text-slate-200">{stage}</div>
                    </div>
                ))}
            </div>
        </section>

        <section className="py-16 text-center opacity-0" style={{ animation: 'fade-in 0.5s 1.1s ease-out forwards' }}>
            <Card className="max-w-3xl mx-auto">
                <CardContent className="!p-12">
                    <div className="space-y-5">
                        <h2 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400">
                            AI 트랜스포메이션 시대!
                            <br />
                            경영자의 전략의사결정이 기업의 미래를 바꿉니다.
                        </h2>
                        <div className="pt-4">
                           <a 
                              href="https://digitaltransformation.co.kr/ax-contact/" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black transform hover:-translate-y-px active:translate-y-0 bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:bg-blue-500 hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] focus-visible:ring-blue-400 h-11 px-6 text-base animate-pulse-glow !text-base"
                            >
                                AX전략 경영의사결정 시뮬레이션 문의하기
                            </a>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </section>
    </div>
);


const AppHeader = ({ stageTitle }: { stageTitle: string }) => (
    <header className="text-center my-8 animate-fade-in">
        <div className="flex items-center justify-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100">🎮 AI트랜스포메이션 전략 경영의사결정 (AX Strategy Decision Making)</h1>
        </div>
        <p className="text-lg text-slate-400 mt-2">{stageTitle}</p>
    </header>
);

const ScenarioProgressBar = ({ currentStage, currentCardInStage, totalCardsInStage }: { currentStage: number, currentCardInStage: number, totalCardsInStage: number }) => (
    <Card className="mb-8 animate-fade-in">
        <CardContent>
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-slate-200 text-lg">시나리오 진행 상황</h4>
                <span className="text-base text-slate-400">{`라운드 ${currentStage + 1} | ${currentCardInStage}/${totalCardsInStage} 완료`}</span>
            </div>
            <div className="flex items-center justify-between space-x-1 md:space-x-2 relative">
                {STAGES.map((stage, index) => {
                    const isCompleted = index < currentStage;
                    const isCurrent = index === currentStage;
                    return (
                        <div key={index} className="flex flex-col items-center flex-1 z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCurrent ? 'bg-blue-500 border-blue-400 scale-110 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : isCompleted ? 'bg-slate-600 border-slate-500' : 'bg-slate-800 border-slate-700'}`}>
                                <span className={`font-bold ${isCurrent ? 'text-white' : 'text-slate-300'}`}>{index + 1}</span>
                            </div>
                            <p className={`text-sm text-center mt-2 transition-colors duration-300 ${isCurrent ? 'text-blue-400 font-semibold' : 'text-slate-400'}`}>{stage}</p>
                        </div>
                    );
                })}
                 <div className="absolute top-4 left-0 w-full h-1 -z-10">
                    <div className="w-full h-full bg-slate-800 rounded-full"></div>
                    <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-700 to-blue-500 rounded-full transition-all duration-500" style={{ width: `${(currentStage / (STAGES.length - 1)) * 100}%`}}></div>
                </div>
            </div>
        </CardContent>
    </Card>
);

const GameScreen = ({ gameState, onDecision }: { gameState: GameState; onDecision: (option: TriggerCardOption) => void; }) => {
  const { currentStage, currentCard, scenario } = gameState;
  const currentScenario = getCardsForStage(currentStage, scenario)[currentCard];

  if (!currentScenario) {
    return <div className="text-center text-red-500">현재 단계에 대한 시나리오를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
         <CompetencyDashboard competencies={gameState.competencies} totalScore={gameState.totalScore} />
      </div>
      <div className="lg:col-span-2">
        <DecisionCard scenario={currentScenario} onDecision={onDecision} />
      </div>
    </div>
  );
};

const CompetencyDashboard = ({ competencies, totalScore }: { competencies: Record<string, number>; totalScore: number; }) => {
  const gradeDetails = getGradeDetails(totalScore);
  return (
    <Card className="animate-slide-in h-full">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
            <BarChart3 className="w-6 h-6 mr-3 text-slate-400" />
            역량 대시보드
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(COMPETENCIES).map(([key, comp]) => (
          <div key={key}>
            <div className="flex justify-between items-center mb-1.5">
               <div className="flex items-center">
                  <comp.icon className={`w-5 h-5 mr-3 ${comp.color}`} />
                  <span className="font-medium text-slate-300 text-base">{comp.name}</span>
               </div>
              <span className="text-base font-mono text-slate-200">{Math.round(competencies[key])}<span className="text-sm text-slate-500">/{MAX_COMPETENCY_SCORE}</span></span>
            </div>
            <Progress 
                value={(competencies[key] / MAX_COMPETENCY_SCORE) * 100} 
                colorClass={`${comp.bgColor} shadow-lg`} 
                indicatorClassName={`shadow-sm ${comp.bgColor.replace('bg-', 'shadow-')}/50`} 
                className="h-2.5"
            />
          </div>
        ))}
        <div className="pt-4 mt-4 border-t border-slate-800">
            <div className="flex justify-between items-baseline">
                <span className="text-lg font-semibold text-slate-400">총점</span>
                <span className="text-2xl font-bold text-slate-100">{Math.round(totalScore)}<span className="text-base text-slate-400">/{MAX_TOTAL_SCORE}</span></span>
            </div>
            <div className="flex justify-between items-baseline mt-2">
                <span className="text-lg font-semibold text-slate-400">현재 등급</span>
                <span className={`text-2xl font-bold ${gradeDetails.color}`}>{gradeDetails.grade}</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

const DecisionCard = ({ scenario, onDecision }: { scenario: TriggerCard; onDecision: (option: TriggerCardOption) => void; }) => (
  <Card className="animate-fade-in h-full">
    <CardHeader>
      <CardTitle className="text-2xl">{scenario.title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-lg text-slate-400 leading-relaxed mb-8">{scenario.description}</p>
      <div className="space-y-3">
        {scenario.options.map((option: TriggerCardOption, index: number) => (
          <Button
            key={index}
            variant="outline"
            onClick={() => onDecision(option)}
            className="w-full justify-between h-auto py-4 px-5 text-left !text-base hover:border-blue-500"
          >
            <span className="text-slate-300 leading-snug">{option.text}</span>
            <ChevronRight className="w-5 h-5 flex-shrink-0 text-slate-500" />
          </Button>
        ))}
      </div>
    </CardContent>
  </Card>
);

const FeedbackScreen = ({ gameState, onNext }: { gameState: GameState; onNext: () => void; }) => {
  const { lastDecision } = gameState;

  if (!lastDecision) {
    return <div>오류: 이전 결정 정보를 찾을 수 없습니다.</div>;
  }
  
  return (
     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      <div className="lg:col-span-1">
         <CompetencyDashboard competencies={gameState.competencies} totalScore={gameState.totalScore} />
      </div>
      <div className="lg:col-span-2">
         <FeedbackCard lastDecision={lastDecision} onNext={onNext} />
      </div>
    </div>
  );
};

const FeedbackCard = ({ lastDecision, onNext }: { lastDecision: GameState['lastDecision'], onNext: () => void; }) => {
  const [method, setMethod] = useState('');
  const [effect, setEffect] = useState('');

  useEffect(() => {
    if (lastDecision?.impactDescription) {
      const methodMatch = lastDecision.impactDescription.match(/## 진행방식\n([\s\S]*?)(?:\n## 기대효과|$)/);
      const effectMatch = lastDecision.impactDescription.match(/## 기대효과\n([\s\S]*)/);

      const formatContent = (content: string | null) => {
        if (!content) return '';
        return content
          .trim()
          .split('\n')
          .map(line => line.trim().replace(/^- /, '').trim())
          .filter(line => line)
          .map(line => `<li>${line}</li>`)
          .join('');
      };

      setMethod(formatContent(methodMatch ? methodMatch[1] : null));
      setEffect(formatContent(effectMatch ? effectMatch[1] : null));
    }
  }, [lastDecision]);

  return (
    <Card className="animate-fade-in border-green-500/50 shadow-green-500/10">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-3">
          <AiIcon className="w-7 h-7 text-green-400" />
          AI 컨설턴트 브리핑 노트
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
          <p className="text-sm text-slate-400 mb-1">당신의 선택:</p>
          <p className="text-base text-slate-200">{lastDecision?.optionText}</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg text-green-400 mb-2">진행방식</h4>
            <ul className="list-disc list-inside space-y-2 text-slate-300" dangerouslySetInnerHTML={{ __html: method }} />
          </div>
          <div>
            <h4 className="font-semibold text-lg text-green-400 mb-2">기대효과</h4>
            <ul className="list-disc list-inside space-y-2 text-slate-300" dangerouslySetInnerHTML={{ __html: effect }} />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end">
          <Button onClick={onNext} variant="green" size="lg">
            다음 단계로 <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const FinalResultScreen = ({ gameState, onRestart, onBackToIntro, isSample, onDownload, reportRef }: {
  gameState: GameState;
  onRestart: () => void;
  onBackToIntro: () => void;
  isSample: boolean;
  onDownload: () => void;
  reportRef: React.RefObject<HTMLDivElement>;
}) => {
  const { totalScore, competencies, finalAnalysis } = gameState;
  
  const analysisParts = useMemo(() => {
    if (!finalAnalysis) return { archetypeTitle: '', archetypeDesc: '', strengths: '', improvements: '', recommendations: '' };

    // More robust regex to handle variations in whitespace from the AI model
    const archetypeMatch = finalAnalysis.match(/##\s*리더십 유형 분석\s*\*\*([^*]+)\*\*\s*([\s\S]*?)(?=\n##\s*|$)/);
    const strengthsMatch = finalAnalysis.match(/##\s*강점 \(Strengths\)\s*([\s\S]*?)(?=\n##\s*|$)/);
    const improvementsMatch = finalAnalysis.match(/##\s*개선필요영역 \(Areas for Improvement\)\s*([\s\S]*?)(?=\n##\s*|$)/);
    const recommendationsMatch = finalAnalysis.match(/##\s*실행권장사항 \(Action Recommendations\)\s*([\s\S]*?)(?=\n##\s*|$)/);

    return {
        archetypeTitle: archetypeMatch ? archetypeMatch[1].trim() : '리더십 유형 분석 중',
        archetypeDesc: archetypeMatch ? archetypeMatch[2].trim() : 'AI 컨설턴트가 당신의 리더십 유형을 분석하고 있습니다.',
        strengths: strengthsMatch ? formatReportSection(strengthsMatch[1]) : '',
        improvements: improvementsMatch ? formatReportSection(improvementsMatch[1]) : '',
        recommendations: recommendationsMatch ? formatReportSection(recommendationsMatch[1]) : '',
    };
  }, [finalAnalysis]);

  const competencyDataForCharts = Object.entries(COMPETENCIES).map(([key, comp]) => ({
    subject: comp.shortName,
    name: comp.name,
    score: Math.round(competencies[key]),
    fullMark: MAX_COMPETENCY_SCORE,
  }));
  
  const sortedCompetencyData = [...competencyDataForCharts].sort((a, b) => a.score - b.score);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div ref={reportRef} className="p-4 sm:p-6 md:p-8 bg-slate-950">
          <div className="flex items-center gap-4 mb-8">
              <Trophy className="w-10 h-10 text-yellow-400" />
              <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-100">AI트랜스포메이션 전략추진 역량 분석 결과</h1>
                  <p className="text-lg text-slate-400 mt-1">{isSample ? "샘플 보고서" : "당신의 AI 트랜스포메이션 리더십 분석 결과입니다."}</p>
              </div>
          </div>
          
          <Card>
              <CardHeader><CardTitle>종합역량 분석</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                  <div className="text-center md:text-left">
                      <p className="text-8xl font-bold text-blue-400">{Math.round(totalScore)}<span className="text-3xl text-slate-500">/{MAX_TOTAL_SCORE}</span></p>
                  </div>
                  <div className="md:col-span-2">
                      <h4 className="text-2xl font-semibold text-slate-100">{analysisParts.archetypeTitle}</h4>
                      <p className="text-slate-400 mt-2 leading-relaxed">{analysisParts.archetypeDesc}</p>
                  </div>
              </CardContent>
          </Card>

          <Card className="mt-8">
              <CardHeader><CardTitle>AI트랜스포메이션 전략추진역량 분석</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {competencyDataForCharts.map(comp => (
                      <div key={comp.name} className="text-center p-4 bg-slate-900/80 rounded-lg border border-slate-800">
                          <p className="text-sm text-slate-400 font-medium">{comp.name}</p>
                          <p className="text-4xl font-bold text-slate-100 mt-2">{comp.score}</p>
                      </div>
                  ))}
              </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-8 mt-8">
              <Card>
                  <CardHeader><CardTitle>종합 역량 밸런스</CardTitle></CardHeader>
                  <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={competencyDataForCharts}>
                              <PolarGrid stroke="#334155" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 14 }} />
                              <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', border: '1px solid #334155', borderRadius: '0.5rem' }} labelStyle={{ color: '#f1f5f9', fontWeight: 'bold' }} />
                              <Radar name="점수" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                          </RadarChart>
                      </ResponsiveContainer>
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader><CardTitle>개선 중점 역량</CardTitle></CardHeader>
                  <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={sortedCompetencyData} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                              <XAxis type="number" domain={[0, MAX_COMPETENCY_SCORE]} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                              <YAxis type="category" dataKey="subject" width={50} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                              <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', border: '1px solid #334155', borderRadius: '0.5rem' }} />
                              <Legend wrapperStyle={{fontSize: "14px"}}/>
                              <Bar dataKey="score" name="역량 점수" fill="#3b82f6" background={{ fill: '#1e293b' }} />
                          </BarChart>
                      </ResponsiveContainer>
                  </CardContent>
              </Card>
          </div>
          
          <div className="mt-12">
              <h2 className="text-3xl font-bold text-center text-slate-100 mb-8">AI 컨설턴트의 상세 분석</h2>
              <Card>
                  <CardHeader><CardTitle>개인의 강점</CardTitle></CardHeader>
                  <CardContent dangerouslySetInnerHTML={{ __html: analysisParts.strengths }} />
              </Card>
              <Card className="mt-6">
                  <CardHeader><CardTitle>개선 필요 영역</CardTitle></CardHeader>
                  <CardContent dangerouslySetInnerHTML={{ __html: analysisParts.improvements }} />
              </Card>
              <Card className="mt-6">
                  <CardHeader><CardTitle>실행 권장 사항</CardTitle></CardHeader>
                  <CardContent dangerouslySetInnerHTML={{ __html: analysisParts.recommendations }} />
              </Card>
          </div>
      </div>
      <div className="mt-8 flex justify-center gap-4">
          <Button onClick={isSample ? onBackToIntro : onRestart} variant="outline" size="lg">
              {isSample ? <ChevronLeft className="w-5 h-5 mr-2" /> : <RotateCcw className="w-5 h-5 mr-2" />}
              {isSample ? '처음으로 돌아가기' : '처음으로'}
          </Button>
          <Button onClick={onDownload} size="lg">
              <Download className="w-5 h-5 mr-2" />
              PDF 저장하기
          </Button>
      </div>
    </div>
  );
};

const LoadingScreen = ({ text }: { text: string }) => {
    const [subtext, setSubtext] = useState(LOADING_SUBTEXTS[0]);

    useEffect(() => {
        const interval = setInterval(() => {
            setSubtext(prev => {
                const currentIndex = LOADING_SUBTEXTS.indexOf(prev);
                const nextIndex = (currentIndex + 1) % LOADING_SUBTEXTS.length;
                return LOADING_SUBTEXTS[nextIndex];
            });
        }, 2000); // Change text every 2 seconds

        return () => clearInterval(interval);
    }, []);
    
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/80 z-50 backdrop-blur-sm transition-opacity duration-300">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <AiIcon className="w-12 h-12 text-blue-400 animate-pulse" />
            </div>
            <p className="mt-6 text-xl text-slate-300 font-medium tracking-wide">{text}</p>
            <p className="mt-2 text-base text-slate-400 transition-opacity duration-500 h-6">{subtext}</p>
        </div>
    );
};

export default App;
