import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../services/api.service';
import { ConfirmDeleteUserComponent } from '../confirm-delete-user/confirm-delete-user.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm-delete-role',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './confirm-delete-role.component.html',
  styleUrl: './confirm-delete-role.component.less'
})
export class ConfirmDeleteRoleComponent {
  isDeleting = false; // Variable pour suivre l'état de la suppression

  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private api: ApiService
  ) { }

  onClose(): void {
    this.dialogRef.close();
  }

  onDelete(): void {
    // Évite les appels multiples
    if (this.isDeleting) {
      return;
    }

    this.isDeleting = true;

    this.api.deleteRole(this.data.role.id).subscribe({
      next: () => {
        console.log('Utilisateur supprimé avec succès');
        this.dialogRef.close(true);
      },
      error: (error: any) => {
        console.error('Erreur lors de la suppression:', error);
        this.isDeleting = false; // Important : réinitialiser en cas d'erreur
        // Optionnel : fermer la dialog ou montrer un message d'erreur
        // this.dialogRef.close(false);
      },
      complete: () => {
        // Cette section s'exécute dans tous les cas
        this.isDeleting = false;
      }
    });
  }
}
