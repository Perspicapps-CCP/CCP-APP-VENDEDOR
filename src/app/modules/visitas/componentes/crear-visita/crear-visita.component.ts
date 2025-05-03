import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, map, Observable, OperatorFunction } from 'rxjs';
import { Cliente } from 'src/app/modules/clientes/interfaces/cliente.interface';
import { ClientesService } from 'src/app/modules/clientes/servicios/clientes.service';
import { sharedImports } from 'src/app/shared/otros/shared-imports';
import { VisitasService } from '../../servicios/visitas.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-crear-visita',
  templateUrl: './crear-visita.component.html',
  styleUrls: ['./crear-visita.component.scss'],
  imports: [ReactiveFormsModule, sharedImports],
})
export class CrearVisitaComponent implements OnInit {
  @Output() closeModal = new EventEmitter<boolean>();

  visitaForm = new FormGroup({
    client: new FormControl<Cliente | null>(null, [Validators.required]),
    description: new FormControl<string>('', [Validators.required]),
    images: new FormControl<any>(null, [Validators.required]),
    images_text: new FormControl<string>('', [Validators.required]),
  });

  clientes: Cliente[] = [];

  constructor(
    private translate: TranslateService,
    private clientesService: ClientesService,
    private visitasService: VisitasService,
    private _snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.obtenerClientes();
  }

  obtenerClientes() {
    this.clientesService.obtenerClientes().subscribe((clientes: Cliente[]) => {
      this.clientes = clientes;
    });
  }

  searchClientes: OperatorFunction<string, readonly { customer_name: string }[]> = (
    text$: Observable<string>,
  ) =>
    text$.pipe(
      debounceTime(200),
      map(term =>
        term.length < 2
          ? []
          : this.clientes
              .filter(cliente => new RegExp(term, 'mi').test(cliente.customer_name))
              .slice(0, 5),
      ),
    );

  formatter = (x: { customer_name: string }) => x.customer_name;

  getErrorMessage(controlName: string): { key: string; params?: any } {
    if (this.visitaForm.get(controlName)?.hasError('required')) {
      return {
        key: 'VISITAS.CREAR_VISITA.FORM_ERRORS.FIELD_REQUIRED',
      };
    }
    return { key: '' };
  }

  isInvalid(controlName: string) {
    return (
      this.visitaForm.get(controlName)!.invalid &&
      (this.visitaForm.get(controlName)!.dirty || this.visitaForm.get(controlName)!.touched)
    );
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files.length > 0 && this.allFilesIsImage(files)) {
      this.translate
        .get('VISITAS.CREAR_VISITA.FORM.IMAGES_CHARGED')
        .subscribe((mensaje: string) => {
          this.visitaForm.patchValue({ images_text: `${files.length} ${mensaje}` });
        });
      this.visitaForm.patchValue({ images: files });
    } else {
      this.visitaForm.patchValue({ images: null });
      this.visitaForm.patchValue({ images_text: null });
      this.visitaForm.get('images_text')?.markAsDirty();
      this.visitaForm.get('images_text')?.markAsTouched();
    }
  }

  allFilesIsImage(files: FileList): boolean {
    const allowedImageFormats = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];

    const allIsValid = Array.from(files).every(file => {
      const fileName = file.name.toLowerCase();
      return allowedImageFormats.some(format => fileName.endsWith(format));
    });

    if (!allIsValid) {
      this.translate
        .get('VISITAS.CREAR_VISITA.FORM_ERRORS.ALL_FILES_MUST_BE_IMAGES')
        .subscribe((mensaje: string) => {
          this._snackBar.open(mensaje, '', {
            duration: 3000,
          });
        });
    }
    return allIsValid;
  }

  crearVisita() {
    const formValue = this.visitaForm.value;
    this.visitasService
      .registrarVisita(formValue.images, formValue.description || '', formValue.client!)
      .subscribe({
        next: () => {
          this.translate.get('VISITAS.CREAR_VISITA.TOAST.SUCCESS').subscribe((mensaje: string) => {
            this._snackBar.open(mensaje, '', {
              duration: 3000,
            });
          });
          this.closeModal.emit(true);
        },
        error: () => {
          this.translate.get('VISITAS.CREAR_VISITA.TOAST.ERROR').subscribe((mensaje: string) => {
            this._snackBar.open(mensaje, '', {
              duration: 3000,
            });
          });
          this.closeModal.emit(false);
        },
      });
  }
}
