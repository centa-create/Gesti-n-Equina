import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReportesService {
  constructor(private firebaseService: FirebaseService) {}

  generarReporte(criaderoId: string): Observable<any> {
    console.log('Generando reporte para criadero:', criaderoId);

    // Usar Promise.all para obtener datos de Firebase y convertir a Observable
    const reportePromise = Promise.all([
      this.firebaseService.queryDocuments('caballos', [
        { field: 'criaderoId', operator: '==', value: criaderoId }
      ]).catch((error) => {
        console.warn('Error obteniendo caballos:', error);
        return [];
      }),
      this.firebaseService.queryDocuments('finanzas', [
        { field: 'criaderoId', operator: '==', value: criaderoId }
      ]).catch((error) => {
        console.warn('Error obteniendo finanzas:', error);
        return [];
      })
    ]).then(([caballos, finanzas]) => {
      console.log('Datos obtenidos - Caballos:', caballos?.length || 0, 'Finanzas:', finanzas?.length || 0);

      // Calcular estadísticas financieras
      const ingresos = (finanzas || [])
        .filter((f: any) => f.tipo === 'ingreso')
        .reduce((acc: number, f: any) => acc + (f.monto || 0), 0);

      const egresos = (finanzas || [])
        .filter((f: any) => f.tipo === 'gasto')
        .reduce((acc: number, f: any) => acc + (f.monto || 0), 0);

      const balance = ingresos - egresos;

      const reporte = {
        totalCaballos: (caballos || []).length,
        ingresos: ingresos / 100, // Convertir de centavos a pesos
        egresos: egresos / 100,
        balance: balance / 100,
        caballosActivos: (caballos || []).filter((c: any) => c.estado !== 'inactivo').length,
        finanzasCount: (finanzas || []).length
      };

      console.log('Reporte generado:', reporte);
      return reporte;
    }).catch((error) => {
      console.error('Error generando reporte:', error);
      // Retornar datos por defecto en caso de error
      return {
        totalCaballos: 0,
        ingresos: 0,
        egresos: 0,
        balance: 0,
        caballosActivos: 0,
        finanzasCount: 0
      };
    });

    return from(reportePromise).pipe(
      catchError((error) => {
        console.error('Error en observable del reporte:', error);
        return of({
          totalCaballos: 0,
          ingresos: 0,
          egresos: 0,
          balance: 0,
          caballosActivos: 0,
          finanzasCount: 0
        });
      })
    );
  }
}