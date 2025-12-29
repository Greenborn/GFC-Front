import { Component, Input, OnInit, OnChanges, ViewChild } from '@angular/core';
import { IonSlides } from '@ionic/angular';
import { FotoDelAnio } from 'src/app/models/foto-del-anio.model';
import { ConfigService } from 'src/app/services/config/config.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';
import { VerFotografiasComponent } from '../concurso-detail/ver-fotografias/ver-fotografias.component';

@Component({
  selector: 'app-fotos-anio-card',
  templateUrl: './fotos-anio-card.component.html',
  styleUrls: ['./fotos-anio-card.component.scss']
})
export class FotosAnioCardComponent implements OnInit, OnChanges {
  @Input() fotos: FotoDelAnio[] = [];
  @Input() temporada: number = 0;
  @Input() url_grabacion: string | null = null;
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

  constructor(
    public configService: ConfigService,
    private UIUtilsService: UiUtilsService
  ) {}

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

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = '../../../assets/no-pictures.png';
  }

  get aspecto() {
    return document.body.classList.contains("dark");
  }

  async slideNext() {
    if (this.slides) {
      await this.slides.slideNext();
    }
  }

  async slidePrev() {
    if (this.slides) {
      await this.slides.slidePrev();
    }
  }

  abrirFotoDetalle(index: number) {
    // Convertir las fotos del año al formato esperado por VerFotografiasComponent
    const fotosFormateadas = this.fotos.map(foto => ({
      image: {
        id: foto.id_foto,
        title: foto.nombre_obra,
        url: foto.url_imagen,
        thumbnail: foto.url_imagen,
        code: `FOTO-${foto.temporada}-${foto.orden}`,
        profile: {
          name: foto.nombre_autor.split(' ')[0] || foto.nombre_autor,
          last_name: foto.nombre_autor.split(' ').slice(1).join(' ') || ''
        }
      },
      section: null,
      metric: {
        prize: foto.puesto
      }
    }));

    this.UIUtilsService.mostrarModal(
      VerFotografiasComponent, 
      { 
        index, 
        all_data: fotosFormateadas, 
        open: false // false porque ya están finalizadas
      }, 
      true
    );
  }
}
