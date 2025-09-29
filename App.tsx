
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { GameState, TriggerCard, TriggerCardOption } from './types';
import { Card, CardContent, CardHeader, CardTitle } from './components/Card';
import { Button } from './components/Button';
import { Progress } from './components/Progress';
import { Trophy, RotateCcw, FileText, ChevronLeft, ChevronRight, Download, Brain, BarChart3, AiIcon, Users, Shield, Wrench } from './components/icons';
import { STAGES, STAGE_NAMES, COMPETENCIES, TRIGGER_CARDS } from './constants';

const MAX_COMPETENCY_SCORE = 200;
const MAX_TOTAL_SCORE = 1000;

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

type Screen = 'intro' | 'simulation_sample' | 'report_sample';

const App = () => {
  const [screen, setScreen] = useState<Screen>('intro');
  const finalReportRef = useRef<HTMLDivElement>(null);

  const showIntro = () => setScreen('intro');
  const showSimulationSample = () => setScreen('simulation_sample');
  const showReportSample = () => setScreen('report_sample');

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
    switch (screen) {
        case 'simulation_sample':
            return <SimulationSampleScreen onBack={showIntro} onShowReportSample={showReportSample} />;
        case 'report_sample':
             return <FinalResultScreen 
                onBackToIntro={showIntro}
                onShowSimulationSample={showSimulationSample}
                onDownload={handleDownloadPdf} 
                reportRef={finalReportRef} 
            />;
        case 'intro':
        default:
             return <IntroScreen 
                onShowSimulationSample={showSimulationSample} 
                onShowReportSample={showReportSample} 
            />;
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

const IntroScreen = ({ onShowSimulationSample, onShowReportSample }: { onShowSimulationSample: () => void; onShowReportSample: () => void; }) => (
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
                 <Button onClick={onShowSimulationSample} variant="default" size="lg" className="animate-pulse-glow">시뮬레이션 체험하기</Button>
                 <Button onClick={onShowReportSample} variant="outline" size="lg">샘플 보고서 보기</Button>
            </div>
             <div className="mt-8 text-center">
                <a 
                  href="https://digitaltransformation.co.kr/ax-contact/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                    AX전략 경영의사결정 시뮬레이션 문의하기 &rarr;
                </a>
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
    </div>
);

const SimulationSampleScreen = ({ onBack, onShowReportSample }: { onBack: () => void; onShowReportSample: () => void; }) => {
    const initialCompetencies = { data: 30, strategy: 35, leadership: 40, ethics: 25, technical: 40 };
    // FIX: Add explicit type to useState to ensure TypeScript correctly infers `competencies` as Record<string, number>.
    // This allows Object.values(competencies) to return a number[], fixing the reduce operation error.
    const [competencies, setCompetencies] = useState<Record<string, number>>(initialCompetencies);
    const [lastDecision, setLastDecision] = useState<GameState['lastDecision'] | null>(null);
    const [decisionMade, setDecisionMade] = useState(false);

    const totalScore = useMemo(() => Object.values(competencies).reduce((a, b) => a + b, 0), [competencies]);

    const impactDescriptions = {
        "A": `## 진행방식
- 전사 데이터 거버넌스팀을 구성하여 데이터 표준화 및 정제 프로세스를 수립합니다.
- 모든 부서의 데이터를 통합 데이터 레이크에 수집하고 일괄 정제 작업을 수행합니다.
- 데이터 품질 측정 KPI를 설정하고 지속적으로 모니터링합니다.

## 기대효과
- 전사적으로 일관되고 신뢰할 수 있는 데이터 기반을 마련하여 향후 모든 AI 프로젝트의 성공률을 높입니다.
- 데이터 사일로 현상을 해결하고 데이터 활용도를 극대화할 수 있습니다.
- 장기적으로 데이터 관리 비용을 절감하고 데이터 관련 리스크를 줄일 수 있습니다.`,
        "B": `## 진행방식
- 핵심 비즈니스에 직접적 영향을 주는 고객 데이터와 판매 데이터를 우선순위로 선정합니다.
- 데이터 정제 및 가공을 위한 자동화 스크립트를 개발하여 1차 정제를 수행합니다.
- 데이터 전문가와 현업 담당자가 협업하여 정제된 데이터의 품질을 검증합니다.

## 기대효과
- 제한된 리소스를 효율적으로 사용하여 단기간에 가시적인 데이터 품질 개선 효과를 얻을 수 있습니다.
- 빠르게 개선된 데이터를 파일럿 프로젝트에 활용하여 AI 도입의 성공 가능성을 높일 수 있습니다.
- 성공 사례를 통해 데이터 품질 개선의 중요성에 대한 전사적 공감대를 형성하기 용이합니다.`,
        "C": `## 진행방식
- 외부 데이터 전문 기업과 파트너십을 맺어 필요한 데이터를 구매하거나 API 형태로 제공받습니다.
- 내부 데이터와 외부 데이터를 결합하여 데이터의 양과 다양성을 확보합니다.
- 외부 데이터 활용에 대한 법적, 윤리적 문제를 검토하고 계약을 체결합니다.

## 기대효과
- 내부 데이터만으로는 얻을 수 없는 새로운 인사이트를 발굴할 수 있습니다.
- 데이터 준비에 드는 시간을 단축하고 즉시 AI 모델 개발에 착수할 수 있습니다.
- 시장 트렌드나 경쟁사 동향 등 외부 환경 변화에 더 빠르게 대응할 수 있습니다.`
    };
    
    const handleDecision = (option: TriggerCardOption) => {
        if (decisionMade) return;

        const updatedCompetencies = { ...competencies };
        for (const key in option.effects) {
            if (Object.prototype.hasOwnProperty.call(updatedCompetencies, key)) {
                updatedCompetencies[key as keyof typeof updatedCompetencies] = Math.min(
                    MAX_COMPETENCY_SCORE,
                    Math.round(updatedCompetencies[key as keyof typeof updatedCompetencies] + option.effects[key] * 10)
                );
            }
        }
        setCompetencies(updatedCompetencies);
        
        const optionKey = option.text.charAt(0);
        setLastDecision({
            optionText: option.text,
            effects: option.effects,
            impactDescription: impactDescriptions[optionKey as keyof typeof impactDescriptions]
        });

        setDecisionMade(true);
    };

    return (
        <div className="animate-fade-in">
            <AppHeader stageTitle={`${STAGE_NAMES[0]}`} />
            <ScenarioProgressBar currentStage={0} currentCardInStage={4} totalCardsInStage={TRIGGER_CARDS[0].length} />

            <div className={`grid grid-cols-1 ${decisionMade ? 'lg:grid-cols-3' : 'justify-items-center'} gap-8 mt-8`}>
                {decisionMade && (
                    <div className="lg:col-span-1 w-full">
                        <CompetencyDashboard competencies={competencies} totalScore={totalScore} />
                    </div>
                )}
                <div className={decisionMade ? 'lg:col-span-2 w-full' : 'max-w-4xl w-full'}>
                    <DecisionCard
                        scenario={TRIGGER_CARDS[0][3]}
                        onDecision={handleDecision}
                        disabled={decisionMade}
                        briefingNote={
                            decisionMade ? <BriefingNoteContent lastDecision={lastDecision} /> : (
                                <div className="text-center pt-8">
                                    <p className="text-slate-400 text-lg">👆 위 선택지 중 하나를 결정하면, AI 컨설턴트가 결정에 대한 브리핑 노트와 역량 변화를 보여줍니다. 👆</p>
                                </div>
                            )
                        }
                    />
                </div>
            </div>
            <div className="mt-8 flex justify-center gap-4">
                <Button onClick={onBack} variant="outline" size="lg">
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    처음으로 돌아가기
                </Button>
                <Button onClick={onShowReportSample} variant="outline" size="lg">
                    샘플 보고서 보기
                    <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
            </div>
        </div>
    );
};


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
              <span className="text-base font-mono text-slate-200">{Math.round(competencies[key as keyof typeof competencies])}<span className="text-sm text-slate-500">/{MAX_COMPETENCY_SCORE}</span></span>
            </div>
            <Progress 
                value={(competencies[key as keyof typeof competencies] / MAX_COMPETENCY_SCORE) * 100} 
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

const DecisionCard = ({ scenario, onDecision, disabled = false, briefingNote }: { scenario: TriggerCard; onDecision: (option: TriggerCardOption) => void; disabled?: boolean; briefingNote?: React.ReactNode }) => (
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
            className={`w-full justify-between h-auto py-4 px-5 text-left !text-base transition-all duration-200 ${disabled ? 'cursor-not-allowed opacity-60 bg-slate-800/60' : 'hover:border-blue-500 hover:bg-slate-800/80'}`}
            disabled={disabled}
          >
            <span className="text-slate-300 leading-snug">{option.text}</span>
            {!disabled && <ChevronRight className="w-5 h-5 flex-shrink-0 text-slate-500" />}
          </Button>
        ))}
      </div>
      {briefingNote}
    </CardContent>
  </Card>
);

const BriefingNoteContent = ({ lastDecision }: { lastDecision: GameState['lastDecision'] }) => {
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
    <div className="mt-8 pt-8 border-t border-slate-800 animate-fade-in">
        <CardTitle className="text-2xl flex items-center gap-3 mb-6">
          <AiIcon className="w-7 h-7 text-green-400" />
          AI 컨설턴트 브리핑 노트
        </CardTitle>
        <div className="mb-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
          <p className="text-sm text-slate-400 mb-1">선택한 결정:</p>
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
    </div>
  );
};

const FeedbackCard = ({ lastDecision, onNext, showNextButton = true }: { lastDecision: GameState['lastDecision'], onNext: () => void; showNextButton?: boolean }) => {
  return (
    <Card className="animate-fade-in border-green-500/50 shadow-green-500/10">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-3">
          <AiIcon className="w-7 h-7 text-green-400" />
          AI 컨설턴트 브리핑 노트
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Note: This component is currently not used in the demo flow, 
            but kept for potential future use of the full simulation. */}
        <BriefingNoteContent lastDecision={lastDecision} />

        {showNextButton && (
          <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end">
            <Button onClick={onNext} variant="green" size="lg">
              다음 단계로 <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};


const FinalResultScreen = ({ onBackToIntro, onShowSimulationSample, onDownload, reportRef }: {
  onBackToIntro: () => void;
  onShowSimulationSample: () => void;
  onDownload: () => void;
  reportRef: React.RefObject<HTMLDivElement>;
}) => {
  const sampleGameState = {
      finalAnalysis: SAMPLE_ANALYSIS_REPORT,
      totalScore: 760,
      competencies: { data: 170, strategy: 130, leadership: 150, ethics: 180, technical: 140 }
  };
  
  const { totalScore, competencies, finalAnalysis } = sampleGameState;
  
  const analysisParts = useMemo(() => {
    if (!finalAnalysis) return { archetypeTitle: '', archetypeDesc: '', strengths: '', improvements: '', recommendations: '' };

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
    score: Math.round(competencies[key as keyof typeof competencies]),
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
                  <p className="text-lg text-slate-400 mt-1">샘플 보고서</p>
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
          <Button onClick={onBackToIntro} variant="outline" size="lg">
              <ChevronLeft className="w-5 h-5 mr-2" />
              처음으로 돌아가기
          </Button>
          <Button onClick={onShowSimulationSample} variant="default" size="lg">
              시뮬레이션 체험하기
              <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
          <Button onClick={onDownload} size="lg">
              <Download className="w-5 h-5 mr-2" />
              PDF 저장하기
          </Button>
      </div>
    </div>
  );
};

export default App;
