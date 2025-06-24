import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-add-role',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonToggleModule,
    MatButtonModule
  ],
  templateUrl: './add-role.component.html',
  styleUrl: './add-role.component.less'
})
export class AddRoleComponent {
  public formRole:any;

  constructor(
    public dialogRef: MatDialogRef<AddRoleComponent>,
    private formBuilder: FormBuilder,
    private api: ApiService
  ) {
    this.formRole = this.formBuilder.group({
      label: ['', Validators.required],
      permission: [this.formBuilder.array([]), Validators.minLength(1)]
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    this.api.addRole(this.formRole.value).subscribe({
      next: (response:any) => {
        console.log('Role added successfully:', response);
        this.dialogRef.close(response);
      },
      error: (error:any) => {
        console.error('Error adding role:', error);
        // Handle error appropriately, e.g., show a notification
      }
    });
  }
}
