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
  private sectionObserver?: IntersectionObserver;
  private navSections: HTMLElement[] = [];
  private readonly handleViewportResize = (): void => this.observeNavSections();

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    this.updateScrollState();
    if (!('IntersectionObserver' in window)) return;

    this.navSections = Array.from(document.querySelectorAll<HTMLElement>('main [data-nav-section]'));
    this.observeNavSections();
    window.addEventListener('resize', this.handleViewportResize, { passive: true });
  }

  private observeNavSections(): void {
    if (!this.isBrowser || !('IntersectionObserver' in window)) return;

    // Vertical root margins are calculated in pixels because percentage margins
    // are based on viewport width, which can collapse the observer on desktop.
    const viewportHeight = window.innerHeight;
    const focusBand = Math.max(8, Math.round(viewportHeight * 0.02));
    const focusTop = Math.round(viewportHeight * 0.38);
    const focusBottom = Math.max(0, viewportHeight - focusTop - focusBand);

    this.sectionObserver?.disconnect();
    this.sectionObserver = new IntersectionObserver(
      (entries) => {
        const active = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => {
            const focusY = focusTop + focusBand / 2;
            const distanceA = Math.abs((a.boundingClientRect.top + a.boundingClientRect.bottom) / 2 - focusY);
            const distanceB = Math.abs((b.boundingClientRect.top + b.boundingClientRect.bottom) / 2 - focusY);
            return distanceA - distanceB;
          })[0];

        if (active) this.activeSection.set(active.target.id);
      },
      {
        rootMargin: `-${focusTop}px 0px -${focusBottom}px 0px`,
        threshold: 0,
      },
    );

    this.navSections.forEach((section) => {
      this.sectionObserver?.observe(section);
    });
  }

  ngOnDestroy(): void {
    this.sectionObserver?.disconnect();
    if (this.isBrowser) window.removeEventListener('resize', this.handleViewportResize);
  }

  @HostListener('window:scroll')
  protected updateScrollState(): void {
    if (!this.isBrowser) return;
    const next = window.scrollY > 18;
    if (next !== this.isScrolled()) this.isScrolled.set(next);
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
