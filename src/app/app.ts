import { DOCUMENT } from '@angular/common';
import { afterNextRender, Component, DestroyRef, inject } from '@angular/core';
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
  imports: [ContactSectionComponent, HeroSectionComponent, ProjectShowcaseComponent, SiteHeaderComponent, SiteSectionsComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly currentYear = new Date().getFullYear();
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => this.initializeViewportMotion());
    this.title.setTitle('HODATEAM — Diseño y desarrollo de software');
    this.meta.updateTag({
      name: 'description',
      content: 'HODATEAM es un equipo de desarrollo de software en El Salvador. Diseña productos digitales y crea aplicaciones web y móviles. Conoce StellarTraffic, su prototipo de movilidad inteligente en desarrollo.',
    });
    if (SITE_CONFIG.siteOrigin) this.applyAbsoluteSiteMetadata(SITE_CONFIG.siteOrigin);
  }

  private initializeViewportMotion(): void {
    const view = this.document.defaultView;
    if (!view || view.matchMedia('(prefers-reduced-motion: reduce)').matches || !view.IntersectionObserver) return;

    const revealItems = Array.from(this.document.querySelectorAll<HTMLElement>('[data-motion-reveal], [data-motion-enter]'));
    const scenes = Array.from(this.document.querySelectorAll<HTMLElement>('[data-motion-scene]'));
    const sceneObserver = new view.IntersectionObserver((entries) => {
      for (const entry of entries) {
        const target = entry.target as HTMLElement;
        target.classList.toggle('is-active', entry.isIntersecting);
        if (entry.isIntersecting) target.classList.add('has-played');
      }
    }, { threshold: 0 });
    const revealObserver = new view.IntersectionObserver((entries) => {
      for (const entry of entries) {
        const target = entry.target as HTMLElement;
        if (entry.isIntersecting) {
          target.classList.remove('motion-pending');
          target.classList.add('is-visible');
          revealObserver.unobserve(target);
        }
      }
    }, { threshold: 0, rootMargin: '-8% 0px -35% 0px' });

    const groupedItems = new Set<HTMLElement>();
    const groups = Array.from(this.document.querySelectorAll<HTMLElement>('[data-motion-group]'));
    for (const group of groups) {
      const children = Array.from(group.querySelectorAll<HTMLElement>(':scope > [data-motion-reveal]'));
      children.forEach((item, index) => {
        groupedItems.add(item);
        item.style.setProperty('--motion-delay', String(Math.min(index * 105, 315)) + 'ms');
      });
    }

    revealItems.forEach((item) => {
      if (!groupedItems.has(item)) item.style.setProperty('--motion-delay', '0ms');
      item.classList.add('motion-ready');
      const rect = item.getBoundingClientRect();
      if (rect.top < view.innerHeight && rect.bottom > 0) {
        item.classList.add('motion-initial', 'is-visible');
      } else {
        item.classList.add('motion-pending');
        revealObserver.observe(item);
      }
    });
    scenes.forEach((scene) => {
      scene.classList.add('motion-ready');
      sceneObserver.observe(scene);
    });
    this.destroyRef.onDestroy(() => { revealObserver.disconnect(); sceneObserver.disconnect(); });
  }

  private applyAbsoluteSiteMetadata(origin: string): void {
    const baseUrl = origin.replace(/\/+$/, '');
    this.meta.updateTag({ property: 'og:url', content: baseUrl + '/' });
    this.meta.updateTag({ property: 'og:image', content: baseUrl + '/assets/hodateam-social-preview.jpg' });
    this.meta.updateTag({ name: 'twitter:image', content: baseUrl + '/assets/hodateam-social-preview.jpg' });
    const canonical =
      this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]') ??
      this.document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = baseUrl + '/';
    this.document.head.append(canonical);
  }
}
