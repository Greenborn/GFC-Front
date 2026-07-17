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

  isOpen = false;
  searchText = '';
  selectedItem: any = null;

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
    }
    this.onTouched();
  }

  selectItem(item: any): void {
    this.value = item[this.itemValueField];
    this.isOpen = false;
    this.searchText = '';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen && this.dropdownEl) {
      const el = this.dropdownEl.nativeElement;
      if (!el.contains(event.target)) {
        this.isOpen = false;
        this.searchText = '';
      }
    }
  }
}
