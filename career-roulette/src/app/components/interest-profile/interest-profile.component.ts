import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { GameService } from '../../services/game.service';
import { InterestProfile } from '../../models/game-state.model';

@Component({
  selector: 'app-interest-profile',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './interest-profile.component.html',
  styleUrl: './interest-profile.component.scss',
})
export class InterestProfileComponent implements OnInit {
  private readonly gameService = inject(GameService);
  private readonly router = inject(Router);

  readonly state = computed(() => this.gameService.state());
  readonly profile = computed(() => this.state().interestProfile);

  facilitatorView = signal(false);
  targetRole = signal('');
  intermediateRole = signal('');

  readonly conversationQuestions = [
    'Kijk naar je ✅ Aan-rollen: Wat hebben ze gemeen? Wat is het patroon in je aantrekkingskracht?',
    'Kijk naar je ❌ Niet aan-rollen: Wat vermijd je bewust? Welke werkvormen of contexten passen niet bij jou?',
    'Als je de tijdshorizon verandert naar 3 jaar — welke rol verandert van Misschien naar Aan?',
    'Welke rol zou je NU al kunnen verkennen via een buddy, zij-project of interne stage?',
  ];

  ngOnInit(): void {
    const s = this.state();
    if (!s.interestProfile) {
      this.router.navigate(['/']);
    }
  }

  toggleFacilitatorView(): void {
    this.facilitatorView.update(v => !v);
  }

  goToCanvas(): void {
    const target = this.targetRole().trim() || (this.profile()?.suggestedPaths.vertical ?? 'Doelrol');
    const intermediate = this.intermediateRole().trim() || (this.profile()?.suggestedPaths.adjacent ?? 'Tussenrol');
    this.gameService.generateCareerCanvas(target, intermediate);
    this.router.navigate(['/canvas']);
  }

  playAgain(): void {
    this.gameService.resetGame();
    this.router.navigate(['/']);
  }
}
