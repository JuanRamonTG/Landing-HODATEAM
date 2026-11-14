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

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    this.updateScrollState();
    if (!('IntersectionObserver' in window)) return;

    this.sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) this.activeSection.set(visible.target.id);
      },
      { rootMargin: '-25% 0px -60% 0px', threshold: [0, 0.15, 0.4] },
    );

    document.querySelectorAll<HTMLElement>('main [data-nav-section]').forEach((section) => {
      this.sectionObserver?.observe(section);
    });
  }

  ngOnDestroy(): void {
    this.sectionObserver?.disconnect();
  }

  @HostListener('window:scroll')
  protected updateScrollState(): void {
    if (this.isBrowser) this.isScrolled.set(window.scrollY > 18);
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
