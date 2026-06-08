import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { AppConfig } from '../models/role.model';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly http = inject(HttpClient);
  private config: AppConfig | null = null;

  loadConfig(): Observable<AppConfig> {
    if (this.config) {
      return of(this.config);
    }
    return this.http.get<AppConfig>('assets/config/career-config.json').pipe(
      tap(config => (this.config = config))
    );
  }

  getConfig(): AppConfig {
    if (!this.config) {
      throw new Error('Config not loaded. Call loadConfig() first.');
    }
    return this.config;
  }

  isLoaded(): boolean {
    return this.config !== null;
  }
}
