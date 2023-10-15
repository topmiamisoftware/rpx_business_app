import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessFeaturesComponent } from './business-features.component';

describe('BusinessFeaturesComponent', () => {
  let component: BusinessFeaturesComponent;
  let fixture: ComponentFixture<BusinessFeaturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessFeaturesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessFeaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
