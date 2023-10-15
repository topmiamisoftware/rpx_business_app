import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StripeAccountComponent } from './stripe-account.component';

describe('StripeAccountComponent', () => {
  let component: StripeAccountComponent;
  let fixture: ComponentFixture<StripeAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StripeAccountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StripeAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
