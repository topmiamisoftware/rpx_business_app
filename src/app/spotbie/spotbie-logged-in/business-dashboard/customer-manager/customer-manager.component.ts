import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {CustomerManagerService} from './customer-manager.service';
import {TextMessageDialogComponent} from './text-message/text-message.component';
import {MatDialog} from '@angular/material/dialog';
import {BehaviorSubject, tap} from 'rxjs';
import {RecentGuestsDialogComponent} from './recent-guests/recent-guests-dialog.component';
import {SmsHistoryDialogComponent} from './sms-history/sms-history-dialog.component';
import {FeedbackComponent} from "./feedback/feedback.component";

@Component({
  selector: 'app-customer-manager',
  templateUrl: './customer-manager.component.html',
  styleUrls: ['./customer-manager.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerManagerComponent implements OnInit {
  messageSent$ = new BehaviorSubject<boolean>(false);

  constructor(
    private customerManagementService: CustomerManagerService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {}

  openRecentGuests() {
    const dialogRef = this.dialog.open(RecentGuestsDialogComponent);
  }

  openSmsHistory() {
    const dialogRef = this.dialog.open(SmsHistoryDialogComponent, {
      width: '90%',
    });
  }

  openFeedback() {
    const dialogRef = this.dialog.open(FeedbackComponent, {
      width: '90%',
    });
  }

  openTextMessage() {
    const dialogRef = this.dialog.open(TextMessageDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }

      this.sendTextMessage(result.text);
    });
  }

  sendTextMessage(text: string) {
    this.customerManagementService
      .sendSms(text)
      .pipe(
        tap(resp => {
          if (resp.success) {
            this.messageSent$.next(true);
            setTimeout(() => {
              this.messageSent$.next(false);
            }, 5000);
          }
        })
      )
      .subscribe();
  }
}
