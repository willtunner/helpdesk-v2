import { Injectable } from '@angular/core';
import {
  Firestore,
  query,
  collection,
  where,
  getDocs,
  CollectionReference
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class EmailValidationService {
  constructor(private firestore: Firestore) {}

  async checkEmailExistsInCollections(email: string, collections: string[]): Promise<boolean> {
    const checks = collections.map(async (collectionName) => {
      const ref = collection(this.firestore, collectionName) as CollectionReference;
      const q = query(ref, where('email', '==', email));
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    });

    const results = await Promise.all(checks);
    return results.includes(true);
  }
}
