import { Component, ElementRef, OnDestroy, OnInit, ViewChild ,AfterViewInit} from '@angular/core';
import { AlertController, PopoverController } from '@ionic/angular';
import { Event, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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
import { FotosDelAnioResponse, ItemConcursoOFoto } from '../models/foto-del-anio.model';
import { forkJoin } from 'rxjs';
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
  public itemsMezclados: ItemConcursoOFoto[] = [];
  public fotosDelAnioPorTemporada: Map<number, FotosDelAnioResponse> = new Map();
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
    public responsiveService: ResponsiveService,
    private http: HttpClient
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
   let result = this.configService.imageUrl(imgUrl)
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
    this.loading = true;
    
    // Obtener concursos y fotos del año en paralelo
    const concursos$ = this.contestService.getAll('expand=categories,sections&sort=-id');
    const url = `${this.configService.nodeApiBaseUrl}foto-del-anio`;
    const token = localStorage.getItem(this.configService.tokenKey);
    const headers = token ? { Authorization: 'Bearer ' + token } : {};
    const fotosAnio$ = this.http.get<any>(url, { headers });

    forkJoin({
      concursos: concursos$,
      fotosAnio: fotosAnio$
    }).subscribe(
      ({ concursos, fotosAnio }) => {
        this.concursos = concursos;
        
        console.log('=== DATOS RECIBIDOS ===');
        console.log('Concursos:', concursos);
        console.log('Fotos del año RAW:', fotosAnio);
        
        // Organizar fotos del año por temporada
        this.fotosDelAnioPorTemporada.clear();
        
        // La API puede devolver un array de objetos o un solo objeto
        const fotosArray = Array.isArray(fotosAnio) ? fotosAnio : [fotosAnio];
        
        fotosArray.forEach(fotoData => {
          if (fotoData && fotoData.temporada && fotoData.items && fotoData.items.length > 0) {
            // Ordenar las fotos por el campo 'orden'
            fotoData.items.sort((a, b) => a.orden - b.orden);
            this.fotosDelAnioPorTemporada.set(fotoData.temporada, fotoData);
            console.log(`Temporada ${fotoData.temporada} agregada con ${fotoData.items.length} fotos`);
          }
        });
        
        console.log('Temporadas organizadas:', this.fotosDelAnioPorTemporada);
        console.log('Cantidad de temporadas:', this.fotosDelAnioPorTemporada.size);
        
        // Mezclar concursos y fotos del año
        this.mezclarConcursosYFotos();
        
        this.loading = false;
      },
      error => {
        console.error('Error al cargar datos:', error);
        // Si falla, al menos mostrar los concursos
        super.fetch<Contest[]>(() => 
          this.contestService.getAll('expand=categories,sections&sort=-id')
        ).subscribe(r => {
          this.concursos = r;
          this.mezclarConcursosYFotos();
          this.loading = false;
        });
      }
    );
  }

  mezclarConcursosYFotos() {
    this.itemsMezclados = [];
    
    console.log('=== INICIANDO MEZCLA ===');
    console.log('Concursos totales:', this.concursos.length);
    console.log('Temporadas con fotos:', this.fotosDelAnioPorTemporada.size);
    
    // Los concursos están ordenados del más reciente al más viejo
    // Agrupar concursos por año
    const concursosPorAnio: Map<number, Contest[]> = new Map();
    
    this.concursos.forEach(concurso => {
      const anio = concurso.end_date ? new Date(concurso.end_date).getFullYear() : 0;
      if (!concursosPorAnio.has(anio)) {
        concursosPorAnio.set(anio, []);
      }
      concursosPorAnio.get(anio)!.push(concurso);
    });
    
    console.log('Concursos por año:', concursosPorAnio);
    
    // Obtener todos los años (de concursos y fotos del año)
    const aniosConcursos = Array.from(concursosPorAnio.keys());
    const aniosFotos = Array.from(this.fotosDelAnioPorTemporada.keys());
    const todosLosAnios = [...new Set([...aniosConcursos, ...aniosFotos])];
    
    // Ordenar del más reciente al más viejo
    const anios = todosLosAnios.sort((a, b) => b - a);
    
    console.log('Años a procesar:', anios);
    
    // Para cada año, agregar primero las fotos del año y luego los concursos
    anios.forEach(anio => {
      console.log(`Procesando año ${anio}`);
      
      // Agregar fotos del año al inicio del año (final de temporada) si existen
      if (this.fotosDelAnioPorTemporada.has(anio)) {
        const fotosData = this.fotosDelAnioPorTemporada.get(anio)!;
        console.log(`  - Agregando fotos del año: ${fotosData.items.length} fotos`);
        this.itemsMezclados.push({
          tipo: 'fotos-anio',
          fotosAnio: fotosData.items,
          temporada: fotosData.temporada,
          url_grabacion: fotosData.url_grabacion
        });
      } else {
        console.log(`  - No hay fotos del año para ${anio}`);
      }
      
      const concursosDelAnio = concursosPorAnio.get(anio) || [];
      
      // Ordenar concursos del año del más reciente al más viejo (por fecha de fin)
      concursosDelAnio.sort((a, b) => {
        const fechaA = a.end_date ? new Date(a.end_date).getTime() : 0;
        const fechaB = b.end_date ? new Date(b.end_date).getTime() : 0;
        return fechaB - fechaA; // Descendente (más reciente primero)
      });
      
      // Agregar todos los concursos del año (del más reciente al más viejo)
      concursosDelAnio.forEach(concurso => {
        this.itemsMezclados.push({
          tipo: 'concurso',
          concurso: concurso
        });
      });
      
      console.log(`  - Concursos agregados: ${concursosDelAnio.length}`);
    });
    
    console.log('=== MEZCLA COMPLETADA ===');
    console.log('Items mezclados total:', this.itemsMezclados.length);
    console.log('Items mezclados:', this.itemsMezclados);
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
