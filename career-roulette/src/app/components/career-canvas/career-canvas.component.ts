import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-career-canvas',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './career-canvas.component.html',
  styleUrl: './career-canvas.component.scss',
})
export class CareerCanvasComponent implements OnInit {
  private readonly gameService = inject(GameService);
  private readonly router = inject(Router);

  readonly state = computed(() => this.gameService.state());
  readonly canvas = computed(() => this.state().careerCanvas);

  targetRole = signal('');
  intermediateRole = signal('');
  topCompetencies = signal<string[]>([]);
  knowledgeKeywords = signal<string[]>([]);
  firstAction1 = signal('');
  firstAction2 = signal('');

  newCompetency = signal('');
  newKeyword = signal('');

  today = new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });

  ngOnInit(): void {
    const canvas = this.canvas();
    if (!canvas) {
      this.router.navigate(['/']);
      return;
    }
    this.targetRole.set(canvas.targetRole);
    this.intermediateRole.set(canvas.intermediateRole);
    this.topCompetencies.set([...canvas.topCompetencies]);
    this.knowledgeKeywords.set([...canvas.knowledgeKeywords]);
    this.firstAction1.set(canvas.firstActions[0] ?? '');
    this.firstAction2.set(canvas.firstActions[1] ?? '');
  }

  addCompetency(): void {
    const val = this.newCompetency().trim();
    if (val && this.topCompetencies().length < 5) {
      this.topCompetencies.update(list => [...list, val]);
      this.newCompetency.set('');
    }
  }

  removeCompetency(index: number): void {
    this.topCompetencies.update(list => list.filter((_, i) => i !== index));
  }

  addKeyword(): void {
    const val = this.newKeyword().trim();
    if (val && this.knowledgeKeywords().length < 8) {
      this.knowledgeKeywords.update(list => [...list, val]);
      this.newKeyword.set('');
    }
  }

  removeKeyword(index: number): void {
    this.knowledgeKeywords.update(list => list.filter((_, i) => i !== index));
  }

  printCanvas(): void {
    window.print();
  }
}
