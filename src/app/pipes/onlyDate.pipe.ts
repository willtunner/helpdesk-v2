import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'onlyDate',
  standalone: true,
})
export class OnlyDatePipe implements PipeTransform {
  transform(value: any): string {
    if (!value) return '';

    let date: Date;

    // Trata objetos no formato Firebase Timestamp
    if (value.seconds !== undefined && typeof value.seconds === 'number') {
      date = new Date(value.seconds * 1000); // Converte `seconds` para milissegundos
    } else if (value instanceof Date) {
      date = value; // Já é um objeto Date
    } else if (typeof value === 'string' || typeof value === 'number') {
      date = new Date(value); // Trata strings ou timestamps
    } else {
      return 'Data inválida'; // Caso não seja um formato reconhecível
    }

    // Verifica se a data é válida
    if (isNaN(date.getTime())) {
      return 'Data inválida';
    }

    // Formata a data no formato DD/MM/YYYY
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }
}
