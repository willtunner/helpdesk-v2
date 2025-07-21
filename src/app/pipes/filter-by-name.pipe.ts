import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterByName',
  standalone: true
})
export class FilterByNamePipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items || !searchText) return items;
    const lower = searchText.toLowerCase();
    return items.filter(item => item.name?.toLowerCase().includes(lower));
  }
}