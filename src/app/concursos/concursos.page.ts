import { Component, ElementRef, OnDestroy, OnInit, ViewChild ,AfterViewInit} from '@angular/core';
import { AlertController, PopoverController } from '@ionic/angular';
import { Event, Router } from '@angular/router';

// import { ConcursoService } from '../services/concurso.service';
import { NotificacionesPage } from '../notificaciones/notificaciones.page';
import { UsuarioPage } from '../usuario/usuario.page';
// import { AuthService } from '../services/auth/auth.service';
import { SearchBarComponentAtributo, SearchBarComponentParams } from '../shared/search-bar/search-bar.component';
// import { ApiService } from '../services/api.service';
import { ContestService } from '../services/contest.service';
import { ApiConsumer } from '../models/ApiConsumer';
// import { ConfigService } from "../services/config/config.service";
import { Contest } from '../models/contest.model';
import { AuthService } from '../modules/auth/services/auth.service';
import { ConfigService } from '../services/config/config.service';
import { RolificadorService } from '../modules/auth/services/rolificador.service';

import { User, UserLogged } from '../../app/models/user.model';
import { ResponsiveService } from '../services/ui/responsive.service';
@Component({
  selector: 'app-concursos',
  templateUrl: './concursos.page.html',
  styleUrls: ['./concursos.page.scss'],
})
export class ConcursosPage extends ApiConsumer implements OnInit {

  markChip: boolean = false;
  public loading: boolean = true;
  mostrarFiltro: boolean = false;
  anchoImg: boolean = false;
  // public concursos: Concurso[] = [];
  public concursos: Contest[] = [];
  public searchParams: SearchBarComponentParams;
  public atributosBusqueda: SearchBarComponentAtributo[] = [
    { valor: 'name', valorMostrado: 'Nombre',
      callback: (c: Contest, query: string) => c.name.match(new RegExp(`^${query}`, 'i'))
    },
    // { valor: 'description', valorMostrado: 'Descripcion',
    //   callback: (c: Contest, query: string) => c.description.match(new RegExp(`^${query}`, 'i'))
    // }
  ];

  constructor(
    public popoverController: PopoverController,
    private router: Router,
    public auth: AuthService,
    public contestService: ContestService,
    public rolificador: RolificadorService,
    alertController: AlertController,
    public configService: ConfigService,
    public responsiveService: ResponsiveService
  ) { 
    // super('concursos page', alertController)
    super(alertController)
  }
  get aspecto() {
    return document.body.classList.contains("dark")
   }
   
  getImg(imgUrl) {
    if (imgUrl == null){
      return ''
    }
   let result = this.configService.apiUrl(imgUrl)
   if (result == null){
     return ''
   }
   return result
  }
    
  obtenerTamanio(event){
    // console.log(event.srcElement.offsetWidth)
    if (event.srcElement.offsetWidth > event.srcElement.offsetEight){
      this.anchoImg = true;
    } else {
      this.anchoImg = false;
    }
  }

  get_fecha_formateada(fecha){
    let date = new Date(fecha)
    let aux = date.getFullYear() + '/' + Number(date.getMonth() + 1).toLocaleString(undefined, {
      minimumIntegerDigits: 2,
      minimumFractionDigits: 0
    }) + '/' + Number(date.getDate()).toLocaleString(undefined, {
      minimumIntegerDigits: 2,
      minimumFractionDigits: 0
    })
    aux += ' ' + Number(date.getHours()).toLocaleString(undefined, {
      minimumIntegerDigits: 2,
      minimumFractionDigits: 0
    }) + ':' + Number(date.getMinutes()).toLocaleString(undefined, {
      minimumIntegerDigits: 2,
      minimumFractionDigits: 0
    })
    return aux
  }
    // @ViewChild('imageContest')
  // imageContest: ElementRef;

  // ngAfterViewInit() {
  //   console.log(this.imageContest.nativeElement.offsetWidth);
  // }

  // obtenerPx(){
  //   let elem = document.querySelector('#colCard').getBoundingClientRect();
  //   if (window.innerWidth > 767) {
  //     return elem.height;
  //   } else {
  //     return elem.width/2;
  //   }
  // }

  // obtenerPx(colCard){
  //   // console.log(colCard)
  //   if (window.innerWidth > 767) {
  //     // console.log(colCard.clientHeight)
  //     // console.log(colCard)
  //     // return colCard.el.getBoundingClientRect().height;
  //     return '100%';
  //     // return colCard.el.clientHeight;
  //   } else {
  //     // console.log('mobile')
  //     // return colCard.el.clientWidth/2;
  //     return window.innerWidth/2 + ' px'
  //     // return window.innerWidth/2
  //   }
  // }

  ngOnInit() {}

  isLogedIn(){ //agregado para seguir manteniendo el servicio auth como private
    return this.auth.loggedIn;
  }

  // get concursosFiltrados(): Concurso[] {
  //   const q = this.searchQuery;
  //   return this.concursos.filter(c => c.name.substr(0, q.length) == q)
  // }
  async filtrarConcursos(output: SearchBarComponentParams) {
    // if (output != undefined) {
    //   // console.log('buscando', output)
    //   let { atributo, query } = output;
    //   this.searchParams = output;
    //   // this.concursos = (await this.db.getConcursos()).filter(u => {
    //   this.concursos = this.concursos.filter(u => {
    //     // console.log('buscando', atributo, query)
    //     switch (atributo) {
    //       case 'description': return u[atributo].search(new RegExp(query, 'i')) > -1;
    //       default: return u[atributo].search(new RegExp(`^${query}`, 'i')) > -1
    //     }
    //   });
    // }
  }
  toggleChipMark() {
    this.markChip = !this.markChip;
  }

  toggleFiltro() {
    this.mostrarFiltro = !this.mostrarFiltro;
  }

  ionViewWillEnter() {
    // this.concursos = await this.db.getConcursos()
    super.fetch<Contest[]>(() => 
      this.contestService.getAll('expand=categories,sections&sort=-id')
    ).subscribe(r => {
      // console.log('concursos recibidos', r)
      this.concursos = r
      this.loading = false
    })
  }

  // para implementar busqueda con la api (sobrescribe variable de concursos)
  // async buscarConcursos(searchQuery) {
  //   console.log(searchQuery)
  // }

  errorImg(e){
    e.currentTarget.src='../../../assets/no-pictures.png';
    e.currentTarget.style='width: 25%; height: 25%; object-fit: contain;';
    e.currentTarget.parentNode.style= 'display: flex; align-items: center; justify-content: center;';
    

  }

  // popover
  async openPopover( ev:any, ctrl: any, url: string ){
    if (window.innerWidth > 767) {
      const popover = await this.popoverController.create({
        component: ctrl, //componente a mostrar
        cssClass: 'my-custom-class',
        event: ev,
        translucent: true,
        // mode: "ios" //para mostrar con la patita, pero es otro estilo y muy angosto
      });
      await popover.present();
      // this.router.events.subscribe() // dismiss popover cuando cambie de ruta

      const { role } = await popover.onDidDismiss();
      // console.log('onDidDismiss resolved with role', role);
    }
    else {
      this.router.navigate([url]);
    }
  }
  async mostrarPerfil( ev:any ){
    this.openPopover(ev, UsuarioPage, '/perfil');
  }
  async mostrarNotificaciones( ev:any ) {
    this.openPopover(ev, NotificacionesPage, '/notificaciones');
  }
}
