export type Choice = 'yes' | 'maybe' | 'no';
export type TimeHorizon = '1yr' | '3yr';

export interface SpinRecord {
  roleId: string;
  roleName: string;
  choice: Choice;
  motivation: string;
  timeHorizon: TimeHorizon;
  wasDeepDive: boolean;
  wasMystery: boolean;
}

export interface InterestProfile {
  topYes: SpinRecord[];
  topMaybe: SpinRecord[];
  noPatterns: string[];
  yesThemes: string[];
  suggestedPaths: {
    vertical: string;
    adjacent: string;
    crossBL: string;
  };
}

export interface CareerCanvas {
  targetRole: string;
  intermediateRole: string;
  topCompetencies: string[];
  knowledgeKeywords: string[];
  firstActions: string[];
}

export type GamePhase = 'start' | 'spinning' | 'summary' | 'canvas';

export interface GameState {
  playerName: string;
  timeHorizon: TimeHorizon;
  currentGrade: string;
  currentSpin: number;
  totalSpins: number;
  spinsUntilDeepDive: number;
  crossBlJokerAvailable: boolean;
  mysterySpinAvailable: boolean;
  records: SpinRecord[];
  phase: GamePhase;
  interestProfile: InterestProfile | null;
  careerCanvas: CareerCanvas | null;
}
