import { Component } from '@angular/core';
import { CompanyService } from 'src/app/services/BaseService';
import { ICompany } from 'src/app/models/Models';

@Component({
  selector: 'navMapping',
  templateUrl: 'navMapping.html'
})
export class NavMappingComponent {
  companies: ICompany[] = [];
  selectedCompanyId: number;

  constructor(
    private companyService: CompanyService
  ) {
    this.getCompanies();
  }

  getCompanies() {
    let query = '$filter=ParentId eq null';
    this.companyService.getAll(query).subscribe((data: ICompany[]) => {
      console.log(data);
      this.companies = data;
    })
  }

  companySelected() {
    console.log(this.selectedCompanyId);
  }
}
