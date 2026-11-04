import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { OperationLogService } from 'src/app/services/operation-log.service';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { RolificadorService } from 'src/app/modules/auth/services/rolificador.service';
import { AlertService } from 'src/app/services/ui/alert.service';
import { SharedModule } from 'src/app/shared/shared.module';

import { TableEditorComponent } from 'src/app/components/table-editor/table-editor.component';
import { ColumnDef, TableEditorApi } from 'src/app/components/table-editor/table-editor.types';

const API_SORT_FIELDS = ['id', 'id_usuario', 'evento', 'date_time'];
const API_FILTER_FIELDS = ['id_usuario', 'evento', 'username', 'date_time'];

/** Formatea una fecha de la API como dd/MM/yyyy HH:mm:ss. */
function formatFecha(value: any): string {
  if (!value) return '-'
  const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/)
  if (m) return `${m[3]}/${m[2]}/${m[1]} ${m[4]}:${m[5]}:${m[6]}`
  const d = new Date(value)
  if (isNaN(d.getTime())) return String(value)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule, TableEditorComponent],
  selector: 'app-log-operaciones',
  templateUrl: './log-operaciones.page.html',
  styleUrls: ['./log-operaciones.page.scss'],
})
export class LogOperacionesPage extends ApiConsumer implements OnInit {

  @ViewChild('tableEditor') tableEditor!: TableEditorComponent;

  tableColumns: ColumnDef[] = [
    { field: 'date_time', headerName: 'Fecha', sortable: true },
    { field: 'username', headerName: 'Cuenta', sortable: false },
    { field: 'evento', headerName: 'Evento', sortable: true },
    { field: 'meta_data', headerName: 'Detalle', sortable: false, css: 'd-none d-md-table-cell' },
  ];

  constructor(
    private operationLogService: OperationLogService,
    alertCtrl: AlertService,
    public auth: AuthService,
    public rolificador: RolificadorService,
  ) {
    super(alertCtrl)
  }

  getTableConfig() {
    return {
      lazy: true,
      infiniteScroll: false,
      selectionMode: null as 'single' | 'multiple' | null,
      showFilterRow: true,
      hideCsvExport: false,
      scrollHeight: 'calc(100vh - 200px)',
      elementName: { singular: 'Operación', gender: 'F' },
      valueFormatters: {
        date_time: (row: any) => formatFecha(row.date_time),
        username: (row: any) => row.username || `#${row.id_usuario ?? '-'}`,
        meta_data: (row: any) => {
          if (!row.meta_data) return '-'
          try {
            const obj = typeof row.meta_data === 'string' ? JSON.parse(row.meta_data) : row.meta_data
            return `<span title="${JSON.stringify(obj).replace(/"/g, '&quot;')}">${JSON.stringify(obj)}</span>`
          } catch {
            return String(row.meta_data)
          }
        },
      },
    }
  }

  getTableApi(): TableEditorApi {
    return {
      list: async (params: any) => {
        const page = params.page || 1
        const perPage = params.pageSize || 20
        const sort = (params.sortField && API_SORT_FIELDS.includes(params.sortField)) ? params.sortField : 'date_time'
        // Sin orden explícito por columna, la tabla más reciente va primero
        const sortDir = params.sortField && params.sortOrder === 'asc' ? 'asc' : 'desc'

        const filters: Record<string, string> = {}
        if (params.filters) {
          let cf: Record<string, string> = {}
          try { cf = typeof params.filters === 'string' ? JSON.parse(params.filters) : (params.filters || {}) } catch { cf = {} }
          for (const [k, v] of Object.entries(cf)) {
            if (v && API_FILTER_FIELDS.includes(k)) filters[k] = v
          }
        }

        return new Promise<any>((resolve, reject) => {
          this.operationLogService.getAllPaged({
            page,
            perPage,
            sort,
            sortDir,
            search: params.search || '',
            filters,
          }).subscribe({
            next: (res: any) => {
              const rows = res?.items || []
              resolve({ stat: true, data: { rows, totalRecords: res?._meta?.totalCount ?? rows.length } })
            },
            error: (err: any) => reject(err),
          })
        })
      },
    }
  }

  ngOnInit() {}
}
