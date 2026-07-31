import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contest } from 'src/app/models/contest.model';
import { ConcursoDetailService } from '../concurso-detail.service';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-juzgamiento',
  templateUrl: './juzgamiento.component.html',
  styleUrls: ['./juzgamiento.component.scss'],
})
export class JuzgamientoComponent {
  concurso: Contest;
  subs: Subscription[] = [];

  constructor(
    public concursoDetailService: ConcursoDetailService,
  ) {
    this.concurso = this.concursoDetailService.concurso.getValue();
    this.subs.push(
      this.concursoDetailService.concurso.subscribe({
        next: c => this.concurso = c
      })
    );
  }

  ngOnDestroy() {
    for (const s of this.subs) {
      s.unsubscribe()
    }
  }
}
