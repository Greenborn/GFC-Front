import { Component, OnInit } from '@angular/core';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { AlertService } from 'src/app/services/ui/alert.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ConsoleLogService } from 'src/app/services/console-log.service';
import { PublicContestService } from 'src/app/services/public.contest.service';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-presentacion-ultimo-concurso',
  templateUrl: './presentacion-ultimo-concurso.component.html',
  styleUrls: ['./presentacion-ultimo-concurso.component.scss'],
})
export class PresentacionUltimoConcursoComponent extends ApiConsumer implements OnInit {
  public concurso: any = null;
  public bg_image: string;
  public cargando = true;
  public error = false;

  constructor(
    private publicContestService: PublicContestService,
    public  alertController:      AlertService,
    private configService:        ConfigService,
    private consoleLogService:    ConsoleLogService
  ) {
    super(alertController);
  }

  ngOnInit() {
    this.publicContestService.getAll('sort=-id').pipe(
      timeout(8000),
      catchError(err => {
        this.consoleLogService.sendLog('warn', 'Error al cargar concurso destacado', { error: err?.message || err?.toString() });
        return of([]);
      })
    ).subscribe(
      ok => {
        this.cargando = false;
        if (ok && ok.length > 0) {
          this.concurso = ok[0];
          this.bg_image = this.configService.imageUrl(this.concurso.img_url);
        } else {
          this.error = true;
        }
      }
    );
  }

  get aspecto() {
   return document.body.classList.contains("dark")
  }

}
