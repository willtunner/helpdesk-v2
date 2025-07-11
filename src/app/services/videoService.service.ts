import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, deleteDoc, DocumentReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { DropDownVideos, Video } from '../models/models';
import { SendNotificationService } from './send-notification.service';
import { NotificationType } from '../enums/notificationType.enum';

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  private collectionName = 'videos-tutorials';

  constructor(private firestore: Firestore, private sendNotification: SendNotificationService) {}

  // Obter todos as sessões
  getSectionVideos(): Observable<DropDownVideos[]> {
    const videoCollection = collection(this.firestore, this.collectionName);
    return collectionData(videoCollection, { idField: 'id' }) as Observable<DropDownVideos[]>;
  }

  // Adicionar uma nova sessão
  sectionSave(newSection: Omit<DropDownVideos, 'id'>): Promise<DocumentReference> {
    const videoCollection = collection(this.firestore, this.collectionName);
    this.sendNotification.customNotification(NotificationType.SUCCESS, 'Video salvo com sucesso!');
    return addDoc(videoCollection, newSection);
  }

  // Atualizar um vídeo específico dentro de um DropDownVideos
  async updateVideo(dropdownId: string, updatedVideo: Video): Promise<void> {
    const dropdownDoc = doc(this.firestore, `${this.collectionName}/${dropdownId}`);
    const dropdown = await docData(dropdownDoc).toPromise() as DropDownVideos;

    const updatedVideos = dropdown.videos.map((video) =>
      video.id === updatedVideo.id ? updatedVideo : video
    );
    return updateDoc(dropdownDoc, { videos: updatedVideos });
  }

  // Atualizar uma seção específica (excluindo os vídeos)
async updateSection(dropdownId: string, updatedSection: Partial<Omit<DropDownVideos, 'id'>>): Promise<void> {
  const dropdownDoc = doc(this.firestore, `${this.collectionName}/${dropdownId}`);
  this.sendNotification.customNotification(NotificationType.SUCCESS, 'Video salvo com sucesso!');
  return updateDoc(dropdownDoc, updatedSection);
}

  // Excluir um vídeo específico de uma sessão
  async deleteVideoSection(dropdownId: string, videoId: string): Promise<void> {
    const dropdownDoc = doc(this.firestore, `${this.collectionName}/${dropdownId}`);
    const dropdown = await docData(dropdownDoc).toPromise() as DropDownVideos;

    const updatedVideos = dropdown.videos.filter(video => video.id !== videoId);
    this.sendNotification.customNotification(NotificationType.ERROR, 'Video excluido com sucesso');
    return updateDoc(dropdownDoc, { videos: updatedVideos });
  }

  // Excluir uma Sessão completa
  async deleteSection(dropdownId: string): Promise<void> {
    const dropdownDoc = doc(this.firestore, `${this.collectionName}/${dropdownId}`);
    return deleteDoc(dropdownDoc);
  }

}
