import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate, query, group } from '@angular/animations';
import { GameService } from '../../services/game.service';
import { RoleCardComponent } from '../role-card/role-card.component';
import { Role } from '../../models/role.model';
import { Choice } from '../../models/game-state.model';

@Component({
  selector: 'app-spin-screen',
  standalone: true,
  imports: [FormsModule, RoleCardComponent],
  templateUrl: './spin-screen.component.html',
  styleUrl: './spin-screen.component.scss',
  animations: [
    trigger('cardSlide', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateX(60px) scale(0.95)' }),
          animate('350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            style({ opacity: 1, transform: 'translateX(0) scale(1)' })
          ),
        ], { optional: true }),
      ]),
    ]),
  ],
})
export class SpinScreenComponent implements OnInit {
  private readonly gameService = inject(GameService);
  private readonly router = inject(Router);

  readonly state = computed(() => this.gameService.state());

  currentRole = signal<Role | null>(null);
  isDeepDive = signal(false);
  isMystery = signal(false);
  selectedChoice = signal<Choice | null>(null);
  motivation = signal('');
  showMotivation = signal(false);
  animationTrigger = signal(0);

  ngOnInit(): void {
    if (this.state().phase !== 'spinning') {
      this.router.navigate(['/']);
      return;
    }
    this.loadNextRole();
  }

  private loadNextRole(): void {
    const role = this.gameService.getNextRole();
    this.isDeepDive.set(this.gameService.isDeepDive());
    this.isMystery.set(this.gameService.isMystery());
    this.currentRole.set(role);
    this.selectedChoice.set(null);
    this.motivation.set('');
    this.showMotivation.set(false);
    this.animationTrigger.update(v => v + 1);
  }

  get progressPercent(): number {
    const s = this.state();
    return s.totalSpins > 0 ? (s.currentSpin / s.totalSpins) * 100 : 0;
  }

  get microQuestion(): string {
    const choice = this.selectedChoice();
    if (choice === 'yes') return 'Welk stuk hiervan geeft je energie?';
    if (choice === 'maybe') return 'Wat mis je nog om dit wél aantrekkelijk te maken?';
    if (choice === 'no') return 'Wat schuurt hier / wat wil je juist vermijden?';
    return '';
  }

  selectChoice(choice: Choice): void {
    this.selectedChoice.set(choice);
    this.showMotivation.set(true);
  }

  toggleTimeHorizon(): void {
    this.gameService.toggleTimeHorizon();
  }

  activateCrossBlJoker(): void {
    this.gameService.activateCrossBlJoker();
    this.loadNextRole();
  }

  activateMystery(): void {
    this.gameService.activateMystery();
    this.loadNextRole();
  }

  submitChoice(): void {
    const choice = this.selectedChoice();
    const role = this.currentRole();
    if (!choice || !role) return;

    this.gameService.recordChoice(
      role.id,
      role.name,
      choice,
      this.motivation(),
      this.isDeepDive(),
      this.isMystery()
    );

    const newState = this.state();
    if (newState.phase === 'summary') {
      this.gameService.computeInterestProfile();
      this.router.navigate(['/summary']);
    } else {
      this.loadNextRole();
    }
  }
}
