import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonBadge } from '@ionic/angular/standalone';
import { addCircleOutline, removeCircleOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

export interface Product {
  id: string | number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  quantity?: number;
}

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonBadge]
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() quantity: number = 1;
  @Input() showQuantityControls: boolean = true;

  @Output() addToCart = new EventEmitter<Product>();
  @Output() quantityChange = new EventEmitter<number>();
  @Output() removeFromCart = new EventEmitter<Product>();

  constructor() {
    addIcons({ addCircleOutline, removeCircleOutline });
  }

  onAddToCart(): void {
    this.addToCart.emit(this.product);
  }

  onRemoveFromCart(): void {
    this.removeFromCart.emit(this.product);
  }

  increaseQuantity(): void {
    this.quantity++;
    this.quantityChange.emit(this.quantity);
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
      this.quantityChange.emit(this.quantity);
    }
  }

  formattedPrice(): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(this.product.price);
  }
}
