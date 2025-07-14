import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
  standalone: true,
})
export class DateFormatPipe implements PipeTransform {
  transform(value: any): string {
    if (!value) return '';

    let date: Date;

    // Verifica se o valor é um Timestamp do Firebase
    if (value.seconds !== undefined) {
      date = new Date(value.seconds * 1000); // Converte Timestamp para Date
    } else if (value instanceof Date) {
      date = value;
    } else {
      return '';
    }

    // Formata a data manualmente
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');

    return `${day}/${month}/${year} ${hour}:${minute}`;
  }
}
