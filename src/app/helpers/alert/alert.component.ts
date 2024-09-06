import {Component, Inject, Input} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {NgIf} from '@angular/common';
import {Capacitor} from "@capacitor/core";
import {Browser} from "@capacitor/browser";

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    NgIf,
  ],
})
export class AlertDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<AlertDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {alertTitle: string; alertText: string, link: string, linkText: string}
  ) {}

  async openExternalLink() {
    await Browser.open({ url: this.data.link });
  }

  continueWithAction() {
    this.dialogRef.close({continueWithAction: true});
  }
  cancelAction() {
    this.dialogRef.close({continueWithAction: false});
  }
}
