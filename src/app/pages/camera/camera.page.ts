import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { cameraOutline, imagesOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { CameraService, CapturedPhoto } from '../../services/camera.service';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.page.html',
  styleUrls: ['./camera.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class CameraPage implements OnInit {
  // Icon bindings para la plantilla
  cameraOutline = cameraOutline;
  imagesOutline = imagesOutline;
  capturedPhotos: CapturedPhoto[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private cameraService: CameraService,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ cameraOutline, imagesOutline });
  }

  ngOnInit(): void {
    this.loadSavedPhotos();
  }

  async takePhoto(): Promise<void> {
    try {
      this.isLoading = true;
      this.errorMessage = '';
      this.cdr.markForCheck();

      const photo = await this.cameraService.takePhoto(false);
      this.capturedPhotos.push(photo);
      this.savePhotos();

      this.cdr.markForCheck();
    } catch (error: any) {
      this.errorMessage = 'Error al capturar foto. Verifica los permisos de cámara.';
      console.error('Error:', error);
      this.cdr.markForCheck();
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  async pickFromGallery(): Promise<void> {
    try {
      this.isLoading = true;
      this.errorMessage = '';
      this.cdr.markForCheck();

      const photo = await this.cameraService.pickPhotoFromGallery();
      this.capturedPhotos.push(photo);
      this.savePhotos();

      this.cdr.markForCheck();
    } catch (error: any) {
      this.errorMessage = 'Error al seleccionar foto de la galería.';
      console.error('Error:', error);
      this.cdr.markForCheck();
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  removePhoto(index: number): void {
    this.capturedPhotos.splice(index, 1);
    this.savePhotos();
    this.cdr.markForCheck();
  }

  private savePhotos(): void {
    localStorage.setItem('capturedPhotos', JSON.stringify(this.capturedPhotos));
  }

  private loadSavedPhotos(): void {
    const saved = localStorage.getItem('capturedPhotos');
    if (saved) {
      try {
        this.capturedPhotos = JSON.parse(saved);
        this.cdr.markForCheck();
      } catch (error) {
        console.error('Error loading saved photos:', error);
      }
    }
  }

  clearAllPhotos(): void {
    this.capturedPhotos = [];
    localStorage.removeItem('capturedPhotos');
    this.cdr.markForCheck();
  }
}
