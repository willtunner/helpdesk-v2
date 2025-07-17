import { inject, Injectable } from '@angular/core';
import { Observable, combineLatest, map, from, switchMap, catchError, of } from 'rxjs';
import { addDoc, collection, collectionData, deleteDoc, doc, Firestore, getDoc, getDocs, orderBy, query, Timestamp, updateDoc, where } from '@angular/fire/firestore';
import { Call, Company, User } from '../models/models';
import { AuthService } from './auth.service';

const PATH_CALLS = 'calls';
const PATH_COMPANIES = 'company';
const PATH_CLIENTS = 'users';

@Injectable({
  providedIn: 'root'
})

export class ChartsService {
  private _firestore = inject(Firestore);
  private _collection = collection(this._firestore, PATH_CALLS);

  constructor(private authservice: AuthService) { }



}


