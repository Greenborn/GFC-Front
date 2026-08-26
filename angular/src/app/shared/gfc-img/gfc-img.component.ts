import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { ConfigService } from '../../services/config/config.service';

export type GfcImgPriority = 'eager' | 'lazy' | 'auto';
export type GfcImgFetchPriority = 'high' | 'low' | 'auto';

@Component({
  standalone: true,
  selector: 'app-gfc-img',
  templateUrl: './gfc-img.component.html',
  styleUrls: ['./gfc-img.component.scss']
})
export class GfcImgComponent implements OnChanges {

  /** URL absoluta o recurso. Si `srcIsConfig=true` se resuelve con ConfigService.imageUrl(). */
  @Input() src = '';

  /** Si true, `src` es un recurso relativo que se completa con imagesBaseUrl. */
  @Input() srcIsConfig = false;

  @Input() alt = '';

  /** Estrategia de carga: eager (LCP), lazy o auto. */
  @Input() priority: GfcImgPriority = 'auto';

  /** fetchpriority del <img>: high para la imagen LCP, low/auto para el resto. */
  @Input() fetchpriority: GfcImgFetchPriority = 'auto';

  /** Proporción para reservar espacio y evitar CLS, p.ej. "1 / 1", "16 / 9". Si 'auto', no se reserva. */
  @Input() aspectRatio = 'auto';

  /** Altura fija (CSS) del contenedor para reservar espacio y evitar CLS, p.ej. "220px". */
  @Input() height = '';

  /** object-fit de la imagen: cover / contain / fill. */
  @Input() objectFit = 'cover';

  /** Clases aplicadas al <img> interno (permite reusar estilos existentes). */
  @Input() imgClass = '';

  /** Icono bootstrap mostrado como placeholder mientras carga o ante error. */
  @Input() placeholderIcon = 'bi bi-image';

  /** Ruta de imagen de respaldo (no-config) cuando falla la carga. */
  @Input() fallback = '';

  /** Clases extra de la host. */
  @Input() hostClass = '';

  imgUrl = '';
  loading = true;
  error = false;

  private config = inject(ConfigService);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['src'] || changes['srcIsConfig']) {
      this.resolveSrc();
    }
  }

  private resolveSrc() {
    this.error = false;
    this.loading = true;
    const raw = this.src ?? '';
    this.imgUrl = this.srcIsConfig
      ? this.config.imageUrl(raw)
      : raw;
  }

  onError() {
    this.error = true;
    this.loading = false;
  }

  onLoad() {
    this.loading = false;
  }

  get isFixed(): boolean {
    return (this.aspectRatio !== 'auto' && this.aspectRatio !== '') || this.height !== '';
  }

  get showImage(): boolean {
    return !!this.imgUrl && !this.error;
  }

  get showFallback(): boolean {
    return !!this.fallback && this.error;
  }

  get finalSrc(): string {
    if (this.showFallback) {
      return this.fallback;
    }
    return this.imgUrl;
  }

  get loadingAttr(): string {
    return this.priority === 'eager' ? 'eager' : 'lazy';
  }

  get decodingAttr(): string {
    return 'async';
  }

  get fetchPriorityAttr(): string {
    return this.fetchpriority;
  }

  get hostClassStr(): string {
    return (this.isFixed ? 'gfc-img--fixed ' : '') + this.hostClass;
  }
}
