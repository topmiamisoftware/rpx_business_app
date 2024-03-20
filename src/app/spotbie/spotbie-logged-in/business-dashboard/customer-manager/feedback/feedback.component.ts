import {Component, Inject, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
import {MatTableModule} from "@angular/material/table";
import {SpotbiePipesModule} from "../../../../../spotbie-pipes/spotbie-pipes.module";
import {Observable} from "rxjs";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FeedbackEntitiesState} from "./feedback.state";
import {Feedback} from "../../../../../models/feedback";
import {Platform} from "@ionic/angular";
import {AlertDialogComponent} from "../../../../../helpers/alert/alert.component";

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss'],
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatTableModule, SpotbiePipesModule],
})
export class FeedbackComponent  implements OnInit {
  feedbackList$: Observable<Feedback[]> =
    this.feedbackState.feedbackList$;

  displayedColumns: string[] = [
    'user_id',
    'feedback_text',
    'updated_at',
  ];

  constructor(
    public dialogRef: MatDialogRef<FeedbackEntitiesState>,
    private feedbackState: FeedbackEntitiesState,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private platform: Platform,
    private matDialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.feedbackState.getFeedbackList().subscribe();

    this.platform.backButton.subscribeWithPriority(10, () => {
      this.closeDialog();
    });
  }

  closeDialog() {
    this.dialogRef.close(null);
  }

  openEntireFeedback(feedback: Feedback) {
    this.matDialog.open(AlertDialogComponent, {
      data: {
        alertTitle: "Full Feedback Message",
        alertText: feedback.feedback_text,
      },
    });
  }
}
