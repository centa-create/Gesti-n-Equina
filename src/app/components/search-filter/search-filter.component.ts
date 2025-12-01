import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

export interface SearchFilter {
  searchText: string;
  dateFrom: string;
  dateTo: string;
  category: string;
  status: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface SearchFilterConfig {
  showSearchText: boolean;
  showDateRange: boolean;
  showCategory: boolean;
  showStatus: boolean;
  showSort: boolean;
  categories: { value: string; label: string }[];
  statuses: { value: string; label: string }[];
  sortOptions: { value: string; label: string }[];
  placeholder: string;
  title: string;
}

@Component({
  selector: 'app-search-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.scss']
})
export class SearchFilterComponent implements OnInit {

  @Input() config: SearchFilterConfig = {
    showSearchText: true,
    showDateRange: true,
    showCategory: false,
    showStatus: false,
    showSort: true,
    categories: [],
    statuses: [],
    sortOptions: [
      { value: 'fecha', label: 'Fecha' },
      { value: 'nombre', label: 'Nombre' },
      { value: 'tipo', label: 'Tipo' }
    ],
    placeholder: 'Buscar...',
    title: 'Filtros de Búsqueda'
  };

  @Input() initialFilters: Partial<SearchFilter> = {};
  @Output() filtersChanged = new EventEmitter<SearchFilter>();
  @Output() searchTriggered = new EventEmitter<SearchFilter>();

  filters: SearchFilter = {
    searchText: '',
    dateFrom: '',
    dateTo: '',
    category: '',
    status: '',
    sortBy: 'fecha',
    sortOrder: 'desc'
  };

  showAdvancedFilters = false;

  ngOnInit() {
    // Aplicar filtros iniciales
    this.filters = { ...this.filters, ...this.initialFilters };
  }

  toggleAdvancedFilters() {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  onSearchInput(event: any) {
    this.filters.searchText = event.target.value;
    this.emitFilters();
  }

  onFilterChange() {
    this.emitFilters();
  }

  onSearchClick() {
    this.searchTriggered.emit(this.filters);
  }

  clearFilters() {
    this.filters = {
      searchText: '',
      dateFrom: '',
      dateTo: '',
      category: '',
      status: '',
      sortBy: 'fecha',
      sortOrder: 'desc'
    };
    this.emitFilters();
  }

  private emitFilters() {
    this.filtersChanged.emit(this.filters);
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.filters.searchText) count++;
    if (this.filters.dateFrom) count++;
    if (this.filters.dateTo) count++;
    if (this.filters.category) count++;
    if (this.filters.status) count++;
    return count;
  }
}