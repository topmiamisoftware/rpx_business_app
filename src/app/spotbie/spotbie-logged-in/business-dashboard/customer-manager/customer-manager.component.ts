import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {CustomerManagerService} from './customer-manager.service';
import {TextMessageDialogComponent} from './text-message/text-message.component';
import {MatDialog} from '@angular/material/dialog';
import {BehaviorSubject, tap} from 'rxjs';
import {RecentGuestsDialogComponent} from './recent-guests/recent-guests-dialog.component';
import {SmsHistoryDialogComponent} from './sms-history/sms-history-dialog.component';
import {FeedbackComponent} from "./feedback/feedback.component";
import {EmailDialogComponent} from "./email/email.component";
import {EmailHistoryDialogComponent} from "./email-history/email-history-dialog.component";
import {PromotionComponent} from "./promotion/promotion.component";

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
    this.dialog.open(RecentGuestsDialogComponent, {
      enterAnimationDuration: '0ms',
      exitAnimationDuration: '0ms',
    });
  }

  openSmsHistory() {
    this.dialog.open(SmsHistoryDialogComponent, {
      width: '90%',
      enterAnimationDuration: '0ms',
      exitAnimationDuration: '0ms',
    });
  }

  openEmailHistory() {
    this.dialog.open(EmailHistoryDialogComponent, {
      width: '90%',
      enterAnimationDuration: '0ms',
      exitAnimationDuration: '0ms',
    });
  }

  openFeedback() {
    this.dialog.open(FeedbackComponent, {
      width: '90%',
      enterAnimationDuration: '0ms',
      exitAnimationDuration: '0ms',
    });
  }

  openTextMessage() {
    const dialogRef = this.dialog.open(TextMessageDialogComponent, {
      enterAnimationDuration: '0ms',
      exitAnimationDuration: '0ms',
    });

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

  sendPromotion(text) {
    this.customerManagementService
      .sendPromotion(text)
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

  openNearbyPromotion() {
    const existingPromotion = this.customerManagementService.getCurrentPromotion().subscribe((resp) => {
      const dialogRef= this.dialog.open(PromotionComponent, {
        width: '90%',
        enterAnimationDuration: '0ms',
        exitAnimationDuration: '0ms',
        data: {
          promotionText: resp.message
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (!result) {
          return;
        }

        this.sendPromotion(result.text);
      });
    });
  }

  openEmail() {
    const dialogRef = this.dialog.open(EmailDialogComponent, {
      enterAnimationDuration: '0ms',
      exitAnimationDuration: '0ms',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }

      this.sendEmail(result.text);
    });
  }

  sendEmail(text: string) {
    this.customerManagementService
      .sendEmail(text)
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
