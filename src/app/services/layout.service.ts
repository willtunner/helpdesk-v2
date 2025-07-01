import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {

  private showSideNavSubject = new BehaviorSubject<boolean>(false);

  // Observable para quem quiser se inscrever
  showSideNav$ = this.showSideNavSubject.asObservable();

  // Atualiza o estado
  setShowSideNav(show: boolean): void {
    this.showSideNavSubject.next(show);
  }
}
