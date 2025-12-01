import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HerrajesPage } from './herrajes.page';

describe('HerrajesPage', () => {
  let component: HerrajesPage;
  let fixture: ComponentFixture<HerrajesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HerrajesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
