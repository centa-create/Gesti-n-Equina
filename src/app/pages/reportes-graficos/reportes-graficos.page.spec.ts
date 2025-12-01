import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportesGraficosPage } from './reportes-graficos.page';

describe('ReportesGraficosPage', () => {
  let component: ReportesGraficosPage;
  let fixture: ComponentFixture<ReportesGraficosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportesGraficosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
