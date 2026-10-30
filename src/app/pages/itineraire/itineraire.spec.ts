import { TestBed } from '@angular/core/testing';
import { Itineraire } from './itineraire';

describe('Itineraire', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Itineraire] }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Itineraire);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('h1')?.textContent).toContain('Itinéraire');
  });
});
