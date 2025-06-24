import { NativeDateAdapter } from '@angular/material/core';

export class MyDateAdapter extends NativeDateAdapter {

  constructor() {
    super('fr-FR'); // Définir la locale directement ici
  }
  
  override getFirstDayOfWeek(): number {
    return 1;
  }

  override parse(value: any, parseFormat?: any): Date | null {
    if (typeof value === 'string') {
      const it = value.split('/');
      if (it.length === 3) {
        const day = +it[0];
        const month = +it[1] - 1;
        const year = +it[2];

        const parsedDate = new Date(year, month, day, 12);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      }
    }
    return null;
  }

  override format(date: Date, displayFormat: Object): string {
    if (!date) return '';

    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }
}
