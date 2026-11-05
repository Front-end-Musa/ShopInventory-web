import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  imports: [MatDialogModule, MatButtonModule],
  template: `<h2 mat-dialog-title>Delete {{ name }}?</h2>
    <mat-dialog-content>This permanently removes the product.</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Cancel</button>
      <button mat-button [mat-dialog-close]="true">Delete</button>
    </mat-dialog-actions>`,
})
export class DeleteConfirmation {
  readonly name = inject<string>(MAT_DIALOG_DATA);
}
