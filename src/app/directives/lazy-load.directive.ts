import { Directive, ElementRef, Input, OnInit } from '@angular/core';

/**
 * Directiva para cargar imágenes de forma perezosa (lazy loading)
 * Uso: <img appLazyLoad [lazyLoadImage]="imageUrl">
 */
@Directive({
  selector: '[appLazyLoad]',
  standalone: true
})
export class LazyLoadDirective implements OnInit {
  @Input() lazyLoadImage!: string;
  @Input() lazyLoadPlaceholder: string = 'https://via.placeholder.com/200?text=Cargando...';

  constructor(private elementRef: ElementRef<HTMLImageElement>) {
    this.elementRef.nativeElement.src = this.lazyLoadPlaceholder;
  }

  ngOnInit(): void {
    if ('IntersectionObserver' in window) {
      this.setupIntersectionObserver();
    } else {
      // Fallback para navegadores que no soportan IntersectionObserver
      this.loadImage();
    }
  }

  private setupIntersectionObserver(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.loadImage();
            observer.unobserve(this.elementRef.nativeElement);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(this.elementRef.nativeElement);
  }

  private loadImage(): void {
    const img = new Image();
    img.src = this.lazyLoadImage;
    img.onload = () => {
      this.elementRef.nativeElement.src = this.lazyLoadImage;
      this.elementRef.nativeElement.classList.add('loaded');
    };
    img.onerror = () => {
      console.error(`Error loading image: ${this.lazyLoadImage}`);
      this.elementRef.nativeElement.src = this.lazyLoadPlaceholder;
    };
  }
}
