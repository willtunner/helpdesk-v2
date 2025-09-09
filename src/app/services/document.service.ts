import { Injectable, computed, inject, signal } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from '@angular/fire/firestore';
import { Timestamp } from '@angular/fire/firestore';
import { SavedDocument } from '../interface/dynamic-form.interface';
import { AuthService } from './auth.service';
import { User } from '../models/models';
import { where } from 'firebase/firestore';

const PATH_DOCS = 'documents';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private _firestore = inject(Firestore);
  private collectionRef = collection(this._firestore, PATH_DOCS);
  private documentsSignal = signal<SavedDocument[]>([]);
  user!: User;

  documents = computed(() => this.documentsSignal());

  constructor(private firestore: Firestore, private auth: AuthService) {
    const session = this.auth.currentUser();
    if (session) { this.user = session; }
    this.loadDocuments();
  }

  private async loadDocuments() {
    if (!this.user || !this.user.helpDeskCompanyId) {
      console.warn('Usuário não possui helpDeskCompanyId definido, não foi possível carregar documentos.');
      this.documentsSignal.set([]);
      return;
    }
  
    const q = query(
      this.collectionRef,
      where('helpDeskCompanyId', '==', this.user.helpDeskCompanyId),
      orderBy('createdAt', 'desc')
    );
  
    const snapshot = await getDocs(q);
  
    const docs: SavedDocument[] = snapshot.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        title: data['title'],
        content: data['content'],
        helpDeskCompanyId: data['helpDeskCompanyId'],
        createdAt: this.convertFirebaseTimestamp(data['createdAt']),
        updatedAt: data['updatedAt'] ? this.convertFirebaseTimestamp(data['updatedAt']) : undefined
      };
    });
  
    this.documentsSignal.set(docs);
  }
  

  private convertFirebaseTimestamp(timestamp: Timestamp | Date): Date {
    return timestamp instanceof Date ? timestamp : timestamp.toDate();
  }

  async saveDocument(title: string, content: string, helpDeskCompanyId: string) {
    const now = new Date();
    const docRef = await addDoc(this.collectionRef, {
      title,
      content,
      helpDeskCompanyId,
      createdAt: now,
      updatedAt: now
    });

    this.documentsSignal.update(docs => [
      {
        id: docRef.id,
        title,
        content,
        helpDeskCompanyId,
        createdAt: now,
        updatedAt: now
      },
      ...docs
    ]);
  }

  async updateDocument(id: string, title: string, content: string) {
    const updatedAt = new Date();
    const docRef = doc(this.firestore, `documents/${id}`);
    await updateDoc(docRef, { title, content, updatedAt });

    this.documentsSignal.update(docs =>
      docs.map(d => d.id === id ? { 
        ...d, 
        title, 
        content, 
        updatedAt 
      } : d)
    );
  }

  async deleteDocument(id: string) {
    const docRef = doc(this.firestore, `documents/${id}`);
    await deleteDoc(docRef);

    this.documentsSignal.update(docs => docs.filter(d => d.id !== id));
  }
}