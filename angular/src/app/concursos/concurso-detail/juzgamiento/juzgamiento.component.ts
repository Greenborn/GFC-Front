import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contest } from 'src/app/models/contest.model';
import { ContestResultExpanded } from 'src/app/models/contest_result.model';
import { ConcursoDetailService } from '../concurso-detail.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ContestResultsService } from 'src/app/services/contest-results.service';
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

  private subs: Subscription[] = [];

  constructor(
    public concursoDetailService: ConcursoDetailService,
    public configService: ConfigService,
    private contestResultsService: ContestResultsService,
  ) {
    this.concurso = this.concursoDetailService.concurso.getValue();
  }

  ngOnInit() {
    this.subs.push(
      this.concursoDetailService.concurso.subscribe({
        next: c => this.concurso = c
      })
    );
    this.subs.push(
      this.contestResultsService.resultadosConcursoGeted.subscribe({
        next: rs => {
          this.resultados = rs?.items ?? [];
          if (this.currentIndex >= this.resultados.length) {
            this.currentIndex = Math.max(0, this.resultados.length - 1);
          }
        }
      })
    );
    this.ensureResults();
  }

  private ensureResults() {
    const id = this.concurso?.id;
    if (!id || this.resultados.length > 0) return;
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

  anterior() {
    if (!this.hasPhotos) return;
    this.currentIndex--;
    if (this.currentIndex < 0) this.currentIndex = this.resultados.length - 1;
  }

  siguiente() {
    if (!this.hasPhotos) return;
    this.currentIndex++;
    if (this.currentIndex >= this.resultados.length) this.currentIndex = 0;
  }

  ngOnDestroy() {
    for (const s of this.subs) {
      s.unsubscribe();
    }
  }
}
