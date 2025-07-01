import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'firstLetterUpperCase',
  standalone: true
})
export class FirstLetterPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) return '';
    return value.charAt(0).toUpperCase();
  }

}
