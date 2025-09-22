import { CommonModule } from '@angular/common';
import {
  Component,
  forwardRef,
  Input,
  OnInit,
  AfterViewInit,
  DoCheck,
  Injector
} from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  NgControl,
  FormsModule,
} from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { MatFormFieldControl } from '@angular/material/form-field';
import { Subject } from 'rxjs';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, QuillModule],
  templateUrl: './rich-text.component.html',
  styleUrls: ['./rich-text.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true
    },
    {
      provide: MatFormFieldControl,
      useExisting: RichTextEditorComponent
    }
  ]
})
export class RichTextEditorComponent
  implements ControlValueAccessor, MatFormFieldControl<string>, OnInit, AfterViewInit, DoCheck
{
  @Input() placeholder: string = 'Digite seu texto aqui...';
  @Input() height: string = '150px';

  static nextId = 0;
  id = `rich-text-${RichTextEditorComponent.nextId++}`;
  stateChanges = new Subject<void>();
  focused = false;
  errorState = false;
  controlType = 'rich-text';
  describedBy = '';

  private _value: string = '';
  private _required = false;
  private _disabled = false;
  ngControl: NgControl | null = null;

  // módulos do toolbar (ngx-quill aceita direto)
  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ['link', 'image', 'video']
    ]
  };

  onChange = (_: any) => {};
  onTouched = () => {};

  constructor(private injector: Injector) {}

  ngOnInit(): void {
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
      this.errorState =
        (this.ngControl.invalid ?? false) && (this.ngControl.touched ?? false);
      this.stateChanges.next();
    }
  }

  // ControlValueAccessor
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

  // Getters/Setters
  get value(): string {
    return this._value;
  }
  set value(value: string) {
    this._value = value || '';
    this.onChange(this._value);
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

  // MatFormFieldControl
  onContainerClick(_: MouseEvent): void {}

  setDescribedByIds(ids: string[]): void {
    this.describedBy = ids.join(' ');
  }

  // eventos do quill
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
