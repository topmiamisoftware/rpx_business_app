import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToastHelperComponent } from './toast-helper.component';

describe('ToastHelperComponent', () => {
  let component: ToastHelperComponent;
  let fixture: ComponentFixture<ToastHelperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToastHelperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToastHelperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
