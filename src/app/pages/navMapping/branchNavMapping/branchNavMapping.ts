import { Component, Input, SimpleChanges } from '@angular/core';
import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';
import { ICompany } from '../../../models/Models';
import { CompanyService, CommonService } from '../../../services/BaseService';
import { NavViewModel } from '../../../models/ViewModels';
import { NavMappingService } from '../../../services/nav-mapping.service';

@Component({
  selector: 'branch-navMap',
  templateUrl: 'branchNavMapping.html'
})
export class BranchNavMappingComponent {
  @Input() CompanyId: number;

  branchList: ICompany[] = [];
  changeBranchList: ICompany[] = [];
  navOptions: NavViewModel[] = [];
  isLoading: boolean = false;
  navCompanyEnabled: boolean = false;


  constructor(
    public navMappingService: NavMappingService,
    private companyService: CompanyService,
    private toastyService: ToastyService,
  ) {
  }

  ngOnInit() {
  }

  ngOnChanges(simpleChanges: SimpleChanges) {
    this.changeBranchList = [];
    this.getCompanyList();
    this.getNavMappingItems();
  }

  getNavMappingItems() {
    this.navOptions = [];

    if (this.CompanyId) {
      let query = `companyId=${this.CompanyId}`;
      this.navMappingService.getNMBranch(query).subscribe((data: NavViewModel[]) => {
        this.navOptions = data;
      }, (err) => {
        this.navOptions = [];
        var toastOptions: ToastOptions = {
          title: "Error",
          msg: "Connection Timed Out",
          showClose: true,
          timeout: 5000,
          theme: 'bootstrap'
        };
        this.toastyService.error(toastOptions);
      });
    }
  }

  getCompanyList() {
    if (this.CompanyId) {
      let query = `$filter=ParentId eq ${this.CompanyId}`;
      this.companyService.getAll(query).subscribe((data: ICompany[]) => {
        this.branchList = data.map(data => {
          data.Nav_code = data.Nav_code ? data.Nav_code : '-1';
          return data;
        });
      });
    }
  }

  updateCompanyNav(code: string, item?: ICompany) {
    this.branchList.map(obj => {
      if (obj.CompanyId == item.CompanyId) {
        obj.Nav_code = code;
      }
      return obj;
    })

    if (this.changeBranchList.filter(x => x.CompanyId == item.CompanyId).length > 0) {
      this.changeBranchList.splice(this.changeBranchList.lastIndexOf(item), 1);
    }

    item.Nav_code = code;
    this.changeBranchList.push(item);
    console.log(this.changeBranchList);

  }

  submitChanges() {
    this.navMappingService.updateBranchNav(this.changeBranchList).subscribe((data) => {
      var toastOptions: ToastOptions = {
        title: "Success",
        msg: `Branches has been successfully mapped.`,
        showClose: true,
        timeout: 5000,
        theme: 'bootstrap'
      };
      this.toastyService.success(toastOptions);
    }, (err) => {
      var toastOptions: ToastOptions = {
        title: "Error",
        msg: "Ledgers were not Edited",
        showClose: true,
        timeout: 5000,
        theme: 'bootstrap'
      };
      this.toastyService.error(toastOptions);
    });
  }

  resetChanges() {
    this.branchList = [];
    this.changeBranchList = [];
    this.getCompanyList();
  }
}
