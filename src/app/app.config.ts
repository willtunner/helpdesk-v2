import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from '../app/environments/environment'
import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideQuillConfig } from 'ngx-quill';
import { provideNgxMask } from 'ngx-mask';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideNgxMask(),
    provideRouter(routes),
    provideAnimations(),
    provideFirebaseApp(() =>
      initializeApp({
        apiKey: environment.firebase.apiKey,
        authDomain: environment.firebase.authDomain,
        projectId: environment.firebase.projectId,
        storageBucket: environment.firebase.storageBucket,
        messagingSenderId: environment.firebase.messagingSenderId,
        appId: environment.firebase.appId,
        measurementId: environment.firebase.measurementId,
      })
    ),
    provideStorage(() => getStorage()),
    provideFirestore(() => getFirestore()),
    provideQuillConfig({
      modules: {
        table: true, // Habilita o módulo de tabelas
        toolbar: [
          // Sua configuração de toolbar pode ser replicada aqui se necessário
        ]
      },
      theme: 'snow'
    })
  ],
};
