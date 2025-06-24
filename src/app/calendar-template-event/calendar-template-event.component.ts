import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { EventApi } from '@fullcalendar/core/index.js';

@Component({
  selector: 'app-calendar-template-event',
  standalone: true,
  imports: [
    MatIconModule
  ],
  templateUrl: './calendar-template-event.component.html',
  styleUrl: './calendar-template-event.component.less'
})
export class CalendarTemplateEventComponent {
  @Input() event!: EventApi;
  @Input() arg!: any;
  public icon = "circle";

  get startTime(): string {
    return this.event.start ? this.formatTime(this.event.start) : 'N/A';
  }

  get endTime(): string {
    return this.event.end ? this.formatTime(this.event.end) : 'N/A';
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  public getIcon(): Boolean {
    return false;
  }

  public getTitle(): string {
    return `${(!this.event.allDay) ? this.startTime + ((this.endTime == 'N/A') ? '' : ' - ' + this.endTime) : ''} ${this.event.title}`;
  }

  isSingleDayEvent(): boolean {
    if (this.event && this.event.start && this.event.end) {
      const eventStart = new Date(this.event.start);
      const eventEnd = new Date(this.event.end || this.event.start);

      return `${eventStart.getDate()} ${eventStart.getMonth() + 1} ${eventStart.getFullYear()}` == `${eventEnd.getDate()} ${eventEnd.getMonth() + 1} ${eventEnd.getFullYear()}`;
    }
    if (this.event && this.event.start && this.event.end == null) {
      return true;
    }
    return false;
  }

  getContrastColor(bgColor: string): string {
    // Convertir la couleur hexadécimale en valeurs RGB
    let r = parseInt(bgColor.substring(1, 3), 16);
    let g = parseInt(bgColor.substring(3, 5), 16);
    let b = parseInt(bgColor.substring(5, 7), 16);

    // Calcul de la luminance relative
    let luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Retourner blanc si le fond est sombre, noir si le fond est clair
    return luminance > 0.6 ? '#000000' : '#FFFFFF';
  }

  updateTextColor() {
    let bgColor = this.event.backgroundColor;
    if (bgColor) {
      let hexColor = '';
      // Convertir la couleur RGB en hexadécimal
      if (bgColor.startsWith("rgb")) {
        let rgb = bgColor.match(/\d+/g);
        if (!rgb) return;
        hexColor = `#${((1 << 24) + (parseInt(rgb[0]) << 16) + (parseInt(rgb[1]) << 8) + parseInt(rgb[2])).toString(16).slice(1)}`;
      }

      if (bgColor.startsWith("#")) {
        hexColor = bgColor;
      }

      return this.getContrastColor(hexColor);
    }
    return '#000000';
  }


}