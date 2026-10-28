import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NAV_LINKS } from '../../config/navigation';
import { BottomNav } from './bottom-nav';

describe('BottomNav', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomNav],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('affiche un onglet avec icône par entrée de navigation', () => {
    const fixture = TestBed.createComponent(BottomNav);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('nav a').length).toBe(NAV_LINKS.length);
    expect(root.querySelectorAll('nav a svg path').length).toBe(NAV_LINKS.length);
  });
});
