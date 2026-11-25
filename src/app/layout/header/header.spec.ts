import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { APP_NAME } from '../../config/app-info';
import { NAV_LINKS } from '../../config/navigation';
import { Header } from './header';

describe('Header', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it("affiche le logo, et nomme le lien d'accueil pour les lecteurs d'écran", () => {
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();
    const brand = (fixture.nativeElement as HTMLElement).querySelector('a.brand') as HTMLAnchorElement;
    const logo = brand.querySelector('img') as HTMLImageElement;

    expect(brand.getAttribute('href')).toBe('/accueil');
    expect(logo.getAttribute('src')).toBe('logo-za.png');
    expect(logo.getAttribute('alt')).toBe(''); // décoratif : le nom vient du texte masqué
    expect(brand.textContent?.trim()).toBe(APP_NAME);
  });

  it('affiche un lien par entrée de navigation', () => {
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();
    const links = (fixture.nativeElement as HTMLElement).querySelectorAll('nav a');
    expect(links.length).toBe(NAV_LINKS.length);
  });
});
