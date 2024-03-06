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

@Component({
  selector: 'app-alert',
  templateUrl: './text-message.component.html',
  styleUrls: ['./text-message.component.css'],
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
export class TextMessageDialogComponent implements OnInit {
  textMessageForm: UntypedFormGroup;
  submitted = false;

  constructor(
    public dialogRef: MatDialogRef<TextMessageDialogComponent>,
    private formBuilder: UntypedFormBuilder,
    private matDialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.initiateForm();
  }

  get f() {
    return this.textMessageForm.controls;
  }

  get smsText(): string {
    return this.textMessageForm.get('smsText').value;
  }

  initiateForm() {
    const textMessageValidator = [
      Validators.required,
      Validators.maxLength(320),
      Validators.minLength(120),
    ];

    this.textMessageForm = this.formBuilder.group({
      smsText: ['', textMessageValidator],
    });
  }

  closeDialog() {
    this.dialogRef.close(null);
  }

  sendMessage() {
    this.submitted = true;

    if (this.textMessageForm.invalid) {
      return;
    }

    const dialogRef = this.matDialog.open(AlertDialogComponent, {
      data: {
        alertTitle: "You're about to send a mass SMS.",
        alertText:
          'Are you sure you want mass send a text message to all of your recent customers that have used SpotBie in your business?',
      },
    });

    dialogRef
      .afterClosed()
      .subscribe((result: {continueWithAction: boolean}) => {
        if (!result.continueWithAction) {
          return;
        }

        this.dialogRef.close({
          text: this.smsText,
        });
      });
  }
}
