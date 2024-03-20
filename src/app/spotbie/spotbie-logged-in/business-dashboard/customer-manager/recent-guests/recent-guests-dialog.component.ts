import {Component, Inject, OnInit} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {CommonModule} from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import {RecentGuestsEntitiesState} from './recent-guest.state';
import {Observable} from 'rxjs';
import {RecentGuest} from '../models';
import {MatTableModule} from '@angular/material/table';
import {SpotbiePipesModule} from '../../../../../spotbie-pipes/spotbie-pipes.module';
import {Platform} from "@ionic/angular";

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
    private recentGuestsState: RecentGuestsEntitiesState,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private platform: Platform,
  ) {}

  ngOnInit(): void {
    this.recentGuestsState.getRecentGuestList().subscribe();

    this.platform.backButton.subscribeWithPriority(10, () => {
      this.closeDialog();
    });
  }

  closeDialog() {
    this.dialogRef.close(null);
  }
}
