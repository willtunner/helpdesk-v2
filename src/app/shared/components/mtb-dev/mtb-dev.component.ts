import { Component, ViewChild, ElementRef, signal, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SavedDocument } from '../../../interface/dynamic-form.interface';
import { DocumentService } from '../../../services/document.service';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';

@Component({
  selector: 'app-mtb-dev',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    QuillModule,
    MatButtonModule,
    MatInputModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DateFormatPipe
  ],
  templateUrl: './mtb-dev.component.html',
  styleUrls: ['./mtb-dev.component.scss']
})
export class MtbDevComponent implements OnInit {
  @ViewChild('previewContent') previewContent!: ElementRef;

  showPreview = signal(false);
  editorContent = '';
  documentTitle = '';
  currentDocumentId: string | null = null;
  savedDocuments = signal<SavedDocument[]>([]);
  nextId = 1;
  isGeneratingPDF = signal(false);
  isLoadingDoc = false;
  isProcessingSave = false;

  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'video']
    ]
  };

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private documentService: DocumentService,
  ) {
    // Efeito para salvar localStorage
    effect(() => {
      localStorage.setItem('savedDocuments', JSON.stringify(this.savedDocuments()));
    });

    // Efeito para carregar documentos e atualizar sinal
    effect(() => {
      const docs = this.documentService.documents();
      console.log('Documentos carregados:', docs);
      this.savedDocuments.set(docs);

      if (docs.length > 0) {
        const maxId = Math.max(...docs.map(doc => Number(doc.id) || 0));
        this.nextId = maxId + 1;
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {

  }


  togglePreview() {
    this.showPreview.update(value => !value);
  }

  
  async generatePDF() {
    if (this.isGeneratingPDF() || !this.previewContent?.nativeElement) return;
  
    this.showPreview.set(true);
    this.isGeneratingPDF.set(true);
  
    await new Promise(resolve => setTimeout(resolve, 80)); // pequeno delay para evitar crash
  
    try {
      const element = this.previewContent.nativeElement;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
  
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        scrollY: 0,
        windowHeight: element.scrollHeight,
        height: element.scrollHeight
      });
  
      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pageWidth - 20;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
  
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
  
      // Links com segurança:
      const anchors = element.querySelectorAll('a[href]');
      const containerRect = element.getBoundingClientRect();
  
      anchors.forEach((a: HTMLAnchorElement) => {
        const href = a.getAttribute('href');
        const text = a.textContent?.trim() || 'Link';
        if (!href || !text) return;
  
        const rect = a.getBoundingClientRect();
        const xPx = rect.left - containerRect.left;
        const yPx = rect.top - containerRect.top;
  
        const pxPerMm = canvas.width / imgWidth;
        const x = xPx / pxPerMm + 10;
        const y = yPx / pxPerMm + 10;
  
        pdf.setTextColor(0, 0, 255);
        pdf.setFontSize(11);
        pdf.textWithLink(text, x, y + 4, { url: href });
      });
  
      const safeName = this.documentTitle.trim().replace(/[^a-zA-Z0-9-_]/g, '_');
      pdf.save(`${safeName || 'documento'}-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      this.snackBar.open('Erro ao gerar PDF', 'Fechar', { duration: 2000 });
    } finally {
      this.isGeneratingPDF.set(false);
    }
  }



  async saveDocument() {
    if (this.isProcessingSave || !this.editorContent.trim()) return;

    this.isProcessingSave = true;

    try {
      if (this.currentDocumentId) {
        await this.documentService.updateDocument(
          this.currentDocumentId,
          this.documentTitle,
          this.editorContent
        );
        this.snackBar.open('Documento atualizado com sucesso!', 'Fechar', { duration: 2000 });
      } else {
        await this.documentService.saveDocument(this.documentTitle, this.editorContent);
        this.snackBar.open('Documento salvo com sucesso!', 'Fechar', { duration: 2000 });
      }

      this.resetEditor();
    } catch (e) {
      this.snackBar.open('Erro ao salvar documento', 'Fechar', { duration: 2000 });
    } finally {
      this.isProcessingSave = false;
    }
  }

  loadDocument(doc: SavedDocument) {
    if (this.isLoadingDoc || doc.id === this.currentDocumentId) return;
    this.isLoadingDoc = true;

    setTimeout(() => {
      this.editorContent = doc.content;
      this.documentTitle = doc.title;
      this.currentDocumentId = doc.id;
      this.showPreview.set(false);
      this.isLoadingDoc = false;
    }, 200); // Simula debounce e evita flood
  }

  async deleteDocument(id: string, doc: SavedDocument) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Você deseja excluir esse Documento?',
        message: `O documento: "${doc.title}" está para ser excluído!`
      }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result === true) {
        await this.documentService.deleteDocument(id);
        if (this.currentDocumentId === id) {
          this.resetEditor();
        }
        this.snackBar.open('Documento excluído com sucesso!', 'Fechar', { duration: 2000 });
      }
    });
  }

  resetEditor() {
    this.editorContent = '';
    this.documentTitle = '';
    this.currentDocumentId = null;
  }

  clearDocument() {
    this.resetEditor();
    this.showPreview.set(false);
  }
}
