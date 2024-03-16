import {Component, Inject, OnInit} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {CommonModule} from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {EmailGroup} from '../models';
import {EmailGroupEntitiesState} from './email-group.state';
import {MatTableModule} from '@angular/material/table';
import {SpotbiePipesModule} from '../../../../../spotbie-pipes/spotbie-pipes.module';
import {SortOrderType} from "@angular-ru/cdk/typings";

@Component({
  selector: 'app-email-history-dialog',
  templateUrl: './email-history-dialog.component.html',
  styleUrls: ['./email-history-dialog.component.css'],
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatTableModule, SpotbiePipesModule],
})
export class EmailHistoryDialogComponent implements OnInit {
  emailGroupList$: Observable<EmailGroup[]> =
    this.emailGroupEntitiesState.entitiesArray$;

  displayedColumns: string[] = [
    'total',
    'total_sent',
    'email_body',
    'created_at',
    'view_logs',
  ];

  constructor(
    public dialogRef: MatDialogRef<EmailHistoryDialogComponent>,
    private matDialog: MatDialog,
    private emailGroupEntitiesState: EmailGroupEntitiesState,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.emailGroupEntitiesState.getEmailGroupList();
  }

  viewGroup(emailGroup: EmailGroup) {
    console.log('EMAIL GROUP', emailGroup);
  }

  closeDialog() {
    this.dialogRef.close(null);
  }
}
