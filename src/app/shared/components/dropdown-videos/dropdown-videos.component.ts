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
import { FormControl, FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { OnlyDatePipe } from '../../../pipes/onlyDate.pipe';
import { DropDownVideos } from '../../../models/models';
import { VideoService } from '../../../services/videoService.service';
import { CustomInputComponent } from '../custom-input/custom-input.component';
import { DynamicSelectComponent } from '../dynamic-select/dynamic-select.component';

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
    OnlyDatePipe,
    CustomInputComponent,
    DynamicSelectComponent
  ],
})
export class DropdownVideosComponent implements OnInit {
  activeDropdown: number | null = null;
  dropdowns: DropDownVideos[] = [];
  filteredDropdowns: DropDownVideos[] = [];
  filters = { name: '', sector: '', date: '' };
  sectors = ['Arquivos', 'Financeiro', 'Tecnologia'];

    // FormControl para campos customizados
    nameControl = new FormControl<string>(''); // valor inicial = ''
    dateControl = new FormControl<string>(''); // idem

  constructor(
    private videoService: VideoService, 
    private dialog: MatDialog, 
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.loadVideos();

    // Escutar mudanças nos filtros reativos
    this.nameControl.valueChanges.subscribe((value) => {
      this.filters.name = value || '';
      this.filterVideos();
    });

    this.dateControl.valueChanges.subscribe((value) => {
      this.filters.name = value || '';
      this.filterVideos();
    });
  }

  toggleDropdown(index: number): void {
    this.activeDropdown = this.activeDropdown === index ? null : index;
  }

  loadVideos() {
    this.videoService.getSectionVideos().subscribe((data: DropDownVideos[]) => {
      this.dropdowns = data;
      this.filteredDropdowns = [...this.dropdowns];
    });
  }

  filterVideos() {
    this.filteredDropdowns = this.dropdowns.map((dropdown) => ({
      ...dropdown,
      videos: dropdown.videos.filter((video) => {
        const nameFilter = (this.filters.name || '').toString().toLowerCase();
        const sectorFilter = this.filters.sector || '';
        const dateFilter = this.filters.date;
  
        const matchesName = nameFilter
          ? video.title.toLowerCase().includes(nameFilter)
          : true;
  
        const matchesSector = sectorFilter
          ? video.sector === sectorFilter
          : true;
  
        const matchesDate = dateFilter
          ? video.created.toDateString() === new Date(dateFilter).toDateString()
          : true;
  
        return matchesName && matchesSector && matchesDate;
      }),
    }));
  }
  
  

  getEmbedUrl(videoUrl: string): SafeResourceUrl {
    if (!videoUrl) return '';
  
    const videoId = videoUrl.split('v=')[1]?.split('&')[0]; // Extrai o ID do vídeo
    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`; // Usa a versão sem cookies
    
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl); // Sanitiza a URL
  }

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
