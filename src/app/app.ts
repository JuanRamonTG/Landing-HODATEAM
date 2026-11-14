import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ContactSectionComponent } from './sections/contact-section.component';
import { HeroSectionComponent } from './sections/hero-section.component';
import { ProjectShowcaseComponent } from './sections/project-showcase.component';
import { SiteHeaderComponent } from './sections/site-header.component';
import { SiteSectionsComponent } from './sections/site-sections.component';
import { SITE_CONFIG } from './site-config';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    ContactSectionComponent,
    HeroSectionComponent,
    ProjectShowcaseComponent,
    SiteHeaderComponent,
    SiteSectionsComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements AfterViewInit, OnDestroy {
  protected readonly currentYear = new Date().getFullYear();
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private revealObserver?: IntersectionObserver;

  constructor() {
    this.title.setTitle('HODATEAM — Diseño y desarrollo de software');
    this.meta.updateTag({
      name: 'description',
      content:
        'HODATEAM es un equipo de desarrollo de software que diseña experiencias digitales y crea aplicaciones web y móviles. Conoce StellarTraffic, su proyecto de movilidad inteligente en desarrollo.',
    });

    if (SITE_CONFIG.siteOrigin) {
      this.applyAbsoluteSiteMetadata(SITE_CONFIG.siteOrigin);
    }
  }

  ngAfterViewInit(): void {
    if (
      !this.isBrowser ||
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    this.document.documentElement.classList.add('has-reveal-motion');
    this.revealObserver = new IntersectionObserver(
      (entries, observer) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -64px 0px', threshold: 0.08 },
    );

    this.document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((element) => {
      this.revealObserver?.observe(element);
    });
  }

  ngOnDestroy(): void {
    this.revealObserver?.disconnect();
    this.document.documentElement.classList.remove('has-reveal-motion');
  }

  private applyAbsoluteSiteMetadata(origin: string): void {
    const baseUrl = origin.replace(/\/+$/, '');
    this.meta.updateTag({ property: 'og:url', content: `${baseUrl}/` });
    this.meta.updateTag({
      property: 'og:image',
      content: `${baseUrl}/assets/hodateam-social-preview.jpg`,
    });
    this.meta.updateTag({
      name: 'twitter:image',
      content: `${baseUrl}/assets/hodateam-social-preview.jpg`,
    });

    const canonical =
      this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]') ??
      this.document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = `${baseUrl}/`;
    this.document.head.append(canonical);
  }
}
