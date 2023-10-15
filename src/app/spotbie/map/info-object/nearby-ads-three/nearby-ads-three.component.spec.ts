import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NearbyAdsThreeComponent } from './nearby-ads-three.component';

describe('NearbyAdsThreeComponent', () => {
  let component: NearbyAdsThreeComponent;
  let fixture: ComponentFixture<NearbyAdsThreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NearbyAdsThreeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NearbyAdsThreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
