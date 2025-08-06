import { inject, Injectable } from '@angular/core';
import { User } from '../models/models';
import { collection, Firestore,
  query, where, getDocs, orderBy, } from '@angular/fire/firestore';
import { SendNotificationService } from './send-notification.service';
import { DateTimeFormatPipe } from '../pipes/dateTimeFormatTimeStamp.pipe';

const PATH = 'clients';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private _firestore = inject(Firestore);
  private _collection = collection(this._firestore, PATH);
  // private dateTimePipe = new DateTimeFormatPipe();

  constructor(private messageService: SendNotificationService) { }

  
  getClientsByCompanyId(companyId: string): Promise<User[]> {
    const q = query(
      this._collection,
      where('companyId', '==', companyId)
    );
  
    return getDocs(q).then(snapshot => {
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    });
  }


}
