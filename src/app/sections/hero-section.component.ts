import { afterNextRender, Component, DestroyRef, ElementRef, Inject, NgZone } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.scss',
})
export class HeroSectionComponent {
  constructor(
    host: ElementRef<HTMLElement>,
    zone: NgZone,
    destroyRef: DestroyRef,
    @Inject(DOCUMENT) document: Document,
  ) {
    afterNextRender(() => {
      const view = document.defaultView;
      const motionTarget = host.nativeElement.querySelector<HTMLElement>('.hero__motion');
      if (
        !view ||
        !motionTarget ||
        view.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        !view.matchMedia('(pointer: fine)').matches
      ) {
        return;
      }

      let frame = 0;
      const moveWithPointer = (event: PointerEvent) => {
        if (event.pointerType === 'touch') return;
        if (frame) view.cancelAnimationFrame(frame);
        frame = view.requestAnimationFrame(() => {
          frame = 0;
          const bounds = motionTarget.getBoundingClientRect();
          if (!bounds.width || !bounds.height) return;
          const horizontal = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
          const vertical = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
          motionTarget.style.setProperty('--phone-tilt-x', `${(horizontal * 4.2).toFixed(2)}deg`);
          motionTarget.style.setProperty('--phone-tilt-y', `${(vertical * -3.4).toFixed(2)}deg`);
          motionTarget.style.setProperty('--phone-shift-x', `${(horizontal * 4).toFixed(1)}px`);
          motionTarget.style.setProperty('--phone-shift-y', `${(vertical * 4).toFixed(1)}px`);
        });
      };
      const resetPosition = () => {
        if (frame) view.cancelAnimationFrame(frame);
        frame = view.requestAnimationFrame(() => {
          frame = 0;
          motionTarget.style.setProperty('--phone-tilt-x', '0deg');
          motionTarget.style.setProperty('--phone-tilt-y', '0deg');
          motionTarget.style.setProperty('--phone-shift-x', '0px');
          motionTarget.style.setProperty('--phone-shift-y', '0px');
        });
      };

      zone.runOutsideAngular(() => {
        motionTarget.addEventListener('pointermove', moveWithPointer, { passive: true });
        motionTarget.addEventListener('pointerleave', resetPosition, { passive: true });
      });
      destroyRef.onDestroy(() => {
        if (frame) view.cancelAnimationFrame(frame);
        motionTarget.removeEventListener('pointermove', moveWithPointer);
        motionTarget.removeEventListener('pointerleave', resetPosition);
      });
    });
  }
}
