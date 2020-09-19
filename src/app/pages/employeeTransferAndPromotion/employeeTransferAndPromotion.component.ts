import { Component, Injectable, ViewChild, Input, Output, EventEmitter, SimpleChange } from '@angular/core';
import {
  EmployeePositionService, EmployeeService, CompanyService,
  DivisionService, DepartmentService, DesignationService,
  CostCenterService, CategoryService, WorkAreaService,
  UserService, ParamService, CommonService
} from '../../services/BaseService';
import {
  IEmployeePosition, IEmployee, IPaginationViewModel,
  IDivision, IDepartment, IDesignation,
  ICostCenter, ICategory, ICompany,
  IWorkArea, IUser, IParam
} from '../../models/Models';
import { IFilterViewModel, ICompanyVM } from '../../models/ViewModels';

import { IInputDateVM, IDatePickerOptionsVM } from '../../shared/datepicker/models/datepickerVM';

import { ModalDirective } from 'ngx-bootstrap'
import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';
import { IEmployeeSearchOption } from '../../shared/employeeSearch/employeeSearch.component';

@Component({
  selector: 'employee-position',
  templateUrl: 'employeeTransferAndPromotion.component.html'
})
export class EmployeeTransferAndPromotionComponent {

  @Input() selectedId: number;
  @Output() selectedEmployeePostion: EventEmitter<IEmployeePosition> = new EventEmitter<IEmployeePosition>();
  isBreadCrumb: boolean = true;
  CBList: ICompanyVM[] = [];
  CompanyName: string;

  CBSelectIsExpand: boolean = false;

  employeePositionList: IEmployeePosition[] = [];
  InputEmployeePosition: IEmployeePosition = <IEmployeePosition>{};
  ePDateInString: any;
  ePEffectiveFromInString: any;
  ePEffectiveToInString: any;
  employeeId: number;
  EmployeePromotionList: IEmployeePosition[] = [];
  employeeName: string = "";

  employeeList: IEmployee[] = [];
  companyList: ICompany[] = [];
  divisionList: IDivision[] = [];
  departmentList: IDepartment[] = [];
  designationList: IDesignation[] = [];
  costCenterList: ICostCenter[] = [];
  categoryList: ICategory[] = [];
  workAreaList: IWorkArea[] = [];
  employeePositionListById: IEmployeePosition[] = [];
  userList: IUser[] = [];
  backToEmployee: boolean = false;
  isEmpTransferSelected: boolean = true;

  //date picker inputs.
  inputDate: IInputDateVM;
  inputDateOptions: IDatePickerOptionsVM;

  inputEffectiveFromDate: IInputDateVM;
  inputEffectiveFromDateOptions: IDatePickerOptionsVM;
  selectedEmpId: number;
  InputParam: IParam;
  divisionRequired: boolean = false;
  costCenterRequired: boolean = false;
  workAreaRequired: boolean = false;
  DepartmentName: string;
  DesignationName: string;
  DivisionName: string;
  CategoryName: string;
  userId: string;
  DecisionDateLTCurrentDate: boolean = false;
  EffectiveDateLTCurrentDate: boolean = false;
  DecisionDateLTEffectiveFrom: boolean = false;
  currentDate: Date = new Date();

  //searching and sorting
  filterObj?: IFilterViewModel;

  //for pagination
  pagination?: IPaginationViewModel = {
    CurrentPage: 1,
    MaxItems: 50,
    ItemsPerPage: 50,
    TotalPage: 0
  };

  selectEmployeeOptions: IEmployeeSearchOption = <IEmployeeSearchOption>{
    showOpenModalButton: true
  };

  //Employee Position Modal
  @ViewChild('employeePositionModal', { static: false }) public employeePositionModal: ModalDirective
  @ViewChild('modal', { static: false })
  ModalDirective: any;
  selectedModalLoaded: boolean = false;

  //Employee Modal  
  @ViewChild('employeeModal', { static: false }) public employeeModal: ModalDirective
  @ViewChild('modal', { static: false })
  EmployeeModalDirective: any;
  selectedEmployeeModalLoaded: boolean = false;

  constructor(
    public employeeService: EmployeeService,
    public employeePositionService: EmployeePositionService,
    public toastyService: ToastyService,
    public toastyConfig: ToastyConfig,
    public companyService: CompanyService,
    private commonService: CommonService,
    public divisionService: DivisionService,
    public departmentService: DepartmentService,
    public designationService: DesignationService,
    public costCenterService: CostCenterService,
    public categoryService: CategoryService,
    public workAreaService: WorkAreaService,
    public userService: UserService,
    public paramService: ParamService
  ) {
    this.userId = localStorage.getItem('UserId');
    this.getAllCompany();
    this.getAllDivision();
    this.getAllDepartment();
    this.getAllDesignation();
    this.getAllCostCenter();
    this.getAllCategory();
    this.getAllWorkArea();
    this.getAllEmployee();
    this.getUsers();
    this.IsDivisionRequired(18);
    this.IsCostCenterRequired(19);
    this.IsWorkAreaRequired(20);
    this.filterObj = { Name: '', Sort: '' };

    this.currentDate.setHours(0, 0, 0, 0);
    this.inputDate = <IInputDateVM>{
      Year: this.currentDate.getFullYear(),
      Month: this.currentDate.getMonth() + 1,
      Date: this.currentDate.getDate(),
    };
    this.inputDateOptions = <IDatePickerOptionsVM>{
      closeOnDateSelect: true,
      minDate: null,
      maxDate: null
    };

    this.inputEffectiveFromDate = <IInputDateVM>{
      Year: this.currentDate.getFullYear(),
      Month: this.currentDate.getMonth() + 1,
      Date: this.currentDate.getDate(),
    };
    this.inputEffectiveFromDateOptions = <IDatePickerOptionsVM>{
      closeOnDateSelect: true,
      minDate: null,
      maxDate: null
    };
  }

  ngOnInit() {
    //this.CBList = JSON.parse(localStorage.getItem('Branches'));

    this.selectedId = this.selectedId != null ? this.selectedId : null;

    if (this.selectedId != null) {
      this.isBreadCrumb = false;
      this.isEmpTransferSelected = true;
    }
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {

    this.selectedId = this.selectedId != null ? this.selectedId : null;
    if (this.selectedId != null) {
      this.isBreadCrumb = false;
      this.isEmpTransferSelected = true;
    }
    this.getEmployeeInfo(this.selectedId);
    this.selectEmployeePostion();
  }

  public getUsers() {
    var query = "$expand=Employee";
    this.userService.getAll(query).subscribe((data: IUser[]) => {
      this.userList = data;
    })
  }

  public getAllEmployee() {
    this.employeeService.getAll()
      .subscribe((list: IEmployee[]) => {
        this.employeeList = list;
      });
  }

  public getAllCompany() {
    this.companyService.getAll()
      .subscribe((list: ICompany[]) => {
        this.companyList = list;
      });


    this.commonService.GetCompanyBranches().subscribe((data: ICompanyVM[]) => {
      //this.svCBList = data;
      this.CBList = data.filter(x => x.isGroup == true);

      this.CBList.forEach(item => {
        item.isOpen = true;
        if (item.isGroup == true) {
          item.ChildCompany = data.filter(x => x.ParentId == item.CompanyId);
        }
      })
      //this.selectBranch(this.svCBList.filter(x => x.isGroup != true)[0]);
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

  //openModal
  public openEmployeePositionModal() {
    //this.hideEmployeeModal();
    //this.employeeId = id;
    this.selectedModalLoaded = true;
  }

  public hideEmployeePositionModal() {
    this.employeeName = "";
    this.InputEmployeePosition = <IEmployeePosition>{};
    this.ePDateInString = null;
    this.ePEffectiveFromInString = null;
    this.selectedModalLoaded = false;
    this.DepartmentName = null;
    this.DesignationName = null;
    this.DivisionName = null;
    this.CategoryName = null;
  }

  //post
  public saveEmployeePosition() {
    this.InputEmployeePosition.PostedBy = this.userId;
    let saveItem: IEmployeePosition = Object.assign({}, this.InputEmployeePosition);

    this.employeePositionService.post(saveItem).subscribe(() => {
      this.InputEmployeePosition = <IEmployeePosition>{};
      this.hideEmployeePositionModal();
      if (this.selectedId != null) {
        this.isEmpTransferSelected = false;
      }

      var toastOptions: ToastOptions = {
        title: "Success",
        msg: "Employee Position has been successfully Added",
        showClose: true,
        timeout: 5000,
        theme: 'bootstrap'
      };
      this.toastyService.success(toastOptions);
    });
  }

  public generalDateInString(date: Date) {
    let dateInString: any;
    return dateInString = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
  }

  public getEmployeeInfo(id: number) {
    this.employeeName = "";
    let query: string = '$select=*,Employee/FirstName,Employee/MiddleName,Employee/LastName,WorkArea,Company,CostCenter,Category,Division,Designation,Department';

    query += "&$expand=Employee,WorkArea,Company,CostCenter,Category,Division,Designation,Department&$filter=EmployeeId eq " + id + "&$orderby=PostedOn desc &$top=1"
    this.employeePositionService.getAll(query)
      .subscribe((list: IEmployeePosition[]) => {
        this.employeePositionListById = list;
        this.employeePositionListById.forEach(item => {
          if (item.Employee.FirstName != null) {
            this.employeeName += item.Employee.FirstName + " ";
          }
          if (item.Employee.MiddleName != null) {
            this.employeeName += item.Employee.MiddleName + " ";
          }
          if (item.Employee.LastName != null) {
            this.employeeName += item.Employee.LastName;
          }
          if (item.Department != null) {
            this.DepartmentName = item.Department.DepartmentName;
          }
          if (item.Designation != null) {
            this.DesignationName = item.Designation.DesignationName;
          }
          if (item.Division != null) {
            this.DivisionName = item.Division.DivisionName;
          }
          if (item.Category != null) {
            this.CategoryName = item.Category.CategoryName;
          }
          this.CompanyName = item.Company.CompanyName;
          this.InputEmployeePosition.EmployeeId = item.EmployeeId;
          this.InputEmployeePosition.Date = item.Date;
          this.InputEmployeePosition.CompanyId = item.CompanyId;
          this.InputEmployeePosition.DivisionId = item.DivisionId;
          this.InputEmployeePosition.DepartmentId = item.DepartmentId;
          this.InputEmployeePosition.DesignationId = item.DesignationId;
          this.InputEmployeePosition.CostCenterId = item.CostCenterId;
          this.InputEmployeePosition.CategoryId = item.CategoryId;
          this.InputEmployeePosition.WorkAreaId = item.WorkAreaId;
          this.InputEmployeePosition.EffectiveFrom = item.EffectiveFrom;
          let date = new Date(this.InputEmployeePosition.Date);
          let date2 = new Date(this.InputEmployeePosition.EffectiveFrom)
          

          this.inputDate = {
            Year: date.getFullYear(),
            Month: date.getMonth() + 1,
            Date: date.getDate()
          };
          this.inputEffectiveFromDate = {
            Year: date2.getFullYear(),
            Month: date2.getMonth() + 1,
            Date: date2.getDate()
          };
        })
      });
  }

  onDateSelect(selectedDate: IInputDateVM) {
    this.inputDate = selectedDate;
    var date = new Date(this.inputDate.Year, this.inputDate.Month - 1, this.inputDate.Date, 5, 45, 0, 0);
    //if (date < this.currentDate) {
    //    this.DecisionDateLTCurrentDate = true;
    //}
    //else {
    //    this.DecisionDateLTCurrentDate = false;
    this.InputEmployeePosition.Date = new Date(this.inputDate.Year, this.inputDate.Month - 1, this.inputDate.Date, 5, 45, 0, 0);
    //}
  }

  onEffectiveFromDateSelect(selectedDate: IInputDateVM) {
    this.inputEffectiveFromDate = selectedDate;
    var date = new Date(this.inputEffectiveFromDate.Year, this.inputEffectiveFromDate.Month - 1, this.inputEffectiveFromDate.Date, 5, 45, 0, 0);
    //if (date < this.currentDate) {
    //    this.EffectiveDateLTCurrentDate = true;
    //}
    //else {
    //    this.EffectiveDateLTCurrentDate = false;
    this.InputEmployeePosition.EffectiveFrom = new Date(this.inputEffectiveFromDate.Year, this.inputEffectiveFromDate.Month - 1, this.inputEffectiveFromDate.Date, 5, 45, 0, 0);
    if (this.InputEmployeePosition.Date > this.InputEmployeePosition.EffectiveFrom) {
      this.DecisionDateLTEffectiveFrom = true;
    }
    else {
      this.DecisionDateLTEffectiveFrom = false;
    }
    //}
  }

  public selectedEmployee(event?: IEmployee, id?: number) {
    if (event != null) {
      this.employeeName = "";
      this.employeeId = event.EmployeeId;
      //if (event.FirstName != null) {
      //    this.employeeName += event.FirstName + " ";
      //}
      //if (event.MiddleName != null) {
      //    this.employeeName += event.MiddleName + " ";
      //}
      //if (event.LastName != null) {
      //    this.employeeName += event.LastName;
      //}

      this.openEmployeePositionModal();
      this.getEmployeeInfo(event.EmployeeId);
    }
    else {
      this.hideEmployeePositionModal();
    }
  }

  public selectEmployeePostion() {
    this.selectedEmployeePostion.emit(this.InputEmployeePosition);
  }

  public goToEmployee() {
    this.isEmpTransferSelected = false;
  }

  public IsDivisionRequired(id: number) {
    var query = "$select=ParamValue/PValue&$expand=ParamValue"
    this.paramService.get(id, query)
      .subscribe((one: IParam) => {
        this.InputParam = one;
        if (this.InputParam.ParamValue.PValue == "true") {
          this.divisionRequired = true;
        }
        else {
          this.divisionRequired = false;
        }
      })
  }

  public IsCostCenterRequired(id: number) {
    var query = "$select=ParamValue/PValue&$expand=ParamValue"
    this.paramService.get(id, query)
      .subscribe((one: IParam) => {
        this.InputParam = one;
        if (this.InputParam.ParamValue.PValue == "true") {
          this.costCenterRequired = true;
        }
        else {
          this.costCenterRequired = false;
        }
      })
  }

  public IsWorkAreaRequired(id: number) {
    var query = "$select=ParamValue/PValue&$expand=ParamValue"
    this.paramService.get(id, query)
      .subscribe((one: IParam) => {
        this.InputParam = one;
        if (this.InputParam.ParamValue.PValue == "true") {
          this.workAreaRequired = true;
        }
        else {
          this.workAreaRequired = false;
        }
      })
  }

  public selectedDept(event: any) {
    this.InputEmployeePosition.DepartmentId = event.DepartmentId;
    this.DepartmentName = event.DepartmentName;
  }

  public selectedDesg(event: any) {
    this.InputEmployeePosition.DesignationId = event.DesignationId;
    this.DesignationName = event.DesignationName;
  }

  public selectedDiv(event: any) {
    this.InputEmployeePosition.DivisionId = event.DivisionId;
    this.DivisionName = event.DivisionName;
  }

  public selectedCat(event: any) {
    this.InputEmployeePosition.CategoryId = event.CategoryId;
    this.CategoryName = event.CategoryName;
  }

  public selectBranch(event: ICompanyVM) {
    let compId = event.CompanyId;
    this.InputEmployeePosition.CompanyId = compId;
    this.CompanyName = event.CompanyName;

    console.log(event);
  }
}
