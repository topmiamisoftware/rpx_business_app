import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderAdBannerComponent } from './header-ad-banner.component';

describe('HeaderAdBannerComponent', () => {
  let component: HeaderAdBannerComponent;
  let fixture: ComponentFixture<HeaderAdBannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderAdBannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderAdBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
