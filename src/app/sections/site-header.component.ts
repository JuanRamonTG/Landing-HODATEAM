import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  inject,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-site-header',
  standalone: true,
  templateUrl: './site-header.component.html',
  styleUrl: './site-header.component.scss',
})
export class SiteHeaderComponent implements AfterViewInit, OnDestroy {
  @ViewChild('menuToggle') private menuToggle?: ElementRef<HTMLButtonElement>;
  protected readonly menuOpen = signal(false);
  protected readonly isScrolled = signal(false);
  protected readonly activeSection = signal('inicio');
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private navSections: HTMLElement[] = [];
  private scrollFrame = 0;
  private readonly handleViewportResize = (): void => this.scheduleSectionUpdate();

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    this.updateScrollState();
    this.navSections = Array.from(document.querySelectorAll<HTMLElement>('main [data-nav-section]'));
    this.scheduleSectionUpdate();
    window.addEventListener('resize', this.handleViewportResize, { passive: true });
  }

  private scheduleSectionUpdate(): void {
    if (!this.isBrowser || this.scrollFrame) return;
    this.scrollFrame = window.requestAnimationFrame(() => {
      this.scrollFrame = 0;
      const readingLine = window.innerHeight * 0.38;
      let current = this.navSections[0];
      for (const section of this.navSections) {
        if (section.getBoundingClientRect().top <= readingLine) current = section;
        else break;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        current = this.navSections.at(-1) ?? current;
      }
      if (current && current.id !== this.activeSection()) this.activeSection.set(current.id);
    });
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      window.removeEventListener('resize', this.handleViewportResize);
      window.cancelAnimationFrame(this.scrollFrame);
    }
  }

  @HostListener('window:scroll')
  protected updateScrollState(): void {
    if (!this.isBrowser) return;
    const next = window.scrollY > 18;
    if (next !== this.isScrolled()) this.isScrolled.set(next);
    this.scheduleSectionUpdate();
  }

  @HostListener('document:keydown.escape')
  protected closeMenuOnEscape(): void {
    if (this.menuOpen()) {
      this.menuOpen.set(false);
      this.menuToggle?.nativeElement.focus();
    }
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected isCurrent(section: string): boolean {
    return this.activeSection() === section;
  }
}
