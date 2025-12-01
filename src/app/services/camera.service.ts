import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export interface CapturedPhoto {
  webPath?: string;
  path?: string;
  base64String?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  constructor() { }

  /**
   * Captura una foto desde la cámara del dispositivo
   * @param useLibrary Si true, abre la galería; si false, abre la cámara
   * @returns Promise con la foto capturada
   */
  async takePhoto(useLibrary: boolean = false): Promise<CapturedPhoto> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: useLibrary ? CameraSource.Photos : CameraSource.Camera
      });

      return {
        webPath: image.webPath,
        path: image.path,
        base64String: image.base64String
      };
    } catch (error) {
      console.error('Error capturando foto:', error);
      throw error;
    }
  }

  /**
   * Captura una foto con edición habilitada
   */
  async takePhotoWithEdit(): Promise<CapturedPhoto> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });

      return {
        webPath: image.webPath,
        path: image.path,
        base64String: image.base64String
      };
    } catch (error) {
      console.error('Error capturando foto con edición:', error);
      throw error;
    }
  }

  /**
   * Captura una foto como base64 (útil para enviar a servidor)
   */
  async takePhotoAsBase64(): Promise<string> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });

      return image.base64String || '';
    } catch (error) {
      console.error('Error capturando foto en base64:', error);
      throw error;
    }
  }

  /**
   * Selecciona una foto de la galería
   */
  async pickPhotoFromGallery(): Promise<CapturedPhoto> {
    return this.takePhoto(true);
  }
}
