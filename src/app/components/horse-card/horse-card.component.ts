import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonChip } from '@ionic/angular/standalone';
import { eyeOutline, createOutline, trashOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

export interface Horse {
  id: string | number;
  name: string;
  race: string;
  age: number;
  color: string;
  imageUrl?: string;
  healthStatus?: string;
  owner?: string;
  birthDate?: string;
}

@Component({
  selector: 'app-horse-card',
  templateUrl: './horse-card.component.html',
  styleUrls: ['./horse-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonChip]
})
export class HorseCardComponent {
  @Input() horse!: Horse;
  @Input() showActions: boolean = true;

  @Output() viewDetails = new EventEmitter<Horse>();
  @Output() edit = new EventEmitter<Horse>();
  @Output() delete = new EventEmitter<Horse>();

  constructor() {
    addIcons({ eyeOutline, createOutline, trashOutline });
  }

  onViewDetails(): void {
    this.viewDetails.emit(this.horse);
  }

  onEdit(): void {
    this.edit.emit(this.horse);
  }

  onDelete(): void {
    this.delete.emit(this.horse);
  }

  getHealthStatusColor(): string {
    if (!this.horse.healthStatus) return 'medium';
    switch (this.horse.healthStatus.toLowerCase()) {
      case 'bueno':
      case 'excelente':
        return 'success';
      case 'regular':
        return 'warning';
      case 'malo':
      case 'crítico':
        return 'danger';
      default:
        return 'medium';
    }
  }

  getImageUrl(): string {
    return this.horse.imageUrl || 'https://via.placeholder.com/200?text=Caballo';
  }
}
