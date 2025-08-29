import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatVisibilityService {

  private _isChatVisible = new BehaviorSubject<boolean>(false);
  isChatVisible$ = this._isChatVisible.asObservable();

  showChat() {
    this._isChatVisible.next(true);
  }

  hideChat() {
    this._isChatVisible.next(false);
  }
}
