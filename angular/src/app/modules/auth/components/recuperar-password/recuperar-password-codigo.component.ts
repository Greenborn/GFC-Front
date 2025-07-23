import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-recuperar-password-codigo',
  templateUrl: './recuperar-password-codigo.component.html',
  styleUrls: ['./recuperar-password-codigo.component.scss']
})
export class RecuperarPasswordCodigoComponent {
  code: string = '';
  pass_0: string = '';
  pass_1: string = '';
  loadingCambio: boolean = false;
  errorCambio: string = '';
  email: string = '';

  constructor(private auth: AuthService, private router: Router) {
    const nav = this.router.getCurrentNavigation();
    this.email = nav?.extras?.state?.email || '';
  }

  cambiarPassword() {
    this.errorCambio = '';
    if (!this.code || !this.pass_0 || !this.pass_1) {
      this.errorCambio = 'Completa todos los campos.';
      return;
    }
    if (this.pass_0 !== this.pass_1) {
      this.errorCambio = 'Las contraseñas no coinciden.';
      return;
    }
    this.loadingCambio = true;
    this.auth.cambiarPasswordConCodigo(this.email, this.code, this.pass_0, this.pass_1).subscribe({
      next: (res: any) => {
        if (res && res.r) {
          this.router.navigate(['recuperar-password/exito']);
        } else {
          this.errorCambio = res?.error || 'No se pudo cambiar la contraseña. Verifica el código.';
        }
        this.loadingCambio = false;
      },
      error: (err) => {
        this.errorCambio = err?.error?.error || 'Error de red o del servidor.';
        this.loadingCambio = false;
      }
    });
  }
} 