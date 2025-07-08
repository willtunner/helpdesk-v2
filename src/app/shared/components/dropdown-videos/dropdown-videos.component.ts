import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddVideoDialogComponentComponent } from './addVideoDialogComponent/addVideoDialogComponent.component';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DropDownVideos } from '../../../models/models';
import { OnlyDatePipe } from '../../../pipes/onlyDate.pipe';
import { VideoService } from '../../../services/videoService.service';
import { YoutubeEmbedPipe } from '../../../pipes/youtubeEmbedPipe.pipe';

@Component({
  selector: 'app-dropdown-videos',
  templateUrl: './dropdown-videos.component.html',
  styleUrls: ['./dropdown-videos.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatDialogModule,
    YoutubeEmbedPipe,
    OnlyDatePipe
  ],
})
export class DropdownVideosComponent implements OnInit {
  activeDropdown: number | null = null;
  dropdowns: DropDownVideos[] = [];
  filteredDropdowns: DropDownVideos[] = [];
  filters = { name: '', sector: '', date: '' };
  sectors = ['Arquivos', 'Financeiro', 'Tecnologia'];

  constructor(private videoService: VideoService, private dialog: MatDialog, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.loadVideos();
  }

  toggleDropdown(index: number): void {
    this.activeDropdown = this.activeDropdown === index ? null : index;
  }

  loadVideos() {
    this.videoService.getSectionVideos().subscribe((data: DropDownVideos[]) => {
      console.log('Data', data);
      this.dropdowns = data;
      this.filteredDropdowns = [...this.dropdowns];
    });
  }

  filterVideos() {
    this.filteredDropdowns = this.dropdowns.map((dropdown) => ({
      ...dropdown,
      videos: dropdown.videos.filter((video) => {
        const matchesName = this.filters.name
          ? video.title.toLowerCase().includes(this.filters.name.toLowerCase())
          : true;
        const matchesSector = this.filters.sector
          ? video.sector === this.filters.sector
          : true;
        const matchesDate = this.filters.date
          ? video.created.toDateString() === new Date(this.filters.date).toDateString()
          : true;
        return matchesName && matchesSector && matchesDate;
      }),
    }));
  }
  

  // getEmbedUrl(videoUrl: string): SafeResourceUrl {
  //   if (!videoUrl) return '';
  
  //   const videoId = videoUrl.split('v=')[1]?.split('&')[0]; // Extrai o ID do vídeo
  //   const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`; // Usa a versão sem cookies
    
  //   return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl); // Sanitiza a URL
  // }

  openAddVideoModal(dropDown?: DropDownVideos) {
    const dialogRef = this.dialog.open(AddVideoDialogComponentComponent, {
      width: '800px',
      data: dropDown ? { dropDown } : null,
    });
  
    dialogRef.afterClosed().subscribe((result: DropDownVideos) => { // Agora recebe DropDownVideos corretamente
      console.log('result', result);
  
      // if (result) {
      //   if (dropDown) {
      //     this.videoService.updateVideo(dropDown.id!, result.videos[0]) // Corrige para pegar o vídeo dentro do dropdown
      //       .then(() => this.loadVideos());
      //   } else if (result.id) {
      //     this.videoService.addVideoToDropdown(result.id, result.videos[0]) // Corrige para pegar o vídeo corretamente
      //       .then(() => this.loadVideos());
      //   } else {
      //     const newDropdown: Omit<DropDownVideos, 'id'> = {
      //       dropdownText: result.dropdownText, // Usa o título correto do dropdown
      //       videos: result.videos, // Garante que a lista de vídeos seja corretamente passada
      //     };
  
      //     this.videoService.addDropDown(newDropdown)
      //       .then(() => this.loadVideos());
      //   }
      // }
    });
  }


}
