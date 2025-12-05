import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'firestoreDate',
  standalone: true
})
export class FirestoreDatePipe implements PipeTransform {

  transform(value: any, format: string = 'short'): string {
    if (!value) return '';

    let date: Date;

    // Handle Firestore Timestamp
    if (value && typeof value === 'object' && 'toDate' in value) {
      date = value.toDate();
    }
    // Handle regular Date object
    else if (value instanceof Date) {
      date = value;
    }
    // Handle string dates
    else if (typeof value === 'string') {
      date = new Date(value);
    }
    // Handle numbers (timestamps)
    else if (typeof value === 'number') {
      date = new Date(value);
    }
    else {
      return '';
    }

    // Format the date
    switch (format) {
      case 'short':
        return date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      case 'long':
        return date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      case 'datetime':
        return date.toLocaleString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      default:
        return date.toLocaleDateString();
    }
  }
}