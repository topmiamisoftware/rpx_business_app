import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NearbyFeaturedAdComponent } from './nearby-featured-ad.component';

describe('NearbyFeaturedAdComponent', () => {
  let component: NearbyFeaturedAdComponent;
  let fixture: ComponentFixture<NearbyFeaturedAdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NearbyFeaturedAdComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NearbyFeaturedAdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
