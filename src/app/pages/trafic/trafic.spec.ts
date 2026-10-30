import { TestBed } from '@angular/core/testing';
import { Trafic } from './trafic';

describe('Trafic', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Trafic] }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Trafic);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('h1')?.textContent).toContain('Trafic');
  });

  it("affiche la ligne passée dans l'URL", () => {
    const fixture = TestBed.createComponent(Trafic);
    fixture.componentRef.setInput('lineId', 'line:IDFM:C01727');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('line:IDFM:C01727');
  });
});
