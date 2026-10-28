import { Injectable, signal } from '@angular/core';

interface StoredUsage {
  day: string;
  count: number;
}

/**
 * Compte les requêtes envoyées à PRIM depuis ce navigateur, pour surveiller le quota
 * (1 000 requêtes par jour et par API). Le compteur repart de zéro chaque jour.
 */
@Injectable({ providedIn: 'root' })
export class PrimUsageService {
  private static readonly STORAGE_KEY = 'prim-usage';

  readonly requestsToday = signal(this.load());

  record(): void {
    const count = this.requestsToday() + 1;
    this.requestsToday.set(count);
    try {
      const usage: StoredUsage = { day: this.today(), count };
      localStorage.setItem(PrimUsageService.STORAGE_KEY, JSON.stringify(usage));
    } catch {
      // Stockage indisponible (navigation privée…) : le compteur reste en mémoire.
    }
  }

  private load(): number {
    try {
      const raw = localStorage.getItem(PrimUsageService.STORAGE_KEY);
      const usage = raw ? (JSON.parse(raw) as StoredUsage) : null;
      return usage?.day === this.today() ? usage.count : 0;
    } catch {
      return 0;
    }
  }

  private today(): string {
    return new Date().toLocaleDateString('sv-SE'); // AAAA-MM-JJ, heure locale
  }
}
