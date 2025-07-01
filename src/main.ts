import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Adicionado
import { importProvidersFrom } from '@angular/core'; // Necessário para usar modules com standalone
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { environment } from '../src/app/environments/environment'
import { HighchartsChartModule } from 'highcharts-angular';
import { MatDialogModule } from '@angular/material/dialog';
import { provideNgxMask } from 'ngx-mask';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideNgxMask(),
    importProvidersFrom(BrowserAnimationsModule, HighchartsChartModule, MatDialogModule ), provideFirebaseApp(() => initializeApp({
      "projectId":environment.firebase.projectId,
      "appId":environment.firebase.appId,
      "storageBucket":environment.firebase.storageBucket,
      "apiKey":environment.firebase.apiKey,
      "authDomain":environment.firebase.authDomain,
      "messagingSenderId":environment.firebase.messagingSenderId,
      "measurementId":environment.firebase.measurementId,
    })), provideAuth(() => getAuth()), provideAnalytics(() => getAnalytics()), ScreenTrackingService, UserTrackingService, provideFirestore(() => getFirestore()), provideDatabase(() => getDatabase()), provideMessaging(() => getMessaging()), provideStorage(() => getStorage()), // Importando o módulo de animações
  ],
});
