import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-profile-image-modal',
  templateUrl: './profile-image-modal.component.html',
  styleUrls: ['./profile-image-modal.component.scss'],
})
export class ProfileImageModalComponent implements OnDestroy {
  dismiss: (data?: any) => void;

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  error: string | null = null;

  showWebcam = false;
  webcamStream: MediaStream | null = null;

  private readonly MAX_SIZE = 10 * 1024 * 1024;
  private readonly DESKTOP_BREAKPOINT = 768;

  @ViewChild('videoElement') videoElement: ElementRef<HTMLVideoElement>;

  get isDesktop(): boolean {
    return window.innerWidth > this.DESKTOP_BREAKPOINT;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.validateAndPreview(file);
    input.value = '';
  }

  triggerCamera() {
    if (this.isDesktop) {
      this.startWebcam();
    } else {
      this.triggerInput('camera');
    }
  }

  triggerGallery() {
    this.triggerInput('gallery');
  }

  private triggerInput(type: 'camera' | 'gallery') {
    const el = document.getElementById(type === 'camera' ? 'file-input-camera' : 'file-input-gallery') as HTMLInputElement;
    el?.click();
  }

  async startWebcam() {
    this.stopWebcam();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.webcamStream = stream;
      this.showWebcam = true;
      this.error = null;

      setTimeout(() => {
        if (this.videoElement?.nativeElement) {
          this.videoElement.nativeElement.srcObject = stream;
        }
      });
    } catch (err) {
      this.error = 'No se pudo acceder a la cámara. Verificá los permisos.';
      this.showWebcam = false;
    }
  }

  captureWebcamSnapshot() {
    const video = this.videoElement?.nativeElement;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;

      const file = new File([blob], 'webcam_photo.jpg', { type: 'image/jpeg' });
      this.stopWebcam();
      this.validateAndPreview(file);
    }, 'image/jpeg', 0.92);
  }

  stopWebcam() {
    if (this.webcamStream) {
      this.webcamStream.getTracks().forEach(t => t.stop());
      this.webcamStream = null;
    }
    this.showWebcam = false;
  }

  private validateAndPreview(file: File) {
    this.error = null;

    if (!file.type.startsWith('image/')) {
      this.error = 'Solo se permiten imágenes';
      return;
    }

    if (file.size > this.MAX_SIZE) {
      this.error = 'La imagen no debe superar los 10MB';
      return;
    }

    this.selectedFile = file;

    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }
    this.previewUrl = URL.createObjectURL(file);
  }

  confirm() {
    if (!this.selectedFile) return;
    this.stopWebcam();
    this.dismiss({ file: this.selectedFile });
  }

  cancel() {
    this.stopWebcam();
    this.dismiss();
  }

  ngOnDestroy() {
    this.stopWebcam();
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }
  }
}
