import {Component, Inject, OnInit} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {CommonModule} from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import {RecentGuestsEntitiesState} from './recent-guest.state';
import {Observable} from 'rxjs';
import {RecentGuest} from '../models';
import {MatTableModule} from '@angular/material/table';
import {SpotbiePipesModule} from '../../../../../spotbie-pipes/spotbie-pipes.module';

@Component({
  selector: 'app-recent-guests-dialog',
  templateUrl: './recent-guests-dialog.component.html',
  styleUrls: ['./recent-guests-dialog.component.css'],
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatTableModule, SpotbiePipesModule],
})
export class RecentGuestsDialogComponent implements OnInit {
  recentGuests$: Observable<RecentGuest[]> =
    this.recentGuestsState.recentGuests$;

  displayedColumns: string[] = [
    'user_id',
    'balance',
    'total_spent',
    'updated_at',
  ];

  constructor(
    public dialogRef: MatDialogRef<RecentGuestsDialogComponent>,
    private matDialog: MatDialog,
    private recentGuestsState: RecentGuestsEntitiesState,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.recentGuestsState.getRecentGuestList().subscribe();
  }

  closeDialog() {
    this.dialogRef.close(null);
  }
}
