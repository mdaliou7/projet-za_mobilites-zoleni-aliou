import { TestBed } from '@angular/core/testing';
import { Favoris } from './favoris';

describe('Favoris', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Favoris] }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Favoris);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('h1')?.textContent).toContain('Favoris');
  });
});
