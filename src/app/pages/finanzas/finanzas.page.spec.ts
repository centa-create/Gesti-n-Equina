import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FinanzasPage } from './finanzas.page';

describe('FinanzasPage', () => {
  let component: FinanzasPage;
  let fixture: ComponentFixture<FinanzasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FinanzasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
