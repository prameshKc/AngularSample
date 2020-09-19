import { Component, SimpleChanges, Input, OnChanges } from "@angular/core";
import { CompanyService } from 'src/app/services/BaseService';


@Component({
  selector: "company-name",
  template: "{{companyName}}"
})
export class CompanyNameComponent implements OnChanges {
  @Input() companyId: number;
  companyName: string;

  constructor(
    private companyService: CompanyService
  ) {

  }

  ngOnChanges(simpleChanges: SimpleChanges) {
    let query: string = "$select=CompanyName";
    this.companyService.get(this.companyId).subscribe((data) => {
      this.companyName = data.CompanyName;
    })
  }
}
