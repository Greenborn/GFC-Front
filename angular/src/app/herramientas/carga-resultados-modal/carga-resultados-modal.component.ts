import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-carga-resultados-modal',
  templateUrl: './carga-resultados-modal.component.html',
  styleUrls: ['./carga-resultados-modal.component.scss']
})
export class CargaResultadosModalComponent {
  @Input() modalController: any;
  @Input() estructura: string;
} 