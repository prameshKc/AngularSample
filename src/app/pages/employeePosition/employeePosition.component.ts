import { Component, Injectable, ViewChild } from '@angular/core';
import {
  EmployeePositionService, EmployeeService, CompanyService,
  DivisionService, DepartmentService, DesignationService,
  CostCenterService, CategoryService, WorkAreaService, EmailService
} from '../../services/BaseService';
import {
  IEmployeePosition, IEmployee, IPaginationViewModel,
  IDivision, IDepartment, IDesignation,
  ICostCenter, ICategory, ICompany, IWorkArea, IEmail
} from '../../models/Models';
import { IFilterViewModel } from '../../models/ViewModels';

import { ModalDirective } from 'ngx-bootstrap'
import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';

@Component({
  selector: 'employee-pos',
  templateUrl: 'employeePosition.component.html'
})
export class EmployeePositionComponent {
  employeePositionList: IEmployeePosition[] = [];
  InputEmployeePosition: IEmployeePosition = <IEmployeePosition>{};
  ePDateInString: any;
  ePEffectiveFromInString: any;
  employeePositionListById: IEmployeePosition[] = [];

  companyList: ICompany[] = [];
  divisionList: IDivision[] = [];
  departmentList: IDepartment[] = [];
  designationList: IDesignation[] = [];
  costCenterList: ICostCenter[] = [];
  categoryList: ICategory[] = [];
  workAreaList: IWorkArea[] = [];
  employeeList: IEmployee[] = [];

  mail: IEmail = <IEmail>{};

  //searching and sorting
  filterObj?: IFilterViewModel;

  //for pagination
  pagination?: IPaginationViewModel = {
    CurrentPage: 1,
    MaxItems: 50,
    ItemsPerPage: 50,
    TotalPage: 0
  };
  toggleDate: boolean;
  toggleEDate: boolean;

  //Employee Position Modal
  @ViewChild('employeePositionModal', { static: false }) public employeePositionModal: ModalDirective
  @ViewChild('modal', { static: false })
  ModalDirective: any;
  selectedModalLoaded: boolean = false;

  constructor(
    public employeePositionService: EmployeePositionService,
    public toastyService: ToastyService,
    public toastyConfig: ToastyConfig,
    public companyService: CompanyService,
    public divisionService: DivisionService,
    public departmentService: DepartmentService,
    public designationService: DesignationService,
    public costCenterService: CostCenterService,
    public categoryService: CategoryService,
    public workAreaService: WorkAreaService,
    public employeeService: EmployeeService,
    public emailService: EmailService
  ) {
    this.getAllEmployeePostion();
    this.getAllCompany();
    this.getAllDivision();
    this.getAllDepartment();
    this.getAllDesignation();
    this.getAllCostCenter();
    this.getAllCategory();
    this.getAllWorkArea();
    this.getAllEmployee();
    this.getEmail();
    this.filterObj = { Name: '', Sort: '' };
  }

  //filter
  public filterEmployeePosition() {
    this.pagination.CurrentPage = 1;
    this.getAllEmployeePostion(this.filterObj);
  }

  public filterHome(pagination: number = 1) {
    this.pagination.CurrentPage = pagination <= 1 ? 1 : pagination > this.pagination.TotalPage ? this.pagination.TotalPage : pagination;
    this.getAllEmployeePostion(this.filterObj);
  }

  public employeePositionAndFilter() {
    this.filterObj = { Name: '', Sort: '' };
    this.filterEmployeePosition();
  }
  //reset pagination
  public resetPagination() {
    this.pagination.CurrentPage = 1;
    this.pagination.MaxItems = 50;
    this.pagination.ItemsPerPage = 50;
    this.pagination.TotalPage = 0;
  };

  public getEmail() {
    this.emailService.getAll()
      .subscribe((abc: any) => {
        let qyy: any;
        qyy = abc;
      });

  }

  public postMail() {

    //this.mail.Designation = "Developer";
    //this.mail.ReceiverEmailAddress = "karmacharya.rashala@gmail.com";
    //this.mail.UserName = "susan.maharjan";
    //this.mail.Password = "susan123";
    //this.mail.ReceiverName = "Hari";
    //this.mail.ServiceProviderEmail = "rashala.karmacharya@gmail.com";        
    //this.mail.Subject = "Test";
    //this.mail.Body = "Hello";

    this.mail = {
      Designation: "Developer",
      Password: "susan123",
      ReceiverEmailAddress: "rashala.karmacharya@gmail.com",
      ReceiverName: "Susan Maharjan",
      ServiceProviderEmail: "karmacharya.rashala@gmail.com",
      UserName: "susan.maharjan"
    };

    this.emailService.post(this.mail).subscribe(() => {
    });
  }


  public getAllEmployeePostion(filterObj?: IFilterViewModel) {
    this.pagination.TotalPage = Math.ceil(this.pagination.TotalItems / this.pagination.ItemsPerPage);

    let skipCount = (this.pagination.CurrentPage * this.pagination.ItemsPerPage) - this.pagination.ItemsPerPage;

    var query = "$expand=Employee,Company,CostCenter,Category,Department,Division,Designation,WorkArea&$inlinecount=allpages&$skip=" + skipCount + "&$top=" + this.pagination.ItemsPerPage;


    if (filterObj != undefined || filterObj != null) {
      if (filterObj.Name != undefined && filterObj.Name != "") {
        query += "&$filter=startswith(Employee/FirstName, '" + this.filterObj.Name + "')or startswith(Employee/MiddleName, '" + this.filterObj.Name + "')or startswith(Employee/LastName, '" + this.filterObj.Name + "')";
      }

      if (filterObj.Sort != undefined && filterObj.Sort != "") {
        if (filterObj.Sort == 'true') {
          query += "&$orderby=EffectiveFrom";
        }
        else {
          query += "&$orderby=EffectiveFrom desc";
        }
      }
    }
    else {
      query += "&$orderby=EffectiveFrom desc & $top=1";
    }

    this.employeePositionService.getAll(query)
      .subscribe((list: any) => {
        this.pagination.TotalItems = <number>(list["odata.count"]);
        this.pagination.TotalPage = Math.ceil(this.pagination.TotalItems / this.pagination.ItemsPerPage);
        this.employeePositionList = list.value;
      });
  }

  public getAllCompany() {
    this.companyService.getAll()
      .subscribe((list: ICompany[]) => {
        this.companyList = list;
      });
  }

  public getAllDivision() {
    this.divisionService.getAll()
      .subscribe((list: IDivision[]) => {
        this.divisionList = list;
      });
  }

  public getAllDepartment() {
    this.departmentService.getAll()
      .subscribe((list: IDepartment[]) => {
        this.departmentList = list;
      });
  }

  public getAllDesignation() {
    this.designationService.getAll()
      .subscribe((list: IDesignation[]) => {
        this.designationList = list;
      });
  }

  public getAllCostCenter() {
    this.costCenterService.getAll()
      .subscribe((list: ICostCenter[]) => {
        this.costCenterList = list;
      });
  }

  public getAllCategory() {
    this.categoryService.getAll()
      .subscribe((list: ICategory[]) => {
        this.categoryList = list;
      });
  }

  public getAllWorkArea() {
    this.workAreaService.getAll()
      .subscribe((list: IWorkArea[]) => {
        this.workAreaList = list;
      });
  }

  public getAllEmployee() {
    this.employeeService.getAll()
      .subscribe((list: IEmployee[]) => {
        this.employeeList = list;
      });
  }

  //openModal
  public openEmployeePositionModal() {
    this.selectedModalLoaded = true;
    if (this.employeePositionModal != undefined) {
      this.employeePositionModal.config.backdrop = false;
    }
    let el = document.createElement('div');
    el.className = 'modal-backdrop fade in';
    document.body.appendChild(el);
    this.employeePositionModal.show();
  }

  public hideEmployeePositionModal() {
    document.body.removeChild(document.querySelector('.modal-backdrop'));
    this.employeePositionModal.hide();
    this.InputEmployeePosition = <IEmployeePosition>{};
    this.selectedModalLoaded = false;
    this.ePDateInString = null;
    this.ePEffectiveFromInString = null;
  }

  //getOne
  public getEmployeePosition(id: number) {
    this.openEmployeePositionModal();
    var query = "$filter=EmployeeId eq " + id + "&$orderby=PostedOn desc &$top=1";
    this.employeePositionService.getAll(query)
      .subscribe((list: IEmployeePosition[]) => {
        this.employeePositionListById = list;
        this.employeePositionListById.forEach(item => {
          let date = new Date(item.Date);
          let date2 = new Date(item.EffectiveFrom)
          this.ePDateInString = this.generalDateInString(date);
          this.ePEffectiveFromInString = this.generalDateInString(date2);
        })
      });
  }

  //edit
  public editEmployeePosition() {

    this.employeePositionListById.forEach(item => {
      if (this.ePDateInString != null) {
        item.Date = new Date(this.ePDateInString);
      }

      if (this.ePEffectiveFromInString != null) {
        item.EffectiveFrom = new Date(this.ePEffectiveFromInString);
      }

      this.employeePositionService.put(item.EmployeeId, item)
        .subscribe(() => {
          this.resetPagination();
          this.getAllEmployeePostion();

          this.InputEmployeePosition = <IEmployeePosition>{};
          this.hideEmployeePositionModal();
          this.selectedModalLoaded = false;

          var toastOptions: ToastOptions = {
            title: "Edited",
            msg: "Employee Position has been successfully Edited",
            showClose: true,
            timeout: 5000,
            theme: 'bootstrap'
          };
          this.toastyService.success(toastOptions);

        });
    })

    //if (this.ePDateInString != null) {
    //    this.InputEmployeePosition.Date = new Date(this.ePDateInString);
    //}

    //if (this.ePEffectiveFromInString != null) {
    //    this.InputEmployeePosition.EffectiveFrom = new Date(this.ePEffectiveFromInString);
    //}



  }

  public onEPDateChange(event: Date) {
    let date = new Date(event);
    this.ePDateInString = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
  }

  public onEPEffectiveFromChange(event: Date) {
    let date = new Date(event);
    this.ePEffectiveFromInString = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
  }

  public generalDateInString(date: Date) {
    let dateInString: any;
    return dateInString = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
  }

}
