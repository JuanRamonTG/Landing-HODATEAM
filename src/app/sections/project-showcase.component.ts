import { Component, ElementRef, ViewChild, signal } from '@angular/core';

interface ProjectScreen {
  readonly src: string;
  readonly title: string;
  readonly alt: string;
}

@Component({
  selector: 'app-project-showcase',
  standalone: true,
  templateUrl: './project-showcase.component.html',
  styleUrl: './project-showcase.component.scss',
})
export class ProjectShowcaseComponent {
  @ViewChild('previewDialog') private previewDialog?: ElementRef<HTMLDialogElement>;

  protected readonly selectedScreen = signal<ProjectScreen | null>(null);
  protected readonly screens: readonly ProjectScreen[] = [
    {
      src: '/assets/stellar-inicio.webp',
      title: 'Inicio de StellarTraffic',
      alt: 'Pantalla de inicio del prototipo móvil StellarTraffic con su identidad visual y el texto Sistema Inteligente de Seguridad Vial',
    },
    {
      src: '/assets/stellar-leyenda.webp',
      title: 'Mapa con la leyenda plegada',
      alt: 'Mapa de San José en StellarTraffic con la leyenda del nivel de tráfico plegada',
    },
    {
      src: '/assets/stellar-zoom.webp',
      title: 'Mapa con la leyenda de tráfico',
      alt: 'Vista de StellarTraffic con el mapa de San José y la leyenda de los niveles de tráfico abierta',
    },
    {
      src: '/assets/stellar-ajustar.webp',
      title: 'Ajustar la ubicación del reporte',
      alt: 'Pantalla de StellarTraffic para ajustar el punto de ubicación de un reporte en el mapa',
    },
  ];

  protected openPreview(screen: ProjectScreen): void {
    this.selectedScreen.set(screen);
    this.previewDialog?.nativeElement.showModal();
  }

  protected closePreview(): void {
    if (this.previewDialog?.nativeElement.open) {
      this.previewDialog.nativeElement.close();
    }
    this.selectedScreen.set(null);
  }

  protected resetPreview(): void {
    this.selectedScreen.set(null);
  }

  protected closeOnBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closePreview();
  }
}
