import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../services/config/config.service';

@Component({
  selector: 'app-herramientas',
  templateUrl: './herramientas.page.html',
  styleUrls: ['./herramientas.page.scss']
})
export class HerramientasPage {
  constructor(private modalController: ModalController) {}

  async abrirBusquedaFotografias() {
    const modal = await this.modalController.create({
      component: BusquedaFotografiasModalComponent,
      cssClass: 'modal-full-width'
    });
    await modal.present();
  }
}

@Component({
  selector: 'app-busqueda-fotografias-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Búsqueda de Fotografías</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cerrarModal()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding">
      <!-- Nota de ayuda -->
      <ion-alert *ngIf="mostrarNota" [isOpen]="true" (didDismiss)="cerrarNota()" header="Ayuda" 
        [buttons]="['Entendido']" message="Busca fotografías por título o código. Puedes usar términos parciales para encontrar coincidencias.">
      </ion-alert>
      
      <!-- Cuadro de búsqueda -->
      <ion-searchbar 
        [(ngModel)]="terminoBusqueda" 
        placeholder="Buscar por título o código..."
        (ionInput)="onBuscar($event)"
        (keyup.enter)="realizarBusqueda()"
        show-clear-button="always">
      </ion-searchbar>
      
      <ion-button expand="block" (click)="realizarBusqueda()" [disabled]="!terminoBusqueda">
        <ion-icon name="search" slot="start"></ion-icon>
        Buscar
      </ion-button>
      
      <!-- Resultados -->
      <div *ngIf="resultados.length > 0">
        <h3>Resultados ({{ resultados.length }})</h3>
        <ion-grid>
          <ion-row>
            <ion-col *ngFor="let imagen of resultados" size="12" size-sm="6" size-md="4" size-lg="3">
              <ion-card>
                <img [src]="imagen.thumbnail_url || imagen.url" alt="{{ imagen.title }}" />
                <ion-card-header>
                  <ion-card-title>{{ imagen.title }}</ion-card-title>
                  <ion-card-subtitle>Código: {{ imagen.code }}</ion-card-subtitle>
                </ion-card-header>
                <ion-card-content>
                  <p *ngIf="imagen.description">{{ imagen.description }}</p>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>
      
      <!-- Mensaje sin resultados -->
      <div *ngIf="busquedaRealizada && resultados.length === 0" class="ion-text-center">
        <ion-icon name="search-outline" size="large"></ion-icon>
        <p>No se encontraron resultados para "{{ terminoBusqueda }}"</p>
      </div>
      
      <!-- Loading -->
      <div *ngIf="cargando" class="ion-text-center">
        <ion-spinner></ion-spinner>
        <p>Buscando...</p>
      </div>
    </ion-content>
  `
})
export class BusquedaFotografiasModalComponent {
  terminoBusqueda: string = '';
  resultados: any[] = [];
  cargando: boolean = false;
  busquedaRealizada: boolean = false;
  mostrarNota: boolean = true;

  constructor(
    private modalController: ModalController,
    private http: HttpClient,
    private config: ConfigService
  ) {}

  cerrarModal() {
    this.modalController.dismiss();
  }

  cerrarNota() {
    this.mostrarNota = false;
  }

  onBuscar(event: any) {
    this.terminoBusqueda = event.detail.value;
  }

  async realizarBusqueda() {
    if (!this.terminoBusqueda.trim()) return;
    
    this.cargando = true;
    this.busquedaRealizada = true;
    
    try {
      const url = this.config.publicApiUrl(`api/images/search?q=${encodeURIComponent(this.terminoBusqueda)}`);
      const response: any = await this.http.get(url).toPromise();
      
      this.resultados = response.data || response || [];
    } catch (error) {
      console.error('Error en búsqueda:', error);
      this.resultados = [];
    } finally {
      this.cargando = false;
    }
  }
} 