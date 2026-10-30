import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Page404 } from './page404';

describe('Page404', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Page404],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('propose un retour à l’accueil', () => {
    const fixture = TestBed.createComponent(Page404);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('h1')?.textContent).toContain('Page introuvable');
    expect(root.querySelector('a.btn')?.getAttribute('href')).toBe('/accueil');
  });
});
