export type ExperienceLevel = 'Foundation' | 'Developing' | 'Proficient' | 'Advanced' | 'Expert';

export interface Competency {
  name: string;
  level: ExperienceLevel;
  description: string;
}

export interface KnowledgeItem {
  domain: string;
  topics: string[];
  level: ExperienceLevel;
}

export interface Role {
  id: string;
  name: string;
  function: string;
  grade: string;
  businessLine: string;
  tagline: string;
  activities: string[];
  description: string;
  localCompetencies: Competency[];
  knowledgeMap: KnowledgeItem[];
  globalCompetencies: Competency[];
  tags: string[];
}

export interface AppConfig {
  appTitle: string;
  spinConfig: { minSpins?: number; maxSpins?: number; deepDiveInterval?: number; spinsPerSession?: number; deepDiveEvery?: number; timeLimitSec?: number };
  grades: string[];
  businessLines: string[];
  globalCompetencies: { name: string; description: string }[];
  coreBehaviors: string[];
  roles: Role[];
}
