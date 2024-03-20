import {Component, Inject, OnInit} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog, MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import {NgIf} from '@angular/common';
import {AlertDialogComponent} from '../../../../../helpers/alert/alert.component';
import {Platform} from "@ionic/angular";

@Component({
  selector: 'app-alert',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.css'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    AlertDialogComponent,
    NgIf,
  ],
})
export class EmailDialogComponent implements OnInit {
  emailForm: UntypedFormGroup;
  submitted = false;

  constructor(
    public dialogRef: MatDialogRef<EmailDialogComponent>,
    private formBuilder: UntypedFormBuilder,
    private matDialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private platform: Platform
  ) {}

  ngOnInit(): void {
    this.initiateForm();

    this.platform.backButton.subscribeWithPriority(10, () => {
      this.closeDialog();
    });
  }

  get f() {
    return this.emailForm.controls;
  }

  get emailBody(): string {
    return this.emailForm.get('emailBody').value;
  }

  initiateForm() {
    const emailValidator = [
      Validators.required,
      Validators.maxLength(1200),
      Validators.minLength(200),
    ];

    this.emailForm = this.formBuilder.group({
      emailBody: ['', emailValidator],
    });
  }

  closeDialog() {
    this.dialogRef.close(null);
  }

  sendMessage() {
    this.submitted = true;

    if (this.emailForm.invalid) {
      return;
    }

    const dialogRef = this.matDialog.open(AlertDialogComponent, {
      data: {
        alertTitle: "You're about to send a mass E-mail.",
        alertText:
          'Are you sure you want mass send an email to all of your recent customers that have used SpotBie in your business?',
      },
    });

    dialogRef
      .afterClosed()
      .subscribe((result: {continueWithAction: boolean}) => {
        if (!result.continueWithAction) {
          return;
        }

        this.dialogRef.close({
          text: this.emailBody,
        });
      });
  }
}
