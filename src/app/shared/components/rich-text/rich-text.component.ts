import { Component, forwardRef, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule, ReactiveFormsModule, FormControl, AbstractControl } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatError } from '@angular/material/form-field';
import { Subscription } from 'rxjs';

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
export class RichTextEditorComponent implements ControlValueAccessor, OnDestroy {
  @Input() placeholder: string = 'Digite seu texto aqui...';
  @Input() label: string = 'Editor de Texto';
  @Input() height: string = '300px';
  @Output() contentChanged = new EventEmitter<string>();
  
  editorContent: string = '';
  showPreview = false;
  isDisabled = false;
  private controlSubscription!: Subscription;

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

  private _control!: FormControl;
  @Input() 
  set control(ctrl: AbstractControl | null) {
    if (this.controlSubscription) {
      this.controlSubscription.unsubscribe();
    }
    
    if (ctrl) {
      this._control = ctrl as FormControl;
      // Sincroniza o valor inicial
      this.writeValue(this._control.value);
      
      // Observa mudanças externas ao controle
      this.controlSubscription = this._control.valueChanges.subscribe(value => {
        if (value !== this.editorContent) {
          this.editorContent = value || '';
        }
      });
    }
  }
  
  get control(): FormControl {
    return this._control;
  }

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

  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  onEditorChanged(event: any): void {
    const content = event.html || '';
    this.updateContent(content);
  }

  private updateContent(content: string): void {
    this.editorContent = content;
    this.onChange(content);
    this.onTouched();
    this.contentChanged.emit(content);
    this.updateControlValue(content);
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  private updateControlValue(content: string): void {
    if (this.control) {
      const isEmpty = !content || content === '<p><br></p>' || content.trim() === '';
      
      if (isEmpty && this.control.hasError('required')) {
        this.control.markAsTouched();
        this.control.markAsDirty();
      } else {
        this.control.setValue(content, { emitEvent: false });
      }
    }
  }

  get showError(): boolean {
    return this.control && this.control.invalid && (this.control.touched || this.control.dirty);
  }

  onBlur(): void {
    this.onTouched();
    if (this.control) {
      this.control.markAsTouched();
      this.updateControlValue(this.editorContent);
    }
  }

  ngOnDestroy(): void {
    if (this.controlSubscription) {
      this.controlSubscription.unsubscribe();
    }
  }
}