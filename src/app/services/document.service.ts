import { Injectable, computed, inject, signal } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from '@angular/fire/firestore';
import { SavedDocument } from '../interface/dynamic-form.interface';

const PATH_DOCS = 'documents';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private _firestore = inject(Firestore);
  private collectionRef = collection(this._firestore, PATH_DOCS);
  private documentsSignal = signal<SavedDocument[]>([]);

  documents = computed(() => this.documentsSignal());

  constructor(private firestore: Firestore) {
    this.loadDocuments();
  }

  private async loadDocuments() {
    const q = query(this.collectionRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const docs: SavedDocument[] = snapshot.docs.map(d => ({
      ...(d.data() as Omit<SavedDocument, 'id'>),
      id: d.id
    }));
    this.documentsSignal.set(docs);
  }

  async saveDocument(title: string, content: string) {
    const now = new Date();
    const docRef = await addDoc(this.collectionRef, {
      title,
      content,
      createdAt: now,
      updatedAt: now
    });

    this.documentsSignal.update(docs => [
      {
        id: docRef.id,
        title,
        content,
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
      docs.map(d => d.id === id ? { ...d, title, content, updatedAt } : d)
    );
  }

  async deleteDocument(id: string) {
    const docRef = doc(this.firestore, `documents/${id}`);
    await deleteDoc(docRef);

    this.documentsSignal.update(docs => docs.filter(d => d.id !== id));
  }
}
