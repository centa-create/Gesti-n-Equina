import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'number' | 'date' | 'daterange' | 'boolean' | 'multiselect';
  options?: { value: any; label: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface FilterConfig {
  title: string;
  fields: FilterField[];
  showToggle?: boolean;
  showSavePreset?: boolean;
  showClearAll?: boolean;
}

export interface FilterValues {
  [key: string]: any;
}

@Component({
  selector: 'app-advanced-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './advanced-filters.component.html',
  styleUrls: ['./advanced-filters.component.scss']
})
export class AdvancedFiltersComponent implements OnInit, OnChanges {

  @Input() config!: FilterConfig;
  @Input() values: FilterValues = {};
  @Input() isExpanded: boolean = false;
  @Input() loading: boolean = false;

  @Output() valuesChange = new EventEmitter<FilterValues>();
  @Output() toggle = new EventEmitter<boolean>();
  @Output() clear = new EventEmitter<void>();
  @Output() savePreset = new EventEmitter<string>();
  @Output() apply = new EventEmitter<FilterValues>();

  internalValues: FilterValues = {};
  showSaveDialog: boolean = false;
  presetName: string = '';

  // Presets guardados
  savedPresets: { name: string; values: FilterValues; date: Date }[] = [];

  ngOnInit() {
    this.loadSavedPresets();
    this.internalValues = { ...this.values };
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['values']) {
      this.internalValues = { ...this.values };
    }
  }

  onValueChange(key: string, value: any) {
    this.internalValues[key] = value;
    this.valuesChange.emit(this.internalValues);
  }

  onToggle() {
    this.isExpanded = !this.isExpanded;
    this.toggle.emit(this.isExpanded);
  }

  onClear() {
    this.internalValues = {};
    this.valuesChange.emit(this.internalValues);
    this.clear.emit();
  }

  onApply() {
    this.apply.emit(this.internalValues);
  }

  onSavePreset() {
    this.showSaveDialog = true;
  }

  onConfirmSavePreset() {
    if (this.presetName.trim()) {
      const preset = {
        name: this.presetName.trim(),
        values: { ...this.internalValues },
        date: new Date()
      };

      this.savedPresets.unshift(preset);
      this.savePresetsToStorage();
      this.showSaveDialog = false;
      this.presetName = '';
      this.savePreset.emit(preset.name);
    }
  }

  onCancelSavePreset() {
    this.showSaveDialog = false;
    this.presetName = '';
  }

  loadPreset(preset: { name: string; values: FilterValues }) {
    this.internalValues = { ...preset.values };
    this.valuesChange.emit(this.internalValues);
    this.apply.emit(this.internalValues);
  }

  deletePreset(index: number) {
    this.savedPresets.splice(index, 1);
    this.savePresetsToStorage();
  }

  private loadSavedPresets() {
    const saved = localStorage.getItem(`filters_presets_${this.config.title}`);
    if (saved) {
      try {
        this.savedPresets = JSON.parse(saved);
      } catch (error) {
        console.error('Error loading saved presets:', error);
        this.savedPresets = [];
      }
    }
  }

  private savePresetsToStorage() {
    localStorage.setItem(`filters_presets_${this.config.title}`, JSON.stringify(this.savedPresets));
  }

  // Helpers para el template
  getFieldValue(key: string): any {
    return this.internalValues[key];
  }

  isFieldActive(key: string): boolean {
    const value = this.internalValues[key];
    if (value === null || value === undefined || value === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  }

  getActiveFiltersCount(): number {
    return this.config.fields.filter(field => this.isFieldActive(field.key)).length;
  }

  formatDate(date: any): string {
    if (!date) return '';
    if (typeof date === 'string') return date;
    if (date instanceof Date) return date.toISOString().split('T')[0];
    if (date.toDate) return date.toDate().toISOString().split('T')[0];
    return '';
  }

  getDateRangeValue(key: string): { start: string; end: string } {
    const value = this.internalValues[key];
    if (!value || typeof value !== 'object') {
      return { start: '', end: '' };
    }
    return {
      start: this.formatDate(value.start),
      end: this.formatDate(value.end)
    };
  }

  onDateRangeChange(key: string, type: 'start' | 'end', dateValue: string | null | undefined) {
    const currentValue = this.internalValues[key] || {};
    currentValue[type] = dateValue ? new Date(dateValue) : null;
    this.onValueChange(key, currentValue);
  }
}