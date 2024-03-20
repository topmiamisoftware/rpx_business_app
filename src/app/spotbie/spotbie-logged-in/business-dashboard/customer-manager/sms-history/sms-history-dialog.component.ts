import {Component, Inject, OnInit} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {CommonModule} from '@angular/common';
import {
  MAT_DIALOG_DATA, MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {SmsGroup} from '../models';
import {SmsGroupEntitiesState} from './sms-group.state';
import {MatTableModule} from '@angular/material/table';
import {SpotbiePipesModule} from '../../../../../spotbie-pipes/spotbie-pipes.module';
import {Platform} from "@ionic/angular";
import {AlertDialogComponent} from "../../../../../helpers/alert/alert.component";

@Component({
  selector: 'app-sms-history-dialog',
  templateUrl: './sms-history-dialog.component.html',
  styleUrls: ['./sms-history-dialog.component.css'],
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatTableModule, SpotbiePipesModule],
})
export class SmsHistoryDialogComponent implements OnInit {
  smsGroupList$: Observable<SmsGroup[]> =
    this.smsGroupEntitiesState.entitiesArray$;

  displayedColumns: string[] = [
    'total',
    'total_sent',
    'body',
    'created_at',
  ];

  constructor(
    public dialogRef: MatDialogRef<SmsHistoryDialogComponent>,
    private smsGroupEntitiesState: SmsGroupEntitiesState,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private platform: Platform,
    private matDialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.smsGroupEntitiesState.getSmsGroupList();

    this.platform.backButton.subscribeWithPriority(10, () => {
      this.closeDialog();
    });
  }

  viewGroup(smsGroup: SmsGroup) {
    this.matDialog.open(AlertDialogComponent, {
      data: {
        alertTitle: "Full SMS Message",
        alertText: smsGroup.body,
      },
    });
  }

  closeDialog() {
    this.dialogRef.close(null);
  }
}
