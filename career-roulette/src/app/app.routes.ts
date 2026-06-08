import { Routes } from '@angular/router';
import { StartScreenComponent } from './components/start-screen/start-screen.component';
import { SpinScreenComponent } from './components/spin-screen/spin-screen.component';
import { InterestProfileComponent } from './components/interest-profile/interest-profile.component';
import { CareerCanvasComponent } from './components/career-canvas/career-canvas.component';

export const routes: Routes = [
  { path: '', component: StartScreenComponent },
  { path: 'spin', component: SpinScreenComponent },
  { path: 'summary', component: InterestProfileComponent },
  { path: 'canvas', component: CareerCanvasComponent },
  { path: '**', redirectTo: '' },
];
