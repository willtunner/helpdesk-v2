import { Pipe, PipeTransform } from "@angular/core";
import { Timestamp } from "firebase/firestore";

@Pipe({
  name: 'firebaseDate',
  standalone: true,
})
export class FirebaseDatePipe implements PipeTransform {
  transform(value: Date | Timestamp | null | undefined): string {
    if (!value) return '';

    const date = value instanceof Date ? value : value.toDate();
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
  }
}
