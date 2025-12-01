import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventosService } from '../../services/eventos.service';
import { CriaderoActivoService } from '../../services/criadero-activo.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, IonicModule, FullCalendarModule],
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarPage {
  criaderoActivo: any = null;
  calendarOptions: any;

  constructor(
    private eventosService: EventosService,
    private criaderoService: CriaderoActivoService
  ) {
    this.criaderoService.criaderoActivo$.subscribe(c => {
      this.criaderoActivo = c;
      this.loadEventos();
    });
  }

  loadEventos() {
    if (!this.criaderoActivo) return;

    this.eventosService.getEventosByCriadero(this.criaderoActivo.id).subscribe({
      next: (eventos) => {
        this.calendarOptions = {
          plugins: [dayGridPlugin, interactionPlugin],
          initialView: 'dayGridMonth',
          events: eventos.map((e: any) => ({
            id: e.id,
            title: e.nombre,
            start: e.fecha
          })),
          dateClick: (info: any) => {
            const nombre = prompt('Nombre del evento:');
            if (nombre && this.criaderoActivo) {
              const nuevoEvento: Omit<any, 'id'> = {
                nombre,
                fecha: info.dateStr + 'T12:00:00.000Z',
                criaderoId: this.criaderoActivo.id,
                tipo: 'otro' as const,
                estado: 'programado' as const
              };
              this.eventosService.agregarEvento(nuevoEvento).subscribe(() => {
                this.loadEventos();
              });
            }
          },
          eventClick: (info: any) => {
            if (confirm(`¿Eliminar evento "${info.event.title}"?`)) {
              this.eventosService.eliminarEvento(Number(info.event.id)).subscribe(() => {
                this.loadEventos();
              });
            }
          }
        };
      },
      error: (err) => {
        console.error('Error cargando eventos para calendario:', err);
      }
    });
  }
}