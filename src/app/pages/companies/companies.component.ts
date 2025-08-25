import { Component, OnInit } from '@angular/core';
import { CompanyService } from '../../services/company.service';
import { AuthService } from '../../services/auth.service';
import { Company } from '../../models/models';
import { DynamicTableComponent } from '../../shared/components/dynamic-table/dynamic-table.component';
import { MatDialog } from '@angular/material/dialog';
import { UpdateCompanyModalComponent } from './update-company-modal/update-company-modal.component';
import { TranslateModule } from '@ngx-translate/core';
import { CustomFilterComponent } from '../../shared/components/custom-filter/custom-filter.component';

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
    private dialog: MatDialog
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

  updateDocument(company: Company) {
    const dialogRef = this.dialog.open(UpdateCompanyModalComponent, {
      width: '600px',
      data: company
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Empresa atualizada:', result);
        // Aqui você pode fazer update no backend
      }
    });
  }

  deleteDocument(row: any) {
    console.log('Delete row:', row);
  }

  onFilteredCompanies(filtered: Company[]) {
    console.log('Empresas filtradas:', filtered);
    this.filteredCompanies = filtered; // Atualiza apenas os dados filtrados
  }


}
