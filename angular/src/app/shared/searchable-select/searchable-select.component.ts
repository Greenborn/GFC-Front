import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, forwardRef, HostListener, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-searchable-select',
  templateUrl: './searchable-select.component.html',
  styleUrls: ['./searchable-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchableSelectComponent),
      multi: true,
    },
  ],
})
export class SearchableSelectComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() items: any[] = [];
  @Input() itemValueField: string = 'id';
  @Input() itemTextField: string = 'name';
  @Input() placeholder: string = 'Seleccionar...';
  @Input() searchFn?: (term: string) => Observable<any[]>;
  @Input() searchMinChars: number = 2;
  @Input() searchDelay: number = 300;
  @Input() displayFn?: (item: any) => string;
  @Output() selectionChange = new EventEmitter<any>();

  @ViewChild('dropdown') dropdownEl: ElementRef;
  @ViewChild('searchInput') searchInputEl: ElementRef<HTMLInputElement>;

  isOpen = false;
  searchText = '';
  selectedItem: any = null;
  selectedLabel = '';
  activeIndex: number = -1;
  loading = false;
  listboxId = `searchable-listbox-${Date.now()}`;

  private _value: any;
  private onChange: any = () => {};
  private onTouched: any = () => {};
  private searchTerms = new Subject<string>();
  private searchSub: any;

  get isRemote(): boolean {
    return typeof this.searchFn === 'function';
  }

  ngOnInit(): void {
    if (this.isRemote) {
      this.searchSub = this.searchTerms.pipe(
        debounceTime(this.searchDelay),
        distinctUntilChanged(),
        switchMap(term => {
          if (!term || term.trim().length < this.searchMinChars) {
            this.items = [];
            return of([]);
          }
          this.loading = true;
          return this.searchFn!(term);
        })
      ).subscribe({
        next: results => {
          this.items = results || [];
          this.loading = false;
          this.activeIndex = -1;
        },
        error: () => {
          this.items = [];
          this.loading = false;
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.searchSub) this.searchSub.unsubscribe();
  }

  get value(): any {
    return this._value;
  }

  set value(v: any) {
    if (v !== this._value) {
      this._value = v;
      this.onChange(v);
      this.updateSelectedItem();
    }
  }

  get filteredItems(): any[] {
    if (this.isRemote) {
      return this.items;
    }
    if (!this.searchText) {
      return this.items;
    }
    const q = this.searchText.toLowerCase();
    return this.items.filter(
      (item) => {
        const text = this.getItemLabel(item).toLowerCase();
        return text.includes(q);
      }
    );
  }

  get displayText(): string {
    if (this.selectedItem != null) {
      return this.getItemLabel(this.selectedItem);
    }
    return this.selectedLabel;
  }

  getItemLabel(item: any): string {
    if (typeof this.displayFn === 'function') {
      return this.displayFn(item) || '';
    }
    return item ? (item[this.itemTextField] ?? '') : '';
  }

  writeValue(v: any): void {
    this._value = v;
    this.updateSelectedItem();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  private updateSelectedItem(): void {
    if (this._value != null && this.items?.length) {
      const found = this.items.find((i) => i[this.itemValueField] === this._value);
      if (found) {
        this.selectedItem = found;
        this.selectedLabel = this.getItemLabel(found);
        return;
      }
    }
    this.selectedItem = null;
  }

  onSearchChange(term: string): void {
    this.searchText = term;
    if (this.isRemote) {
      this.searchTerms.next(term);
    } else {
      this.activeIndex = -1;
    }
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.searchText = '';
      this.activeIndex = -1;
      if (this.isRemote) {
        this.searchTerms.next('');
      }
      setTimeout(() => {
        if (this.searchInputEl) {
          this.searchInputEl.nativeElement.focus();
        }
      });
    } else {
      this.activeIndex = -1;
    }
    this.onTouched();
  }

  selectItem(item: any): void {
    this.value = item[this.itemValueField];
    this.selectedItem = item;
    this.selectedLabel = this.getItemLabel(item);
    this.selectionChange.emit(item);
    this.isOpen = false;
    this.searchText = '';
    this.activeIndex = -1;
    const trigger = this.dropdownEl?.nativeElement?.querySelector('.select-trigger') as HTMLElement;
    if (trigger) trigger.focus();
  }

  onKeydown(event: KeyboardEvent) {
    if (!this.isOpen) {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.toggleDropdown();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (this.filteredItems.length > 0) {
          this.activeIndex = (this.activeIndex + 1) % this.filteredItems.length;
          this.scrollToActive();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (this.filteredItems.length > 0) {
          this.activeIndex = this.activeIndex <= 0 ? this.filteredItems.length - 1 : this.activeIndex - 1;
          this.scrollToActive();
        }
        break;
      case 'Enter':
        event.preventDefault();
        if (this.activeIndex >= 0 && this.filteredItems[this.activeIndex]) {
          this.selectItem(this.filteredItems[this.activeIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.isOpen = false;
        this.activeIndex = -1;
        this.searchText = '';
        const trigger = this.dropdownEl?.nativeElement?.querySelector('.select-trigger') as HTMLElement;
        if (trigger) trigger.focus();
        break;
      case 'Tab':
        this.isOpen = false;
        this.activeIndex = -1;
        this.searchText = '';
        break;
    }
  }

  private scrollToActive() {
    setTimeout(() => {
      const activeEl = document.getElementById(`searchable-option-${this.activeIndex}`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen && this.dropdownEl) {
      const el = this.dropdownEl.nativeElement;
      if (!el.contains(event.target)) {
        this.isOpen = false;
        this.searchText = '';
        this.activeIndex = -1;
      }
    }
  }
}
