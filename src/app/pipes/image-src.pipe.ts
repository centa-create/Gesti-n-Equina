import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe personalizado para optimizar URLs de imágenes
 * Uso: {{ imageUrl | imageSrc: width: height }}
 * Ejemplo: {{ 'image.jpg' | imageSrc: 400: 300 }}
 */
@Pipe({
  name: 'imageSrc',
  standalone: true
})
export class ImageSrcPipe implements PipeTransform {
  /**
   * Transforma una URL de imagen aplicando optimización
   * Si es una URL de placeholder, ajusta el tamaño
   * @param value URL de la imagen
   * @param width Ancho deseado
   * @param height Alto deseado
   */
  transform(value: string, width: number = 400, height: number = 300): string {
    if (!value) {
      return `https://via.placeholder.com/${width}x${height}?text=Sin+imagen`;
    }

    // Si es una URL de placeholder, ajustar tamaño
    if (value.includes('placeholder.com')) {
      return `https://via.placeholder.com/${width}x${height}`;
    }

    // Para otras URLs, retornar tal cual (podrías agregar lógica adicional aquí)
    return value;
  }
}
