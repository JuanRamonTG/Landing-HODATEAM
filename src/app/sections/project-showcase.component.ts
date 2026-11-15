import { Component, ElementRef, ViewChild, computed, signal } from '@angular/core';

interface ProjectScreen {
  readonly src: string;
  readonly title: string;
  readonly alt: string;
  readonly description: string;
}

@Component({
  selector: 'app-project-showcase',
  standalone: true,
  templateUrl: './project-showcase.component.html',
  styleUrl: './project-showcase.component.scss',
})
export class ProjectShowcaseComponent {
  @ViewChild('previewDialog') private previewDialog?: ElementRef<HTMLDialogElement>;

  protected readonly screens: readonly ProjectScreen[] = [
    { src: '/assets/stellar-inicio.webp', title: 'Pantalla de inicio', alt: 'Pantalla inicial del prototipo móvil StellarTraffic con su identidad visual', description: 'La identidad de StellarTraffic abre el prototipo móvil.' },
    { src: '/assets/stellar-leyenda.webp', title: 'Mapa de San José', alt: 'Mapa de San José en StellarTraffic con la leyenda del nivel de tráfico plegada', description: 'La vista central sitúa el mapa y mantiene sus controles a mano.' },
    { src: '/assets/stellar-zoom.webp', title: 'Leyenda de tráfico', alt: 'Vista de StellarTraffic con el mapa de San José y la leyenda de los niveles de tráfico abierta', description: 'La leyenda ayuda a leer los niveles que aparecen en el mapa.' },
    { src: '/assets/stellar-ajustar.webp', title: 'Ubicación del reporte', alt: 'Pantalla de StellarTraffic para ajustar el punto de ubicación de un reporte en el mapa', description: 'El punto se puede ajustar en el mapa antes de publicar el reporte.' },
  ];

  protected readonly activeScreen = signal(this.screens[1]);
  protected readonly activeScreenList = computed(() => [this.activeScreen()]);
  protected readonly selectedScreen = signal<ProjectScreen | null>(null);

  protected selectScreen(screen: ProjectScreen): void { this.activeScreen.set(screen); }

  protected openPreview(screen: ProjectScreen): void {
    this.selectedScreen.set(screen);
    this.previewDialog?.nativeElement.showModal();
  }

  protected closePreview(): void {
    if (this.previewDialog?.nativeElement.open) this.previewDialog.nativeElement.close();
    this.selectedScreen.set(null);
  }

  protected resetPreview(): void { this.selectedScreen.set(null); }

  protected closeOnBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closePreview();
  }
}
