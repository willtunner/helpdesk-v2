import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DropDownVideos, Video } from '../../../../models/models';
import { SessionService } from '../../../../services/session.service';
import { VideoService } from '../../../../services/videoService.service';
import { CustomInputComponent } from '../../custom-input/custom-input.component';
import { DynamicButtonComponent } from '../../action-button/action-button.component';
import { ConfirmationDialogComponent } from '../../confirmation-dialog copy/confirmation-dialog.component';

@Component({
  selector: 'app-addVideoDialogComponent',
  templateUrl: './addVideoDialogComponent.component.html',
  styleUrls: ['./addVideoDialogComponent.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    CommonModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    CustomInputComponent,
    DynamicButtonComponent,
  ]
})
export class AddVideoDialogComponentComponent {
  videoForm: FormGroup;
  displayedColumns: string[] = ['title', 'url', 'sector', 'actions'];
  isEditable = false;
  showForm = false;
  editing: { [key: string]: boolean } = {};
  videoDropDown!: DropDownVideos;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddVideoDialogComponentComponent>,
    private sessionService: SessionService,
    private videoService: VideoService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: { dropDown: DropDownVideos }
  ) {
    this.videoForm = this.fb.group({
      sectionTitle: [data ? data.dropDown.dropdownText : ''],
      videoTitle: [''],
      videoUrl: [''],
      sector: ['']
    });
  }

  ngOnInit(): void {
    if (this.data?.dropDown) {
      this.isEditable = true;
      this.videoDropDown = this.data.dropDown;
    } else {
      this.isEditable = false;
      this.videoDropDown = { id: '', dropdownText: '', videos: [] }; // Evita undefined
    }
  }


  trackById(index: number, item: any): number {
    return item.id;
  }


  //? Salvar uma sessão
  sectionSave() {
    const newVideo = this.videoForm.value;
    const user = this.sessionService.getSession();

    if (!user) return;

    const videoToSave: Video = {
      url: newVideo.videoUrl,
      title: newVideo.videoTitle,
      created: new Date(),
      imgProfile: user.imageUrl,
      nameProfile: user.username,
      sector: newVideo.sector
    };
    
    if (this.isEditable && this.showForm) {
      // Se for atualizar sessão incluindo novo video
      this.videoDropDown.videos.push(videoToSave);
      console.log('dowpDownSection1:', this.videoDropDown)
      // this.videoService.updateSection(this.videoDropDown.id!, this.videoDropDown);
      this.onClose();
    } else if(this.isEditable && !this.showForm) {
      // Se for atualizar somente o titulo da sessão
      this.videoDropDown.dropdownText = newVideo.sectionTitle;
      // this.videoService.updateSection(this.videoDropDown.id!, this.videoDropDown);
    } else {
      // cria uma sessão nova
      this.videoDropDown.dropdownText = newVideo.sectionTitle;
      this.videoDropDown.videos.push(videoToSave);
      console.log('dowpDownSection2:', this.videoDropDown)
      // this.videoService.sectionSave(this.videoDropDown);
      this.onClose();
    }
  }
  

  //? Deleta sessão inteira
  deleteDropDownVideo() {
    if (this.videoDropDown.id) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '400px',
        data: {
          title: 'Deseja excluir essa sessão?',
          message: `Se você excluir essa sessão todos os videos serão deletados juntos, tem certeza?`,
        },
      });

      dialogRef.afterClosed().subscribe(async (result) => {
        if (result) {
          // try {
          //   this.videoService.deleteSection(this.videoDropDown.id!).then(() => {
          //     console.log('Dropdown e vídeos excluídos com sucesso!');
          //   });
          //   this.onClose();
          // } catch (error) {
          //   console.error('Erro ao tentar excluir a sessão', error);
          // }
        }
      });
    }
  }

  //? atualiza os videos de cada sessão
  updateVideo(video: Video, event?: KeyboardEvent) {
    // Só executa a atualização se a tecla pressionada for Enter
    if (event && event.key !== "Enter") {
      return;
    }
  
    const index = this.videoDropDown.videos.findIndex(v => v.title === video.title);
    if (index !== -1) {
      this.videoDropDown.videos[index] = video;
      // this.videoService.updateSection(this.videoDropDown.id!, this.videoDropDown);
    }
  
    // Sai do modo de edição
    this.editing[video.title] = false;
  }

  //? deleta apenas um video da sessão
  deleteVideo(video: Video) {


    if (this.videoDropDown.videos.length > 0) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '400px',
        data: {
          title: 'Deseja excluir o video?',
          message: `Você está preste a deletar o video ${ video.title }, tem certeza?`,
        },
      });

      dialogRef.afterClosed().subscribe(async (result) => {
        if (result) {
          // try {
          //   this.videoDropDown.videos = this.videoDropDown.videos.filter(v => v !== video);
          //   this.videoService.updateSection(this.videoDropDown.id!, this.videoDropDown);
          //   this.onClose();
          // } catch (error) {
          //   console.error('Erro tentar excluir o video', error);
          // }
        }
      });


    }
  }

  toggleEdit(video: Video) {
    if (this.editing[video.title]) {
      // Apenas desativa a edição, sem chamar updateVideo diretamente
      this.editing[video.title] = false;
    } else {
      // Ativa a edição apenas para o vídeo selecionado
      this.editing = { [video.title]: true };
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

  get sectionTitleControl(): FormControl {
    return this.videoForm.get('sectionTitle') as FormControl;
  }
  
  get videoTitleControl(): FormControl {
    return this.videoForm.get('videoTitle') as FormControl;
  }
  
  get videoUrlControl(): FormControl {
    return this.videoForm.get('videoUrl') as FormControl;
  }
  
  get sectorControl(): FormControl {
    return this.videoForm.get('sector') as FormControl;
  }

}
