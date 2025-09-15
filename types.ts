
import type { ElementType } from 'react';

export interface Competency {
  id: string;
  name: string;
  shortName: string;
  icon: ElementType;
  color: string;
  bgColor: string;
}

export type TriggerCardOption = {
  text: string;
  effects: Record<string, number>;
};

export type TriggerCard = {
  id: number;
  title: string;
  description: string;
  options: TriggerCardOption[];
};

export interface GameState {
  screen: 'intro' | 'game' | 'final_report';
  loadingMessage: string | null;
  scenario: Record<number, TriggerCard[]>;
  currentStage: number;
  currentCard: number;
  competencies: Record<string, number>;
  totalScore: number;
  showFeedback: boolean;
  lastDecision: {
    optionText: string;
    effects: Record<string, number>;
    impactDescription: string;
  } | null;
  finalAnalysis: string | null;
  decisionHistory: Array<{
    stage: number;
    title: string;
    choice: string;
    allOptions: string[];
    effects: Record<string, number>;
  }>;
}

export interface Theme {
  name: string;
  primaryClass: string;
  primaryHoverClass: string;
  primaryTextClass: string;
  primaryRingClass: string;
  strokeHex: string;
  fillHex: string;
}