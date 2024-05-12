import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrShortComponent } from './qr-short.component';

describe('QrComponent', () => {
  let component: QrShortComponent;
  let fixture: ComponentFixture<QrShortComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QrShortComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QrShortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
