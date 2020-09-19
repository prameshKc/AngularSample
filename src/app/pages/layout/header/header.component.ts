import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { CommonService } from '../../../services/BaseService';
import { BranchService } from '../../../services/BranchService';
import { IFgetCurrentEmployeePosition_Result, ICompanyVM } from '../../../models/ViewModels';
import { IEmployee } from '../../../models/Models';
import { AuthenticationService } from 'src/app/services/AuthService';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnChanges {
  @Input() employeeDetails: IEmployee;
  @Input() collapseClass;
  @Input() isAdmin: boolean = false;
  @Output() toggleDrawer: EventEmitter<any> = new EventEmitter();

  showNavPopUp: boolean = false;

  constructor(
    private authService: AuthenticationService,
    private commonService: CommonService,
    private branchService: BranchService,
    private location: Location,
    private router: Router
  ) { }

  ngOnChanges(simpleChange: SimpleChanges) {
    this.getBranches();
    if (localStorage.getItem('ContextMenus')) {
      if (JSON.parse(localStorage.getItem('ContextMenus')).filter(x => x.MenuId == 1121).length > 0) {
        this.isAdmin = true;
      } else {
        this.isAdmin = false;
      }
    }
  }

  public logout() {
    this.authService.logout();
  }

  //company branch list
  EmpCurrentPost: IFgetCurrentEmployeePosition_Result;
  CBList: ICompanyVM[] = [];
  svCBList: ICompanyVM[] = [];
  currentCompany: number;
  CompanyName: string;
  PCompanyName: string;

  getBranches() {
    this.commonService.GetCompanyBranches().subscribe((data: ICompanyVM[]) => {
      localStorage.setItem('Branches', JSON.stringify(data));
      this.svCBList = data;
      this.CBList = data.filter(x => x.isGroup == true);
      if (this.branchService.getBranch()) {
        this.currentCompany = Number(this.branchService.getBranch());
      } else {
        if (this.svCBList.length > 0) {
          this.currentCompany = this.svCBList.filter(x => x.isGroup != true)[0].CompanyId;
        }
      }
      this.CBList.map(item => {
        item.isOpen = true;
        if (item.isGroup == true) {
          item.ChildCompany = [...data.filter(x => x.ParentId == item.CompanyId)];
        }
        item.PComapnyName = this.CBList.filter(x => x.CompanyId == item.ParentId).length > 0 ? this.CBList.filter(x => x.CompanyId == item.ParentId)[0].CompanyName : null;
        return item;
      })
      this.CompanyName = this.svCBList.filter(x => x.CompanyId == this.currentCompany)[0].CompanyName;
      this.selectBranch(this.svCBList.filter(x => x.CompanyId == this.currentCompany)[0]);
    });
  }

  selectBranch(company?: ICompanyVM) {
    if (company.isGroup != true) {
      this.CompanyName = company.CompanyName;
      this.currentCompany = company.CompanyId;
      this.PCompanyName = this.CBList.filter(x => x.CompanyId == company.ParentId)[0].CompanyName;

      if (this.currentCompany) {
        if (this.branchService.getBranch() != this.currentCompany.toString()) {
          this.branchService.changeBranch(this.currentCompany.toString());
          this.redirectTo(this.location.path(true));
        }
      }
    }
  }

  redirectTo(uri: string) {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
      this.router.navigate([uri]));
  }
}
