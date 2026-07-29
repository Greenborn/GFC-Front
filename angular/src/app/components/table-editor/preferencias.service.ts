import { Injectable, signal } from '@angular/core'

@Injectable({ providedIn: 'root' })
export class PreferenciasService {
  private STORAGE_KEY = 'te_preferencias'

  misValores = signal<Record<string, string>>({})

  constructor() {
    this.cargar()
  }

  private cargar(): void {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY)
      if (raw) this.misValores.set(JSON.parse(raw))
    } catch { }
  }

  private guardar(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.misValores()))
    } catch { }
  }

  valor(key: string): any {
    const val = this.misValores()[key]
    if (!val) return null
    try { return JSON.parse(val) } catch { return val }
  }

  async guardarMisPreferencias(data: Record<string, string>): Promise<void> {
    this.misValores.update(prev => ({ ...prev, ...data }))
    this.guardar()
  }

  async fetchMisPreferencias(): Promise<void> {
    this.cargar()
  }
}
