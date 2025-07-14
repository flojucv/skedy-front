import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() { }

  /**
   * Exporte les événements au format texte
   */
  exportToText(events: any[]): void {
    const sortedEvents = events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    let textContent = '=== EXPORT CALENDRIER SKEDY ===\n\n';
    textContent += `Date d'export: ${new Date().toLocaleString('fr-FR')}\n`;
    textContent += `Nombre d'événements: ${sortedEvents.length}\n\n`;
    textContent += '='.repeat(50) + '\n\n';

    sortedEvents.forEach((event, index) => {
      textContent += `${index + 1}. ${event.title}\n`;
      textContent += `   📅 Début: ${this.formatDate(event.start)}\n`;
      textContent += `   📅 Fin: ${this.formatDate(event.end)}\n`;

      if (event.extendedProps?.group_label && event.extendedProps.group_label !== 'holidays') {
        textContent += `   👥 Groupe: ${event.extendedProps.group_label}\n`;
      }

      if (event.extendedProps?.description) {
        textContent += `   📝 Description: ${event.extendedProps.description}\n`;
      }

      textContent += `   🏷️ Type: ${event.allDay ? 'Journée complète' : 'Horaire'}\n`;
      textContent += '\n' + '-'.repeat(40) + '\n\n';
    });

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `calendrier_skedy_${this.getDateString()}.txt`);
  }

  /**
   * Exporte les événements au format CSV
   */
  exportToCSV(events: any[]): void {
    const sortedEvents = events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    let csvContent = 'Titre,Date début,Heure début,Date fin,Heure fin,Journée complète,Groupe,Description\n';

    sortedEvents.forEach(event => {
      const startDate = new Date(event.start);
      const endDate = new Date(event.end);


      const row = [
        this.escapeCsv(event.title),
        startDate.toLocaleDateString('fr-FR'),
        startDate.toLocaleTimeString('fr-FR'),
        endDate.toLocaleDateString('fr-FR'),
        endDate.toLocaleTimeString('fr-FR'),
        event.allDay ? 'Oui' : 'Non',
        this.escapeCsv(event.extendedProps?.group_label || ''),
        this.escapeCsv(event.extendedProps?.description || '')
      ];

      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `calendrier_skedy_${this.getDateString()}.csv`);
  }

  /**
   * Exporte les événements au format ICS (compatible Outlook, Google Calendar)
   */
  exportToICS(events: any[]): void {
    let icsContent = 'BEGIN:VCALENDAR\n';
    icsContent += 'VERSION:2.0\n';
    icsContent += 'PRODID:-//Skedy//Calendrier//FR\n';
    icsContent += 'CALSCALE:GREGORIAN\n';
    icsContent += 'METHOD:PUBLISH\n';
    icsContent += 'X-WR-CALNAME:Calendrier Skedy\n';
    icsContent += 'X-WR-TIMEZONE:Europe/Paris\n';

    events.forEach(event => {
      icsContent += 'BEGIN:VEVENT\n';
      icsContent += `UID:${event.id || this.generateUID()}@skedy.local\n`;
      icsContent += `DTSTART:${this.formatDateForICS(event.start, event.allDay)}\n`;
      icsContent += `DTEND:${this.formatDateForICS(event.end, event.allDay)}\n`;
      icsContent += `SUMMARY:${this.escapeICS(event.title)}\n`;

      if (event.extendedProps?.description) {
        icsContent += `DESCRIPTION:${this.escapeICS(event.extendedProps.description)}\n`;
      }

      if (event.extendedProps?.group_label && event.extendedProps.group_label !== 'holidays') {
        icsContent += `CATEGORIES:${this.escapeICS(event.extendedProps.group_label)}\n`;
      }

      icsContent += `CREATED:${this.formatDateForICS(new Date())}\n`;
      icsContent += `LAST-MODIFIED:${this.formatDateForICS(new Date())}\n`;
      icsContent += 'STATUS:CONFIRMED\n';
      icsContent += 'TRANSP:OPAQUE\n';
      icsContent += 'END:VEVENT\n';
    });

    icsContent += 'END:VCALENDAR\n';

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    saveAs(blob, `calendrier_skedy_${this.getDateString()}.ics`);
  }

  /**
   * Génère un lien pour importer vers Google Calendar
   */
  generateGoogleCalendarLink(event: any): string {
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);

    const formatDateForGoogle = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${formatDateForGoogle(startDate)}/${formatDateForGoogle(endDate)}`,
      details: event.extendedProps?.description || '',
      location: event.extendedProps?.location || ''
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  /**
   * Génère un lien pour importer vers Outlook
   */
  generateOutlookLink(event: any): string {
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);

    const params = new URLSearchParams({
      subject: event.title,
      startdt: startDate.toISOString(),
      enddt: endDate.toISOString(),
      body: event.extendedProps?.description || '',
      location: event.extendedProps?.location || ''
    });

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  }

  // Méthodes utilitaires privées
  private formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private formatDateForICS(date: Date | string, allDay: boolean = false): string {
    const d = new Date(date);
    if (allDay) {
      return d.toISOString().slice(0, 10).replace(/-/g, '');
    }
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }

  private getDateString(): string {
    const now = new Date();
    return now.toISOString().slice(0, 10).replace(/-/g, '');
  }

  private escapeCsv(text: string): string {
    if (!text) return '';
    console.log(text)
    if (text.includes(',') || text.includes('"') || text.includes('\n')) {
      return '"' + text.replace(/"/g, '""') + '"';
    }
    return text;
  }

  private escapeICS(text: string): string {
    if (!text) return '';
    return text
      .replace(/\\/g, '\\\\')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');
  }

  private generateUID(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
