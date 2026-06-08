import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfigService } from '../../services/config.service';
import { GameService } from '../../services/game.service';
import { TimeHorizon } from '../../models/game-state.model';

@Component({
  selector: 'app-start-screen',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './start-screen.component.html',
  styleUrl: './start-screen.component.scss',
})
export class StartScreenComponent implements OnInit {
  private readonly configService = inject(ConfigService);
  private readonly gameService = inject(GameService);
  private readonly router = inject(Router);

  playerName = signal('');
  timeHorizon = signal<TimeHorizon>('1yr');
  currentGrade = signal<string>('A');
  loading = signal(true);
  error = signal<string | null>(null);

  readonly grades = [
    { code: 'A', label: 'A – Junior' },
    { code: 'B', label: 'B – Medior / Senior' },
    { code: 'C', label: 'C – Senior / Expert' },
    { code: 'D', label: 'D – Lead / Architect' },
    { code: 'E', label: 'E – Principal / Strategisch' },
  ];

  ngOnInit(): void {
    this.configService.loadConfig().subscribe({
      next: () => this.loading.set(false),
      error: () => {
        this.error.set('Kon configuratie niet laden. Probeer de pagina te herladen.');
        this.loading.set(false);
      },
    });
  }

  setTimeHorizon(horizon: TimeHorizon): void {
    this.timeHorizon.set(horizon);
  }

  setGrade(code: string): void {
    this.currentGrade.set(code);
  }

  startGame(): void {
    const name = this.playerName().trim();
    if (!name) return;
    this.gameService.startGame(name, this.timeHorizon(), this.currentGrade());
    this.router.navigate(['/spin']);
  }

  get canStart(): boolean {
    return this.playerName().trim().length > 0 && !this.loading();
  }
}
