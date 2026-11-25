import { TestBed } from '@angular/core/testing';
import { LineBadge } from './line-badge';

describe('LineBadge', () => {
  function render(inputs: { label: string; color?: string; textColor?: string }) {
    TestBed.configureTestingModule({ imports: [LineBadge] });
    const fixture = TestBed.createComponent(LineBadge);
    fixture.componentRef.setInput('label', inputs.label);
    fixture.componentRef.setInput('color', inputs.color);
    fixture.componentRef.setInput('textColor', inputs.textColor);
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).querySelector('.badge') as HTMLElement;
  }

  it('affiche le nom de la ligne avec les couleurs fournies', () => {
    const badge = render({ label: 'E', color: 'B94E9A', textColor: 'FFFFFF' });

    expect(badge.textContent).toBe('E');
    expect(badge.style.backgroundColor).toBe('rgb(185, 78, 154)');
    expect(badge.style.color).toBe('rgb(255, 255, 255)');
  });

  it('choisit un texte lisible quand la couleur du texte manque', () => {
    expect(render({ label: '6210', color: 'FFBE00' }).style.color).toBe('rgb(0, 0, 0)'); // fond clair
    TestBed.resetTestingModule();
    expect(render({ label: '14', color: '662483' }).style.color).toBe('rgb(255, 255, 255)'); // fond sombre
  });

  it('retombe sur un gris quand la couleur est absente ou invalide', () => {
    const sans = render({ label: 'X' });
    expect(sans.style.backgroundColor).toBe('rgb(91, 102, 118)');

    TestBed.resetTestingModule();
    const invalide = render({ label: 'Y', color: 'rouge; background:url(x)' });
    expect(invalide.style.backgroundColor).toBe('rgb(91, 102, 118)');
  });
});
