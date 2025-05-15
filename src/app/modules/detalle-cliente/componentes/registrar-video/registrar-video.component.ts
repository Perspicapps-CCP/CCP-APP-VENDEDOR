import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { ClientesService } from 'src/app/modules/clientes/servicios/clientes.service';
import { sharedImports } from 'src/app/shared/otros/shared-imports';
import { VideoService } from '../../servicios/video.service';
import { IonModal } from '@ionic/angular/standalone';
import { GrabarVideoComponent } from '../grabar-video/grabar-video.component';

@Component({
  selector: 'app-registrar-video',
  templateUrl: './registrar-video.component.html',
  styleUrls: ['./registrar-video.component.scss'],
  imports: [ReactiveFormsModule, sharedImports, IonModal, GrabarVideoComponent],
})
export class RegistrarVideoComponent {
  @Output() closeModal = new EventEmitter<boolean>();

  videoForm = new FormGroup({
    title: new FormControl<string>('', [Validators.required]),
    description: new FormControl<string>('', [Validators.required]),
    videos: new FormControl<any>(null, [Validators.required]),
    videos_text: new FormControl<string>('', [Validators.required]),
  });

  constructor(
    private translate: TranslateService,
    private _snackBar: MatSnackBar,
    private videoService: VideoService,
    private clientesService: ClientesService,
  ) {}

  getErrorMessage(controlName: string): { key: string; params?: any } {
    if (this.videoForm.get(controlName)?.hasError('required')) {
      return {
        key: 'DETALLE_VIDEOS.CREAR_VIDEO.FORM_ERRORS.FIELD_REQUIRED',
      };
    }
    return { key: '' };
  }

  isInvalid(controlName: string) {
    return (
      this.videoForm.get(controlName)!.invalid &&
      (this.videoForm.get(controlName)!.dirty || this.videoForm.get(controlName)!.touched)
    );
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    console.log(files);

    if (files.length > 0 && this.allFilesIsVideo(files)) {
      this.translate
        .get('DETALLE_VIDEOS.CREAR_VIDEO.FORM.VIDEO_CHARGED')
        .subscribe((mensaje: string) => {
          this.videoForm.patchValue({ videos_text: `${files.length} ${mensaje}` });
        });
      this.videoForm.patchValue({ videos: files });
    } else {
      this.videoForm.patchValue({ videos: null });
      this.videoForm.patchValue({ videos_text: null });
      this.videoForm.get('videos_text')?.markAsDirty();
      this.videoForm.get('videos_text')?.markAsTouched();
    }
  }

  allFilesIsVideo(files: FileList): boolean {
    const allowedImageFormats = ['.mp4', '.webm'];

    const allIsValid = Array.from(files).every(file => {
      const fileName = file.name.toLowerCase();
      return allowedImageFormats.some(format => fileName.endsWith(format));
    });

    if (!allIsValid) {
      this.translate
        .get('DETALLE_VIDEOS.CREAR_VIDEO.FORM_ERRORS.ALL_FILES_MUST_BE_VIDEOS')
        .subscribe((mensaje: string) => {
          this._snackBar.open(mensaje, '', {
            duration: 3000,
          });
        });
    }
    return allIsValid;
  }

  crearVideo() {
    const formValue = this.videoForm.value;
    this.videoService
      .crearVideo(
        formValue.videos,
        formValue.description || '',
        formValue.title! || '',
        this.clientesService.clienteSeleccionado!.customer_id,
      )
      .subscribe({
        next: () => {
          this.translate
            .get('DETALLE_VIDEOS.CREAR_VIDEO.TOAST.SUCCESS')
            .subscribe((mensaje: string) => {
              this._snackBar.open(mensaje, '', {
                duration: 3000,
              });
            });
          this.closeModal.emit(true);
        },
        error: () => {
          this.translate
            .get('DETALLE_VIDEOS.CREAR_VIDEO.TOAST.ERROR')
            .subscribe((mensaje: string) => {
              this._snackBar.open(mensaje, '', {
                duration: 3000,
              });
            });
          this.closeModal.emit(false);
        },
      });
  }

  updateVideo(video: File | null) {
    this.translate
      .get('DETALLE_VIDEOS.CREAR_VIDEO.FORM.VIDEO_CHARGED')
      .subscribe((mensaje: string) => {
        if (video) {
          this.videoForm.patchValue({ videos: [video] });
          this.videoForm.patchValue({ videos_text: `${1} ${mensaje}` });
        }
        this.videoForm.get('videos_text')?.markAsDirty();
        this.videoForm.get('videos_text')?.markAsTouched();
      });
  }
}
