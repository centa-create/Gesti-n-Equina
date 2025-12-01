import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonBadge } from '@ionic/angular/standalone';
import { callOutline, mailOutline, eyeOutline, createOutline, trashOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

export interface Rider {
  id: string | number;
  name: string;
  specialty: string;
  phone?: string;
  email?: string;
  experience?: number;
  hourlyRate?: number;
  availability?: boolean;
}

@Component({
  selector: 'app-rider-card',
  templateUrl: './rider-card.component.html',
  styleUrls: ['./rider-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonBadge]
})
export class RiderCardComponent {
  @Input() rider!: Rider;
  @Input() showActions: boolean = true;

  @Output() viewDetails = new EventEmitter<Rider>();
  @Output() edit = new EventEmitter<Rider>();
  @Output() delete = new EventEmitter<Rider>();
  @Output() contact = new EventEmitter<Rider>();

  constructor() {
    addIcons({ callOutline, mailOutline, eyeOutline, createOutline, trashOutline });
  }

  onViewDetails(): void {
    this.viewDetails.emit(this.rider);
  }

  onEdit(): void {
    this.edit.emit(this.rider);
  }

  onDelete(): void {
    this.delete.emit(this.rider);
  }

  onContact(): void {
    this.contact.emit(this.rider);
  }

  getAvailabilityColor(): string {
    return this.rider.availability ? 'success' : 'danger';
  }

  getAvailabilityText(): string {
    return this.rider.availability ? 'Disponible' : 'No disponible';
  }

  formattedRate(): string {
    if (!this.rider.hourlyRate) return 'N/A';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(this.rider.hourlyRate);
  }
}
