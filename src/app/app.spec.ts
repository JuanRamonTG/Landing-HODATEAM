import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { App } from './app';

describe('HODATEAM landing', () => {
  it('renders each section linked from the primary navigation', async () => {
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    for (const id of ['identidad', 'capacidades', 'proyectos', 'enfoque', 'contacto']) {
      expect(root.querySelector(`#${id}`)).not.toBeNull();
    }
  });

  it('closes the mobile navigation with Escape', async () => {
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const toggle = fixture.nativeElement.querySelector(
      '.site-header__toggle',
    ) as HTMLButtonElement;
    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });
});
