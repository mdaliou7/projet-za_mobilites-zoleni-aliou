import { TestBed } from '@angular/core/testing';
import { Horaires } from './horaires';

describe('Horaires', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Horaires] }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Horaires);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('h1')?.textContent).toContain('Horaires');
  });

  it("affiche l'arrêt passé dans l'URL", () => {
    const fixture = TestBed.createComponent(Horaires);
    fixture.componentRef.setInput('stopAreaId', 'STIF:StopArea:SP:71264:');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('STIF:StopArea:SP:71264:');
  });
});
