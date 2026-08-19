import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

import { UserService } from 'src/app/services/user.service';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { User, UserLogged } from 'src/app/models/user.model';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { RolificadorService } from 'src/app/modules/auth/services/rolificador.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';
import { AlertService } from 'src/app/services/ui/alert.service';
import axios from 'axios';
import { SharedModule } from 'src/app/shared/shared.module';

import { TableEditorComponent } from 'src/app/components/table-editor/table-editor.component';
import { ColumnDef, BtnConfig, TableEditorApi } from 'src/app/components/table-editor/table-editor.types';

const API_SORT_FIELDS = ['id', 'username', 'email', 'dni', 'status', 'role_id', 'profile_id', 'created_at', 'updated_at'];
const API_FILTER_FIELDS = ['id', 'username', 'email', 'dni', 'status', 'role_id', 'profile_id'];

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

  loading: boolean = false;
  selectedRow: any = null;

  tableColumns: ColumnDef[] = [];
  userLogged: UserLogged | null = null;

  constructor(
    private userService: UserService,
    alertCtrl: AlertService,
    private router: Router,
    public auth: AuthService,
    public rolificador: RolificadorService,
    public configService: ConfigService,
    public UIUtilsService: UiUtilsService
  ) {
    super(alertCtrl)
  }

  private buildColumns(): ColumnDef[] {
    const isAdmin = this.userLogged && this.rolificador.isAdmin(this.userLogged)
    const cols: ColumnDef[] = [
      {
        field: 'username',
        headerName: 'Usuario',
        sortable: true,
      },
      {
        field: 'email',
        headerName: 'Email',
        sortable: true,
        css: 'd-none d-sm-table-cell',
      },
      {
        field: 'dni',
        headerName: 'DNI',
        sortable: true,
        css: 'd-none d-sm-table-cell',
      },
      {
        field: '_rol',
        headerName: 'Rol',
        sortable: false,
        css: 'd-none d-sm-table-cell',
      },
      {
        field: '_fotoclub',
        headerName: 'Fotoclub',
        sortable: false,
        css: 'd-none d-sm-table-cell',
      },
      {
        field: 'status',
        headerName: 'Estado',
        sortable: true,
        css: 'd-none d-sm-table-cell',
      },
    ]

    if (isAdmin) {
      cols.push({
        field: 'executive_rol',
        headerName: 'Comisión directiva',
        sortable: false,
        css: 'd-none d-sm-table-cell',
      })
    }

    return cols
  }

  private enrichRows(rows: any[], profiles: any[], roles: any[], fotoclubs: any[]): any[] {
    const profileMap = new Map<number, any>()
    for (const p of profiles) if (p?.id != null) profileMap.set(p.id, p)
    const roleMap = new Map<number, any>()
    for (const r of roles) if (r?.id != null) roleMap.set(r.id, r)
    const fotoclubMap = new Map<number, any>()
    for (const f of fotoclubs) if (f?.id != null) fotoclubMap.set(f.id, f)

    return (rows || []).map(r => {
      const profile = profileMap.get(r.profile_id)
      const role = roleMap.get(r.role_id)
      const fc = profile && profile.fotoclub_id != null ? fotoclubMap.get(profile.fotoclub_id) : null
      return {
        ...r,
        _rol: role ? role.type : '',
        _fotoclub: fc ? fc.name : 'Ninguno',
        executive_rol: profile && profile.executive_rol ? profile.executive_rol : '',
      }
    })
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

  getToggleStatusBtn(forToolbar: boolean = false): BtnConfig[] {
    return [
      new BtnConfig({
        key: 'enable',
        icon: 'bi bi-toggle-on',
        severity: 'btn-success',
        label: 'Habilitar',
        isVisible: () => {
          const r = this.selectedRow
          return !!r && (r.status ?? 1) === 0
        },
        isDisabled: () => forToolbar && !this.selectedRow,
        onClick: (row: any) => {
          const r = row || this.selectedRow
          if (r) this.toggleUsuarioStatus(r)
        },
      }),
      new BtnConfig({
        key: 'disable',
        icon: 'bi bi-toggle-on',
        severity: 'btn-danger',
        label: 'Deshabilitar',
        isVisible: () => {
          const r = this.selectedRow
          return !!r && (r.status ?? 1) === 1
        },
        isDisabled: () => forToolbar && !this.selectedRow,
        onClick: (row: any) => {
          const r = row || this.selectedRow
          if (r) this.toggleUsuarioStatus(r)
        },
      }),
    ]
  }

  getTableConfig() {
    return {
      lazy: true,
      infiniteScroll: false,
      selectionMode: 'single' as 'single' | 'multiple' | null,
      showFilterRow: true,
      hideCsvExport: true,
      hideRefresh: false,
      scrollHeight: 'calc(100vh - 200px)',
      elementName: { singular: 'Usuario', gender: 'M' },
      valueFormatters: {
        status: (row: any) => {
          const status = row.status ?? 1
          const cls = status == 1 ? 'bg-success' : 'bg-danger'
          const label = status == 1 ? 'Habilitado' : 'Deshabilitado'
          return `<span class="badge ${cls}">${label}</span>`
        },
        _rol: (row: any) => row._rol || '-',
        _fotoclub: (row: any) => row._fotoclub || 'Ninguno',
        executive_rol: (row: any) => row.executive_rol || 'No',
      },
      buttons: {
        toolbar: [this.getCrearBtn(), this.getEditBtn(true), ...this.getToggleStatusBtn(true)],
      },
    }
  }

  getTableApi(): TableEditorApi {
    return {
      list: async (params: any) => {
        const page = params.page || 1
        const perPage = params.pageSize || 20
        let sort = (params.sortField && API_SORT_FIELDS.includes(params.sortField)) ? params.sortField : 'id'
        const sortDir = params.sortOrder === 'desc' ? 'desc' : 'asc'

        const filters: Record<string, string> = {}
        if (params.filters) {
          let cf: Record<string, string> = {}
          try { cf = typeof params.filters === 'string' ? JSON.parse(params.filters) : (params.filters || {}) } catch { cf = {} }
          for (const [k, v] of Object.entries(cf)) {
            if (v && API_FILTER_FIELDS.includes(k)) filters[k] = v
          }
        }

        return new Promise<any>((resolve, reject) => {
          this.userService.getAllPaged({
            page,
            perPage,
            sort,
            sortDir,
            search: params.search || '',
            filters,
          }).subscribe({
            next: (res: any) => {
              const rows = this.enrichRows(res?.items || [], res?.profile || [], res?.role || [], res?.fotoclub || [])
              resolve({ stat: true, data: { rows, totalRecords: res?._meta?.totalCount ?? rows.length } })
            },
            error: (err: any) => reject(err),
          })
        })
      },
    }
  }

  async toggleUsuarioStatus(u: any) {
    if (!u || u.id == null) {
      await this.UIUtilsService.mostrarError({ message: 'El usuario no tiene un id válido.' });
      return;
    }

    const currentStatus = typeof u.status === 'number' ? u.status : 1;
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
          const body = { id: u.id, status: newStatus };
          const r = (await axios.post(url, body)).data;
          const message = r && r.message ? r.message : 'Usuario deshabilitado';
          await this.UIUtilsService.mostrarAlert({ header: 'Acción realizada', message, buttons: [{ text: 'OK', role: 'cancel' }] });
          this.refreshTable();
        } catch (err: any) {
          const msg = err?.error?.message || 'Error al deshabilitar usuario';
          await this.UIUtilsService.mostrarError({ message: msg });
        }
      }
    )
  }

  private refreshTable(): void {
    if (this.tableEditor) this.tableEditor.refresh()
  }

  async ngOnInit() {
    this.auth.user.then(u => {
      if (!u) return
      this.user = u
      this.userLogged = u
      this.tableColumns = this.buildColumns()
      setTimeout(() => this.refreshTable())
    })
  }

  async ionViewWillEnter() {
    this.auth.user.then(u => {
      if (!u) return
      this.userLogged = u
    })
    if (this.tableEditor) this.tableEditor.refresh()
  }

}
