import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxColorsModule } from 'ngx-colors';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-add-groupe',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    NgxColorsModule
  ],
  templateUrl: './add-groupe.component.html',
  styleUrl: './add-groupe.component.less'
})
export class AddGroupeComponent {
  public formGroup: any;
  public color:string = '#000000'; // Default color

  constructor(
    private dialogRef: MatDialogRef<AddGroupeComponent>,
    private FormBuilder: FormBuilder,
    private api: ApiService
  ) {
    this.formGroup = this.FormBuilder.group({
      label: ['', Validators.required],
      color: [this.color]
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.formGroup.valid) {
      const groupData = {
        label: this.formGroup.value.label,
        color: this.color
      };

      this.api.addGroup(groupData).subscribe({
        next: (response:any) => {
          console.log('Groupe ajouté avec succès:', response);
          this.dialogRef.close(true);
        },
        error: (error:any) => {
          console.error('Erreur lors de l\'ajout du groupe:', error);
          // Optionnel : afficher un message d'erreur à l'utilisateur
        }
      });
    } else {
      console.warn('Formulaire invalide');
    }
  }
}
