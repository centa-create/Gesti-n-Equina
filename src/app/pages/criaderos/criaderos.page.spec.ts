import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CriaderosPage } from './criaderos.page';

describe('CriaderosPage', () => {
  let component: CriaderosPage;
  let fixture: ComponentFixture<CriaderosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CriaderosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
