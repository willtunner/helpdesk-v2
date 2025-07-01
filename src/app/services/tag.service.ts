import { inject, Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, collection, query, where, getDocs } from '@angular/fire/firestore';
import { Call } from '../models/models'; // Importar o modelo Call

const DOCUMENT_PATH = 'tags/tagDocument';

@Injectable({
  providedIn: 'root',
})
export class TagService {
  private firestore = inject(Firestore);

  async searchTags(startWith: string): Promise<string[]> {
    const docRef = doc(this.firestore, DOCUMENT_PATH);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return [];
    const tagsArray: string[] = docSnap.data()['tagsArray'] || [];
    const searchTerm = startWith.toUpperCase();
    return tagsArray.filter((tag) => tag.toUpperCase().startsWith(searchTerm));
  }

  async getAllTags(): Promise<string[]> {
    const docRef = doc(this.firestore, DOCUMENT_PATH);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return [];
    return docSnap.data()['tagsArray'] || [];
  }

  async getAllTagsByCall(): Promise<string[]> {
    try {
      const callsRef = collection(this.firestore, 'calls');
      const querySnapshot = await getDocs(callsRef);

      const tagSet = new Set<string>();

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const tags: string[] = data['tags'] || [];

        tags.forEach((tag) => tagSet.add(tag.toUpperCase()));
      });

      return Array.from(tagSet);
    } catch (error) {
      console.error('Erro ao buscar todas as tags por chamado:', error);
      return [];
    }
  }

  async addTagToFirestore(tag: string): Promise<boolean> {
    const docRef = doc(this.firestore, DOCUMENT_PATH);
    const docSnap = await getDoc(docRef);

    let tagsArray: string[] = [];
    if (docSnap.exists()) {
      tagsArray = docSnap.data()['tagsArray'] || [];
    }

    const upperTag = tag.toUpperCase();
    if (!tagsArray.includes(upperTag)) {
      tagsArray.push(upperTag);
      await setDoc(docRef, { tagsArray }, { merge: true });
      return true;
    }

    return false; // Tag já existe
  }

  async getCallsByTag(tag: string): Promise<{ count: number; calls: Call[] }> {
    try {
      const callsRef = collection(this.firestore, 'calls');
      const q = query(callsRef, where('tags', 'array-contains', tag.toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return { count: 0, calls: [] };
      }

      const calls: Call[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const originalTags: string[] = data['tags'] || [];
        const upperTags = originalTags.map(tag => tag.toUpperCase());
        // console.log('Upper Tags:', upperTags);

        calls.push({
          id: doc.id,
          companyId: data['companyId'],
          clientId: data['clientId'],
          connection: data['connection'],
          title: data['title'],
          description: data['description'],
          resolution: data['resolution'],
          tags: upperTags,
          closed: data['closed'],
          operatorId: data['operatorId'],
          created: data['created']?.toDate ? data['created'].toDate() : new Date(),
          company: data['company'],
          client: data['client']
        } as Call);
      });

      return {
        count: calls.length,
        calls
      };
    } catch (error) {
      console.error(`Erro ao buscar chamados para a tag ${tag}:`, error);
      return { count: 0, calls: [] };
    }
  }


}