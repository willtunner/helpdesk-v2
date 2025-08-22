import { inject, Injectable } from '@angular/core';
import { 
  Firestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from '@angular/fire/firestore';
import { Call } from '../models/models';

const DOCUMENT_PATH = 'tags/tagDocument';

@Injectable({
  providedIn: 'root',
})
export class TagService {
  private firestore = inject(Firestore);
  
  // Cache em memória para melhor performance
  private allCalls: Call[] = [];
  private callsLoaded = false;
  private allTagsCache: string[] = [];
  private tagsCacheLoaded = false;

  /**
   * Busca tags que começam com o termo especificado
   */
  async searchTags(startWith: string): Promise<string[]> {
    try {
      const allTags = await this.getAllTags();
      const searchTerm = startWith.toUpperCase();
      return allTags.filter(tag => tag.toUpperCase().startsWith(searchTerm));
    } catch (error) {
      console.error('Erro ao buscar tags:', error);
      return [];
    }
  }

  /**
   * Obtém todas as tags do documento de tags
   */
  async getAllTags(): Promise<string[]> {
    if (this.tagsCacheLoaded) {
      return this.allTagsCache;
    }

    try {
      const docRef = doc(this.firestore, DOCUMENT_PATH);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        this.allTagsCache = [];
        this.tagsCacheLoaded = true;
        return [];
      }

      this.allTagsCache = docSnap.data()['tagsArray'] || [];
      this.tagsCacheLoaded = true;
      return this.allTagsCache;
    } catch (error) {
      console.error('Erro ao buscar todas as tags:', error);
      return [];
    }
  }

  /**
   * Obtém todas as tags usadas em chamados
   */
  async getAllTagsByCall(): Promise<string[]> {
    try {
      await this.loadAllCalls();
      
      const tagSet = new Set<string>();
      this.allCalls.forEach(call => {
        call.tags.forEach(tag => tagSet.add(tag.toUpperCase()));
      });

      return Array.from(tagSet);
    } catch (error) {
      console.error('Erro ao buscar todas as tags por chamado:', error);
      return [];
    }
  }

  /**
   * Adiciona uma tag ao Firestore
   */
  async addTagToFirestore(tag: string): Promise<boolean> {
    try {
      const upperTag = tag.toUpperCase();
      const currentTags = await this.getAllTags();
      
      if (currentTags.includes(upperTag)) {
        return false; // Tag já existe
      }

      const updatedTags = [...currentTags, upperTag];
      const docRef = doc(this.firestore, DOCUMENT_PATH);
      
      await setDoc(docRef, { tagsArray: updatedTags }, { merge: true });
      
      // Atualiza o cache
      this.allTagsCache = updatedTags;
      
      return true;
    } catch (error) {
      console.error('Erro ao adicionar tag:', error);
      return false;
    }
  }

  /**
   * Obtém chamados por tag (com cache)
   */
  async getCallsByTag(tag: string): Promise<Call[]> {
    try {
      await this.loadAllCalls();
  
      const upperTag = tag.toUpperCase();
      return this.allCalls.filter(call => 
        call.tags.includes(upperTag)
      );
    } catch (error) {
      console.error(`Erro ao buscar todos os chamados da tag ${tag}:`, error);
      return [];
    }
  }

  /**
   * Obtém chamados por múltiplas tags de forma otimizada
   */
  async getCallsByMultipleTags(tags: string[]): Promise<Map<string, { count: number; calls: Call[] }>> {
    try {
      await this.loadAllCalls();
      
      const resultMap = new Map<string, { count: number; calls: Call[] }>();
      
      // Inicializa o mapa com todas as tags
      tags.forEach(tag => {
        resultMap.set(tag.toUpperCase(), { count: 0, calls: [] });
      });

      // Processa todos os calls
      this.allCalls.forEach(call => {
        call.tags.forEach(tag => {
          if (resultMap.has(tag)) {
            const current = resultMap.get(tag)!;
            current.count++;
            current.calls.push(call);
          }
        });
      });

      return resultMap;
    } catch (error) {
      console.error('Erro ao buscar chamados para múltiplas tags:', error);
      return new Map();
    }
  }

  /**
   * Carrega todos os calls do Firestore (apenas uma vez)
   */
  private async loadAllCalls(): Promise<void> {
    if (this.callsLoaded) return;

    try {
      const callsRef = collection(this.firestore, 'calls');
      const querySnapshot = await getDocs(callsRef);

      this.allCalls = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const originalTags: string[] = data['tags'] || [];
        const upperTags = originalTags.map(tag => tag.toUpperCase());

        this.allCalls.push({
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

      this.callsLoaded = true;
      console.log('Todos os calls carregados em cache:', this.allCalls.length);
    } catch (error) {
      console.error('Erro ao carregar todos os chamados:', error);
      throw error;
    }
  }

  /**
   * Limpa o cache (útil para forçar recarregamento)
   */
  clearCache(): void {
    this.allCalls = [];
    this.callsLoaded = false;
    this.allTagsCache = [];
    this.tagsCacheLoaded = false;
    console.log('Cache do TagService limpo');
  }

  /**
   * Obtém estatísticas gerais de tags
   */
  async getTagStatistics(): Promise<{tag: string, count: number}[]> {
    try {
      await this.loadAllCalls();
      
      const tagCountMap = new Map<string, number>();
      
      this.allCalls.forEach(call => {
        call.tags.forEach(tag => {
          const currentCount = tagCountMap.get(tag) || 0;
          tagCountMap.set(tag, currentCount + 1);
        });
      });

      return Array.from(tagCountMap.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('Erro ao obter estatísticas de tags:', error);
      return [];
    }
  }

  /**
   * Verifica se uma tag existe
   */
  async tagExists(tag: string): Promise<boolean> {
    const allTags = await this.getAllTags();
    return allTags.includes(tag.toUpperCase());
  }

  /**
   * Remove uma tag do Firestore
   */
  async removeTag(tag: string): Promise<boolean> {
    try {
      const upperTag = tag.toUpperCase();
      const currentTags = await this.getAllTags();
      
      if (!currentTags.includes(upperTag)) {
        return false; // Tag não existe
      }

      const updatedTags = currentTags.filter(t => t !== upperTag);
      const docRef = doc(this.firestore, DOCUMENT_PATH);
      
      await setDoc(docRef, { tagsArray: updatedTags }, { merge: true });
      
      // Atualiza o cache
      this.allTagsCache = updatedTags;
      
      return true;
    } catch (error) {
      console.error('Erro ao remover tag:', error);
      return false;
    }
  }
}