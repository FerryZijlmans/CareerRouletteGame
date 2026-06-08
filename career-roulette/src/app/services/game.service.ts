import { Injectable, inject, signal } from '@angular/core';
import { Role } from '../models/role.model';
import { GameState, SpinRecord, Choice, TimeHorizon, InterestProfile, CareerCanvas } from '../models/game-state.model';
import { ConfigService } from './config.service';

const INITIAL_STATE: GameState = {
  playerName: '',
  timeHorizon: '1yr',
  currentGrade: 'A',
  currentSpin: 0,
  totalSpins: 0,
  spinsUntilDeepDive: 5,
  crossBlJokerAvailable: true,
  mysterySpinAvailable: true,
  records: [],
  phase: 'start',
  interestProfile: null,
  careerCanvas: null,
};

@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly configService = inject(ConfigService);
  readonly state = signal<GameState>({ ...INITIAL_STATE });
  private readonly gradeOrder = ['A', 'B', 'C', 'D', 'E'];

  private playedRoleIds = new Set<string>();
  private crossBlJokerActive = false;
  private mysteryActive = false;

  startGame(playerName: string, timeHorizon: TimeHorizon, playerGrade: string = 'A'): void {
    const config = this.configService.getConfig();
    const { deepDiveInterval, deepDiveEvery } = config.spinConfig || {};

    const desiredSpins = Math.floor(Math.random() * 5) + 8; // 8..12
    const eligibleRoles = this.getEligibleRolesFor(playerGrade, timeHorizon);
    const rolePoolForSession = eligibleRoles.length > 0 ? eligibleRoles : config.roles;
    const totalSpins = Math.min(desiredSpins, rolePoolForSession.length);

    this.playedRoleIds = new Set<string>();
    this.crossBlJokerActive = false;
    this.mysteryActive = false;

    this.state.set({
      playerName,
      timeHorizon,
      currentGrade: playerGrade,
      currentSpin: 0,
      totalSpins,
      spinsUntilDeepDive:
        (typeof deepDiveInterval === 'number' && deepDiveInterval > 0 ? deepDiveInterval : undefined) ||
        (typeof deepDiveEvery === 'number' && deepDiveEvery > 0 ? deepDiveEvery : undefined) ||
        5,
      crossBlJokerAvailable: true,
      mysterySpinAvailable: true,
      records: [],
      phase: 'spinning',
      interestProfile: null,
      careerCanvas: null,
    });
  }

  getNextRole(): Role {
    const config = this.configService.getConfig();
    const allRoles = config.roles;
    const filteredRoles = this.getEligibleRolesFor(this.state().currentGrade, this.state().timeHorizon);
    const eligibleRoles = filteredRoles.length > 0 ? filteredRoles : allRoles;
    let pool = eligibleRoles.filter(r => !this.playedRoleIds.has(r.id));

    if (pool.length === 0) {
      throw new Error('Geen unieke rollen meer beschikbaar voor deze sessie.');
    }

    if (this.crossBlJokerActive) {
      const yesRecords = this.state().records.filter(r => r.choice === 'yes');
      if (yesRecords.length > 0) {
        const playedBLs = new Set(yesRecords.map(r => {
          const role = allRoles.find(role => role.id === r.roleId);
          return role?.businessLine;
        }).filter(Boolean));
        const crossPool = pool.filter(r => !playedBLs.has(r.businessLine));
        if (crossPool.length > 0) pool = crossPool;
      }
      this.crossBlJokerActive = false;
      this.state.update(s => ({ ...s, crossBlJokerAvailable: false }));
    }

    const index = Math.floor(Math.random() * pool.length);
    const role = pool[index];
    this.playedRoleIds.add(role.id);

    if (this.mysteryActive) {
      this.mysteryActive = false;
      this.state.update(s => ({ ...s, mysterySpinAvailable: false }));
    }

    return role;
  }

  isDeepDive(): boolean {
    const { currentSpin, spinsUntilDeepDive } = this.state();
    return currentSpin > 0 && currentSpin % spinsUntilDeepDive === 0;
  }

  isMystery(): boolean {
    return this.mysteryActive;
  }

  recordChoice(
    roleId: string,
    roleName: string,
    choice: Choice,
    motivation: string,
    wasDeepDive: boolean,
    wasMystery: boolean
  ): void {
    const current = this.state();
    const newSpin = current.currentSpin + 1;
    const record: SpinRecord = {
      roleId,
      roleName,
      choice,
      motivation,
      timeHorizon: current.timeHorizon,
      wasDeepDive,
      wasMystery,
    };

    const isLast = newSpin >= current.totalSpins;
    this.state.update(s => ({
      ...s,
      currentSpin: newSpin,
      records: [...s.records, record],
      phase: isLast ? 'summary' : 'spinning',
    }));
  }

  toggleTimeHorizon(): void {
    this.state.update(s => ({
      ...s,
      timeHorizon: s.timeHorizon === '1yr' ? '3yr' : '1yr',
    }));
  }

  activateCrossBlJoker(): void {
    if (this.state().crossBlJokerAvailable) {
      this.crossBlJokerActive = true;
    }
  }

  activateMystery(): void {
    if (this.state().mysterySpinAvailable) {
      this.mysteryActive = true;
    }
  }

  computeInterestProfile(): InterestProfile {
    const records = this.state().records;
    const config = this.configService.getConfig();
    const allRoles = config.roles;

    const yesRecords = records.filter(r => r.choice === 'yes');
    const maybeRecords = records.filter(r => r.choice === 'maybe');
    const noRecords = records.filter(r => r.choice === 'no');

    // Tag frequency helpers
    const getTagFrequency = (recs: SpinRecord[]): Map<string, number> => {
      const freq = new Map<string, number>();
      recs.forEach(rec => {
        const role = allRoles.find(r => r.id === rec.roleId);
        if (role) {
          role.tags.forEach(tag => freq.set(tag, (freq.get(tag) || 0) + 1));
        }
      });
      return freq;
    };

    const topTags = (freq: Map<string, number>, n: number): string[] =>
      [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([tag]) => tag);

    const yesThemes = topTags(getTagFrequency(yesRecords), 5);
    const noPatterns = topTags(getTagFrequency(noRecords), 5);

    // Suggested paths
    const topYesRole = yesRecords.length > 0
      ? allRoles.find(r => r.id === yesRecords[0].roleId)
      : null;

    const suggestedPaths = {
      vertical: topYesRole
        ? this.suggestVerticalPath(topYesRole, allRoles)
        : 'Verken meer rollen voor een aanbeveling',
      adjacent: topYesRole
        ? this.suggestAdjacentPath(topYesRole, allRoles, yesThemes)
        : 'Verken meer rollen voor een aanbeveling',
      crossBL: topYesRole
        ? this.suggestCrossBlPath(topYesRole, allRoles)
        : 'Verken meer rollen voor een aanbeveling',
    };

    const profile: InterestProfile = {
      topYes: yesRecords.slice(0, 3),
      topMaybe: maybeRecords.slice(0, 3),
      noPatterns,
      yesThemes,
      suggestedPaths,
    };

    this.state.update(s => ({ ...s, interestProfile: profile, phase: 'summary' }));
    return profile;
  }

  private suggestVerticalPath(role: Role, allRoles: Role[]): string {
    const letter = this.extractGradeLetter(role.grade);
    if (!letter) return `Geen grade-informatie beschikbaar`;
    const idx = this.gradeOrder.indexOf(letter);
    if (idx >= 0 && idx < this.gradeOrder.length - 1) {
      const nextLetter = this.gradeOrder[idx + 1];
      const nextGradeString = `Grade ${nextLetter}`;
      const candidate = allRoles.find(
        r => r.function === role.function && r.grade === nextGradeString && r.id !== role.id
      );
      if (candidate) return `${candidate.name} (${candidate.businessLine})`;
      return `${nextGradeString} in ${role.function}`;
    }
    return `${role.name} — al op het hoogste niveau`;
  }

  private suggestAdjacentPath(role: Role, allRoles: Role[], yesThemes: string[]): string {
    const candidate = allRoles.find(
      r => r.function !== role.function &&
        r.grade === role.grade &&
        r.tags.some(t => yesThemes.includes(t)) &&
        r.id !== role.id
    );
    return candidate ? `${candidate.name} (${candidate.businessLine})` : `Vergelijkbaar niveau in een andere functie`;
  }

  private suggestCrossBlPath(role: Role, allRoles: Role[]): string {
    const candidate = allRoles.find(
      r => r.businessLine !== role.businessLine &&
        r.function === role.function &&
        r.id !== role.id
    );
    return candidate ? `${candidate.name} bij ${candidate.businessLine}` : `Zelfde rol in een ander business line`;
  }

  generateCareerCanvas(targetRole: string, intermediateRole: string): CareerCanvas {
    const records = this.state().records;
    const config = this.configService.getConfig();
    const allRoles = config.roles;
    const yesRecords = records.filter(r => r.choice === 'yes');

    // Collect competencies from yes roles
    const compFreq = new Map<string, number>();
    yesRecords.forEach(rec => {
      const role = allRoles.find(r => r.id === rec.roleId);
      if (role) {
        [...role.localCompetencies, ...role.globalCompetencies].forEach(c =>
          compFreq.set(c.name, (compFreq.get(c.name) || 0) + 1)
        );
      }
    });
    const topCompetencies = [...compFreq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);

    // Collect knowledge keywords
    const kwFreq = new Map<string, number>();
    yesRecords.forEach(rec => {
      const role = allRoles.find(r => r.id === rec.roleId);
      if (role) {
        role.knowledgeMap.forEach(km =>
          km.topics.forEach(t => kwFreq.set(t, (kwFreq.get(t) || 0) + 1))
        );
        role.tags.forEach(t => kwFreq.set(t, (kwFreq.get(t) || 0) + 1));
      }
    });
    const knowledgeKeywords = [...kwFreq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([kw]) => kw);

    const resolvedTopCompetencies =
      topCompetencies.length > 0 ? topCompetencies : ['Definieer je top competenties'];
    const resolvedKnowledgeKeywords =
      knowledgeKeywords.length > 0 ? knowledgeKeywords : ['Definieer je kennisgebieden'];

    const canvas: CareerCanvas = {
      targetRole,
      intermediateRole,
      topCompetencies: resolvedTopCompetencies,
      knowledgeKeywords: resolvedKnowledgeKeywords,
      firstActions: this.generateRandomFirstActions(
        targetRole,
        intermediateRole,
        resolvedTopCompetencies,
        resolvedKnowledgeKeywords
      ),
    };

    this.state.update(s => ({ ...s, careerCanvas: canvas, phase: 'canvas' }));
    return canvas;
  }

  resetGame(): void {
    this.playedRoleIds.clear();
    this.crossBlJokerActive = false;
    this.mysteryActive = false;
    this.state.set({ ...INITIAL_STATE });
  }

  private extractGradeLetter(grade: string | null | undefined): string | null {
    if (!grade) return null;

    const normalized = grade.trim().toUpperCase();
    if (normalized.length === 1 && /^[A-E]$/.test(normalized)) {
      return normalized;
    }

    const gradeMatch = normalized.match(/^GRADE\s*([A-E])$/i);
    if (gradeMatch?.[1]) {
      return gradeMatch[1].toUpperCase();
    }

    const standaloneMatch = normalized.match(/\b([A-E])\b/i);
    return standaloneMatch?.[1]?.toUpperCase() ?? null;
  }

  private generateRandomFirstActions(
    targetRole: string,
    intermediateRole: string,
    topCompetencies: string[],
    knowledgeKeywords: string[]
  ): string[] {
    const competency = topCompetencies[0] ?? 'je belangrijkste competentie';
    const keyword = knowledgeKeywords[0] ?? 'een relevant kennisgebied';

    const options = [
      `Plan een carrièregesprek met je lead over jouw route naar ${targetRole}`,
      `Vraag een buddy- of koffiesessie aan met iemand die nu werkt als ${targetRole}`,
      `Spreek af hoe je in ${intermediateRole} ervaring kunt opbouwen in de komende 3 maanden`,
      `Reserveer deze week 2 uur om je te verdiepen in ${keyword}`,
      `Kies één lopend project waarin je bewust werkt aan ${competency}`,
      `Plan een maandelijkse check-in om je voortgang richting ${targetRole} te bespreken`,
      `Maak een concreet leerplan met 2 meetbare doelen voor ${intermediateRole}`,
      `Vraag feedback op je huidige niveau en vertaal dit naar 1 actie voor ${competency}`,
    ];

    const shuffled = [...options].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 2);
  }

  private getEligibleRolesFor(playerGradeRaw: string, timeHorizon: TimeHorizon): Role[] {
    const config = this.configService.getConfig();
    const playerGrade = this.extractGradeLetter(playerGradeRaw) || 'A';
    const playerIndex = Math.max(0, this.gradeOrder.indexOf(playerGrade));
    const maxOffset = timeHorizon === '3yr' ? 2 : 1;
    const maxAllowedIndex = Math.min(this.gradeOrder.length - 1, playerIndex + maxOffset);

    return config.roles.filter(role => {
      const letter = this.extractGradeLetter(role.grade);
      if (!letter) return true;
      const roleIndex = this.gradeOrder.indexOf(letter);
      return roleIndex >= playerIndex && roleIndex <= maxAllowedIndex;
    });
  }
}
