import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Call } from '../../../models/models';
import { CompanyService } from '../../../services/company.service';
import { OperatorsService } from '../../../services/operators.service';
import { CallDetailsModalComponent } from '../../calls/call-details-modal/call-details-modal.component';

@Component({
  selector: 'app-tag-detail-modal',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    CommonModule
  ],
  templateUrl: './tag-detail-modal.component.html',
  styleUrls: ['./tag-detail-modal.component.scss']
})
export class TagDetailModalComponent implements OnInit {
  calls: Call[] = [];

  constructor(
    private companyService: CompanyService,
    public dialogRef: MatDialogRef<TagDetailModalComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: { tagName: string; count: number; month?: string; calls?: Call[] }
  ) {}


  async ngOnInit(): Promise<void> {
    if (this.data.calls) {
      this.calls = this.data.calls;
      await this.enrichCallsWithCompany();
    }
  
    console.log('Calls atualizados com empresa:', this.calls);
  }
    
  private async enrichCallsWithCompany(): Promise<void> {
    const uniqueCompanyIds = Array.from(new Set(this.calls.map(call => call.companyId)));
  
    const companyMap = new Map<string, any>();
  
    // Busca todas as empresas únicas e armazena em um map
    for (const companyId of uniqueCompanyIds) {
      const company = await this.companyService.getCompanyById(companyId);
      if (company) {
        companyMap.set(companyId, company);
      }
    }
  
    // Atualiza cada call com a empresa correspondente
    this.calls = this.calls.map(call => ({
      ...call,
      company: companyMap.get(call.companyId) || null
    }));
  }
  
  close(): void {
    this.dialogRef.close();
  }

  formatDate(created: any): string {
    if (!created) return '';
    if (created instanceof Date) {
      return created.toLocaleDateString();
    }
    if (created && typeof created.toDate === 'function') {
      return created.toDate().toLocaleDateString();
    }
    return new Date(created).toLocaleDateString();
  }

  openCallDetails(call: Call): void {
    this.dialog.open(CallDetailsModalComponent, {
      width: '700px',
      data: call
    });
  }
  
}