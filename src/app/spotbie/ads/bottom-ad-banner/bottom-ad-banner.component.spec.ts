import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomAdBannerComponent } from './bottom-ad-banner.component';

describe('BottomAdBannerComponent', () => {
  let component: BottomAdBannerComponent;
  let fixture: ComponentFixture<BottomAdBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BottomAdBannerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BottomAdBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
