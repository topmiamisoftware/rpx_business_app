import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmsHistoryDialogComponent } from './sms-history-dialog.component';

describe('SmsHistoryDialogComponent', () => {
  let component: SmsHistoryDialogComponent;
  let fixture: ComponentFixture<SmsHistoryDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmsHistoryDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmsHistoryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
