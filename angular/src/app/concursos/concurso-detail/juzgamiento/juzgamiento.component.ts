import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contest } from 'src/app/models/contest.model';
import { ContestResultExpanded } from 'src/app/models/contest_result.model';
import { ConcursoDetailService } from '../concurso-detail.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ContestResultsService } from 'src/app/services/contest-results.service';
import { ContestPreselectedPhotoService } from 'src/app/services/contest-preselected-photo.service';
import { ContestPreselectedPhoto } from 'src/app/models/contest-preselected-photo.model';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';
import { ZoomableImageComponent } from 'src/app/shared/zoomable-image/zoomable-image.component';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  imports: [CommonModule, ZoomableImageComponent],
  selector: 'app-juzgamiento',
  templateUrl: './juzgamiento.component.html',
  styleUrls: ['./juzgamiento.component.scss'],
})
export class JuzgamientoComponent implements OnInit, OnDestroy {

  concurso: Contest;
  resultados: ContestResultExpanded[] = [];
  currentIndex: number = 0;
  preseleccionadas: ContestPreselectedPhoto[] = [];
  isFullscreen: boolean = false;
  controlesVisibles: boolean = true;
  mostrarVotoFs: boolean = false;

  private subs: Subscription[] = [];
  private controlesTimer: any = null;
  private votoFsTimer: any = null;
  private loadedContestId: number | null = null;

  constructor(
    public concursoDetailService: ConcursoDetailService,
    public configService: ConfigService,
    private contestResultsService: ContestResultsService,
    private contestPreselectedPhotoService: ContestPreselectedPhotoService,
    private authService: AuthService,
    public UIUtilsService: UiUtilsService,
  ) {
    this.concurso = this.concursoDetailService.concurso.getValue();
  }

  ngOnInit() {
    this.subs.push(
      this.concursoDetailService.concurso.subscribe({
        next: c => {
          this.concurso = c;
          this.ensureResults();
          this.ensurePreseleccionadas();
        }
      })
    );
    this.subs.push(
      this.contestResultsService.resultadosConcursoGeted.subscribe({
        next: rs => {
          if (this.loadedContestId !== this.concurso?.id) return;
          this.resultados = rs?.items ?? [];
          if (this.currentIndex >= this.resultados.length) {
            this.currentIndex = Math.max(0, this.resultados.length - 1);
          }
        }
      })
    );
    this.ensureResults();
    this.ensurePreseleccionadas();
  }

  private ensurePreseleccionadas() {
    if (this.concurso?.judging_stage !== 'preseleccion' || !this.concurso?.id) return;
    this.recargarPreseleccion();
  }

  private recargarPreseleccion() {
    if (this.concurso?.judging_stage !== 'preseleccion' || !this.concurso?.id) return;
    this.contestPreselectedPhotoService.list(this.concurso.id).then(items => {
      this.preseleccionadas = items ?? [];
    });
  }

  private ensureResults() {
    const id = this.concurso?.id;
    if (!id) return;
    this.loadedContestId = id;
    this.contestResultsService.get_all({ contest_id: id });
  }

  get hasPhotos(): boolean {
    return this.resultados.length > 0;
  }

  get current(): ContestResultExpanded | null {
    return this.hasPhotos ? this.resultados[this.currentIndex] : null;
  }

  get currentSrc(): string {
    const url = this.current?.image?.url;
    return url != null ? this.configService.imageUrl(url) : '';
  }

  get currentTitle(): string {
    return this.current?.image?.title ?? '';
  }

  get etapaJuzgamiento(): string {
    switch (this.concurso?.judging_stage) {
      case 'preseleccion': return 'Preselección';
      case 'puntuacion': return 'Puntuación';
      default: return 'En juzgamiento';
    }
  }

  get etapaJuzgamientoIcono(): string {
    switch (this.concurso?.judging_stage) {
      case 'preseleccion': return 'bi bi-eye';
      case 'puntuacion': return 'bi bi-star';
      default: return 'bi bi-shield-check';
    }
  }

  get esPreseleccion(): boolean {
    return this.concurso?.judging_stage === 'preseleccion' && this.hasPhotos;
  }

  onFullscreenChange(fs: boolean) {
    this.isFullscreen = fs;
    if (fs) {
      this.controlesVisibles = false;
      this.mostrarVotoFs = false;
    } else {
      this.controlesVisibles = true;
      this.mostrarVotoFs = false;
      this.limpiarControlesTimer();
      this.limpiarVotoFsTimer();
    }
  }

  private mostrarVotoTemporalmente() {
    this.mostrarVotoFs = true;
    this.limpiarVotoFsTimer();
    this.votoFsTimer = setTimeout(() => {
      this.mostrarVotoFs = false;
      this.votoFsTimer = null;
    }, 2500);
  }

  private limpiarVotoFsTimer() {
    if (this.votoFsTimer != null) {
      clearTimeout(this.votoFsTimer);
      this.votoFsTimer = null;
    }
  }

  toggleControles() {
    if (!this.isFullscreen) return;
    this.controlesVisibles = !this.controlesVisibles;
    if (this.controlesVisibles) {
      this.limpiarControlesTimer();
      this.controlesTimer = setTimeout(() => {
        this.controlesVisibles = false;
        this.controlesTimer = null;
      }, 4000);
    }
  }

  private limpiarControlesTimer() {
    if (this.controlesTimer != null) {
      clearTimeout(this.controlesTimer);
      this.controlesTimer = null;
    }
  }

  get currentPhotoId(): number | null {
    return this.current?.image?.id ?? this.current?.image_id ?? null;
  }

  get currentContestId(): number | null {
    return this.current?.contest_id ?? this.concurso?.id ?? null;
  }

  get preseleccionDeFotoActual(): ContestPreselectedPhoto | null {
    const imageId = this.currentPhotoId;
    if (imageId == null) return null;
    return this.preseleccionadas.find(p => p.image_id === imageId) ?? null;
  }

  get votosDeFotoActual(): number {
    return this.preseleccionDeFotoActual?.vote_count ?? 0;
  }

  get votoPropioDeFotoActual(): 'aceptar' | 'rechazar' | null {
    return this.preseleccionDeFotoActual?.my_vote ?? null;
  }

  get fotoAceptada(): boolean {
    return this.votoPropioDeFotoActual === 'aceptar';
  }

  get fotoRechazada(): boolean {
    return this.votoPropioDeFotoActual === 'rechazar';
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'h' || event.key === 'H') {
      if (this.isFullscreen) {
        event.preventDefault();
        this.toggleControles();
      }
      return;
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.anterior();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.siguiente();
    } else if (!this.esPreseleccion) {
      return;
    } else if (event.key === '1') {
      event.preventDefault();
      this.aceptar();
    } else if (event.key === '2') {
      event.preventDefault();
      this.rechazar();
    }
  }

  private async votar(preselected: boolean) {
    if (!this.esPreseleccion) return;
    const contestId = this.currentContestId;
    const imageId = this.currentPhotoId;
    if (contestId == null || imageId == null) {
      this.UIUtilsService.mostrarToast(undefined, {
        message: 'No se pudo identificar la fotografía',
        duration: 2000,
        position: 'top',
        color: 'danger',
      });
      return;
    }

    const result = await this.contestPreselectedPhotoService.votar(contestId, imageId, preselected);
    if (!result) {
      this.UIUtilsService.mostrarToast(undefined, {
        message: 'No se pudo guardar el voto',
        duration: 2000,
        position: 'top',
        color: 'danger',
      });
      return;
    }

    this.actualizarPreseleccionLocal(result);
    if (this.isFullscreen) {
      this.mostrarVotoTemporalmente();
    }

    this.UIUtilsService.mostrarToast(undefined, {
      message: preselected ? 'Fotografía aceptada' : 'Fotografía rechazada',
      duration: 1500,
      position: 'top',
      color: preselected ? 'success' : 'danger',
    });
  }

  private actualizarPreseleccionLocal(result: ContestPreselectedPhoto) {
    const idx = this.preseleccionadas.findIndex(p => p.image_id === result.image_id);
    if (idx >= 0) {
      this.preseleccionadas[idx] = result;
    } else {
      this.preseleccionadas.push(result);
    }
  }

  aceptar() {
    this.votar(true);
  }

  rechazar() {
    this.votar(false);
  }

  anterior() {
    if (!this.hasPhotos) return;
    this.currentIndex--;
    if (this.currentIndex < 0) this.currentIndex = this.resultados.length - 1;
    this.recargarPreseleccion();
  }

  siguiente() {
    if (!this.hasPhotos) return;
    this.currentIndex++;
    if (this.currentIndex >= this.resultados.length) this.currentIndex = 0;
    this.recargarPreseleccion();
  }

  ngOnDestroy() {
    this.limpiarControlesTimer();
    this.limpiarVotoFsTimer();
    for (const s of this.subs) {
      s.unsubscribe();
    }
  }
}
