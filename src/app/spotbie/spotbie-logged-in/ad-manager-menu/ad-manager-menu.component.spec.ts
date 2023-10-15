import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdManagerMenuComponent } from './ad-manager-menu.component';

describe('AdManagerMenuComponent', () => {
  let component: AdManagerMenuComponent;
  let fixture: ComponentFixture<AdManagerMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdManagerMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdManagerMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
