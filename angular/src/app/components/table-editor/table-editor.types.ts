export interface ColumnDef {
  field: string
  headerName: string
  type?: string
  sortable?: boolean
  form_type?: string
  css?: string
  [key: string]: any
}

export interface TableEditorApi {
  list?: (params: any) => Promise<any>
  create?: (data: any) => Promise<any>
  edit?: (data: any) => Promise<any>
  delete?: (data: any) => Promise<any>
}

export interface InlineEditCfg {
  type?: string
  min?: number
  afterEdit?: (row: any, field: string, value: any) => void
  [key: string]: any
}

export interface ColumnGroup {
  headerName: string
  fields: string[]
}

export interface ElementName {
  singular: string
  gender?: string
}

export interface InlineEditingConfig {
  campos: { [field: string]: InlineEditCfg }
  api?: (data: any) => Promise<any>
  debounce_ms?: number
  onSave?: () => void
  [key: string]: any
}

export class BtnConfig {
  key: string
  icon?: string
  severity: string
  class: string
  label: string
  private _getLabel: () => string
  private _isVisible: () => boolean
  private _isDisabled: () => boolean
  onClick: (...args: any[]) => void
  helpKey?: string

  constructor(cfg: Partial<BtnConfig>) {
    this.key = cfg.key || ''
    this.icon = cfg.icon
    this.severity = cfg.severity || 'btn-outline-primary'
    this.class = cfg.class || ''
    this.label = cfg.label || ''
    this._getLabel = cfg.getLabel || (() => cfg.label || '')
    this._isVisible = cfg.isVisible || (() => true)
    this._isDisabled = cfg.isDisabled || (() => false)
    this.onClick = cfg.onClick || (() => {})
    this.helpKey = cfg.helpKey
  }

  getLabel(): string { return this._getLabel() }
  isVisible(): boolean { return this._isVisible() }
  isDisabled(): boolean { return this._isDisabled() }
}

export interface TableEditorConfig {
  lazy?: boolean
  selectionMode?: 'single' | 'multiple' | null
  infiniteScroll?: boolean
  elementName?: ElementName
  columnGroups?: ColumnGroup[]
  inlineEditing?: InlineEditingConfig
  valueFormatters?: { [field: string]: (row: any) => string }
  showFilterRow?: boolean
  scrollHeight?: string | null
  pageSize?: number
  pageSizeOptions?: number[]
  hideToolbar?: boolean
  hideRefresh?: boolean
  hideCsvExport?: boolean
  showPaginator?: boolean
  defaultColumnProps?: Partial<ColumnDef>
  columnOrder?: string[]
  buttons?: {
    toolbar?: BtnConfig[]
    rowActions?: BtnConfig[]
  }
  [key: string]: any
}

export interface CellValue {
  value: any
  style: string | null
}
