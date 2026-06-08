import { Component, Input } from '@angular/core';
import { LowerCasePipe } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { Role } from '../../models/role.model';
import { TimeHorizon } from '../../models/game-state.model';

@Component({
  selector: 'app-role-card',
  standalone: true,
  imports: [LowerCasePipe],
  templateUrl: './role-card.component.html',
  styleUrl: './role-card.component.scss',
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(12px) scale(0.97)' }),
        animate('300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      ]),
      transition(':leave', [
        animate('150ms ease-in',
          style({ opacity: 0, transform: 'translateY(-8px) scale(0.97)' })),
      ]),
    ]),
  ],
})
export class RoleCardComponent {
  @Input() role!: Role;
  @Input() isDeepDive = false;
  @Input() isMystery = false;
  @Input() timeHorizon: TimeHorizon = '1yr';

  get blColorClass(): string {
    const map: Record<string, string> = {
      'Azure': 'bl-azure',
      'Microsoft 365': 'bl-m365',
      'Security': 'bl-security',
      'Data & AI': 'bl-data-ai',
      'Developer Tools': 'bl-devtools',
      'Gaming': 'bl-gaming',
    };
    return map[this.role?.businessLine] ?? 'bl-default';
  }
}
