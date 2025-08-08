import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { CalendarEventModalComponent } from './calendar-event-modal/calendar-event-modal.component';

interface Holiday {
  date: string;
  name: string;
  type: string;
}

interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  description: string;
}

@Component({
  selector: 'app-holiday-calendar',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatButtonModule,
    MatListModule,
    MatMenuModule,
    FormsModule,
    MatSnackBarModule
  ],
  templateUrl: './holiday-calendar.component.html',
  styleUrls: ['./holiday-calendar.component.scss']
})
export class HolidayCalendarComponent implements OnInit {
  private http = inject(HttpClient);
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  currentYear = new Date().getFullYear();
  yearControl = new FormControl(this.currentYear);
  stateControl = new FormControl('');

  holidays: Holiday[] = [];
  loading = false;
  error: string | null = null;

  events = signal<CalendarEvent[]>([]);
  eventDates = computed(() => this.events().map(e => e.date));

  selectedDate: Date | null = null;
  editingEvent: CalendarEvent | null = null;
  eventForm: FormGroup;

  states = [
    { value: 'AC', label: 'Acre' }, { value: 'AL', label: 'Alagoas' }, { value: 'AP', label: 'Amapá' },
    { value: 'AM', label: 'Amazonas' }, { value: 'BA', label: 'Bahia' }, { value: 'CE', label: 'Ceará' },
    { value: 'DF', label: 'Distrito Federal' }, { value: 'ES', label: 'Espírito Santo' }, { value: 'GO', label: 'Goiás' },
    { value: 'MA', label: 'Maranhão' }, { value: 'MT', label: 'Mato Grosso' }, { value: 'MS', label: 'Mato Grosso do Sul' },
    { value: 'MG', label: 'Minas Gerais' }, { value: 'PA', label: 'Pará' }, { value: 'PB', label: 'Paraíba' },
    { value: 'PR', label: 'Paraná' }, { value: 'PE', label: 'Pernambuco' }, { value: 'PI', label: 'Piauí' },
    { value: 'RJ', label: 'Rio de Janeiro' }, { value: 'RN', label: 'Rio Grande do Norte' }, { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'RO', label: 'Rondônia' }, { value: 'RR', label: 'Roraima' }, { value: 'SC', label: 'Santa Catarina' },
    { value: 'SP', label: 'São Paulo' }, { value: 'SE', label: 'Sergipe' }, { value: 'TO', label: 'Tocantins' }
  ];

  private apiKey = '21075|Wiu4ByEDG4xvXHH8Lfnbm2GILonpwEiu';

  constructor() {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', Validators.maxLength(200)]
    });
  }

  ngOnInit(): void {
    this.fetchHolidays();
    this.loadEventsFromStorage();

    this.yearControl.valueChanges.subscribe(() => this.fetchHolidays());
    this.stateControl.valueChanges.subscribe(() => this.fetchHolidays());
  }

  private loadEventsFromStorage(): void {
    const savedEvents = localStorage.getItem('calendarEvents');
    if (savedEvents) {
      try {
        const parsed = JSON.parse(savedEvents);
        this.events.set(parsed.map((e: any) => ({ ...e, date: new Date(e.date) })));
      } catch (e) {
        console.error('Erro ao carregar eventos salvos', e);
      }
    }
  }

  private updateLocalStorage(): void {
    localStorage.setItem('calendarEvents', JSON.stringify(this.events()));
  }

  get yearRange(): number[] {
    const startYear = this.currentYear - 5;
    const endYear = this.currentYear + 5;
    return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  }

  fetchHolidays(): void {
    this.loading = true;
    this.error = null;
    const year = this.yearControl.value || this.currentYear;
    const state = this.stateControl.value;
    let apiUrl = `https://api.invertexto.com/v1/holidays/${year}?token=${this.apiKey}`;
    if (state) apiUrl += `&state=${state}`;

    this.http.get<Holiday[]>(apiUrl).subscribe({
      next: (data) => {
        this.holidays = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar feriados.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  openEventDialog(date: Date, eventToEdit?: CalendarEvent): void {
    this.selectedDate = date;
  
    if (eventToEdit) {
      this.editingEvent = eventToEdit;
      this.eventForm.reset();
      this.eventForm.patchValue({
        title: this.editingEvent.title,
        description: this.editingEvent.description
      });
    } else {
      this.editingEvent = null;
      this.eventForm.reset();
    }
  
    const dialogRef = this.dialog.open(CalendarEventModalComponent, {
      width: '500px',
      data: { form: this.eventForm, isEditing: !!this.editingEvent, date }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.saveEvent();
    });
  }
  

  private findEventByDate(date: Date): CalendarEvent | undefined {
    return this.events().find(e => e.date.toDateString() === date.toDateString());
  }

  saveEvent(): void {
    if (!this.selectedDate || !this.eventForm.valid) return;

    const formValue = this.eventForm.value;
    const newEvent: CalendarEvent = {
      id: this.editingEvent?.id || crypto.randomUUID(),
      date: this.selectedDate,
      title: formValue.title,
      description: formValue.description
    };

    if (this.editingEvent) {
      this.events.update(evts => evts.map(e => e.id === newEvent.id ? newEvent : e));
      this.snackBar.open('Evento atualizado!', 'Fechar', { duration: 3000 });
    } else {
      this.events.update(evts => [...evts, newEvent]);
      this.snackBar.open('Evento criado!', 'Fechar', { duration: 3000 });
    }

    this.updateLocalStorage();
    this.closeDialog();
  }

  deleteEvent(event: CalendarEvent): void {
    this.events.update(evts => evts.filter(e => e.id !== event.id));
    this.updateLocalStorage();
    this.snackBar.open('Evento removido!', 'Fechar', { duration: 3000 });
  }

  closeDialog(): void {
    this.selectedDate = null;
    this.editingEvent = null;
    this.eventForm.reset();
  }

  getEventsForDate(date: Date): CalendarEvent[] {
    return this.events().filter(e => e.date.toDateString() === date.toDateString());
  }

  getHolidayTooltip(date: Date): string {
    if (date.getTime() === 0) return '';
    
    const holiday = this.getHolidayName(date);
    const events = this.getEventsForDate(date);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const monthName = this.getMonthName(date.getMonth());
    
    if (holiday) {
        return `Dia ${day}/${month}/${year}\nFeriado: ${holiday}`;
    }
    
    if (events.length > 0) {
        const eventsText = events.length === 1 
            ? `1 Evento:\n${events[0].title}`
            : `${events.length} Eventos:\n${events.map(e => `• ${e.title}`).join('\n')}`;
        return `Dia ${day}/${month}/${year}\n${eventsText}`;
    }
    
    return `${day} de ${monthName} de ${year}`;
}

  getHolidayName(date: Date): string | null {
    const dateStr = date.toISOString().split('T')[0];
    return this.holidays.find(h => h.date === dateStr)?.name || null;
  }

  getWeeksInMonth(year: number | null, month: number): Date[][] {
    year = year ?? this.currentYear;
    const weeks: Date[][] = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let currentWeek: Date[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) currentWeek.push(new Date(0));

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      currentWeek.push(date);
      if (date.getDay() === 6 || day === lastDay.getDate()) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    return weeks;
  }

  getMonthName(month: number): string {
    return [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ][month];
  }

  isHoliday(date: Date): boolean {
    const dateStr = date.toISOString().split('T')[0];
    return this.holidays.some(h => h.date === dateStr);
  }

  sortedEvents() {
    return [...this.events()].sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  onDayClick(day: Date): void {
    if (day.getTime() === 0) return;
  
    // Sempre abre modal para cadastrar novo evento
    this.selectedDate = day;
    this.editingEvent = null;   // Força modo "novo evento"
    this.eventForm.reset();
  
    const dialogRef = this.dialog.open(CalendarEventModalComponent, {
      width: '500px',
      data: { form: this.eventForm, isEditing: false, date: day }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.saveEvent();
    });
  }
  
}