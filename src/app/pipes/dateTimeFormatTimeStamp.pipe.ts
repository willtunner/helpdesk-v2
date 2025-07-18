import { Pipe, PipeTransform } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore'; // importe isso

@Pipe({
  name: 'dateTimeFormat',
  standalone: true
})
export class DateTimeFormatPipe implements PipeTransform {
  transform(value: Date | string | Timestamp | null): string {
    if (!value) return '';

    // Converte Timestamp do Firebase para Date
    if (typeof value === 'object' && 'toDate' in value) {
      value = (value as Timestamp).toDate();
    }

    const date = typeof value === 'string' ? new Date(value) : value;
    const pad = (n: number) => n.toString().padStart(2, '0');

    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();

    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
  }
}
