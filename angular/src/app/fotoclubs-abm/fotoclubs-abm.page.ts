import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiConsumer } from '../models/ApiConsumer';
import { AlertService } from '../services/ui/alert.service';
import { Fotoclub } from '../models/fotoclub.model';
import { ConfigService } from '../services/config/config.service';
import { FotoclubService } from '../services/fotoclub.service';
import { UiUtilsService } from '../services/ui/ui-utils.service';
import { extractErrorMessage } from 'src/app/shared/error-utils';
import { FotoclubPostComponent } from './fotoclub-post/fotoclub-post.component';

import { TableEditorComponent } from 'src/app/components/table-editor/table-editor.component';
import { ColumnDef, BtnConfig } from 'src/app/components/table-editor/table-editor.types';

@Component({
  standalone: true,
  imports: [CommonModule, TableEditorComponent],
  selector: 'app-fotoclubs-abm',
  templateUrl: './fotoclubs-abm.page.html',
  styleUrls: ['./fotoclubs-abm.page.scss'],
})
export class FotoclubsAbmPage extends ApiConsumer implements OnInit {

  @ViewChild('tableEditor') tableEditor!: TableEditorComponent;

  public fotoclubs: Fotoclub[] = [];
  selectedRow: any = null;
  tableColumns: ColumnDef[] = [];

  constructor(
    alertCtrl: AlertService,
    public UIUtilsService: UiUtilsService,
    private fotoclubService: FotoclubService,
    public configService: ConfigService,
  ) {
    super(alertCtrl)
  }

  get aspecto() {
    return document.body.classList.contains("dark")
  }

  onRowSelected(row: any): void {
    this.selectedRow = row
  }

  getCrearBtn(): BtnConfig {
    return new BtnConfig({
      key: 'crear',
      icon: 'bi bi-plus-lg',
      severity: 'btn-success',
      label: 'Institución',
      onClick: () => this.postFotoclub(),
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
        if (r) this.postFotoclub({ ...r })
      },
    })
  }

  getDeleteBtn(forToolbar: boolean = false): BtnConfig {
    return new BtnConfig({
      key: 'delete',
      icon: 'bi bi-trash',
      severity: 'btn-danger',
      label: 'Borrar',
      isDisabled: () => forToolbar && !this.selectedRow,
      onClick: (row: any) => {
        const r = row || this.selectedRow
        if (r) this.deleteFotoclub(r)
      },
    })
  }

  getTableConfig() {
    return {
      lazy: false,
      infiniteScroll: false,
      selectionMode: 'single' as 'single' | 'multiple' | null,
      showFilterRow: false,
      hideCsvExport: true,
      hideRefresh: true,
      scrollHeight: 'calc(100vh - 200px)',
      elementName: { singular: 'Organización', gender: 'F' },
      valueFormatters: {
        _nombre: (row: any) => {
          const imgSrc = row.photo_url
            ? this.configService.imageUrl(row.photo_url)
            : './assets/no-pictures.png'
          const invertStyle = this.aspecto && (!row.photo_url || row.photo_url === '') ? 'filter:invert(100)' : ''
          return `<img src="${imgSrc}" class="rounded me-2" style="${invertStyle};object-fit:cover;border-radius:6px" width="32" height="32"><span class="align-middle">${row.name}</span>`
        },
        _habilitado: (row: any) => {
          const cls = row.enabled ? 'bg-success' : 'bg-danger'
          const label = row.enabled ? 'Sí' : 'No'
          return `<span class="badge ${cls}">${label}</span>`
        },
      },
      buttons: {
        toolbar: [this.getCrearBtn(), this.getEditBtn(true), this.getDeleteBtn(true)],
      },
    }
  }

  private buildColumns(): ColumnDef[] {
    return [
      { field: '_nombre', headerName: 'Organización', sortable: true },
      { field: '_habilitado', headerName: 'Habilitado', sortable: true },
    ]
  }

  private enrichRows(rows: Fotoclub[]): any[] {
    return rows.map(r => ({
      ...r,
      _nombre: r.name,
      _habilitado: r.enabled ? 'Sí' : 'No',
    }))
  }

  private refreshTable(): void {
    if (this.tableEditor) {
      const enriched = this.enrichRows(this.fotoclubs)
      this.tableEditor.loadExternalData(enriched, this.tableColumns)
    }
  }

  async ngOnInit() {
    await this.UIUtilsService.presentLoading()
    super.fetch<Fotoclub[]>(() => this.fotoclubService.getAll('inc_disabled=true')).subscribe(fs => {
      this.fotoclubs = fs
      this.tableColumns = this.buildColumns()
      this.UIUtilsService.dismissLoading()
      setTimeout(() => {
        if (this.tableEditor) {
          const enriched = this.enrichRows(fs)
          this.tableEditor.loadExternalData(enriched, this.tableColumns)
        }
      })
    })
  }

  async postFotoclub(f: Fotoclub = undefined) {
    const { fotoclub } = await this.UIUtilsService.mostrarModal(FotoclubPostComponent, { fotoclub: f ? { ...f } : undefined })
    if (fotoclub == undefined) return
    await this.UIUtilsService.presentLoading()
    super.fetch<Fotoclub[]>(() => this.fotoclubService.getAll('inc_disabled=true')).subscribe(fs => {
      this.fotoclubs = fs
      this.UIUtilsService.dismissLoading()
      this.refreshTable()
    })
  }

  async deleteFotoclub(f: Fotoclub) {
    const id = f.id
    await this.UIUtilsService.mostrarAlert({
      header: 'Confirmar borrado',
      message: 'No se podrá eliminar si tiene usuarios asociados.'
      },
      async () => {
        super.fetch<void>(() => this.fotoclubService.delete(id)).subscribe(
          _ => {
            const idx = this.fotoclubs.findIndex(x => x.id == id)
            if (idx >= 0) this.fotoclubs.splice(idx, 1)
            this.refreshTable()
          },
          async err => {
            this.UIUtilsService.mostrarError({ message: extractErrorMessage(err) })
          }
        )
      }
    )
  }

}
