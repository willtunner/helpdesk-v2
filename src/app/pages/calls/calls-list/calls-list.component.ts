import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { DynamicTableComponent } from '../../../shared/components/dynamic-table/dynamic-table.component';
import { Call, User } from '../../../models/models';
import { CallService } from '../../../services/call.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-calls-list',
  standalone: true,
  imports: [DynamicTableComponent],
  templateUrl: './calls-list.component.html',
  styleUrl: './calls-list.component.scss'
})
export class CallsListComponent implements OnInit {
  private callService = inject(CallService);
  private authService = inject(AuthService);
  calls: Call[] = [];
  operator!: User;
  loading = false;
  @Output() callSelected = new EventEmitter<Call>();


  constructor(private router: Router,) {
    const session = this.authService.currentUser();
    if (session) {
      this.operator = session;
    }
    
    console.log('Operador:', this.operator);
  }

  

  onRowClick(call: Call) {
    this.router.navigate(['/calls', call.id]);
    this.callSelected.emit(call);
  }

  ngOnInit(): void {
    this.loadCalls();
  }

  loadCalls(): void {
    if (!this.operator?.helpDeskCompanyId) {
      console.error('helpDeskCompanyId não está definido');
      return;
    }

    this.loading = true;
    this.callService.getCallsByHelpDeskCompany$(this.operator.helpDeskCompanyId).subscribe({
      next: (calls) => {
        console.log('Chamados carregados:', calls);
        this.calls = calls;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar chamados:', err);
        this.loading = false;
      }
    });
  }

  headers = [
    {
      key: 'company',
      label: 'table.companies',
      formatter: (row: any) => row.company?.name || 'N/A'
    },
    {
      key: 'tags',
      label: 'table.tags',
      formatter: (row: any) => Array.isArray(row.tags) ? row.tags.join(', ') : 'N/A'
    },
    { key: 'description', label: 'table.description' },
    { key: 'title', label: 'table.title' },
    {
      key: 'operator',
      label: 'table.operator',
      formatter: (row: any) => row.operator?.username || row.operator?.name || 'N/A'
    },
    {
      key: 'clients',
      label: 'table.clients',
      formatter: (row: any) => row.client?.name || 'N/A'
    },
    {
      key: 'created',
      label: 'table.createdAt',
      formatter: (row: any) => this.formatDate(row.created)
    },
    {
      key: 'closed',
      label: 'table.closed',
      formatter: (row: any) => row.closed ? 'Sim' : 'Não'
    },
  ];

  formatDate(dateString: string | Date): string {
    if (!dateString) return 'N/A';

    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

    if (isNaN(date.getTime())) {
      return 'N/A';
    }

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  updateDocument(any: any) { };
  deleteDocument(any: any) { };
}