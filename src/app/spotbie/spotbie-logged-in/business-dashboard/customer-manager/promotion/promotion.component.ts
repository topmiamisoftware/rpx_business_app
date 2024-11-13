import {Component, Inject, OnInit} from '@angular/core';
import {FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {Platform} from "@ionic/angular";
import {AlertDialogComponent} from "../../../../../helpers/alert/alert.component";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-promotion',
  templateUrl: './promotion.component.html',
  styleUrls: ['./promotion.component.scss'],
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
export class PromotionComponent implements OnInit {
  textMessageForm: UntypedFormGroup;
  submitted = false;

  constructor(
    public dialogRef: MatDialogRef<PromotionComponent>,
    private formBuilder: UntypedFormBuilder,
    private matDialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: { promotionText: string },
    private platform: Platform
  ) {}

  ngOnInit(): void {
    this.initiateForm();

    this.platform.backButton.subscribeWithPriority(10, () => {
      this.closeDialog();
    });
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
      Validators.maxLength(420),
      Validators.minLength(120),
    ];

    this.textMessageForm = this.formBuilder.group({
      smsText: ['', textMessageValidator],
    });

    if (this.data.promotionText) {
      this.textMessageForm.get('smsText').setValue(this.data.promotionText);
    }
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
        alertTitle: "You're about to set a mass promotion.",
        alertText:
          'Are you sure you want to set a mass promotion to all nearby SpotBie users?',
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
