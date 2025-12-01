import { Injectable } from '@angular/core';
import { CaballosService } from './caballos.service';
import { FinanzasService } from './finanzas.service';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ReportesService {
  constructor(
    private caballosService: CaballosService,
    private finanzasService: FinanzasService
  ) {}

  generarReporte(criaderoId: number): Observable<any> {
    const caballos$ = this.caballosService.getCaballosByCriadero(criaderoId);
    const finanzas$ = this.finanzasService.getRegistrosByCriadero(criaderoId);

    return combineLatest([caballos$, finanzas$]).pipe(
      map(([caballos, finanzas]) => ({
        totalCaballos: caballos.length,
        ingresos: finanzas.filter((f: any) => f.monto > 0).reduce((acc: number, f: any) => acc + f.monto, 0),
        egresos: finanzas.filter((f: any) => f.monto < 0).reduce((acc: number, f: any) => acc + f.monto, 0),
        balance: finanzas.reduce((acc: number, f: any) => acc + f.monto, 0)
      }))
    );
  }
}