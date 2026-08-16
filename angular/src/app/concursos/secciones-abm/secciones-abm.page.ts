import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { AlertService } from 'src/app/services/ui/alert.service';
import { Section } from 'src/app/models/section.model';
import { SectionService } from 'src/app/services/section.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';
import { extractErrorMessage } from 'src/app/shared/error-utils';
import { SeccionPostComponent } from './seccion-post/seccion-post.component';

import { TableEditorComponent } from 'src/app/components/table-editor/table-editor.component';
import { ColumnDef, BtnConfig } from 'src/app/components/table-editor/table-editor.types';

@Component({
  standalone: true,
  imports: [CommonModule, TableEditorComponent],
  selector: 'app-secciones-abm',
  templateUrl: './secciones-abm.page.html',
  styleUrls: ['./secciones-abm.page.scss'],
})
export class SeccionesAbmPage extends ApiConsumer implements OnInit {

  @ViewChild('tableEditor') tableEditor!: TableEditorComponent;

  public sections: Section[] = [];
  selectedRow: any = null;
  tableColumns: ColumnDef[] = [];

  constructor(
    alertCtrl: AlertService,
    public sectionService: SectionService,
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
      label: 'Sección',
      onClick: () => this.postSection(),
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
        if (r) this.postSection({ ...r })
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
        if (r) this.deleteSection(r)
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
      elementName: { singular: 'Sección', gender: 'F' },
      buttons: {
        toolbar: [this.getCrearBtn(), this.getEditBtn(true), this.getDeleteBtn(true)],
      },
    }
  }

  private buildColumns(): ColumnDef[] {
    return [
      { field: 'name', headerName: 'Nombre', sortable: true },
    ]
  }

  private refreshTable(): void {
    if (this.tableEditor) {
      this.tableEditor.loadExternalData(this.sections, this.tableColumns)
    }
  }

  async ngOnInit() {
    await this.UIUtilsService.presentLoading()
    super.fetch<Section[]>(() => this.sectionService.getAll()).subscribe(s => {
      this.sections = s
      this.tableColumns = this.buildColumns()
      this.UIUtilsService.dismissLoading()
      setTimeout(() => {
        if (this.tableEditor) {
          this.tableEditor.loadExternalData(s, this.tableColumns)
        }
      })
    })
  }

  async postSection(section: Section = undefined) {
    const componentProps: any = section != undefined ? { section } : {}
    componentProps.parentSections = this.sections
    const { section: s } = await this.UIUtilsService.mostrarModal(SeccionPostComponent, componentProps)
    if (s) {
      const i = this.sections.findIndex(s1 => s1.id == s.id)
      if (i > -1) {
        this.sections[i] = s
      } else {
        this.sections.push(s)
      }
      this.refreshTable()
    }
  }

  deleteSection(section: Section) {
    this.UIUtilsService.mostrarAlert({
      header: 'Confirmar borrado',
      message: 'No se podrá eliminar si tiene concursos o imagenes asociadas.'
      }, async () => {
        this.fetch<void>(() =>
          this.sectionService.delete(section.id)
        ).subscribe(
          _ => {
            this.sections.splice(this.sections.findIndex(s => s.id == section.id), 1)
            this.refreshTable()
          },
          async err => this.UIUtilsService.mostrarError({ message: extractErrorMessage(err) })
        )
    })
  }

}
