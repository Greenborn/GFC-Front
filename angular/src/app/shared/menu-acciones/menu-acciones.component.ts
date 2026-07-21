import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface MenuAccionesComponentAccion {
  accion: Function;
  params?: string[];
  icon: string;
  label: string;
}

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-menu-acciones',
  templateUrl: './menu-acciones.component.html',
  styleUrls: ['./menu-acciones.component.scss'],
})
export class MenuAccionesComponent {

  @Input() acciones: MenuAccionesComponentAccion[] = [];
  @Input() onClick: Function = () => {};

  action(action: Function, params: any[]) {
    action(params)
    this.onClick()
  }

}
