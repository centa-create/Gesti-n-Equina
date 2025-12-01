import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MontadoresPage } from './montadores.page';

describe('MontadoresPage', () => {
  let component: MontadoresPage;
  let fixture: ComponentFixture<MontadoresPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MontadoresPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
