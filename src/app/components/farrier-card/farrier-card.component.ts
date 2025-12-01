import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonChip } from '@ionic/angular/standalone';
import { eyeOutline, createOutline, trashOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

export interface Farrier {
  id: string | number;
  name: string;
  type: string;
  description: string;
  price: number;
  stock: number;
  supplier?: string;
  purchaseDate?: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-farrier-card',
  templateUrl: './farrier-card.component.html',
  styleUrls: ['./farrier-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonChip]
})
export class FarrierCardComponent {
  @Input() farrier!: Farrier;
  @Input() showActions: boolean = true;

  @Output() viewDetails = new EventEmitter<Farrier>();
  @Output() edit = new EventEmitter<Farrier>();
  @Output() delete = new EventEmitter<Farrier>();

  constructor() {
    addIcons({ eyeOutline, createOutline, trashOutline });
  }

  onViewDetails(): void {
    this.viewDetails.emit(this.farrier);
  }

  onEdit(): void {
    this.edit.emit(this.farrier);
  }

  onDelete(): void {
    this.delete.emit(this.farrier);
  }

  getStockStatus(): string {
    if (this.farrier.stock === 0) return 'Agotado';
    if (this.farrier.stock < 5) return 'Bajo';
    return 'Disponible';
  }

  getStockColor(): string {
    if (this.farrier.stock === 0) return 'danger';
    if (this.farrier.stock < 5) return 'warning';
    return 'success';
  }

  formattedPrice(): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(this.farrier.price);
  }

  getImageUrl(): string {
    return this.farrier.imageUrl || 'https://via.placeholder.com/150?text=Herraje';
  }
}
