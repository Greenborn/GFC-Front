import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-recuperar-password-solicitud',
  templateUrl: './recuperar-password-solicitud.component.html',
  styleUrls: ['./recuperar-password-solicitud.component.scss']
})
export class RecuperarPasswordSolicitudComponent {
  email: string = '';
  loading: boolean = false;
  error: string = '';

  constructor(private auth: AuthService, private router: Router) {}

  solicitarCodigo() {
    this.error = '';
    this.loading = true;
    this.auth.solicitarRecuperacionPassword(this.email).subscribe({
      next: (res: any) => {
        if (res && res.r) {
          this.router.navigate(['recuperar-password/codigo'], { state: { email: this.email } });
        } else {
          this.error = res?.error || 'No se pudo enviar el código. Intenta nuevamente.';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.error || 'Error de red o del servidor.';
        this.loading = false;
      }
    });
  }
} 