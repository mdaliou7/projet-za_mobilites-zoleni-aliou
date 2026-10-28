import { TestBed } from '@angular/core/testing';
import { APP_NAME } from '../../config/app-info';
import { Footer } from './footer';

describe('Footer', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Footer] }).compileComponents();
  });

  it('mentionne le nom de l’appli et la source des données', () => {
    const fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain(APP_NAME);
    expect(text).toContain('PRIM');
  });
});
