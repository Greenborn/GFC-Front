import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { RolificadorService } from 'src/app/modules/auth/services/rolificador.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ContestService } from 'src/app/services/contest.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';
import { ConcursoDetailService } from '../concurso-detail.service';

@Component({
  selector: 'app-juzgamiento',
  templateUrl: './juzgamiento.component.html',
  styleUrls: ['./juzgamiento.component.scss'],
})
export class JuzgamientoComponent implements OnInit {

  
  constructor(public UIUtilsService: UiUtilsService, public concursoDetailService: ConcursoDetailService, public rolificador: RolificadorService,
    public auth: AuthService,
    public contestService: ContestService,
    public configService: ConfigService, private router: Router,) { }

  async ngOnInit() {
    
  }

}
