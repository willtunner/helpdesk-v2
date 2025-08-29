import { Injectable } from '@angular/core';
import { getDownloadURL, getStorage, ref, uploadBytes, uploadBytesResumable } from '@firebase/storage';
import { AuthService } from './auth.service';
import { doc, getDoc, updateDoc } from '@firebase/firestore';
import { Firestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private storage = getStorage();

  constructor(private authService: AuthService, private firestore: Firestore,) {}

  async uploadImageToFirebaseChat(file: File, folder: string): Promise<string> {
    try {
      const filePath = `${folder}/${new Date().getTime()}_${file.name}`;
      const fileRef = ref(this.storage, filePath);
      const uploadTask = uploadBytesResumable(fileRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Progresso: ${progress}%`); //? remover
          },
          (error) => reject(error),
          async () => {
            const downloadUrl = await getDownloadURL(fileRef);
            resolve(downloadUrl);
          }
        );
      });
    } catch (error) {
      console.error('Erro ao fazer upload no Firebase Storage:', error);
      throw error;
    }
  }

  async changeProfileImage(blob: Blob, file: File): Promise<void> {
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      throw new Error('Usuário não está logado.');
    }

    const { id, roles } = currentUser;
    const collectionPath = roles.includes('OPERATOR') ? 'users' : 'clients';
    const storagePath = `profile-images/${id}/${file.name}`;

    try {
      // Upload da imagem
      const storageRef = ref(this.storage, storagePath);
      const uploadTask = await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(uploadTask.ref);

      // Atualização no Firestore
      const userDocRef = doc(this.firestore, `${collectionPath}/${id}`);
      await updateDoc(userDocRef, { imageUrl: downloadUrl });

      // Atualiza o signal currentUser
      this.authService.currentUser.set({ ...currentUser, imageUrl: downloadUrl });
    } catch (error) {
      console.error('Erro ao alterar a imagem de perfil:', error);
      throw error;
    }
  }

}