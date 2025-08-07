import { Component, forwardRef, Input, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule, ReactiveFormsModule, FormControl, AbstractControl } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatError } from '@angular/material/form-field';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    QuillModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatError
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
  @Input() label: string = 'Editor de Texto';
  @Input() height: string = '300px';
  @Input() control!: FormControl;
  @Output() contentChanged = new EventEmitter<string>();

  editorContent: string = '';
  showPreview = false;
  isDisabled = false;

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
    if (this.control && value !== this.control.value) {
      this.control.setValue(value, { emitEvent: false });
    }
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
    this.updateControlValue(content);
  }

  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  onEditorChanged(event: any): void {
    const content = event.html || '';
    this.onContentChange(content);
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  private updateControlValue(content: string): void {
    if (this.control) {
      const isEmpty = !content || content === '<p><br></p>' || content.trim() === '';
      
      if (isEmpty && this.control.hasError('required')) {
        this.control.markAsTouched();
        this.control.markAsDirty();
      } else {
        this.control.setValue(content, { emitEvent: true });
      }
    }
  }

  get showError(): boolean {
    return this.control && this.control.invalid && (this.control.touched || this.control.dirty);
  }

  onBlur(): void {
    if (this.control) {
      this.control.markAsTouched();
      this.updateControlValue(this.editorContent);
    }
  }
}