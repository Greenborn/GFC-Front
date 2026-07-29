import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { NavigationEnd, Router } from '@angular/router';
import { SearchBarComponentAtributo, SearchBarComponentParams } from 'src/app/shared/search-bar/search-bar.component';

import { MenuAccionesComponent } from '../../shared/menu-acciones/menu-acciones.component';
import { Role } from 'src/app/models/role.model';
import { Fotoclub } from 'src/app/models/fotoclub.model';
import { FotoclubService } from 'src/app/services/fotoclub.service';
import { UserService } from 'src/app/services/user.service';
import { RoleService } from 'src/app/services/role.service';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { ProfileService } from 'src/app/services/profile.service';
import { User, UserLogged } from 'src/app/models/user.model';
import { Profile, ProfileExpanded } from 'src/app/models/profile.model';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { RolificadorService } from 'src/app/modules/auth/services/rolificador.service';
import { filter } from 'rxjs/operators';
import { ConfigService } from 'src/app/services/config/config.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';
import { AlertService } from 'src/app/services/ui/alert.service';
import { LoadingService } from 'src/app/services/ui/loading.service';
import axios from 'axios';
import { SharedModule } from 'src/app/shared/shared.module';

import { TableEditorComponent } from 'src/app/components/table-editor/table-editor.component';
import { ColumnDef, BtnConfig } from 'src/app/components/table-editor/table-editor.types';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule, TableEditorComponent],
  selector: 'app-usuarios-abm',
  templateUrl: './usuarios-abm.page.html',
  styleUrls: ['./usuarios-abm.page.scss'],
})
export class UsuariosAbmPage extends ApiConsumer implements OnInit  {

  @ViewChild('tableEditor') tableEditor!: TableEditorComponent;

  user: User = undefined;
  miembros: ProfileExpanded[] = [];
  roles: Role[] = [];
  fotoclubs: Fotoclub[] = [];

  loading: boolean = false;
  selectedRow: any = null;

  tableColumns: ColumnDef[] = [];
  userLogged: UserLogged | null = null;

  constructor(
    private fotoclubService: FotoclubService,
    private userService: UserService,
    private profileService: ProfileService,
    private roleService: RoleService,
    alertCtrl: AlertService,
    private router: Router,
    public auth: AuthService,
    public rolificador: RolificadorService,
    public loadingService: LoadingService,
    public configService: ConfigService,
    public UIUtilsService: UiUtilsService
  ) {
    super(alertCtrl)
  }

  getFotoclubName(fotoclub_id: number) {
    let name = ''
    let fc = this.fotoclubs.find(e => e.id == fotoclub_id)
    if (fc != undefined) name = fc.name
    return name
  }

  getRoleType(id: number) {
    const a = this.roles.find(e => e.id == id)
    return a != undefined ? a.type : ''
  }

  private buildColumns(): ColumnDef[] {
    const isAdmin = this.userLogged && this.rolificador.isAdmin(this.userLogged)
    const cols: ColumnDef[] = [
      {
        field: '_nombre',
        headerName: this.userLogged ? this.rolificador.getNombreUsuarios(this.userLogged.role_id) : 'Usuario',
        sortable: true,
        formatter: (row: ProfileExpanded) => `${row.name} ${row.last_name}`,
      },
    ]

    if (isAdmin) {
      cols.push({
        field: 'executive_rol',
        headerName: 'Comisión directiva',
        sortable: true,
        css: 'd-none d-sm-table-cell',
      })
      cols.push({
        field: '_rol',
        headerName: 'Rol',
        sortable: true,
        css: 'd-none d-sm-table-cell',
      })
      cols.push({
        field: '_fotoclub',
        headerName: 'Fotoclub',
        sortable: true,
        css: 'd-none d-sm-table-cell',
      })
      cols.push({
        field: '_estado',
        headerName: 'Estado',
        sortable: true,
        css: 'd-none d-sm-table-cell',
      })
    }

    return cols
  }

  private enrichRows(rows: ProfileExpanded[]): any[] {
    return rows.map(r => ({
      ...r,
      _nombre: `${r.name} ${r.last_name}`,
      _rol: r.user ? this.getRoleType(r.user.role_id) : '',
      _fotoclub: r.fotoclub_id != null ? this.getFotoclubName(r.fotoclub_id) : 'Ninguno',
      _estado: r.user ? (r.user.status == 1 ? 'Habilitado' : 'Deshabilitado') : 'Desconocido',
      _estadoClase: r.user?.status == 1 ? 'bg-success' : 'bg-danger',
      _username: r.user?.username || '',
    }))
  }

  onRowSelected(row: any): void {
    this.selectedRow = row
  }

  getCrearBtn(): BtnConfig {
    return new BtnConfig({
      key: 'crear',
      icon: 'bi bi-plus-lg',
      severity: 'btn-success',
      label: 'Usuario',
      onClick: () => this.router.navigate(['/usuarios', 'nuevo']),
    })
  }

  getEditBtn(forToolbar: boolean = false): BtnConfig {
    return new BtnConfig({
      key: 'edit',
      icon: 'bi bi-pencil',
      severity: 'btn-warning',
      label: 'Editar',
      isDisabled: () => forToolbar && !this.selectedRow,
      onClick: (row: any) => {
        const r = row || this.selectedRow
        const uid = r?.user?.id ?? r?.id
        if (uid) this.router.navigate(['/usuarios', 'editar', uid])
      },
    })
  }

  getToggleStatusBtn(forToolbar: boolean = false): BtnConfig {
    return new BtnConfig({
      key: 'toggle',
      icon: 'bi bi-toggle-on',
      severity: 'btn-danger',
      getLabel: () => {
        const r = this.selectedRow
        if (!r) return ''
        const st = r.user?.status ?? 1
        return st === 0 ? 'Habilitar' : 'Deshabilitar'
      },
      isDisabled: () => forToolbar && !this.selectedRow,
      onClick: (row: any) => {
        const r = row || this.selectedRow
        if (r) this.toggleUsuarioStatus(r)
      },
    })
  }

  getTableConfig() {
    const isDelegadoOrAdmin = this.userLogged && (this.rolificador.esDelegado(this.userLogged) || this.rolificador.isAdmin(this.userLogged))
    return {
      lazy: false,
      infiniteScroll: false,
      selectionMode: 'single' as 'single' | 'multiple' | null,
      showFilterRow: false,
      hideCsvExport: true,
      hideRefresh: true,
      scrollHeight: 'calc(100vh - 200px)',
      elementName: { singular: 'Usuario', gender: 'M' },
      valueFormatters: {
        _estado: (row: any) => {
          const status = row.user?.status ?? 1
          const cls = status == 1 ? 'bg-success' : 'bg-danger'
          const label = status == 1 ? 'Habilitado' : 'Deshabilitado'
          return `<span class="badge ${cls}">${label}</span>`
        },
        _nombre: (row: any) => {
          const img = row.img_url ? this.configService.imageUrl(row.img_url) : ''
          const name = `${row.name} ${row.last_name}`
          const username = row._username ? `<small class="text-muted d-block"><i>@${row._username}</i></small>` : ''
          const imgHtml = img ? `<img src="${img}" class="rounded-circle me-1" width="32" height="32">` : ''
          return `${imgHtml}<span class="align-middle">${name}</span>${username}`
        },
        _rol: (row: any) => row._rol || '-',
        _fotoclub: (row: any) => row._fotoclub || 'Ninguno',
        executive_rol: (row: any) => row.executive_rol || 'No',
      },
      buttons: {
        toolbar: [this.getCrearBtn(), this.getEditBtn(true), this.getToggleStatusBtn(true)],
        rowActions: isDelegadoOrAdmin ? [this.getEditBtn(), this.getToggleStatusBtn()] : [],
      },
    }
  }

  async toggleUsuarioStatus(p: ProfileExpanded) {
    if (!p.user || p.user.id == null) {
      await this.UIUtilsService.mostrarError({ message: 'El perfil no tiene usuario asociado.' });
      return;
    }

    const currentStatus = typeof p.user.status === 'number' ? p.user.status : 1;
    const newStatus = currentStatus === 1 ? 0 : 1;
    const confirmHeader = newStatus === 0 ? 'Confirmar deshabilitación' : 'Confirmar habilitación';
    const confirmMessage = newStatus === 0
      ? 'Se procederá a deshabilitar al usuario. No se elimina para preservar la vinculación con su contenido. Al deshabilitar se invalida el access_token y no podrá acceder al sistema.'
      : 'Se procederá a habilitar al usuario. Podrá volver a acceder al sistema.';

    await this.UIUtilsService.mostrarAlert({
      header: confirmHeader,
      message: confirmMessage
      },
      async () => {
        try {
          const url = `${this.configService.nodeApiBaseUrl}disable_user`;
          const body = { id: p.user.id, status: newStatus };
          const r = (await axios.post(url, body)).data;
          const message = r && r.message ? r.message : 'Usuario deshabilitado';
          await this.UIUtilsService.mostrarAlert({ header: 'Acción realizada', message, buttons: [{ text: 'OK', role: 'cancel' }] });
          p.user.status = newStatus;
          const idx = this.miembros.findIndex(m => m.id == p.id);
          if (idx >= 0 && this.miembros[idx].user) this.miembros[idx].user.status = newStatus;
          this.refreshTable();
        } catch (err: any) {
          const msg = err?.error?.message || 'Error al deshabilitar usuario';
          await this.UIUtilsService.mostrarError({ message: msg });
        }
      }
    )
  }

  private refreshTable(): void {
    if (this.tableEditor) {
      const enriched = this.enrichRows(this.miembros)
      this.tableEditor.loadExternalData(enriched, this.tableColumns)
    }
  }

  async ngOnInit() {
    super.fetch<Role[]>(() => this.roleService.getAll()).subscribe(r => this.roles = r)
    super.fetch<Fotoclub[]>(() => this.fotoclubService.getAll()).subscribe(r => {
      this.fotoclubs = r
      this.cargarMiembros()
    })
  }

  private async cargarMiembros() {
    this.auth.user.then(u => {
      if (!u) return
      this.user = u
      this.userLogged = u
      this.tableColumns = this.buildColumns()
      super.fetch<ProfileExpanded[]>(() => this.rolificador.getMiembros(u)).subscribe(m => {
        this.miembros = m
        setTimeout(() => {
          if (this.tableEditor) {
            const enriched = this.enrichRows(m)
            this.tableEditor.loadExternalData(enriched, this.tableColumns)
          }
        })
      })
    })
  }

  async ionViewWillEnter() {
    this.cargarMiembros()
  }

}
