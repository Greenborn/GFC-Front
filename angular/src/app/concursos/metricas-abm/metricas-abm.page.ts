import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { AlertService } from 'src/app/services/ui/alert.service';
import { Metric } from 'src/app/models/metric.model';
import { MetricAbmService } from 'src/app/services/metric-abm.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';
import { extractErrorMessage } from 'src/app/shared/error-utils';
import { MetricasPostComponent } from './metricas-post/metricas-post.component';

import { TableEditorComponent } from 'src/app/components/table-editor/table-editor.component';
import { ColumnDef, BtnConfig } from 'src/app/components/table-editor/table-editor.types';

@Component({
  standalone: true,
  imports: [CommonModule, TableEditorComponent],
  selector: 'app-metricas-abm',
  templateUrl: './metricas-abm.page.html',
  styleUrls: ['./metricas-abm.page.scss'],
})
export class MetricasAbmPage extends ApiConsumer implements OnInit {

  @ViewChild('tableEditor') tableEditor!: TableEditorComponent;

  public metricas: Metric[] = [];
  selectedRow: any = null;
  tableColumns: ColumnDef[] = [];

  constructor(
    alertCtrl: AlertService,
    public metricAbmService: MetricAbmService,
    private UIUtilsService: UiUtilsService
  ) {
    super(alertCtrl)
  }

  onRowSelected(row: any): void {
    this.selectedRow = row
  }

  getCrearBtn(): BtnConfig {
    return new BtnConfig({
      key: 'crear',
      icon: 'bi bi-plus-lg',
      severity: 'btn-success',
      label: 'Premio',
      onClick: () => this.post(),
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
        if (r) this.post({ ...r })
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
        if (r) this.delete(r)
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
      elementName: { singular: 'Premio', gender: 'M' },
      buttons: {
        toolbar: [this.getCrearBtn(), this.getEditBtn(true), this.getDeleteBtn(true)],
      },
    }
  }

  private buildColumns(): ColumnDef[] {
    return [
      { field: 'prize', headerName: 'Premio', sortable: true },
      { field: 'score', headerName: 'Puntaje', sortable: true },
    ]
  }

  private refreshTable(): void {
    if (this.tableEditor) {
      this.tableEditor.loadExternalData(this.metricas, this.tableColumns)
    }
  }

  async ngOnInit() {
    await this.UIUtilsService.presentLoading()
    super.fetch<Metric[]>(() => this.metricAbmService.getAll()).subscribe(s => {
      this.metricas = s
      this.tableColumns = this.buildColumns()
      this.UIUtilsService.dismissLoading()
      setTimeout(() => {
        if (this.tableEditor) {
          this.tableEditor.loadExternalData(s, this.tableColumns)
        }
      })
    })
  }

  async post(metric: Metric = undefined) {
    const componentProps: any = metric != undefined ? { metric } : {}
    componentProps.parentSections = this.metricas
    const { metric: s } = await this.UIUtilsService.mostrarModal(MetricasPostComponent, componentProps)
    if (s) {
      const i = this.metricas.findIndex(s1 => s1.id == s.id)
      if (i > -1) {
        this.metricas[i] = s
      } else {
        this.metricas.push(s)
      }
      this.refreshTable()
    }
  }

  delete(metric: Metric) {
    this.UIUtilsService.mostrarAlert({
      header: 'Confirmar borrado',
      message: 'No se podrá eliminar si tiene concursos asociados.'
      }, async () => {
        this.fetch<void>(() =>
          this.metricAbmService.delete(metric.id)
        ).subscribe(
          _ => {
            this.metricas.splice(this.metricas.findIndex(s => s.id == metric.id), 1)
            this.refreshTable()
          },
          async err => this.UIUtilsService.mostrarError({ message: extractErrorMessage(err) })
        )
    })
  }

}
