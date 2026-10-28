import { TestBed } from '@angular/core/testing';
import { Lieux } from './lieux';

describe('Lieux', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Lieux] }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Lieux);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('h1')?.textContent).toContain('Lieux');
  });
});
