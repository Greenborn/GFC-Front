import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef, HostListener, ElementRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FormsModule } from '@angular/forms';

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
export class SearchableSelectComponent implements ControlValueAccessor {
  @Input() items: any[] = [];
  @Input() itemValueField: string = 'id';
  @Input() itemTextField: string = 'name';
  @Input() placeholder: string = 'Seleccionar...';

  @ViewChild('dropdown') dropdownEl: ElementRef;
  @ViewChild('searchInput') searchInputEl: ElementRef<HTMLInputElement>;

  isOpen = false;
  searchText = '';
  selectedItem: any = null;
  activeIndex: number = -1;
  listboxId = `searchable-listbox-${Date.now()}`;

  private _value: any;
  private onChange: any = () => {};
  private onTouched: any = () => {};

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
    if (!this.searchText) {
      return this.items;
    }
    const q = this.searchText.toLowerCase();
    return this.items.filter(
      (item) =>
        item[this.itemTextField] &&
        item[this.itemTextField].toLowerCase().includes(q)
    );
  }

  get displayText(): string {
    return this.selectedItem ? this.selectedItem[this.itemTextField] : '';
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
      this.selectedItem =
        this.items.find((i) => i[this.itemValueField] === this._value) || null;
    } else {
      this.selectedItem = null;
    }
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.searchText = '';
      this.activeIndex = -1;
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
