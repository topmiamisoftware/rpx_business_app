import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailHistoryDialogComponent } from './email-history-dialog.component';

describe('EmailHistoryDialogComponent', () => {
  let component: EmailHistoryDialogComponent;
  let fixture: ComponentFixture<EmailHistoryDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmailHistoryDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailHistoryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
