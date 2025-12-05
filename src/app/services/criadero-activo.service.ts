import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CriaderoActivoService {
  private _criaderoActivo = new BehaviorSubject<any>(null);
  criaderoActivo$ = this._criaderoActivo.asObservable();

  constructor() {
    const data = localStorage.getItem('criaderoActivo');
    if (data) {
      this._criaderoActivo.next(JSON.parse(data));
    }
  }

  setCriadero(criadero: any) {
    localStorage.setItem('criaderoActivo', JSON.stringify(criadero));
    this._criaderoActivo.next(criadero);
  }

  clearCriadero() {
    localStorage.removeItem('criaderoActivo');
    this._criaderoActivo.next(null);
  }

  getCriaderoActivo(): any {
    return this._criaderoActivo.value;
  }
}