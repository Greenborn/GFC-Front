import { Component, Input, OnInit, OnChanges, ViewChild } from '@angular/core';
import { IonSlides } from '@ionic/angular';
import { FotoDelAnio } from 'src/app/models/foto-del-anio.model';
import { ConfigService } from 'src/app/services/config/config.service';

@Component({
  selector: 'app-fotos-anio-card',
  templateUrl: './fotos-anio-card.component.html',
  styleUrls: ['./fotos-anio-card.component.scss']
})
export class FotosAnioCardComponent implements OnInit, OnChanges {
  @Input() fotos: FotoDelAnio[] = [];
  @Input() temporada: number = 0;
  @ViewChild('slides', { static: false }) slides: IonSlides;

  slideOpts = {
    initialSlide: 0,
    speed: 400,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    }
  };

  constructor(public configService: ConfigService) {}

  ngOnInit() {
    console.log('=== COMPONENTE FOTOS AÑO INICIALIZADO ===');
    console.log('Fotos recibidas:', this.fotos);
    console.log('Cantidad de fotos:', this.fotos?.length);
    console.log('Temporada:', this.temporada);
  }

  ngOnChanges() {
    console.log('=== CAMBIOS EN INPUTS ===');
    console.log('Fotos:', this.fotos);
    console.log('Temporada:', this.temporada);
  }

  getImageUrl(url: string): string {
    if (!url) return '';
    const fullUrl = this.configService.imageUrl(url) || '';
    console.log('URL imagen:', url, '->', fullUrl);
    return fullUrl;
  }

  get aspecto() {
    return document.body.classList.contains("dark");
  }
}
