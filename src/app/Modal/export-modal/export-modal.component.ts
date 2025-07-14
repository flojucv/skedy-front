import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { ExportService } from '../../services/export.service';

@Component({
  selector: 'app-export-modal',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatDialogContent,
    MatDialogActions
],
  templateUrl: './export-modal.component.html',
  styleUrl: './export-modal.component.less'
})
export class ExportModalComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { events: any[] },
    private dialogRef: MatDialogRef<ExportModalComponent>,
    private exportService: ExportService
  ) { }

  exportToText(): void {
    this.exportService.exportToText(this.data.events);
    this.close();
  }

  exportToCSV(): void {
    this.exportService.exportToCSV(this.data.events);
    this.close();
  }

  exportToICS(): void {
    this.exportService.exportToICS(this.data.events);
    this.close();
  }

  openGoogleCalendar(): void {
    // Pour Google Calendar, on génère un fichier ICS pour l'import
    this.exportService.exportToICS(this.data.events);

    // Optionnel : ouvrir Google Calendar dans un nouvel onglet
    window.open('https://calendar.google.com/calendar/u/0/r/settings/export', '_blank');
    this.close();
  }

  openOutlookCalendar(): void {
    // Pour Outlook, on génère un fichier ICS pour l'import
    this.exportService.exportToICS(this.data.events);

    // Optionnel : ouvrir Outlook Calendar dans un nouvel onglet
    window.open('https://outlook.live.com/calendar/0/view/month', '_blank');
    this.close();
  }

  close(): void {
    this.dialogRef.close();
  }
}
