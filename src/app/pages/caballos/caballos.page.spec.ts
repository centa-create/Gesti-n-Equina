import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CaballosPage } from './caballos.page';

describe('CaballosPage', () => {
  let component: CaballosPage;
  let fixture: ComponentFixture<CaballosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CaballosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
