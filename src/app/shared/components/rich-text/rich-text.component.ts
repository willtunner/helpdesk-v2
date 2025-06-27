import { CommonModule } from '@angular/common';
import {
  Component,
  forwardRef,
  Input,
  ViewChild,
  ElementRef,
  OnInit,
  AfterViewInit,
  DoCheck,
  Injector
} from '@angular/core';
import {
  FormsModule,
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  NgControl,
  FormControl
} from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { MatFormFieldControl } from '@angular/material/form-field';
import { Subject } from 'rxjs';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

@Component({
  selector: 'app-rich-text',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    QuillModule
  ],
  templateUrl: './rich-text.component.html',
  styleUrls: ['./rich-text.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextComponent),
      multi: true
    },
    {
      provide: MatFormFieldControl,
      useExisting: RichTextComponent
    }
  ]
})
export class RichTextComponent implements ControlValueAccessor, MatFormFieldControl<string>, OnInit, AfterViewInit, DoCheck {
  @ViewChild('editor') editor!: ElementRef;
  @Input() placeholder: string = 'Digite seu texto aqui...';
  @Input() height: string = '150px';

  static nextId = 0;
  id = `rich-text-${RichTextComponent.nextId++}`;
  stateChanges = new Subject<void>();
  focused = false;
  errorState = false;
  controlType = 'rich-text';
  describedBy = '';

  private _value: string = '';
  private _required = false;
  private _disabled = false;
  ngControl: NgControl | null = null;

  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      [{ 'table': 'insert-table' }]
    ]
  };

  onChange = (_: any) => { };
  onTouched = () => { };

  constructor(private injector: Injector) { }

  ngOnInit(): void {
    // Obter NgControl de forma assíncrona para evitar circular dependency
    setTimeout(() => {
      this.ngControl = this.injector.get(NgControl, null);
      if (this.ngControl) {
        this.ngControl.valueAccessor = this;
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.stateChanges.next());
  }

  ngDoCheck(): void {
    if (this.ngControl) {
      this.errorState = (this.ngControl.invalid ?? false) && (this.ngControl.touched ?? false);
      this.stateChanges.next();
    }
  }

  // Restante da implementação permanece igual...
  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  get value(): string {
    return this._value;
  }

  set value(value: string) {
    this._value = value;
    this.onChange(value);
    this.stateChanges.next();
  }

  get empty(): boolean {
    return !this._value;
  }

  get shouldLabelFloat(): boolean {
    return this.focused || !this.empty;
  }

  @Input()
  get required(): boolean {
    return this._required;
  }

  set required(req: boolean) {
    this._required = coerceBooleanProperty(req);
    this.stateChanges.next();
  }

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(dis: boolean) {
    this._disabled = coerceBooleanProperty(dis);
    this.stateChanges.next();
  }

  onContainerClick(event: MouseEvent): void {
    if (this.editor?.nativeElement) {
      this.editor.nativeElement.focus();
    }
  }

  setDescribedByIds(ids: string[]): void {
    this.describedBy = ids.join(' ');
  }

  onContentChange(content: string): void {
    this.value = content;
    this.onTouched();
  }

  onFocus(): void {
    if (!this.focused) {
      this.focused = true;
      this.stateChanges.next();
    }
  }

  onBlur(): void {
    this.focused = false;
    this.onTouched();
    this.stateChanges.next();
  }
}