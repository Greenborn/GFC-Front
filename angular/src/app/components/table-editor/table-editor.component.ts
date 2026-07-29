import {
  Component, Input, Output, EventEmitter, signal, computed, effect,
  OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef,
  ChangeDetectionStrategy
} from '@angular/core'
import { NgFor, NgIf } from '@angular/common'
import { FormsModule } from '@angular/forms'
import {
  ColumnDef, TableEditorApi, TableEditorConfig, BtnConfig,
  CellValue, InlineEditingConfig
} from './table-editor.types'
import { PreferenciasService } from './preferencias.service'

@Component({
  selector: 'app-table-editor',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './table-editor.component.html',
  styleUrls: ['./table-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableEditorComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input({ required: false }) api: TableEditorApi | null = null
  @Input() permisos: Record<string, boolean> = {}
  @Input() config: TableEditorConfig = {}
  @Input() data: any[] | null = null
  @Input() id: string | null = null
  @Input() columns: ColumnDef[] | null = null

  @Output() loaded = new EventEmitter<boolean>()
  @Output() rowSelected = new EventEmitter<any>()
  @Output() rowDoubleClick = new EventEmitter<any>()

  @ViewChild('scrollWrapRef') scrollWrapRef!: ElementRef
  @ViewChild('sentinelRef') sentinelRef!: ElementRef<HTMLDivElement>
  @ViewChild('inlineEditRef') inlineEditRef!: ElementRef<HTMLInputElement>

  rows = signal<any[]>([])
  columnDefs = signal<ColumnDef[]>([])
  selectedColumns = signal<ColumnDef[]>([])
  availableColumns = signal<ColumnDef[]>([])
  isLoaded = signal(false)
  editEnabled = signal(true)
  selectionMode = signal<'single' | 'multiple' | null>('single')
  selectedRow = signal<any | null>(null)
  selectedRowsMap = signal<Map<any, boolean>>(new Map())
  sortField = signal<string | null>(null)
  sortOrder = signal<'asc' | 'desc'>('asc')
  columnFilters = signal<Record<string, string>>({})
  globalFilterValue = signal('')
  page = signal(1)
  pageSize = signal(25)
  pageSizeOptions = signal([25, 50, 100, 200])
  scrollHeight = signal<string | null>(null)
  showPaginator = signal(true)
  showFilterRow = signal(false)
  striped = signal(true)
  resizableColumns = signal(true)
  reorderableColumns = signal(true)
  selectionColWidth = signal('3rem')
  actionColWidth = signal('10rem')
  columnWidths = signal<Record<string, string>>({})
  columnOrder = signal<string[]>([])
  loading = signal(false)
  totalRecords = signal(0)
  isLoadingMore = signal(false)
  hasMorePages = signal(true)
  infinitePage = signal(1)

  dragField = signal<string | null>(null)
  dragOverField = signal<string | null>(null)
  dropSide = signal<'left' | 'right' | null>(null)

  resizingField = signal<string | null>(null)
  private resizeStartX: number | null = null
  private resizeStartWidth: number | null = null

  editingCell = signal<{ row: any; field: string } | null>(null)
  inlineEditValue = signal('')
  private inlineSaveTimer: any = null
  private pendingInlineSave: any = null

  private filterTimer: any = null
  private gfTimer: any = null
  private colsTimer: any = null

  private saveTimer: any = null

  private infiniteObserver: IntersectionObserver | null = null

  private onResizeMoveBinded: any = null
  private onResizeEndBinded: any = null

  elementLabels = signal({
    create: 'Nuevo', edit: 'Editar', delete: 'Borrar',
    article: 'un', deleted: 'eliminado',
  })

  lazy = computed(() => this.config?.lazy === true)

  infiniteScroll = computed(() =>
    this.config?.infiniteScroll === true ||
    (this.config?.infiniteScroll !== false && this.lazy())
  )

  visibleColumns = computed(() => {
    const sel = this.selectedColumns()
    const order = this.columnOrder()
    if (order.length) {
      const ordered: ColumnDef[] = []
      for (const f of order) {
        const found = sel.find(c => c.field === f)
        if (found) ordered.push(found)
      }
      for (const c of sel) {
        if (!ordered.some(x => x.field === c.field)) ordered.push(c)
      }
      return ordered
    }
    return sel
  })

  hasColumnGroups = computed(() =>
    this.config?.columnGroups?.length > 0
  )

  inlineEditingConfig = computed<InlineEditingConfig | undefined>(() =>
    this.config?.inlineEditing
  )

  inlineEditFields = computed(() =>
    this.inlineEditingConfig()?.campos || {}
  )

  totalColspan = computed(() => {
    let n = this.visibleColumns().length + 1
    if (this.selectionMode() !== null) n++
    if (this.rowActionButtons().length) n++
    return n
  })

  columnGroupHeaders = computed(() => {
    if (!this.hasColumnGroups()) return []
    const groups = this.config?.columnGroups || []
    const cols = this.visibleColumns()
    const fieldToGroup: Record<string, number> = {}
    for (let gi = 0; gi < groups.length; gi++) {
      for (const f of groups[gi].fields) fieldToGroup[f] = gi
    }
    const result: any[] = []
    let i = 0
    while (i < cols.length) {
      const col = cols[i]
      const gi = fieldToGroup[col.field]
      if (gi !== undefined) {
        const groupCols: ColumnDef[] = []
        while (i < cols.length && fieldToGroup[cols[i].field] === gi) {
          groupCols.push(cols[i])
          i++
        }
        result.push({
          _key: 'g-' + gi, _type: 'group',
          headerName: groups[gi].headerName,
          _span: groupCols.length, _cols: groupCols,
        })
      } else {
        result.push({ _key: 'c-' + col.field, _type: 'col', _col: col })
        i++
      }
    }
    return result
  })

  filteredRows = computed(() => {
    let r = this.rows() || []
    const gf = this.globalFilterValue()
    const cols = this.visibleColumns()
    const cf = this.columnFilters()

    if (gf) {
      const q = gf.toLowerCase()
      r = r.filter(row =>
        cols.some(c => {
          const v = row[c.field]
          return v != null && String(v).toLowerCase().includes(q)
        })
      )
    }

    for (const col of cols) {
      const fv = cf[col.field]
      if (fv) {
        const q = fv.toLowerCase()
        r = r.filter(row => {
          const v = row[col.field]
          return v != null && String(v).toLowerCase().includes(q)
        })
      }
    }

    const sf = this.sortField()
    if (sf) {
      const so = this.sortOrder()
      r = [...r].sort((a, b) => {
        let va = a[sf], vb = b[sf]
        if (va == null) va = ''
        if (vb == null) vb = ''
        if (typeof va === 'number' && typeof vb === 'number') {
          return so === 'asc' ? va - vb : vb - va
        }
        va = String(va).toLowerCase()
        vb = String(vb).toLowerCase()
        return so === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
      })
    }
    return r
  })

  totalRows = computed(() =>
    this.lazy() ? this.totalRecords() : this.filteredRows().length
  )

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalRows() / this.pageSize()))
  )

  displayRows = computed(() => {
    if (this.infiniteScroll() || this.lazy()) return this.rows() || []
    const p = this.page()
    const ps = this.pageSize()
    const start = (p - 1) * ps
    return this.filteredRows().slice(start, start + ps)
  })

  pageStart = computed(() => (this.page() - 1) * this.pageSize() + 1)

  pageEnd = computed(() =>
    Math.min(this.page() * this.pageSize(), this.totalRows())
  )

  isAllSelected = computed(() =>
    this.displayRows().length > 0 &&
    this.displayRows().every(r => this.isSelected(r))
  )

  rowActionButtons = computed<BtnConfig[]>(() =>
    this.config?.buttons?.rowActions || []
  )

  toolbarButtons = computed<BtnConfig[]>(() => {
    const btns: BtnConfig[] = []
    const refresh = new BtnConfig({
      key: 'refresh', icon: 'bi bi-arrow-clockwise',
      severity: 'btn-outline-info',
      isVisible: () => !this.config?.hideRefresh,
      onClick: () => this.refresh(),
    })
    btns.push(refresh)

    const csv = new BtnConfig({
      key: 'csv', icon: 'bi bi-download',
      severity: 'btn-outline-info', label: 'CSV',
      isVisible: () => !this.config?.hideCsvExport,
      onClick: () => this.exportCsv(),
    })
    btns.push(csv)

    const create = new BtnConfig({
      key: 'create', icon: 'bi bi-plus-lg',
      severity: 'btn-success',
      isVisible: () => this.api?.create != null,
      getLabel: () => this.elementLabels().create,
      onClick: () => this.createRecord(),
    })
    btns.push(create)

    const edit = new BtnConfig({
      key: 'edit', icon: 'bi bi-pencil',
      severity: 'btn-warning',
      isVisible: () => this.api?.edit != null,
      getLabel: () => this.elementLabels().edit,
      isDisabled: () => this.editEnabled(),
      onClick: () => this.editRecord(),
    })
    btns.push(edit)

    const del = new BtnConfig({
      key: 'delete', icon: 'bi bi-trash',
      severity: 'btn-danger',
      isVisible: () => this.api?.delete != null,
      getLabel: () => this.elementLabels().delete,
      isDisabled: () => this.editEnabled(),
      onClick: () => this.deleteRecord(),
    })
    btns.push(del)

    if (this.config?.buttons?.toolbar) {
      for (const b of this.config.buttons.toolbar) {
        btns.push(b instanceof BtnConfig ? b : new BtnConfig(b))
      }
    }
    return btns
  })

  constructor(private prefStore: PreferenciasService) {
    this.onResizeMoveBinded = this.onResizeMove.bind(this)
    this.onResizeEndBinded = this.onResizeEnd.bind(this)
  }

  ngOnInit(): void {
    this.applyConfig()
    this.prefStore.fetchMisPreferencias().then(() => this.loadData())
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.setupInfiniteScroll())
  }

  ngOnDestroy(): void {
    document.removeEventListener('pointermove', this.onResizeMoveBinded)
    document.removeEventListener('pointerup', this.onResizeEndBinded)
    this.infiniteObserver?.disconnect()
    if (this.inlineSaveTimer) { clearTimeout(this.inlineSaveTimer) }
    if (this.pendingInlineSave) {
      this.pendingInlineSave.api(this.pendingInlineSave.data)
    }
    if (this.saveTimer) clearTimeout(this.saveTimer)
    if (this.filterTimer) clearTimeout(this.filterTimer)
    if (this.gfTimer) clearTimeout(this.gfTimer)
    if (this.colsTimer) clearTimeout(this.colsTimer)
  }

  private getPrefKey(): string | null {
    return this.id ? `te_cfg_${this.id}` : null
  }

  private loadPersistedConfig(): any {
    const key = this.getPrefKey()
    if (!key) return null
    return this.prefStore.valor(key)
  }

  private async savePersistedConfig(): Promise<void> {
    const key = this.getPrefKey()
    if (!key) return
    const cols = this.visibleColumns()
    const fields = cols.map(c => c.field)
    const cw: Record<string, string> = {}
    for (const f of fields) cw[f] = this.columnWidths()[f] || '15rem'
    const ord = this.columnOrder().length ? this.columnOrder() : fields
    await this.prefStore.guardarMisPreferencias({
      [key]: JSON.stringify({ columnOrder: ord, columnWidths: cw })
    })
  }

  private debouncedPersist(): void {
    if (this.saveTimer) clearTimeout(this.saveTimer)
    this.saveTimer = setTimeout(() => this.savePersistedConfig(), 500)
  }

  applyConfig(): void {
    if (this.config?.selectionMode != null)
      this.selectionMode.set(this.config.selectionMode as any)
    if (this.config?.elementName?.gender === 'F') {
      this.elementLabels.set({
        create: 'Nueva', edit: 'Editar', delete: 'Borrar',
        article: 'una', deleted: 'eliminada',
      })
    }
    if (this.config?.pageSize != null) this.pageSize.set(this.config.pageSize)
    if (this.config?.pageSizeOptions != null)
      this.pageSizeOptions.set(this.config.pageSizeOptions)
    if (this.config?.scrollHeight != null)
      this.scrollHeight.set(this.config.scrollHeight)
    if (this.config?.showPaginator != null)
      this.showPaginator.set(this.config.showPaginator)
    if (this.config?.showFilterRow != null)
      this.showFilterRow.set(this.config.showFilterRow)
  }

  toggleColumnVisibility(col: ColumnDef, event: any): void {
    const checked = event?.target?.checked ?? !this.selectedColumns().includes(col)
    if (checked) {
      if (!this.selectedColumns().includes(col)) {
        this.selectedColumns.update(list => [...list, col])
      }
    } else {
      this.selectedColumns.update(list => list.filter(c => c !== col))
    }
    this.onColumnsChangeDebounced()
  }

  private invertHexColor(h: string): string | null {
    if (h.length !== 7) return null
    return '#' + (255 - parseInt(h.slice(1, 3), 16)).toString(16).padStart(2, '0') +
      (255 - parseInt(h.slice(3, 5), 16)).toString(16).padStart(2, '0') +
      (255 - parseInt(h.slice(5, 7), 16)).toString(16).padStart(2, '0')
  }

  private unwrapCell(row: any, col: ColumnDef): CellValue {
    if (row == null) return { value: null, style: null }
    const v = row[col?.field]
    if (v != null && typeof v === 'object' && '__style' in v) {
      return { value: v.value, style: v.__style }
    }
    if (row.__field_styles?.[col?.field]) {
      return { value: v, style: row.__field_styles[col?.field] }
    }
    return { value: v, style: null }
  }

  cellStyle(row: any, col: ColumnDef): string | null {
    return this.unwrapCell(row, col).style
  }

  formatCell(row: any, col: ColumnDef): string {
    let { value: data } = this.unwrapCell(row, col)
    if (data == null || data === '') return '-'
    const formatter = this.config?.valueFormatters?.[col?.field]
    if (col?.form_type === 'color') {
      const bg = '#' + (data || '000000')
      const fg = this.invertHexColor(bg) || '#ffffff'
      return `<span class="te-color-badge" style="background:${bg};color:${fg}">${data}</span>`
    }
    if (col?.form_type === 'json') return JSON.stringify(data)
    if (col?.type === 'date' || col?.field?.endsWith('_at') || col?.field?.endsWith('At')) {
      try { return new Date(data).toLocaleDateString() } catch { return data }
    }
    if (col?.type === 'datetime') {
      try { return new Date(data).toLocaleString() } catch { return data }
    }
    if (col?.type === 'boolean' || col?.type === 'bool') return data ? 'Sí' : 'No'
    if (typeof formatter === 'function') return formatter(row)
    return String(data)
  }

  isSelected(row: any): boolean {
    if (this.selectionMode() === 'single') {
      return this.selectedRow() === row
    }
    return this.selectedRowsMap().has(row)
  }

  selectSingle(row: any): void {
    this.selectedRow.set(row)
    this.editEnabled.set(false)
    this.rowSelected.emit(row)
  }

  toggleRowSelection(row: any): void {
    const m = new Map(this.selectedRowsMap())
    if (m.has(row)) m.delete(row)
    else m.set(row, true)
    this.selectedRowsMap.set(m)
    this.editEnabled.set(m.size === 0)
    this.rowSelected.emit([...m.keys()])
  }

  toggleSelectAll(): void {
    if (this.isAllSelected()) {
      this.selectedRowsMap.set(new Map())
      this.editEnabled.set(true)
      this.rowSelected.emit([])
    } else {
      const m = new Map<any, boolean>()
      for (const r of this.displayRows()) m.set(r, true)
      this.selectedRowsMap.set(m)
      this.editEnabled.set(false)
      this.rowSelected.emit([...m.keys()])
    }
  }

  onRowClick(row: any, event: MouseEvent): void {
    if (this.resizingField()) return
    if (this.selectionMode() === 'multiple') {
      this.toggleRowSelection(row)
    } else {
      this.selectSingle(row)
    }
  }

  onRowDblClick(row: any): void {
    if (this.resizingField()) return
    this.rowDoubleClick.emit(row)
  }

  onSortClick(field: string): void {
    if (this.resizingField()) return
    const col = this.visibleColumns().find(c => c.field === field)
    if (col?.sortable === false) return
    if (this.sortField() === field) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc')
    } else {
      this.sortField.set(field)
      this.sortOrder.set('asc')
    }
    this.page.set(1)
    if (this.lazy()) {
      if (this.infiniteScroll()) {
        this.infinitePage.set(1)
        this.hasMorePages.set(true)
        this.rows.set([])
      }
      this.loadLazyData()
    }
  }

  onGlobalFilterDebounced(): void {
    if (this.gfTimer) clearTimeout(this.gfTimer)
    this.gfTimer = setTimeout(() => {
      this.page.set(1)
      if (this.lazy()) {
        if (this.infiniteScroll()) {
          this.infinitePage.set(1)
          this.hasMorePages.set(true)
          this.rows.set([])
        }
        this.loadLazyData()
      }
    }, 300)
  }

  onColumnFilterChange(field: string, value: string): void {
    this.columnFilters.set({ ...this.columnFilters(), [field]: value })
    this.onColumnFilterDebounced()
  }

  onColumnFilterDebounced(): void {
    if (this.filterTimer) clearTimeout(this.filterTimer)
    this.filterTimer = setTimeout(() => {
      this.page.set(1)
      if (this.lazy()) {
        if (this.infiniteScroll()) {
          this.infinitePage.set(1)
          this.hasMorePages.set(true)
          this.rows.set([])
        }
        this.loadLazyData()
      }
    }, 400)
  }

  onColumnsChangeDebounced(): void {
    if (this.colsTimer) clearTimeout(this.colsTimer)
    this.colsTimer = setTimeout(() => this.debouncedPersist(), 300)
  }

  goToPage(p: number): void {
    this.flushInlineEdit()
    const np = Math.max(1, Math.min(p, this.totalPages()))
    this.page.set(np)
    if (this.lazy()) this.loadLazyData()
  }

  onPageSizeChange(): void {
    this.flushInlineEdit()
    this.page.set(1)
    if (this.lazy()) this.loadLazyData()
  }

  onResizeStart(e: PointerEvent, field: string): void {
    if (e.button !== 0 || this.dragField()) return
    e.preventDefault()
    const el = (e.currentTarget as HTMLElement)?.closest?.('th, td') as HTMLElement
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (rect.right - e.clientX > 11) return
    try { el.setPointerCapture(e.pointerId) } catch (_) {}
    this.resizingField.set(field)
    this.resizeStartX = e.clientX
    this.resizeStartWidth = el.offsetWidth
    document.body.style.cursor = 'col-resize'
    document.body.classList.add('te-resizing')
    document.addEventListener('pointermove', this.onResizeMoveBinded)
    document.addEventListener('pointerup', this.onResizeEndBinded)
  }

  onResizeMove(e: PointerEvent): void {
    if (!this.resizingField() || this.resizeStartX == null || this.resizeStartWidth == null) return
    const nw = Math.max(100, this.resizeStartWidth + (e.clientX - this.resizeStartX))
    this.columnWidths.update(v => ({ ...v, [this.resizingField()!]: nw + 'px' }))
  }

  onResizeEnd(): void {
    document.removeEventListener('pointermove', this.onResizeMoveBinded)
    document.removeEventListener('pointerup', this.onResizeEndBinded)
    document.body.style.cursor = ''
    document.body.classList.remove('te-resizing')
    if (this.resizingField()) this.debouncedPersist()
    this.resizeStartX = null
    this.resizeStartWidth = null
    this.resizingField.set(null)
  }

  onResizeDblClick(e: MouseEvent, field: string): void {
    const pe = new PointerEvent('pointerdown', {
      clientX: e.clientX,
      clientY: e.clientY,
      button: 0,
    })
    this.onResizeStart(pe, field)
  }

  onDragStart(e: DragEvent, field: string): void {
    if (this.resizingField()) { e.preventDefault(); return }
    this.dragField.set(field)
    this.dragOverField.set(null)
    this.dropSide.set(null)
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', field)
    }
  }

  onDragEnter(e: DragEvent, field: string): void {
    if (this.dragField() === field) return
    const ct = e.currentTarget as HTMLElement
    if (e.relatedTarget && ct.contains(e.relatedTarget as Node)) return
    this.dragOverField.set(field)
  }

  onDragOver(e: DragEvent, field: string): void {
    if (this.dragField() === field) return
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    this.dropSide.set(e.clientX < rect.left + rect.width / 2 ? 'left' : 'right')
  }

  onDragLeave(e: DragEvent, field: string): void {
    const ct = e.currentTarget as HTMLElement
    if (ct.contains(e.relatedTarget as Node)) return
    if (this.dragOverField() === field) {
      this.dragOverField.set(null)
      this.dropSide.set(null)
    }
  }

  onDrop(e: DragEvent, field: string): void {
    if (!this.dragField() || this.dragField() === field) { this.onDragEnd(); return }
    const order = this.columnOrder().length
      ? [...this.columnOrder()]
      : this.selectedColumns().map(c => c.field)
    const from = order.indexOf(this.dragField()!)
    const to = order.indexOf(field)
    if (from < 0 || to < 0) { this.onDragEnd(); return }
    const [m] = order.splice(from, 1)
    const at = from < to
      ? (this.dropSide() === 'right' ? to : to - 1)
      : (this.dropSide() === 'left' ? to : to + 1)
    order.splice(Math.max(0, Math.min(order.length, at)), 0, m)
    this.columnOrder.set(order)
    this.debouncedPersist()
    this.onDragEnd()
  }

  onDragEnd(): void {
    this.dragField.set(null)
    this.dragOverField.set(null)
    this.dropSide.set(null)
  }

  getInlineEditCfg(col: ColumnDef): any {
    return this.inlineEditFields()[col?.field] || null
  }

  isEditingCell(row: any, col: ColumnDef): boolean {
    const ec = this.editingCell()
    return ec ? ec.row === row && ec.field === col.field : false
  }

  startInlineEdit(event: any, row: any, col: ColumnDef): void {
    const cfg = this.getInlineEditCfg(col)
    if (!cfg) return
    event?.stopPropagation?.()
    const val = row[col.field] ?? ''
    this.editingCell.set({ row, field: col.field })
    this.inlineEditValue.set(val)
    setTimeout(() => {
      if (this.inlineEditRef?.nativeElement) {
        this.inlineEditRef.nativeElement.focus()
        this.inlineEditRef.nativeElement.select()
      }
    })
  }

  confirmInlineEdit(row: any, col: ColumnDef): void {
    if (!this.editingCell()) return
    const cfg = this.getInlineEditCfg(col)
    if (!cfg) { this.cancelInlineEdit(); return }
    let val: any = this.inlineEditValue()
    if (cfg.type === 'integer') {
      val = parseInt(val, 10)
      if (isNaN(val) || (cfg.min !== undefined && val < cfg.min)) { this.cancelInlineEdit(); return }
    } else if (cfg.type === 'number') {
      val = parseFloat(val)
      if (isNaN(val) || (cfg.min !== undefined && val < cfg.min)) { this.cancelInlineEdit(); return }
    }
    row[col.field] = val
    if (!row.__raw) row.__raw = {}
    row.__raw[col.field] = val
    if (cfg.afterEdit) cfg.afterEdit(row, col.field, val)
    this.editingCell.set(null)
    this.debouncedInlineSave(row, col.field, val)
  }

  cancelInlineEdit(): void {
    this.editingCell.set(null)
    this.inlineEditValue.set('')
  }

  private debouncedInlineSave(row: any, field: string, value: any): void {
    const cfg = this.inlineEditingConfig()
    if (!cfg?.api) return
    const id = row.id
    if (!id) return
    if (this.inlineSaveTimer) { clearTimeout(this.inlineSaveTimer) }
    if (this.pendingInlineSave) {
      this.pendingInlineSave.api(this.pendingInlineSave.data)
      this.pendingInlineSave = null
    }
    this.pendingInlineSave = { api: cfg.api, data: { id, field, value } }
    this.inlineSaveTimer = setTimeout(async () => {
      const res = await cfg.api!({ id, field, value })
      this.pendingInlineSave = null
      if (res?.stat && cfg.onSave) cfg.onSave()
    }, cfg.debounce_ms ?? 1000)
  }

  private flushInlineEdit(): void {
    this.editingCell.set(null)
    this.inlineEditValue.set('')
    if (this.inlineSaveTimer) { clearTimeout(this.inlineSaveTimer) }
    if (this.pendingInlineSave) {
      this.pendingInlineSave.api(this.pendingInlineSave.data)
      this.pendingInlineSave = null
    }
  }

  createRecord(): void {
    console.log('[TableEditor] createRecord - implementar via api.create')
  }

  editRecord(): void {
    console.log('[TableEditor] editRecord - implementar via api.edit')
  }

  deleteRecord(): void {
    console.log('[TableEditor] deleteRecord - implementar via api.delete')
  }

  exportCsv(): void {
    const data = this.rows() || []
    if (!data.length) return
    const cols = this.visibleColumns()
    let csv = cols.map(c => this.csvEscape(c.headerName)).join(',') + '\n'
    for (const r of data) {
      csv += cols.map(c => this.csvEscape(r[c.field] != null ? String(r[c.field]) : '')).join(',') + '\n'
    }
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent('\uFEFF' + csv)
    a.download = 'datos.csv'
    a.click()
  }

  private csvEscape(v: string): string {
    v = String(v).replace(/"/g, '""')
    return v.includes(',') || v.includes('"') || v.includes('\n') ? '"' + v + '"' : v
  }

  refresh(): void {
    this.flushInlineEdit()
    this.selectedRow.set(null)
    this.selectedRowsMap.set(new Map())
    this.editEnabled.set(true)
    if (this.infiniteScroll()) {
      this.infinitePage.set(1)
      this.hasMorePages.set(true)
      this.rows.set([])
    }
    this.loadData()
  }

  async loadData(dataOverride?: any): Promise<void> {
    const src = dataOverride || this.data
    if (src != null) {
      this.processData(src, this.columns)
      return
    }
    if (this.api?.list) {
      if (this.lazy()) return this.loadLazyData()
      this.loading.set(true)
      try {
        const res = await this.api.list({})
        if (res?.stat) this.processData(res.data)
      } catch (err) {
        console.error('[TableEditor] load error:', err)
      } finally {
        this.loading.set(false)
      }
    }
    this.rowSelected.emit(this.selectionMode() === 'single' ? null : [])
    this.selectedRow.set(null)
    this.selectedRowsMap.set(new Map())
  }

  loadExternalData(rows: any[], columns?: ColumnDef[]): void {
    this.processData(rows, columns)
  }

  private async loadLazyData(): Promise<void> {
    this.flushInlineEdit()
    this.loading.set(true)
    const p: any = {
      page: this.infiniteScroll() ? this.infinitePage() : this.page(),
      pageSize: this.pageSize(),
      sortField: this.sortField() || '',
      sortOrder: this.sortOrder(),
      search: this.globalFilterValue() || '',
    }
    const cf: Record<string, string> = {}
    for (const [k, v] of Object.entries(this.columnFilters())) {
      if (v) cf[k] = v
    }
    if (Object.keys(cf).length) p.filters = JSON.stringify(cf)
    try {
      const res = await this.api!.list!(p)
      if (res?.stat) {
        this.totalRecords.set(res.data.totalRecords || res.data.total || 0)
        this.processData(res.data)
      }
    } catch (err) {
      console.error('[TableEditor] load error:', err)
    } finally {
      this.loading.set(false)
    }
  }

  private processData(data: any, columnsOverride?: ColumnDef[] | null): void {
    if (Array.isArray(data)) {
      this.rows.set(data)
    } else {
      this.rows.set(data.rows || [])
    }

    let defs: ColumnDef[]
    if (columnsOverride) {
      defs = [...columnsOverride]
    } else if (data.fields_def) {
      defs = [...data.fields_def]
    } else {
      defs = this.columnDefs().length ? [...this.columnDefs()] : []
    }

    if (defs.length) {
      this.columnDefs.set(defs)
      this.selectedColumns.set([...defs])
      this.availableColumns.set([...defs])
      if (this.config?.defaultColumnProps) {
        this.selectedColumns.update(cols =>
          cols.map(c => ({ ...c, ...this.config!.defaultColumnProps }))
        )
      }
      if (this.config?.columnOrder) {
        const ordered: ColumnDef[] = []
        for (const f of this.config.columnOrder) {
          const found = this.selectedColumns().find(c => c.field === f)
          if (found) ordered.push(found)
        }
        for (const c of this.selectedColumns()) {
          if (!ordered.some(x => x.field === c.field)) ordered.push(c)
        }
        this.selectedColumns.set(ordered)
      }
      const saved = this.loadPersistedConfig()
      if (saved?.columnWidths) {
        this.columnWidths.set({ ...saved.columnWidths })
      }
      this.columnOrder.set(saved?.columnOrder || [])
    }

    if (!data.fields_def && data.total != null) {
      this.totalRecords.set(data.total)
    }
    if (Array.isArray(data)) {
      this.totalRecords.set(data.length)
    }
    this.isLoaded.set(true)
    this.loaded.emit(true)
  }

  private setupInfiniteScroll(): void {
    if (!this.infiniteScroll()) return
    const wrap = this.scrollWrapRef?.nativeElement
    const sentinel = this.sentinelRef?.nativeElement
    if (!wrap || !sentinel) return
    this.infiniteObserver?.disconnect()
    this.infiniteObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && this.hasMorePages() && !this.isLoadingMore()) {
          this.loadMoreInfinite()
        }
      },
      { root: wrap, rootMargin: '0px 0px 200px 0px', threshold: 0 }
    )
    this.infiniteObserver.observe(sentinel)
  }

  private async loadMoreInfinite(): Promise<void> {
    this.isLoadingMore.set(true)
    if (this.lazy()) {
      this.infinitePage.update(v => v + 1)
      const p: any = {
        page: this.infinitePage(),
        pageSize: this.pageSize(),
        sortField: this.sortField() || '',
        sortOrder: this.sortOrder(),
        search: this.globalFilterValue() || '',
      }
      try {
        const res = await this.api!.list!(p)
        if (res?.stat) {
          const newRows = res.data.rows || []
          this.rows.update(prev => [...prev, ...newRows])
          this.totalRecords.set(res.data.totalRecords || res.data.total || 0)
        }
        this.hasMorePages.set(this.rows().length < this.totalRecords())
      } catch {
        this.hasMorePages.set(false)
      }
    } else {
      const total = this.filteredRows().length
      const shown = this.rows().length
      const next = Math.min(shown + this.pageSize(), total)
      if (next > shown) this.rows.set([...this.filteredRows().slice(0, next)])
      this.hasMorePages.set(this.rows().length < total)
    }
    this.isLoadingMore.set(false)
  }

  trackByRow(index: number, row: any): any {
    return row.id || row.__uid || index
  }

  trackByCol(index: number, col: ColumnDef): string {
    return col.field
  }

  trackByHCol(index: number, hcol: any): string {
    return hcol._key
  }

  trackByBtn(index: number, btn: BtnConfig): string {
    return btn.key
  }

  trackByIndex(index: number): number {
    return index
  }
}
