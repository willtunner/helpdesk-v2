import { Component, OnInit } from '@angular/core';
import { CompanyService } from '../../services/company.service';
import { AuthService } from '../../services/auth.service';
import { Company } from '../../models/models';
import { DynamicTableComponent } from '../../shared/components/dynamic-table/dynamic-table.component';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [DynamicTableComponent],
  templateUrl: './companies.component.html',
  styleUrl: './companies.component.scss'
})
export class CompaniesComponent implements OnInit {

  companies: Company[] = [];

  constructor(
    private companyService: CompanyService,
    private auth: AuthService,
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
        })
        .catch(error => {
          console.error('Error fetching companies:', error);
        });
    } else {
      console.warn('No help desk company ID found in user session.');
    }

  }

  updateDocument() {}
  deleteDocument() {}

}
