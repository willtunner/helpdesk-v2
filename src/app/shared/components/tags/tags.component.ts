import { Component, EventEmitter, OnInit, Output, HostListener, Input, SimpleChanges } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, debounceTime, distinctUntilChanged, from, Observable, of, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TagService } from '../../../services/tag.service';
import { MatError } from '@angular/material/form-field';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule, MatError, TranslateModule],
})
export class TagsComponent implements OnInit {
  @Input() tags: string[] | null = null;
  @Input() control!: FormControl<string[]>;
  
  tagsSelecteds: { name: string; color: string; isHovered?: boolean }[] = [];
  suggestedTags$: Observable<string[]>;
  private suggestionsSubject = new BehaviorSubject<string[]>([]);
  successMessage: string | null = null;
  showNoTagMessage: boolean = false;
  showAllTags: boolean = false;
  @Output() tagsChanged = new EventEmitter<string[]>();
  
  // Input temporário para o campo de texto
  inputControl = new FormControl('');

  constructor(private tagService: TagService) {
    this.suggestedTags$ = this.suggestionsSubject.asObservable();
  }

  ngOnInit() {
    if (!this.control) return;

    // Inicializa com os valores existentes no controle
    if (this.control.value && this.control.value.length > 0) {
      this.populateSelectedTags(this.control.value);
    }

    // Observa mudanças no input de texto (não no controle principal)
    this.inputControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value) => {
        if (!value) return of([]);
        if (this.showAllTags) {
          return from(this.tagService.getAllTags());
        }
        if (value.length >= 3) {
          return this.searchTags(value);
        }
        this.showNoTagMessage = false;
        return of([]);
      })
    ).subscribe(tags => {
      this.suggestionsSubject.next(tags);
      this.showNoTagMessage = tags.length === 0 && 
        (this.showAllTags || (this.inputControl.value?.length ?? 0) >= 3);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tags'] && this.tags) {
      this.populateSelectedTags(this.tags);
    }
  
    if (changes['control'] && this.control && this.control.value) {
      this.populateSelectedTags(this.control.value);
    }
  }

  private populateSelectedTags(tags: string[]): void {
    this.tagsSelecteds = tags.map(tagName => ({
      name: tagName,
      color: this.generateColorFromString(tagName),
      isHovered: false
    }));
  }

  private generateColorFromString(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = input.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = Math.floor(Math.abs(Math.sin(hash) * 16777215)).toString(16);
    return '#' + ('000000' + color).slice(-6);
  }

  async onEnter(event: Event): Promise<void> {
    event.preventDefault();
    const name = this.inputControl.value?.trim().toUpperCase();
    
    if (name && !this.tagsSelecteds.some(tag => tag.name === name)) {
      const exists = await this.tagExists(name);
      if (exists) {
        this.addToSelected(name);
      } else {
        this.successMessage = 'Tag inexistente, pressione enter para cadastrar nova tag';
        setTimeout(() => (this.successMessage = null), 3000);
        await this.addTag(name);
      }
    }
    
    this.inputControl.setValue('');
    this.hideSuggestions();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey && event.code === 'Space') {
      event.preventDefault();
      this.toggleAllTags();
    }
  }

  private toggleAllTags(): void {
    this.showAllTags = !this.showAllTags;
    if (this.showAllTags) {
      this.tagService.getAllTags().then(tags => {
        this.suggestionsSubject.next(tags);
        this.showNoTagMessage = tags.length === 0;
      });
    } else {
      this.inputControl.updateValueAndValidity({ emitEvent: true });
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const tagContainer = document.querySelector('.tag-input-container');
    const suggestions = document.querySelector('.suggestions');

    if (this.showAllTags && tagContainer && suggestions && 
        !tagContainer.contains(target) && !suggestions.contains(target)) {
      this.showAllTags = false;
      this.inputControl.updateValueAndValidity({ emitEvent: true });
    }
  }

  async addTag(name: string): Promise<void> {
    const newTag = { name, color: this.getRandomColor(), isHovered: false };
    const success = await this.tagService.addTagToFirestore(name);
    if (success) {
      this.tagsSelecteds.push(newTag);
      this.emitTags();
      this.successMessage = 'Tag salva com sucesso!';
      setTimeout(() => (this.successMessage = null), 3000);
    }
  }

  private getRandomColor(): string {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    return `#${randomColor.padStart(6, '0')}`;
  }

  selectTag(name: string): void {
    if (!this.tagsSelecteds.some(tag => tag.name === name)) {
      this.addToSelected(name);
      this.emitTags();
    }
    this.inputControl.setValue('');
    this.hideSuggestions();
  }

  private hideSuggestions(): void {
    this.showAllTags = false;
    this.suggestionsSubject.next([]);
    this.showNoTagMessage = false;
  }

  private addToSelected(name: string): void {
    this.tagsSelecteds.push({ name, color: this.getRandomColor() });
    this.emitTags();
  }

  private async tagExists(name: string): Promise<boolean> {
    const tags = await this.tagService.searchTags(name);
    return tags.includes(name);
  }

  removeTag(index: number): void {
    this.tagsSelecteds.splice(index, 1);
    this.emitTags();
  }

  emitTags(): void {
    const tagsArray = this.tagsSelecteds.map(tag => tag.name);
    this.control.setValue(tagsArray);
    this.control.markAsDirty();
    this.control.updateValueAndValidity();
    this.tagsChanged.emit(tagsArray);
  }

  get showError(): boolean {
    if (!this.control) return false;
    
    const isInvalid = this.control.invalid && (this.control.touched || this.control.dirty);
    const isEmptyArray = Array.isArray(this.control.value) && this.control.value.length === 0;
    
    return isInvalid || (isEmptyArray && (this.control.touched || this.control.dirty));
  }

  onBlur(): void {
    if (this.control) {
      this.control.markAsTouched();
      this.control.updateValueAndValidity();
    }
  }

  private searchTags(value: string): Observable<string[]> {
    return from(this.tagService.searchTags(value.toUpperCase()));
  }
}