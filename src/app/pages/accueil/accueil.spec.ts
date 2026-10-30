import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NAV_LINKS } from '../../config/navigation';
import { Accueil } from './accueil';

describe('Accueil', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Accueil],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('propose une carte par fonctionnalité', () => {
    const fixture = TestBed.createComponent(Accueil);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('h1')?.textContent).toContain('Bienvenue');
    expect(root.querySelectorAll('a.card').length).toBe(NAV_LINKS.length);
  });
});
