import { Component, OnInit } from '@angular/core';
import { CompanyService } from '../../services/company.service';
import { AuthService } from '../../services/auth.service';
import { Company } from '../../models/models';
import { DynamicTableComponent } from '../../shared/components/dynamic-table/dynamic-table.component';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CustomFilterComponent } from '../../shared/components/custom-filter/custom-filter.component';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog copy/confirmation-dialog.component';
import { SendNotificationService } from '../../services/send-notification.service';
import { NotificationType } from '../../enums/notificationType.enum';

@Component({
    selector: 'app-companies',
    standalone: true,
    imports: [DynamicTableComponent, TranslateModule, CustomFilterComponent],
    templateUrl: './companies.component.html',
    styleUrl: './companies.component.scss'
})
export class CompaniesComponent implements OnInit {

  companies: Company[] = [];
  filteredCompanies: Company[] = [];

  constructor(
    private companyService: CompanyService,
    private auth: AuthService,
    private dialog: MatDialog,
    private translate: TranslateService,
    private messageService: SendNotificationService
  ) { }

  headers = [
    { key: 'name', label: 'table.name' },
    { key: 'cnpj', label: 'table.cnpj' },
    { key: 'email', label: 'table.email' },
    { key: 'city', label: 'table.city' },
    { key: 'state', label: 'table.state' },
    { key: 'phone', label: 'table.phone' },
    { key: 'created', label: 'table.created' },
    { key: 'versionServ', label: 'table.versionServ' }
  ];


  ngOnInit(): void {
    const userSession = this.auth.currentUser();
    if (userSession && userSession.helpDeskCompanyId) {
      this.companyService.getCompanyByHelpDeskId(userSession.helpDeskCompanyId)
        .then(companies => {
          console.log('Companies:', companies);
          this.companies = companies;
          this.filteredCompanies = [...companies];
        })
        .catch(error => {
          console.error('Error fetching companies:', error);
        });
    } else {
      console.warn('No help desk company ID found in user session.');
    }

  }
  
  async updateDocument(company: Company): Promise<void> {
    console.log('Update company:', company);
    
    try {
      const { id, ...companyData } = company;
  
      // Chama o serviço para atualizar a empresa
      const updatedCompany = await this.companyService.updateCompany(id, companyData);
  
      // Atualiza a lista local de empresas
      this.updateLocalCompany(updatedCompany);
  
      // Mostra notificação de sucesso
      this.messageService.customNotification(
        NotificationType.SUCCESS,
        this.translate.instant('company.notifications.success.companyUpdated', { name: updatedCompany.name })
      );
  
      console.log('Empresa atualizada no banco:', updatedCompany);
  
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      
      // Mostra notificação de erro
      this.messageService.customNotification(
        NotificationType.ERROR,
        this.translate.instant('company.notifications.error.updatingCompany')
      );
  
      throw error;
    }
  }
  

  // Atualiza localmente a lista de empresas
  private updateLocalCompany(updatedCompany: Company): void {
    this.companies = this.companies.map(c =>
      c.id === updatedCompany.id ? updatedCompany : c
    );
    this.filteredCompanies = [...this.companies]; // mantém filtrado atualizado também
  }


  deleteDocument(row: Company) {
    console.log('Delete row:', row);
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: this.translate.instant('client.confirmation.deleteTitle'),
        typeButtom: 'delete',
        message: this.translate.instant('client.confirmation.deleteCompanyMessage', {
          companyName: row.name,
        })
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.companyService.deleteCompany(row.id).then(() => {
          // Atualiza a lista local removendo o cliente
          this.companies = this.companies.map(c => {
            if (c.id === row.id) {
              return {
                ...c,
                clients: c.clients.filter(c => c.id !== row.id)
              };
            }
            return c;
          });

          // Notificação de sucesso
          this.messageService.customNotification(
            NotificationType.ERROR,
            this.translate.instant('client.notifications.success.operatorDeleted', { name: row.name })
          );

        }).catch(err => {
          console.error('Erro ao deletar cliente:', err);
          this.messageService.customNotification(
            NotificationType.ERROR,
            this.translate.instant('client.notifications.error.deletingClient')
          );
        });
      }
    });
  }

  onFilteredCompanies(filtered: Company[]) {
    console.log('Empresas filtradas:', filtered);
    this.filteredCompanies = filtered; // Atualiza apenas os dados filtrados
  }


}
