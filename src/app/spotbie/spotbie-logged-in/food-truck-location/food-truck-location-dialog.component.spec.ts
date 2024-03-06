import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodTruckLocationDialogComponent } from './food-truck-location-dialog.component';

describe('FoodTruckLocationComponent', () => {
  let component: FoodTruckLocationDialogComponent;
  let fixture: ComponentFixture<FoodTruckLocationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FoodTruckLocationDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FoodTruckLocationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
