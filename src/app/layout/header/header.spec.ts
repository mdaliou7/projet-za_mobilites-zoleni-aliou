import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NAV_LINKS } from '../../config/navigation';
import { Header } from './header';

describe('Header', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('affiche un lien par entrée de navigation', () => {
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();
    const links = (fixture.nativeElement as HTMLElement).querySelectorAll('nav a');
    expect(links.length).toBe(NAV_LINKS.length);
  });
});
