import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClaseRegistradaPage } from './clase-registrada.page';

describe('ClaseRegistradaPage', () => {
  let component: ClaseRegistradaPage;
  let fixture: ComponentFixture<ClaseRegistradaPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ClaseRegistradaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
