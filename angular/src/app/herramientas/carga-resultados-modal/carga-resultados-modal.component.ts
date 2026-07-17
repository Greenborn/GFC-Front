import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-carga-resultados-modal',
  templateUrl: './carga-resultados-modal.component.html',
  styleUrls: ['./carga-resultados-modal.component.scss']
})
export class CargaResultadosModalComponent {
  @Input() modalController: any;
  @Input() estructura: string;
} 