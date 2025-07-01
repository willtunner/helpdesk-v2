// rich-text-editor.component.ts
import { Component, forwardRef, Input, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    QuillModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './rich-text.component.html',
  styleUrls: ['./rich-text.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true
    }
  ]
})
export class RichTextEditorComponent implements ControlValueAccessor {
  @Input() placeholder: string = 'Digite seu texto aqui...';
  @Input() label: string = 'Editor de Texto Rico';
  @Input() height: string = '300px';
  @Output() contentChanged = new EventEmitter<string>();

  editorContent: string = '';
  showPreview = false;

  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ]
  };

  // ControlValueAccessor methods
  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.editorContent = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onContentChange(content: string): void {
    this.editorContent = content;
    this.onChange(content);
    this.onTouched();
    this.contentChanged.emit(content);
  }

  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }
}