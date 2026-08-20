import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contest } from 'src/app/models/contest.model';
import { ContestResultExpanded } from 'src/app/models/contest_result.model';
import { ConcursoDetailService } from '../concurso-detail.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ContestResultsService } from 'src/app/services/contest-results.service';
import { ContestPreselectedPhotoService } from 'src/app/services/contest-preselected-photo.service';
import { ContestPreselectedPhoto, ContestCurrentPhoto } from 'src/app/models/contest-preselected-photo.model';
import { ContestJudgeService } from 'src/app/services/contest-judge.service';
import { ContestJudge } from 'src/app/models/contest_judge.model';
import { ContestApproveService, ContestApprovalStatus } from 'src/app/services/contest-approve.service';
import { ContestPuntuacionService, PuntuacionStatus, PuntuacionItem, PuntuacionVoteCount } from 'src/app/services/contest-puntuacion.service';
import { Metric } from 'src/app/models/metric.model';
import { ContestService } from 'src/app/services/contest.service';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';
import { SSOSocketService, SSO_TOKEN_KEY } from 'angular-greenborn-sso-front';
import { ZoomableImageComponent } from 'src/app/shared/zoomable-image/zoomable-image.component';
import { Subscription } from 'rxjs';

type FiltroJuzgamiento = 'actual' | 'todas' | 'preseleccionadas' | 'rechazadas' | 'sin_votar' | 'puntuadas' | 'sin_puntuar' | 'sin_unanimidad';

const FILTROS_PRESELECCION: { value: FiltroJuzgamiento; label: string; icono: string }[] = [
  { value: 'actual', label: 'Actual', icono: 'bi bi-play-fill' },
  { value: 'todas', label: 'Todas', icono: 'bi bi-grid' },
  { value: 'preseleccionadas', label: 'Preseleccionadas', icono: 'bi bi-check-circle' },
  { value: 'rechazadas', label: 'Rechazadas', icono: 'bi bi-x-circle' },
  { value: 'sin_votar', label: 'Sin votar', icono: 'bi bi-clock' },
];

const FILTROS_PUNTUACION: { value: FiltroJuzgamiento; label: string; icono: string }[] = [
  { value: 'actual', label: 'Actual', icono: 'bi bi-play-fill' },
  { value: 'todas', label: 'Todas', icono: 'bi bi-grid' },
  { value: 'puntuadas', label: 'Puntuadas', icono: 'bi bi-trophy' },
  { value: 'sin_puntuar', label: 'Sin puntuar', icono: 'bi bi-clock' },
  { value: 'sin_unanimidad', label: 'Sin unanimidad', icono: 'bi bi-patch-exclamation' },
];

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
  filtro: FiltroJuzgamiento = 'actual';
  preseleccionadas: ContestPreselectedPhoto[] = [];
  guia: ContestCurrentPhoto | null = null;
  cargandoGuia: boolean = false;
  isFullscreen: boolean = false;
  controlesVisibles: boolean = true;
  mostrarVotoFs: boolean = false;

  jueces: ContestJudge[] = [];
  onlineUserIds: Set<number> = new Set();
  isJudging: boolean = false;
  esJuez: boolean = false;
  socketError: string | null = null;
  aprobacion: ContestApprovalStatus | null = null;
  cargandoAprobacion: boolean = false;
  aprobando: boolean = false;
  cambiandoFase: boolean = false;
  puntuacion: PuntuacionStatus | null = null;
  cargandoPuntuacion: boolean = false;
  votandoMetrica: boolean = false;
  finalizando: boolean = false;

  private presente: Map<number, { last_active: number; user?: any }> = new Map();
  private subs: Subscription[] = [];
  private controlesTimer: any = null;
  private votoFsTimer: any = null;
  private heartbeatTimer: any = null;
  private pollTimer: any = null;
  private presenciaTimer: any = null;
  private loadedContestId: number | null = null;
  private juecesUpdateHandler: ((payload: any) => void) | null = null;
  private preselectHandler: ((payload: any) => void) | null = null;
  private approveHandler: ((payload: any) => void) | null = null;
  private puntuacionHandler: ((payload: any) => void) | null = null;
  private ultimoPushTs: number = 0;

  constructor(
    public concursoDetailService: ConcursoDetailService,
    public configService: ConfigService,
    private contestResultsService: ContestResultsService,
    private contestPreselectedPhotoService: ContestPreselectedPhotoService,
    private contestJudgeService: ContestJudgeService,
    private contestApproveService: ContestApproveService,
    private contestPuntuacionService: ContestPuntuacionService,
    private contestService: ContestService,
    private authService: AuthService,
    private ssoSocket: SSOSocketService,
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
          this.ensurePuntuacion();
          this.iniciarSeguimientoJueces();
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
    this.iniciarSeguimientoJueces();
  }

  private seguimientoContestId: number | null = null;

  private iniciarSeguimientoJueces() {
    const id = this.concurso?.id;
    if (!id) return;
    if (this.seguimientoContestId === id) return;
    const prevId = this.seguimientoContestId;
    this.detenerSeguimientoJueces();
    if (prevId != null) {
      this.ssoSocket.emit('contest:leave', { contest_id: prevId });
    }
    this.seguimientoContestId = id;
    this.cargarJueces(id);
    this.conectarPresencia(id);
  }

  private detenerSeguimientoJueces() {
    if (this.juecesUpdateHandler != null) {
      this.ssoSocket.off('contest:judges:update', this.juecesUpdateHandler);
      this.juecesUpdateHandler = null;
    }
    if (this.preselectHandler != null) {
      this.ssoSocket.off('contest:preselect', this.preselectHandler);
      this.preselectHandler = null;
    }
    if (this.approveHandler != null) {
      this.ssoSocket.off('contest:approve', this.approveHandler);
      this.approveHandler = null;
    }
    if (this.puntuacionHandler != null) {
      this.ssoSocket.off('contest:puntuacion', this.puntuacionHandler);
      this.puntuacionHandler = null;
    }
    if (this.heartbeatTimer != null) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.pollTimer != null) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    if (this.presenciaTimer != null) {
      clearInterval(this.presenciaTimer);
      this.presenciaTimer = null;
    }
    this.socketError = null;
  }

  private cargarJueces(contestId: number) {
    this.authService.user.then(user => {
      this.contestJudgeService.getAll<ContestJudge>(`contest_id=${contestId}&expand=user,user.profile`).subscribe({
        next: jueces => {
          this.jueces = jueces ?? [];
          this.esJuez = (jueces ?? []).some(j => j.user_id == user?.id);
          if (this.esJuez && this.heartbeatTimer == null) {
            this.heartbeatTimer = setInterval(() => this.heartbeatSocket(), 25000);
          }
          this.iniciarSeguimientoEnVivo();
        },
        error: () => this.jueces = [],
      });
    });
  }

  private iniciarSeguimientoEnVivo() {
    if (this.pollTimer != null) return;
    this.pollTimer = setInterval(() => {
      if (Date.now() - this.ultimoPushTs < 10000) return;
      this.cargarGuia();
      this.recargarPreseleccion();
      this.cargarAprobacion();
      this.cargarPuntuacion();
    }, 10000);
  }

  private conectarPresencia(contestId: number) {
    if (!this.juecesUpdateHandler) {
      this.juecesUpdateHandler = (payload: any) => this.aplicarPresencia(payload);
      this.ssoSocket.on('contest:judges:update', this.juecesUpdateHandler);
    }

    if (!this.preselectHandler) {
      this.preselectHandler = (payload: any) => this.onPreselectPush(payload);
      this.ssoSocket.on('contest:preselect', this.preselectHandler);
    }
    if (!this.approveHandler) {
      this.approveHandler = (payload: any) => this.onApprovePush(payload);
      this.ssoSocket.on('contest:approve', this.approveHandler);
    }
    if (!this.puntuacionHandler) {
      this.puntuacionHandler = (payload: any) => this.onPuntuacionPush(payload);
      this.ssoSocket.on('contest:puntuacion', this.puntuacionHandler);
    }

    this.subs.push(
      this.ssoSocket.connected$.subscribe(connected => {
        if (connected) {
          this.unirseAlConcurso(contestId);
        }
      })
    );

    this.asegurarTokenSocket();
    if (this.ssoSocket.isConnected) {
      this.unirseAlConcurso(contestId);
    } else {
      this.reconectarSocket(contestId);
    }

    if (this.presenciaTimer == null) {
      this.presenciaTimer = setInterval(() => this.refrescarPresencia(), 15000);
    }
  }

  // El socket de la librería, una vez creado, no reconecta con `connect()` (if(socket) return).
  // Al no estar conectado, forzamos disconnect()+connect() para crear una conexión nueva con
  // el token vigente. Si aún no se creó el cliente, disconnect() es no-op y connect() lo crea.
  private reconectarSocket(contestId: number) {
    this.ssoSocket.disconnect();
    this.ssoSocket.connect();
    if (this.ssoSocket.isConnected) {
      this.unirseAlConcurso(contestId);
    }
  }

  private asegurarTokenSocket(): void {
    try {
      if (localStorage.getItem(SSO_TOKEN_KEY)) return;
      const localToken = this.authService.token;
      if (localToken) {
        localStorage.setItem(SSO_TOKEN_KEY, localToken);
      }
    } catch (e) {
      console.warn('[WebSocket] No se pudo asegurar el token del socket', e);
    }
  }

  private refrescarPresencia() {
    const id = this.concurso?.id;
    if (id == null) return;
    this.contestJudgeService.getActivos(id).then(res => {
      if (res) this.aplicarPresencia(res);
    });
  }

  private unirseAlConcurso(contestId: number) {
    this.ssoSocket.emit('contest:join', { contest_id: contestId }, (res: any) => {
      if (res?.success) {
        this.isJudging = res.is_judging === true;
        this.socketError = null;
        this.aplicarPresencia(res);
      } else {
        this.isJudging = false;
        this.socketError = res?.error || 'No se pudo unir al juzgamiento';
      }
    });
  }

  private aplicarPresencia(payload: any) {
    if (payload?.contest_id != null && payload.contest_id !== this.concurso?.id) return;
    const items = payload?.items ?? [];
    const map = new Map<number, { last_active: number; user?: any }>();
    const ids = new Set<number>();
    for (const item of items) {
      if (item?.user_id == null) continue;
      ids.add(item.user_id);
      map.set(item.user_id, {
        last_active: item.last_active,
        user: item.user,
      });
    }
    this.presente = map;
    this.onlineUserIds = ids;
    if (payload?.is_judging != null) {
      this.isJudging = payload.is_judging === true;
    }
  }

  private onPreselectPush(payload: any) {
    if (payload?.contest_id != null && payload.contest_id !== this.concurso?.id) return;
    this.ultimoPushTs = Date.now();
    this.recargarPreseleccion();
    this.cargarGuia();
  }

  private onApprovePush(payload: any) {
    if (payload?.contest_id != null && payload.contest_id !== this.concurso?.id) return;
    this.ultimoPushTs = Date.now();
    this.cargarAprobacion();
  }

  private onPuntuacionPush(payload: any) {
    if (payload?.contest_id != null && payload.contest_id !== this.concurso?.id) return;
    this.ultimoPushTs = Date.now();
    this.cargarPuntuacion();
  }

  private heartbeatSocket() {
    const id = this.concurso?.id;
    if (!id || !this.esJuez || !this.isJudging) return;
    this.ssoSocket.emit('contest:heartbeat', { contest_id: id }, (res: any) => {
      if (res && res.success === false) {
        this.isJudging = false;
        this.socketError = res.error || null;
      }
    });
  }

  isOnline(userId: number): boolean {
    return this.onlineUserIds.has(userId);
  }

  lastActiveLabel(userId: number): string {
    const entry = this.presente.get(userId);
    if (!entry || entry.last_active == null) return '';
    const diff = Math.floor((Date.now() - entry.last_active * 1000) / 1000);
    if (diff < 0) return 'ahora';
    if (diff < 60) return `hace ${diff} s`;
    const min = Math.floor(diff / 60);
    if (min < 60) return `hace ${min} min`;
    const horas = Math.floor(min / 60);
    return `hace ${horas} h`;
  }

  private ensurePreseleccionadas() {
    if (this.concurso?.judging_stage !== 'preseleccion' || !this.concurso?.id) return;
    this.recargarPreseleccion();
    this.cargarGuia();
    this.cargarAprobacion();
  }

  private recargarPreseleccion() {
    if (this.concurso?.judging_stage !== 'preseleccion' || !this.concurso?.id) return;
    this.contestPreselectedPhotoService.list(this.concurso.id).then(items => {
      this.preseleccionadas = items ?? [];
    });
  }

  private cargarGuia() {
    if (this.concurso?.judging_stage !== 'preseleccion' || !this.concurso?.id) return;
    this.cargandoGuia = true;
    this.contestPreselectedPhotoService.current(this.concurso.id).then(g => {
      this.guia = g;
      this.cargandoGuia = false;
    });
  }

  private cargarAprobacion() {
    if (this.concurso?.judging_stage !== 'preseleccion' || !this.concurso?.id) return;
    this.cargandoAprobacion = true;
    this.contestApproveService.getStatus(this.concurso.id).then(s => {
      this.aprobacion = s;
      this.cargandoAprobacion = false;
    });
  }

  aprobar() {
    const id = this.concurso?.id;
    if (!id || this.aprobando || !this.esJuez) return;
    this.aprobando = true;
    this.contestApproveService.aprobar(id).then(s => {
      this.aprobando = false;
      if (s) {
        this.aprobacion = s;
        this.UIUtilsService.mostrarToast(undefined, {
          message: 'Visto bueno registrado',
          duration: 1500,
          position: 'top',
          color: 'success',
        });
      } else {
        this.UIUtilsService.mostrarToast(undefined, {
          message: 'No se pudo registrar el visto bueno',
          duration: 2000,
          position: 'top',
          color: 'danger',
        });
      }
    });
  }

  pasarAPuntuacion() {
    const id = this.concurso?.id;
    if (!id || this.cambiandoFase || !this.allAprobado) return;
    this.cambiandoFase = true;
    this.contestService.cambiarJudgingStage(id, 'puntuacion').subscribe({
      next: () => {
        this.cambiandoFase = false;
        this.concursoDetailService.loadContest(id).then(() => {
          this.ensureResults();
          this.ensurePreseleccionadas();
        });
        this.UIUtilsService.mostrarToast(undefined, {
          message: 'El concurso pasó a fase de Puntuación',
          duration: 2000,
          position: 'top',
          color: 'success',
        });
      },
      error: err => {
        this.cambiandoFase = false;
        const msg = err?.response?.data?.message || err?.message || 'No se pudo cambiar de fase';
        this.UIUtilsService.mostrarToast(undefined, {
          message: msg,
          duration: 2500,
          position: 'top',
          color: 'danger',
        });
      }
    });
  }

  get preseleccionCompleta(): boolean {
    return this.aprobacion?.preseleccion_completa === true;
  }

  get allAprobado(): boolean {
    return this.aprobacion?.all_approved === true;
  }

  get myAprobo(): boolean {
    return this.aprobacion?.my_approved === true;
  }

  get aprobacionProgreso(): string {
    const s = this.aprobacion;
    if (!s) return '—';
    return `${s.approved_count ?? 0}/${s.judges_count ?? 0}`;
  }

  private ensurePuntuacion() {
    if (this.concurso?.judging_stage !== 'puntuacion' || !this.concurso?.id) return;
    this.cargarPuntuacion();
  }

  private cargarPuntuacion() {
    if (this.concurso?.judging_stage !== 'puntuacion' || !this.concurso?.id) return;
    this.cargandoPuntuacion = true;
    this.contestPuntuacionService.getStatus(this.concurso.id).then(s => {
      this.puntuacion = s;
      this.cargandoPuntuacion = false;
    });
  }

  votarMetrica(metricAbmId: number) {
    const id = this.concurso?.id;
    const imageId = this.currentPhotoId;
    if (!id || imageId == null || this.votandoMetrica || !this.esJuez) return;
    this.votandoMetrica = true;
    this.contestPuntuacionService.votar(id, imageId, metricAbmId).then(() => {
      this.votandoMetrica = false;
      this.cargarPuntuacion();
    });
  }

  get esPuntuacion(): boolean {
    return this.concurso?.judging_stage === 'puntuacion';
  }

  get metricasDisponibles(): Metric[] {
    return this.puntuacion?.metrics ?? [];
  }

  get itemPuntuacionFotoActual(): PuntuacionItem | null {
    const imageId = this.currentPhotoId;
    if (imageId == null || !this.puntuacion) return null;
    return this.puntuacion.items.find(i => i.image_id === imageId) ?? null;
  }

  get miVotoFotoActual(): number | null {
    return this.itemPuntuacionFotoActual?.my_vote ?? null;
  }

  get votosFotoActual(): PuntuacionVoteCount[] {
    return this.itemPuntuacionFotoActual?.votes ?? [];
  }

  get puntuacionProgreso(): string {
    const s = this.puntuacion;
    if (!s) return '—';
    return `${s.judged_count ?? 0}/${s.total_count ?? 0}`;
  }

  get metricaActualName(): string {
    const id = this.miVotoFotoActual;
    if (id == null) return '';
    return this.metricasDisponibles.find(m => m.id === id)?.prize ?? '';
  }

  get sinUnanimidadCount(): number {
    return (this.puntuacion?.items ?? []).filter(item => {
      const distinct = (item.votes ?? []).filter(v => (v.count ?? 0) > 0).length;
      return distinct !== 1;
    }).length;
  }

  get listoParaFinalizar(): boolean {
    return this.esPuntuacion && this.esJuez &&
      this.puntuacion?.all_judged === true && this.sinUnanimidadCount === 0;
  }

  async finalizarJudging() {
    const id = this.concurso?.id;
    if (!id || this.finalizando || !this.listoParaFinalizar) return;
    this.UIUtilsService.mostrarAlert(
      {
        header: 'Finalizar juzgamiento',
        message: 'Se asentará el puntaje de las fotografías y el concurso quedará marcado como juzgado. Esta acción no se puede deshacer. ¿Desea continuar?'
      },
      async () => {
        this.finalizando = true;
        this.contestService.finalizarJudging(id).subscribe({
          next: () => {
            this.finalizando = false;
            this.concursoDetailService.loadContest(id).then(() => {
              this.ensureResults();
              this.ensurePuntuacion();
            });
            this.UIUtilsService.mostrarToast(undefined, {
              message: 'Juzgamiento finalizado. El puntaje quedó asentado en el concurso.',
              duration: 2500,
              position: 'top',
              color: 'success',
            });
          },
          error: err => {
            this.finalizando = false;
            const msg = err?.response?.data?.message || err?.message || 'No se pudo finalizar el juzgamiento';
            this.UIUtilsService.mostrarToast(undefined, {
              message: msg,
              duration: 3500,
              position: 'top',
              color: 'danger',
            });
          }
        });
      }
    );
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

  get filtroOpciones(): { value: FiltroJuzgamiento; label: string; icono: string }[] {
    return this.esPuntuacion ? FILTROS_PUNTUACION : FILTROS_PRESELECCION;
  }

  get resultadosFiltrados(): ContestResultExpanded[] {
    if (this.filtro === 'actual' || this.filtro === 'todas') return this.resultados;

    if (this.esPuntuacion) {
      const votos = new Map<number, number>();
      const sinUnanimidad = new Map<number, boolean>();
      for (const it of this.puntuacion?.items ?? []) {
        votos.set(it.image_id, it.total_votes ?? 0);
        const distinct = new Set<number>();
        for (const v of it.votes ?? []) {
          if ((v.count ?? 0) > 0) distinct.add(v.metric_abm_id);
        }
        sinUnanimidad.set(it.image_id, distinct.size > 1);
      }
      return this.resultados.filter(r => {
        const imgId = r.image?.id ?? r.image_id;
        const total = votos.get(imgId) ?? 0;
        if (this.filtro === 'puntuadas') return total > 0;
        if (this.filtro === 'sin_puntuar') return total === 0;
        if (this.filtro === 'sin_unanimidad') return sinUnanimidad.get(imgId) === true;
        return true;
      });
    }

    const map = new Map<number, ContestPreselectedPhoto>();
    for (const p of this.preseleccionadas) {
      if (p.image_id != null) map.set(p.image_id, p);
    }

    return this.resultados.filter(r => {
      const imgId = r.image?.id ?? r.image_id;
      const item = map.get(imgId);
      if (this.filtro === 'preseleccionadas') return item?.preselected === true;
      if (this.filtro === 'rechazadas') return !!item && item.preselected === false;
      if (this.filtro === 'sin_votar') return !item;
      return true;
    });
  }

  get modoGuiaActivo(): boolean {
    return this.filtro === 'actual' && this.concurso?.judging_stage === 'preseleccion';
  }

  get guiaFotoActual() {
    return this.guia?.current_photo ?? null;
  }

  get todasJuzgadas(): boolean {
    return this.modoGuiaActivo && !this.cargandoGuia && this.guia !== null &&
      (this.guia.all_judged === true || this.guiaFotoActual == null);
  }

  get mostrarVisor(): boolean {
    return this.modoGuiaActivo ? this.guiaFotoActual != null : this.resultadosFiltrados.length > 0;
  }

  get current(): ContestResultExpanded | null {
    const list = this.resultadosFiltrados;
    if (list.length === 0) return null;
    const idx = Math.max(0, Math.min(this.currentIndex, list.length - 1));
    return list[idx];
  }

  get currentSrc(): string {
    const url = this.modoGuiaActivo ? this.guiaFotoActual?.url : this.current?.image?.url;
    return url != null ? this.configService.imageUrl(url) : '';
  }

  get currentTitle(): string {
    return this.modoGuiaActivo ? (this.guiaFotoActual?.title ?? '') : (this.current?.image?.title ?? '');
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
    return this.concurso?.judging_stage === 'preseleccion';
  }

  cambiarFiltro(f: FiltroJuzgamiento) {
    if (this.filtro === f) return;
    this.filtro = f;
    this.currentIndex = 0;
    if (f === 'actual') {
      this.cargarGuia();
    }
    this.recargarPreseleccion();
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
    if (this.modoGuiaActivo) return this.guiaFotoActual?.image_id ?? null;
    return this.current?.image?.id ?? this.current?.image_id ?? null;
  }

  get currentContestId(): number | null {
    if (this.modoGuiaActivo) return this.guia?.contest_id ?? this.concurso?.id ?? null;
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

  get votosPorJuezPreseleccion(): { user_id: number; nombre: string; vote: 'aceptar' | 'rechazar' }[] {
    return (this.preseleccionDeFotoActual?.judge_votes ?? []).map(jv => ({
      user_id: jv.user_id,
      nombre: this.formatJudgeName(jv.name, jv.last_name, jv.username),
      vote: jv.vote,
    }));
  }

  get votosPorJuezPuntuacion(): { user_id: number; nombre: string; metric_abm: Metric | null }[] {
    return (this.itemPuntuacionFotoActual?.judge_votes ?? []).map(jv => ({
      user_id: jv.user_id,
      nombre: this.formatJudgeName(jv.name, jv.last_name, jv.username),
      metric_abm: jv.metric_abm ?? this.metricasDisponibles.find(m => m.id === jv.metric_abm_id) ?? null,
    }));
  }

  private formatJudgeName(name?: string | null, last_name?: string | null, username?: string | null): string {
    const full = `${name ?? ''} ${last_name ?? ''}`.trim();
    return full || username || 'Juez';
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
    if (!this.esJuez) return;
    if (!this.esPreseleccion) return;
    if (this.todasJuzgadas || !this.mostrarVisor) return;
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
    this.cargarGuia();
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
    if (this.modoGuiaActivo) return;
    const list = this.resultadosFiltrados;
    if (list.length === 0) return;
    this.currentIndex--;
    if (this.currentIndex < 0) this.currentIndex = list.length - 1;
    this.recargarPreseleccion();
  }

  siguiente() {
    if (this.modoGuiaActivo) return;
    const list = this.resultadosFiltrados;
    if (list.length === 0) return;
    this.currentIndex++;
    if (this.currentIndex >= list.length) this.currentIndex = 0;
    this.recargarPreseleccion();
  }

  ngOnDestroy() {
    const id = this.seguimientoContestId;
    if (id != null) {
      this.ssoSocket.emit('contest:leave', { contest_id: id });
    }
    this.detenerSeguimientoJueces();
    this.limpiarControlesTimer();
    this.limpiarVotoFsTimer();
    for (const s of this.subs) {
      s.unsubscribe();
    }
  }
}
