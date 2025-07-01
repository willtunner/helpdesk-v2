import { Component, EventEmitter, OnInit, Output, HostListener, Input, SimpleChanges } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, debounceTime, distinctUntilChanged, from, Observable, of, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TagService } from '../../../services/tag.service';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.css'],
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule],
})
export class TagsComponent implements OnInit {
  @Input() tags: string[] | null = null;
  tagInput = new FormControl('', { nonNullable: true });
  tagsSelecteds: { name: string; color: string; isHovered?: boolean }[] = [];
  suggestedTags$: Observable<string[]>;
  private suggestionsSubject = new BehaviorSubject<string[]>([]);
  successMessage: string | null = null;
  showNoTagMessage: boolean = false;
  showAllTags: boolean = false; // Controla o toggle de todas as tags
  @Output() tagsChanged = new EventEmitter<string>();

  constructor(private tagService: TagService) {
    this.suggestedTags$ = this.suggestionsSubject.asObservable();
    this.setupTagSuggestions();
  }

  ngOnInit() {
    // Converte tudo para maiúsculas enquanto o usuário digita
    this.tagInput.valueChanges.subscribe(value => {
      const upperValue = value.toUpperCase();
      if (value !== upperValue) {
        this.tagInput.setValue(upperValue, { emitEvent: false });
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tags'] && this.tags) {
      this.populateSelectedTags(this.tags);
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

  private setupTagSuggestions(): void {
    this.tagInput.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value) => {
        if (this.showAllTags) {
          // Mostra todas as tags quando o toggle está ativo
          return from(this.tagService.getAllTags());
        }
        if (value && value.length >= 3) {
          // Busca automática por 3 caracteres
          return this.searchTags(value);
        }
        this.showNoTagMessage = false;
        return of([]);
      })
    ).subscribe(tags => {
      this.suggestionsSubject.next(tags);
      this.showNoTagMessage = tags.length === 0 && (this.showAllTags || this.tagInput.value.length >= 3);
    });
  }

  private searchTags(value: string): Observable<string[]> {
    return from(this.tagService.searchTags(value.toUpperCase()));
  }

  async onEnter(event: Event): Promise<void> {
    event.preventDefault();
    const name = this.tagInput.value.trim();
    if (name && !this.tagsSelecteds.some((tag) => tag.name === name)) {
      const exists = await this.tagExists(name);
      if (exists) {
        this.addToSelected(name);
      } else {
        this.successMessage = 'Tag inexistente, pressione enter para cadastrar nova tag';
        setTimeout(() => (this.successMessage = null), 3000);
        await this.addTag(name);
      }
    }
    this.tagInput.setValue('');
    this.hideSuggestions(); // Fecha as sugestões
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
      // Restaura a busca automática com base no input atual
      this.tagInput.updateValueAndValidity({ emitEvent: true });
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
      this.tagInput.updateValueAndValidity({ emitEvent: true }); // Restaura a busca automática
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
    if (!this.tagsSelecteds.some((tag) => tag.name === name)) {
      this.addToSelected(name);
      this.emitTags();
    }
    this.tagInput.setValue('');
    this.hideSuggestions(); // Fecha as sugestões ao selecionar
  }

  private hideSuggestions(): void {
    this.showAllTags = false;
    this.suggestionsSubject.next([]); // Limpa as sugestões
    this.showNoTagMessage = false;
  }

  private addToSelected(name: string): void {
    this.tagsSelecteds.push({ name, color: this.getRandomColor() });
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
    const tagsString = this.tagsSelecteds.map((tag) => tag.name).join(', ');
    this.tagsChanged.emit(tagsString);
  }
}