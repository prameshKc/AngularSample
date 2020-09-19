import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Component, Injectable, Input, SimpleChange, Output, EventEmitter } from '@angular/core';

import {
  IEmployee, IPagination,
  IReligion, ILoginGroup, IWorkArea,
  IDivision, IDepartment, IDesignation,
  ICostCenter, ICategory, ICompany,
  IEmployeePosition, IEmployeeShift, IParam,
  ILoginShift, IMenu, IUser,
  ILoginDeviceType, IReportTo, IEmployeeWorkArea,
  IEmployeeStatusHistory, IHolidayList, IMenuVsTemplate,
  IEmployeeHolidayList, IODataResult, IFEmployeeResign, IEmployeeNominee, IEmployeeContract
} from '../../models/Models';
import {
  EmployeeService, ReligionService, CompanyService,
  DivisionService, DepartmentService, DesignationService,
  CostCenterService, CategoryService, LoginGroup, WorkAreaService,
  EmployeePositionService, EmployeeShiftService, ParamService,
  LoginShiftService, MenuService, UserService,
  LoginDeviceTypeService, SupervisorListService, ReportToService,
  EmployeeWorkAreaService, EmployeeStatusHistoryService, HolidayListService,
  MenuVsTemplateService, EmployeeHolidayListService, ResignedEmployeeReportService, CommonService,
} from '../../services/BaseService';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ngx-toasty';

import { DomSanitizer } from '@angular/platform-browser';
import {
  IFilterViewModel, IEmployeeShiftVM, IEmployeeVM,
  IEmployeeWithEmpPosVM,
  ICompanyVM,
  IFgetCurrentEmployeePosition_Result
} from '../../models/ViewModels';
import { IInputDateVM, IDatePickerOptionsVM } from '../../shared/datepicker/models/datepickerVM';
import { Router, ActivatedRoute } from '@angular/router';

import { CsvService } from 'src/app/services/excel.service';

import { BranchService } from '../../services/BranchService';

@Component({
  selector: 'employee',
  templateUrl: 'employee.component.html'
})
export class EmployeeComponent {
  @Input() showEmployee: boolean;
  @Input() selectedId: number;
  @Output() showEmployeeDetail: EventEmitter<IEmployee> = new EventEmitter<IEmployee>();
  isRefreshEmployee: boolean = true;
  empName: string;
  empNo: number;

  isAddEmployee: boolean = false;
  InputEmployee: IEmployee = <IEmployee>{};
  EmployeeDetails: IEmployee = <IEmployee>{};
  DetailEmployee: IEmployee = <IEmployee>{};
  Employee: IEmployee = <IEmployee>{};
  selectedValue: any;
  selectedValue2: any;
  flag: boolean = false;

  InputEmployeePosition: IEmployeePosition = <IEmployeePosition>{};
  EmployeePositionList: IEmployeePosition[] = [];
  EmployeePositionList2: IEmployeePosition[] = [];
  EmployeePosition2: IEmployeePosition = <IEmployeePosition>{};


  EmployeePositionListView: IEmployeePosition[] = [];
  EmployeePositionListViewNew: IEmployeePosition[] = [];
  EmployeePositionListView2: IEmployeePosition[] = [];
  EmployeePositionListView3: IEmployeePosition[] = [];

  InputEmployeeShift: IEmployeeShiftVM = <IEmployeeShiftVM>{};
  EmployeeShiftList2: IEmployeeShiftVM = <IEmployeeShiftVM>{};
  EmployeeShiftList: IEmployeeShiftVM[] = [];
  EmployeeShift: IEmployeeShift = <IEmployeeShift>{};
  InputEmployeeShiftList: IEmployeeShiftVM[] = [];
  employeeStatusList: IEmployeeStatusHistory[] = [];

  empNomineeList: IEmployeeNominee[] = [];

  employeeList: IEmployeeWithEmpPosVM[] = [];
  employeeList2: IEmployee[] = [];
  employeeDetail: IEmployee = <IEmployee>{};
  isAddEditToggle: boolean = false;
  isEditEmployee: boolean = false;
  religionList: IReligion[] = [];
  companyList: ICompany[] = [];
  divisionList: IDivision[] = [];
  departmentList: IDepartment[] = [];
  designationList: IDesignation[] = [];
  costCenterList: ICostCenter[] = [];
  categoryList: ICategory[] = [];
  loginGroupList: ILoginGroup[] = [];
  workAreaList: IWorkArea[] = [];
  holidayList: IHolidayList[] = [];
  loginDeviceTypeList: ILoginDeviceType[] = [];
  //loginDeviceList:IL
  loginShift: ILoginShift = <ILoginShift>{};
  MenuList: IMenu[] = [];
  Menu: IMenu = <IMenu>{};
  UserList: IUser = <IUser>{};
  User: IUser = <IUser>{};
  bloodGroupList: any[] = [
    { bloodId: 1, bloodGroup: "A +ve" },
    { bloodId: 1, bloodGroup: "A -ve" },
    { bloodId: 1, bloodGroup: "B +ve" },
    { bloodId: 1, bloodGroup: "B -ve" },
    { bloodId: 1, bloodGroup: "AB +ve" },
    { bloodId: 1, bloodGroup: "AB -ve" },
    { bloodId: 1, bloodGroup: "O +ve" },
    { bloodId: 1, bloodGroup: "O -ve" }
  ];
  genderList: any[] = [
    { genderId: 1, genderName: "Male" },
    { genderId: 2, genderName: "Female" },
    { genderId: 3, genderName: "Other" }
  ];
  loginDeviceList: any[] = [
    { loginDeviceId: 1, loginDeviceName: "Device Login" },
    { loginDeviceId: 2, loginDeviceName: "Web Login" },
    { loginDeviceId: 3, loginDeviceName: "Both" }
  ]
  currentDate: Date = new Date();
  showEmployeeNo: boolean;
  showDiv: boolean = false;
  empList: IEmployee[] = [];
  showDatePicker: boolean = false;
  showMultipleShiftAlreadyExist: boolean = false;
  showShiftAlreadyExist: boolean = false;
  base64textString: string;
  tempIconPath: any;
  employeePhoto: any;
  copyAddress: boolean = false;
  isAutoGenerated: boolean = false;
  InputParam: IParam = <IParam>{};
  showMultipleShiftCheckbox: boolean = false;
  showEmployeeShiftTable: boolean = false;
  showMultipleShift: boolean = false;
  showMultipleShiftEdit: boolean = false;
  gName: string;
  lName: string;
  updateShift: boolean = false;
  deleteShiftId: number;
  svloginGroupList: ILoginGroup[] = [];
  saveEmployeeShift: IEmployeeShift = <IEmployeeShift>{};
  saveEmployeeShiftList: IEmployeeShift[] = [];
  employeeId: number = null;
  selectedEmp: number;
  selectedEmpShift: number;
  userId: string;
  userDetails: IUser = <IUser>{};
  requiredEmployeeId: number;
  newEmpList: IEmployee[] = [];
  newEmployeeList: IEmployee[] = [];
  isContractEmp: boolean = false;

  isUpdateEmployeePosition: boolean = false;
  isUpdateEmployeeShift: boolean = false;
  backToLayout: boolean = false;
  employeeShiftChange: boolean = false;
  employeeTransferAndPromotion: boolean = false;
  supervisorHierarchylist: IEmployee[] = [];
  report: IReportTo = <IReportTo>{};
  reportToList: IReportTo[] = [];
  employeeWorkAreaList: IEmployeeWorkArea[] = [];
  StatusIn: string;
  //searching and sorting
  filterObj?: IFilterViewModel;

  //date picker inputs.
  inputDOB: IInputDateVM;
  inputDOBOptions: IDatePickerOptionsVM;

  inputDOJ: IInputDateVM;
  inputDOJOptions: IDatePickerOptionsVM;

  inputESFromDate: IInputDateVM;
  inputESFromDateOptions: IDatePickerOptionsVM;

  inputEPDate: IInputDateVM;
  inputEPDateOptions: IDatePickerOptionsVM;

  inputEPEffectiveFromDate: IInputDateVM;
  inputEPEffectiveFromDateOptions: IDatePickerOptionsVM;

  inputEHEffectiveFromDate: IInputDateVM;
  inputEHEffectiveFromDateOptions: IDatePickerOptionsVM;

  Shift: ShiftListView[] = [];
  selectedModalLoaded: boolean = false;
  selectedDetailDiv: boolean = false;
  selectedListDiv: boolean = true;
  divisionRequired: boolean = false;
  workAreaRequired: boolean = false;
  costCenterRequired: boolean = false;
  openEmpTAndP: boolean = false;
  openEmpShift: boolean = false;
  toggleSort: boolean = false;
  toggleHistoryES: boolean = false;
  toggleHistoryEP: boolean = false;
  toggleHistoryEH: boolean = false;
  disableAL: boolean = false;
  disableIOTL: boolean = false;
  disableLDC: boolean = false;
  DepartmentName: string;
  DesignationName: string;
  DivisionName: string;
  CategoryName: string;
  DecisionDateLTCurrentDate: boolean = false;
  DecisionDateLTEffectiveFrom: boolean = false;
  EffectiveDateLTCurrentDate: boolean = false;
  DOJLTCurrentDate: boolean = false;
  ESFromDateLTCurrentDate: boolean = false;
  currentdateInString: string;
  workId: number[] = [];
  workArea: IWorkArea[] = [];
  workArea2: IWorkArea = <IWorkArea>{};
  workName: string = "";
  isMultipleWA: boolean = false;
  inactive: boolean = false;
  resigned: boolean = false;
  active: boolean = true;
  InputReportTo: IReportTo[] = [];
  allSupervisorHierarchylist: IEmployee[] = [];
  supervisorList: IEmployeeVM[] = [];
  menuVsTemplateList: IMenuVsTemplate[] = [];
  svEmployeeList: IEmployeeVM[] = [];
  ReportToEmployeeName: IEmployeeVM = <IEmployeeVM>{};
  ReportToId: number;
  InputHolidayList: IEmployeeHolidayList = <IEmployeeHolidayList>{};
  employeeHolidayList: IEmployeeHolidayList[] = [];
  isAdmin: boolean = false;
  employeeObj: IEmployeeVM = <IEmployeeVM>{};
  currentEmpId: number;
  statusId: number;
  pagination?: IPagination;
  uniqueArray: number[];
  isEditMyProfile: boolean = false;
  showAttendance: boolean = false;
  attendanceId: number;
  isRefreshCalendar: boolean = false;
  invalidImage: boolean = false;
  resignedEmpList: IFEmployeeResign[] = [];
  constructor(
    public employeeService: EmployeeService,
    public religionService: ReligionService,
    public companyService: CompanyService,
    public divisionService: DivisionService,
    public departmentService: DepartmentService,
    public designationService: DesignationService,
    public costCenterService: CostCenterService,
    public categoryService: CategoryService,
    public workAreaService: WorkAreaService,
    public loginGroupService: LoginGroup,
    public employeePositionService: EmployeePositionService,
    public employeeShiftService: EmployeeShiftService,
    public paramService: ParamService,
    public loginShiftService: LoginShiftService,
    public menuService: MenuService,
    public userService: UserService,
    public loginDeviceTypeService: LoginDeviceTypeService,
    public supervisorListService: SupervisorListService,
    public employeeWorkAreaService: EmployeeWorkAreaService,
    public employeeStatusHistoryService: EmployeeStatusHistoryService,
    public reportService: ReportToService,
    public holidayListService: HolidayListService,
    public menuVsTemplateService: MenuVsTemplateService,
    public employeeHolidayListService: EmployeeHolidayListService,
    private resignedEmployeeReportService: ResignedEmployeeReportService,
    public toastyService: ToastyService,
    public toastyConfig: ToastyConfig,
    public sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private router: Router,
    private csvService: CsvService,
    private branchService: BranchService,
    private commonService: CommonService,
  ) {
    this.userId = localStorage.getItem('UserId');
    this.requiredEmployeeId = parseInt(localStorage.getItem('EmployeeId'));
    this.currentEmpId = parseInt(localStorage.getItem('EmployeeId'));
    this.filterObj = { Name: "", Sort: "false", SortingAttribute: "PostedOn", SearchBy: null };
    this.pagination = <IPagination>{
      CurrentPage: 1,
      ItemsPerPage: 50,
      TotalItems: 0,
      SortBy: null
    };
    //this.getUserDetails();
    this.getSupervisor();
    //this.getAllEmployeeWithoutPagi();
    this.getAllReligion();
    this.getAllCompany();
    this.getAllDivision();
    this.getAllDepartment();
    this.getAllDesignation();
    this.getAllCostCenter();
    this.getAllCategory();
    this.getAllLoginGroup();
    this.getAllWorkArea();
    this.getAllLoginDeviceType();
    this.getAllHolidayList();



    if (JSON.parse(localStorage.getItem('ContextMenus')).filter(x => x.MenuId == 1121).length > 0) {
      this.isAdmin = true;
    } else {
      this.isAdmin = false;
    }
    this.getBranches();


    this.EmployeeNoIsManual(16);
    this.MultipleShift(17);
    this.IsDivisionRequired(18);
    this.IsCostCenterRequired(19);
    this.IsWorkAreaRequired(20);
    this.isEmployeePositionEditable();
    this.isEmployeeShiftEditable();
    this.isEmployeeTransferAndPromotion();
    this.isEmployeeShiftChange();

    this.currentDate.setHours(0, 0, 0, 0);
    this.inputDOB = <IInputDateVM>{
      Year: this.currentDate.getFullYear(),
      Month: this.currentDate.getMonth() + 1,
      Date: this.currentDate.getDate(),
    };
    this.inputDOBOptions = <IDatePickerOptionsVM>{
      closeOnDateSelect: true,
      minDate: null,
      maxDate: null
    };

    this.inputDOJ = <IInputDateVM>{
      Year: this.currentDate.getFullYear(),
      Month: this.currentDate.getMonth() + 1,
      Date: this.currentDate.getDate(),
    };
    this.inputDOJOptions = <IDatePickerOptionsVM>{
      closeOnDateSelect: true,
      minDate: null,
      maxDate: null
    };

    this.inputESFromDate = <IInputDateVM>{
      Year: this.currentDate.getFullYear(),
      Month: this.currentDate.getMonth() + 1,
      Date: this.currentDate.getDate(),
    };
    this.inputESFromDateOptions = <IDatePickerOptionsVM>{
      closeOnDateSelect: true,
      minDate: null,
      maxDate: null
    };

    this.inputEPDate = <IInputDateVM>{
      Year: this.currentDate.getFullYear(),
      Month: this.currentDate.getMonth() + 1,
      Date: this.currentDate.getDate(),
    };
    this.inputEPDateOptions = <IDatePickerOptionsVM>{
      closeOnDateSelect: true,
      minDate: null,
      maxDate: null
    };

    this.inputEPEffectiveFromDate = <IInputDateVM>{
      Year: this.currentDate.getFullYear(),
      Month: this.currentDate.getMonth() + 1,
      Date: this.currentDate.getDate(),
    };
    this.inputEPEffectiveFromDateOptions = <IDatePickerOptionsVM>{
      closeOnDateSelect: true,
      minDate: null,
      maxDate: null
    };

    this.inputEHEffectiveFromDate = <IInputDateVM>{
      Year: this.currentDate.getFullYear(),
      Month: this.currentDate.getMonth() + 1,
      Date: this.currentDate.getDate(),
    };
    this.inputEHEffectiveFromDateOptions = <IDatePickerOptionsVM>{
      closeOnDateSelect: true,
      minDate: null,
      maxDate: null
    };
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    this.selectedListDiv = this.showEmployee;
    if (this.selectedId != null || typeof this.selectedId != undefined) {
      this.selectEmployeeDetail();
    }
  }
  //filter
  public filterEmployee() {
    if (this.filterObj.Name == null || this.filterObj.Name == "") {
      this.filterObj.Name = "";
    }
    this.resetPagination();
    this.onPageSelect(this.pagination);
    //if (this.resigned == false) {
    //    this.getAllEmployee(this.filterObj);
    //}
    //else {
    //    this.getAllResignedEmployee(this.filterObj)
    //}
  }

  public filterEmployeeEdit() {
    this.filterObj = { Name: "", Sort: "false", SortingAttribute: "ModifiedOn", SearchBy: null };
    this.onPageSelect(this.pagination);
    //this.getAllEmployee(this.filterObj);
  }

  public employeeAndFilter() {
    this.filterObj = { Name: "", Sort: "false", SortingAttribute: "PostedOn", SearchBy: null };
    this.filterEmployee();
  }

  public getDate(): number {
    return new Date().getTime();
  }

  public getUserDetails() {
    let query: string = '$select=*,Employee/FirstName,Employee/MiddleName,Employee/LastName,Employee/ReportTo/*,MenuTemplate/*,MenuTemplate/MenuVsTemplate/*&$expand=Employee/ReportTo,MenuTemplate/MenuVsTemplate';
    this.userService.get(this.userId, query).subscribe((data: IUser) => {
      this.userDetails = data;
      this.userDetails.Employee.ReportTo = this.userDetails.Employee.ReportTo.filter(x => x.Status == true);
      this.requiredEmployeeId = data.EmployeeId;
      let currentReportTo = data.Employee.ReportTo.filter(x => x.Status == true)[0];
      this.getAllEmployee(this.filterObj);
      if (
        currentReportTo.ReportTo1 == 0 ||
        this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0 ||
        this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1121).length > 0
      ) {
        this.isAdmin = true;
      }
      else {
        if (
          this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0 ||
          this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1121).length > 0
        ) {
          this.isAdmin = true;
        }
        else {
          this.isAdmin = false;
        }
      }
    })
  }

  public getAllEmployee(filterObj1?: IFilterViewModel) {
    if (this.active == true) {
      this.statusId = 1;
    }
    if (this.inactive == true) {
      this.statusId = 2;
    }
    let currentEmpId;
    if (this.userDetails.Employee.ReportTo != null || typeof this.userDetails.Employee.ReportTo != undefined) {
      if (this.userDetails.Employee.ReportTo[0].ReportTo1 == 0 ||
        this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0 ||
        this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1121).length > 0
      ) {
        currentEmpId = -1;
      }
      else {
        currentEmpId = this.currentEmpId;
      }
    }
    this.supervisorListService.GetEmployeeHierarchy(currentEmpId, this.pagination, filterObj1, this.statusId).subscribe((data: IODataResult<IEmployeeWithEmpPosVM[]>) => {
      this.employeeList = data.value;
      this.employeeList.forEach(item => {
        if (item.Photo == 'yes') {
          item.newPhoto = this.getEmpImage(item.EmployeeId).pipe(
            map(x => { return x.Photo; }),
            catchError(err => {
              throw Observable.throw(err);
            })
          );
        }
      })
      this.pagination = {
        ItemsPerPage: this.pagination.ItemsPerPage,
        TotalItems: data.count,
        CurrentPage: this.pagination.CurrentPage,
        SortBy: this.pagination.SortBy
      };
    });
  }

  public getAllResignedEmployee(filterObj1?: IFilterViewModel) {

    if (this.userDetails.Employee.ReportTo != null || typeof this.userDetails.Employee.ReportTo != undefined) {
      if (this.userDetails.Employee.ReportTo[0].ReportTo1 == 0 ||
        this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0 ||
        this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1121).length > 0
      ) {
        this.resignedEmployeeReportService.GetAllResignedEmployee(this.pagination, filterObj1, 2, 1).subscribe((data: IODataResult<IFEmployeeResign[]>) => {
          this.resignedEmpList = data.value;
          this.resignedEmpList.forEach(item => {
            if (item.Photo == 'yes') {
              item.newPhoto = this.getEmpImage(item.EmployeeId).pipe(
                map(x => { return x.Photo; }),
                catchError(err => {
                  throw Observable.throw(err);
                })
              );
            }
          })
          this.pagination = {
            ItemsPerPage: this.pagination.ItemsPerPage,
            TotalItems: data.count,
            CurrentPage: this.pagination.CurrentPage,
            SortBy: this.pagination.SortBy
          };
        });
      }
      else {
        this.resignedEmployeeReportService.GetResignedEmployeeUnderManager(this.currentEmpId, this.pagination, filterObj1, 2, 1).subscribe((data: IODataResult<IFEmployeeResign[]>) => {
          this.resignedEmpList = data.value;
          this.resignedEmpList.forEach(item => {
            if (item.Photo == 'yes') {
              item.newPhoto = this.getEmpImage(item.EmployeeId).map(x => { return x.Photo; });
            }
          })
          this.pagination = {
            ItemsPerPage: this.pagination.ItemsPerPage,
            TotalItems: data.count,
            CurrentPage: this.pagination.CurrentPage,
            SortBy: this.pagination.SortBy
          };
        });
      }
    }
  }

  public openEmployeeDiv() {
    this.copyAddress = true;
    this.loginGroupList = this.svloginGroupList;
    this.InputEmployeePosition.CompanyId = 1;

    this.InputEmployee.City = '-';
    this.InputEmployee.Country = '-';
    this.InputEmployee.State = '-';
    this.InputEmployee.Street1 = '-';
    this.InputEmployee.Street2 = '-';

    this.InputEmployee.PerCity = '-';
    this.InputEmployee.PerCountry = '-';
    this.InputEmployee.PerState = '-';
    this.InputEmployee.PerStreet1 = '-';
    this.InputEmployee.PerStreet2 = '-';

    this.selectedValue = null;
    this.selectedValue2 = null;
    this.isAddEmployee = true;
    this.isEditEmployee = false;
    this.selectedModalLoaded = true;
    this.selectedListDiv = false;
  }

  public hideEmployeeDiv() {
    this.selectedModalLoaded = false;
    this.isAddEmployee = false;
    this.isEditEmployee = false;
    this.isAddEditToggle = false;
    this.showDiv = false;
    this.showEmployeeNo = false;
    this.InputEmployee = <IEmployee>{};
    this.InputEmployeePosition = <IEmployeePosition>{};
    this.InputEmployeeShift = <IEmployeeShiftVM>{};
    this.showShiftAlreadyExist = false;
    this.showMultipleShiftAlreadyExist = false;
    this.copyAddress = true;
    this.selectedListDiv = true;
    this.InputEmployeeShiftList = [];
    this.Shift = [];
    this.showMultipleShift = false;
    this.showMultipleShiftEdit = false;
    this.isContractEmp = false;
    this.EmployeeShiftList2 = <IEmployeeShiftVM>{};

    this.EmployeeShiftList2.InputFromDate = {
      Year: this.currentDate.getFullYear(),
      Month: this.currentDate.getMonth() + 1,
      Date: this.currentDate.getDate()
    };

    this.updateShift = false;
    this.DepartmentName = null;
    this.DesignationName = null;
    this.DivisionName = null;
    this.CategoryName = null;
    this.disableAL = false;
    this.disableIOTL = false;
    this.disableLDC = false;
    this.copyAddress = false;
    this.invalidImage = false;

    this.inputDOB = <IInputDateVM>{
      Year: this.currentDate.getFullYear(),
      Month: this.currentDate.getMonth() + 1,
      Date: this.currentDate.getDate(),
    };

    this.inputDOJ = <IInputDateVM>{
      Year: this.currentDate.getFullYear(),
      Month: this.currentDate.getMonth() + 1,
      Date: this.currentDate.getDate(),
    };

    this.inputESFromDate = <IInputDateVM>{
      Year: this.currentDate.getFullYear(),
      Month: this.currentDate.getMonth() + 1,
      Date: this.currentDate.getDate(),
    };
    this.inputEPDate = <IInputDateVM>{
      Year: this.currentDate.getFullYear(),
      Month: this.currentDate.getMonth() + 1,
      Date: this.currentDate.getDate(),
    };
    this.inputEPEffectiveFromDate = <IInputDateVM>{
      Year: this.currentDate.getFullYear(),
      Month: this.currentDate.getMonth() + 1,
      Date: this.currentDate.getDate(),
    };
    this.inputEHEffectiveFromDate = <IInputDateVM>{
      Year: this.currentDate.getFullYear(),
      Month: this.currentDate.getMonth() + 1,
      Date: this.currentDate.getDate(),
    };
  }

  public getAllLoginGroup() {
    var query = "$expand=LoginShift,Employee";

    this.loginGroupService.getAll(query)
      .subscribe((list: ILoginGroup[]) => {
        this.svloginGroupList = list;
        this.loginGroupList = list;
      });
  }

  public getFilteredLoginGroup() {
    var query = "";
    for (var i = 0; i < this.InputEmployeeShiftList.length; i++) {
      if (query != "") {
        query = query + " and "
      }
      query += "(ShiftId ne " + this.InputEmployeeShiftList[i].ShiftId + ") "
    }
    query = "$filter=" + query;
    this.loginGroupService.getAll(query)
      .subscribe((list: ILoginGroup[]) => {
        this.loginGroupList = list;
      });
  }

  public getAllReligion() {
    this.religionService.getAll()
      .subscribe((list: IReligion[]) => {
        this.religionList = list;
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

  public getAllLoginDeviceType() {
    this.loginDeviceTypeService.getAll()
      .subscribe((list: ILoginDeviceType[]) => {
        this.loginDeviceTypeList = list;
      });
  }

  public getAllHolidayList() {
    this.holidayListService.getAll()
      .subscribe((list: IHolidayList[]) => {
        this.holidayList = list;
      });
  }

  public EmployeeNoIsManual(id: number) {
    var query = "$select=ParamValue/PValue&$expand=ParamValue"
    this.paramService.get(id, query)
      .subscribe((one: IParam) => {
        this.InputParam = one;
        if (this.InputParam.ParamValue.PValue == "true") {
          this.isAutoGenerated = true;
        }
        else {
          this.isAutoGenerated = false;
        }
      })
  }

  public MultipleShift(id: number) {
    var query = "$select=ParamValue/PValue&$expand=ParamValue"
    this.paramService.get(id, query)
      .subscribe((one: IParam) => {
        this.InputParam = one;
        if (this.InputParam.ParamValue.PValue == "true") {
          this.showMultipleShiftCheckbox = true;
        }
        else {
          this.showMultipleShiftCheckbox = false;
        }
      })
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

  //add EmployeeShift
  public addEmployeeShift() {
    this.disableAL = false;
    this.disableIOTL = false;
    this.disableLDC = false;
    if (this.InputEmployeeShift.AutoLogin != true) {
      this.InputEmployeeShift.AutoLogin = false;
    }
    if (this.InputEmployeeShift.IsOneTimeLogin != true) {
      this.InputEmployeeShift.IsOneTimeLogin = false;
    }

    this.InputEmployeeShiftList.push(this.InputEmployeeShift);

    this.Shift.push(
      new ShiftListView(
        this.gName,
        this.InputEmployeeShift.FromDate,
        this.InputEmployeeShift.AutoLogin,
        this.InputEmployeeShift.IsOneTimeLogin,
        this.lName
      )
    )

    this.getFilteredLoginGroup();

    this.InputEmployeeShift = <IEmployeeShiftVM>{};
    this.showEmployeeShiftTable = true;
  }

  //remove Employee Shift
  public removeEmployeeShift(index: number) {
    this.Shift.splice(index, 1);
    this.InputEmployeeShiftList.splice(index, 1);

    if (this.Shift.length == 0) {
      this.Shift = [];
      this.InputEmployeeShiftList = [];
    }
    this.getFilteredLoginGroup();
  }

  //post
  public saveEmployee(file?: File) {
    if (this.InputEmployee.DateOfBirth == null) {
      this.onDOBSelect(this.inputDOB);
    }
    if (this.InputEmployee.DateOfJoin == null) {
      this.onDOJSelect(this.inputDOJ);
    }
    if (this.InputEmployee.ExceptionToPayroll == null) {
      this.InputEmployee.ExceptionToPayroll = false;
    }

    this.saveEmployeeChild();
    this.InputEmployee.PostedBy = this.userId;
    this.InputEmployee.Status = 1;

    let saveItem: IEmployee = Object.assign({}, this.InputEmployee);
    if (this.InputEmployeePosition.Date > this.InputEmployeePosition.EffectiveFrom) {
      this.DecisionDateLTEffectiveFrom = true;

      var toastOptions: ToastOptions = {
        title: "Error",
        msg: "Decision date can't be later than effective date.",
        showClose: true,
        timeout: 5000,
        theme: 'bootstrap'
      };
      this.toastyService.error(toastOptions);
    } else {
      this.DecisionDateLTEffectiveFrom = false;

      this.employeeService.post(saveItem)
        .subscribe(() => {
          this.InputEmployee = <IEmployee>{};
          this.InputEmployeePosition = <IEmployeePosition>{};
          this.InputEmployeeShift = <IEmployeeShiftVM>{};
          this.isAddEditToggle = false;
          this.hideEmployeeDiv();
          //this.filterEmployee();
          this.filterObj = { Name: "", Sort: "false", SortingAttribute: "PostedOn", SearchBy: null };

          this.onPageSelect(this.pagination);
          //this.getAllEmployee(this.filterObj);
          var toastOptions: ToastOptions = {
            title: "Success",
            msg: "Employee has been successfully Added",
            showClose: true,
            timeout: 5000,
            theme: 'bootstrap'
          };
          this.toastyService.success(toastOptions);
        });
    }
  }

  public saveEmployeeChild(): any {
    this.InputEmployeePosition.PostedBy = this.userId;

    let branchList: ICompanyVM[] = <ICompanyVM[]>JSON.parse(localStorage.getItem('Branches'));
    if (branchList.filter(x => x.CompanyId == this.InputEmployeePosition.CompanyId)[0].isGroup == true) {
      this.InputEmployeePosition.CompanyId = Number(localStorage.getItem('Branch'));
    }

    let saveEmployeePosition: IEmployeePosition = Object.assign({}, this.InputEmployeePosition);

    this.InputEmployee.EmployeePosition = [];
    this.InputEmployee.EmployeePosition.push(saveEmployeePosition);

    this.InputHolidayList.PostedBy = this.userId;
    this.InputHolidayList.Status = true;
    this.InputHolidayList.PostedOn = new Date();
    let saveEmployeeHolidayList: IEmployeeHolidayList = Object.assign({}, this.InputHolidayList);
    this.InputEmployee.EmployeeHolidayList = [];
    this.InputEmployee.EmployeeHolidayList.push(saveEmployeeHolidayList);

    if (this.showMultipleShiftCheckbox == false || this.showMultipleShift == false) {
      this.InputEmployee.EmployeeShift = [];

      this.saveEmployeeShift.GroupId = this.InputEmployeeShift.GroupId;
      this.saveEmployeeShift.FromDate = this.InputEmployeeShift.FromDate;
      this.saveEmployeeShift.AutoLogin = this.InputEmployeeShift.AutoLogin;
      this.saveEmployeeShift.IsOneTimeLogin = this.InputEmployeeShift.IsOneTimeLogin;
      this.saveEmployeeShift.LoginDeviceId = this.InputEmployeeShift.LoginDeviceId;
      this.saveEmployeeShift.Status = true;
      this.saveEmployeeShift.PostedBy = this.userId;

      this.InputEmployee.EmployeeShift.push(this.saveEmployeeShift);
    }
    else {
      this.InputEmployee.EmployeeShift = [];
      this.InputEmployeeShiftList.forEach(item => {
        let saveEmployeeShift: IEmployeeShift = <IEmployeeShift>{};

        saveEmployeeShift.GroupId = item.GroupId;
        saveEmployeeShift.FromDate = item.FromDate;
        saveEmployeeShift.AutoLogin = item.AutoLogin;
        saveEmployeeShift.IsOneTimeLogin = item.IsOneTimeLogin;
        saveEmployeeShift.LoginDeviceId = item.LoginDeviceId;
        saveEmployeeShift.Status = true;
        saveEmployeeShift.PostedBy = this.userId;

        this.InputEmployee.EmployeeShift.push(saveEmployeeShift);
      })
    }
  }

  //getOne
  public getEmployee(id: number) {
    this.employeeId = id;
    this.openEditDiv();
    let query = "$expand=EmployeePosition,EmployeePosition/Company,EmployeePosition/CostCenter,EmployeePosition/Category,EmployeePosition/Division,EmployeePosition/Designation,EmployeePosition/Department,EmployeeShift,Employee_Nominee";


    this.employeeService.get(id, query)
      .subscribe((one: IEmployee) => {
        this.EmployeeDetails = one;

        this.Employee.EmployeeId = this.EmployeeDetails.EmployeeId;
        this.Employee.EmployeeNo = this.EmployeeDetails.EmployeeNo;
        this.Employee.FirstName = this.EmployeeDetails.FirstName;
        this.Employee.MiddleName = this.EmployeeDetails.MiddleName;
        this.Employee.LastName = this.EmployeeDetails.LastName;
        this.Employee.DateOfBirth = this.EmployeeDetails.DateOfBirth;
        this.Employee.BloodGroup = this.EmployeeDetails.BloodGroup;
        this.Employee.ReligionId = this.EmployeeDetails.ReligionId;
        this.Employee.Gender = this.EmployeeDetails.Gender;
        this.Employee.ContactNumber = this.EmployeeDetails.ContactNumber;
        this.Employee.MobileNumber = this.EmployeeDetails.MobileNumber;
        this.Employee.Street2 = this.EmployeeDetails.Street2;
        this.Employee.Street1 = this.EmployeeDetails.Street1;
        this.Employee.City = this.EmployeeDetails.City;
        this.Employee.State = this.EmployeeDetails.State;
        this.Employee.Country = this.EmployeeDetails.Country;
        this.Employee.PerStreet2 = this.EmployeeDetails.PerStreet2;
        this.Employee.PerStreet1 = this.EmployeeDetails.PerStreet1;
        this.Employee.PerCity = this.EmployeeDetails.PerCity;
        this.Employee.PerState = this.EmployeeDetails.PerState;
        this.Employee.PerCountry = this.EmployeeDetails.PerCountry;
        this.Employee.DateOfJoin = this.EmployeeDetails.DateOfJoin;
        this.Employee.Email = this.EmployeeDetails.Email;
        this.Employee.COGNumber = this.EmployeeDetails.COGNumber;
        this.Employee.Photo = this.EmployeeDetails.Photo;
        this.Employee.GroupId = this.EmployeeDetails.GroupId;
        this.Employee.PostedOn = this.EmployeeDetails.PostedOn;
        this.Employee.PostedBy = this.EmployeeDetails.PostedBy;
        this.Employee.Status = this.EmployeeDetails.Status;
        this.Employee.ExceptionToPayroll = this.EmployeeDetails.ExceptionToPayroll;

        let DOB: Date = new Date(one.DateOfBirth);
        this.inputDOB = {
          Year: DOB.getFullYear(),
          Month: DOB.getMonth() + 1,
          Date: DOB.getDate()
        };

        let DOJ: Date = new Date(one.DateOfJoin);
        this.inputDOJ = {
          Year: DOJ.getFullYear(),
          Month: DOJ.getMonth() + 1,
          Date: DOJ.getDate()
        };

        this.getEmployeeShift(id);
        this.getEmployeePosition(id);
        this.getEmployeeReportTo(id);
        this.getEmployeeHolidayList(id);
        this.EmployeePositionList = this.EmployeeDetails.EmployeePosition;

        this.isAddEditToggle = true;
      });
  }

  public getEmployeeReportTo(id: number) {
    this.supervisorListService.GetSupervisorName(id).subscribe((data: any) => {
      this.ReportToEmployeeName.employeeNameJoint = "";
      if (data != null) {
        if (data.FirstName != null) {
          this.ReportToEmployeeName.employeeNameJoint += data.FirstName + " ";
        }
        if (data.MiddleName != null) {
          this.ReportToEmployeeName.employeeNameJoint += data.MiddleName + " ";
        }
        if (data.LastName != null) {
          this.ReportToEmployeeName.employeeNameJoint += data.LastName + " ";
        }
      }
      else {
        this.ReportToEmployeeName.employeeNameJoint = "Not Assigned";
      }
    })
  }

  public getEmployeeHolidayList(id: number) {
    var query = "$expand=HolidayList &$filter=EmployeeId eq " + id + " and Status eq true";

    this.employeeHolidayListService.getAll(query)
      .subscribe((list: IEmployeeHolidayList[]) => {
        this.employeeHolidayList = list;
        this.employeeHolidayList.forEach(item => {
          let date = new Date(item.EffectiveFrom);

          this.inputEHEffectiveFromDate = {
            Year: date.getFullYear(),
            Month: date.getMonth() + 1,
            Date: date.getDate()
          }
        })
      });
  }

  public getEmployeeHolidayListAllRecords(id: number) {
    var query = "$expand=HolidayList &$filter=EmployeeId eq " + id;
    query += "&$orderby=Status desc";

    this.employeeHolidayListService.getAll(query)
      .subscribe((list: IEmployeeHolidayList[]) => {
        this.employeeHolidayList = list;
        this.employeeHolidayList.forEach(item => {
          let date = new Date(item.EffectiveFrom);

          this.inputEHEffectiveFromDate = {
            Year: date.getFullYear(),
            Month: date.getMonth() + 1,
            Date: date.getDate()
          }
        })
      });
  }

  //for edit view
  public getEmployeeShift(id: number) {
    let query = "$expand=LoginGroup,LoginDeviceType&$filter=EmployeeId eq " + id;
    query += "&$orderby=Status desc";

    this.employeeShiftService.getAll(query)
      .subscribe((list: IEmployeeShift[]) => {

        this.EmployeeShiftList = <IEmployeeShiftVM[]>list;
        if (this.EmployeeShiftList.length > 1) {
          this.showMultipleShiftEdit = true;
        }
        this.EmployeeShiftList.forEach(item => {
          let date = new Date(item.FromDate);

          this.inputESFromDate = {
            Year: date.getFullYear(),
            Month: date.getMonth() + 1,
            Date: date.getDate()
          }
        })
      });
  }

  public getEmployeeShiftOnlyTrueStatus(id: number) {
    let query = "$expand=LoginGroup,LoginDeviceType&$filter=EmployeeId eq " + id;

    this.employeeShiftService.getAll(query)
      .subscribe((list: IEmployeeShift[]) => {

        this.EmployeeShiftList = <IEmployeeShiftVM[]>list.filter(x => x.Status == true);
        if (this.EmployeeShiftList.length > 1) {
          this.showMultipleShiftEdit = true;
        }
        this.EmployeeShiftList.forEach(item => {
          let date = new Date(item.FromDate);

          this.inputESFromDate = {
            Year: date.getFullYear(),
            Month: date.getMonth() + 1,
            Date: date.getDate()
          }
        })
      });
  }

  //for edit view    
  public getEmployeePosition(id: number) {
    this.getCurrentDateInString(this.currentDate);
    let query = "$expand=WorkArea,Company,CostCenter,Category,Division,Designation,Department&$filter=EmployeeId eq " + id + "and EffectiveFrom le DateTime'" + this.currentdateInString + "'&$orderby=PostedOn desc &$top=1";
    this.getEmployeeWorkArea(id);
    this.employeePositionService.getAll(query)
      .subscribe((list: IEmployeePosition[]) => {
        this.EmployeePositionListViewNew = list;
        this.EmployeePositionListViewNew.forEach(item => {
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
          this.EmployeePosition2.Id = item.Id;
          this.EmployeePosition2.EmployeeId = item.EmployeeId;
          this.EmployeePosition2.Date = item.Date;
          this.EmployeePosition2.CompanyId = item.CompanyId;
          this.EmployeePosition2.DepartmentId = item.DepartmentId;
          this.EmployeePosition2.DesignationId = item.DesignationId;
          this.EmployeePosition2.DivisionId = item.DivisionId;
          this.EmployeePosition2.CostCenterId = item.CostCenterId;
          this.EmployeePosition2.CategoryId = item.CategoryId;
          this.EmployeePosition2.WorkAreaId = item.WorkAreaId;
          this.EmployeePosition2.EffectiveFrom = item.EffectiveFrom;
          this.EmployeePosition2.PostedBy = item.PostedBy;
          this.EmployeePosition2.PostedOn = item.PostedOn;
          this.workId = [];

          if (item.CategoryId == 4) {
            this.isContractEmp = true;
          }

          if (this.employeeWorkAreaList.length > 0) {
            this.isMultipleWA = true;
            this.employeeWorkAreaList.forEach(item => {
              var fromDate = new Date(item.FromDate);
              fromDate.setHours(0, 0, 0, 0);
              var toDate = new Date(item.ToDate);
              toDate.setHours(0, 0, 0, 0);

              if (this.currentDate >= fromDate && this.currentDate <= toDate) {
                this.workId.push(item.WorkAreaId);
                //this.EmployeePosition2.WorkAreaId = this.employeeWorkAreaList[0].WorkAreaId;
              }
            });
            this.workArea = [];
            for (var i = 0; i < this.workId.length; i++) {
              this.workAreaList.forEach(item => {
                if (item.WorkAreaId == this.workId[i]) {
                  this.workArea2 = item;
                  this.workArea.push(this.workArea2);
                }
              })
            }
            this.workName = "";
            this.workArea.forEach(item => {
              if (this.workName == "") {
                this.workName += item.WorkAreaName;
              }
              else {
                this.workName += "," + item.WorkAreaName;
              }
            })
          }
          else {
            this.isMultipleWA = false;
            this.workId = [];
            this.workArea = [];
            this.workName = "";
            this.workId.push(item.WorkAreaId);
            for (var i = 0; i < this.workId.length; i++) {
              this.workAreaList.forEach(item => {
                if (item.WorkAreaId == this.workId[i]) {
                  this.workArea2 = item;
                  this.workArea.push(this.workArea2);
                }
              })
            }
            this.workName = "";
            this.workArea.forEach(item => {
              if (this.workName == "") {
                this.workName += item.WorkAreaName;
              }
              else {
                this.workName += "," + item.WorkAreaName;
              }
            })

            //this.EmployeePosition2.WorkAreaId = item.WorkAreaId;
          }

          //var fromDate = new Date(this.employeeWorkAreaList[0].FromDate);
          //var toDate = new Date(this.employeeWorkAreaList[0].ToDate);

          //if (this.currentDate >= fromDate  && this.currentDate <= toDate) {
          //    this.EmployeePosition2.WorkAreaId = this.employeeWorkAreaList[0].WorkAreaId;
          //}
          //else {
          //    this.EmployeePosition2.WorkAreaId = item.WorkAreaId;
          //}

          this.EmployeePositionList2 = [];
          this.EmployeePositionList2.push(this.EmployeePosition2);

          let date = new Date(item.Date);
          let date2 = new Date(item.EffectiveFrom);

          let EPDate: Date = date;
          this.inputEPDate.Year = EPDate.getFullYear();
          this.inputEPDate.Month = EPDate.getMonth() + 1;
          this.inputEPDate.Date = EPDate.getDate();

          let EPEffectiveFrom: Date = date2;
          this.inputEPEffectiveFromDate.Year = EPEffectiveFrom.getFullYear();
          this.inputEPEffectiveFromDate.Month = EPEffectiveFrom.getMonth() + 1;
          this.inputEPEffectiveFromDate.Date = EPEffectiveFrom.getDate();
        })

      });
  }

  public editEmployeePosition() {
    this.EmployeePositionList2.forEach(item => {

      this.employeePositionService.put(item.EmployeeId, item)
        .subscribe(() => {
          this.filterEmployeeEdit();
          this.hideEmployeeDiv();
          this.selectedModalLoaded = false;
          var toastOptions: ToastOptions = {
            title: "Edited",
            msg: "Employee Position has been successfully Updated",
            showClose: true,
            timeout: 5000,
            theme: 'bootstrap'
          };
          this.toastyService.success(toastOptions);
        });
    })
  }

  public editEmployeeShift(shiftId: number, id: number, index: number, employeeId: number) {
    this.loginGroupList = this.svloginGroupList.filter(x => x.Employee.EmployeeId != employeeId && x.ShiftId == shiftId);

    this.EmployeeShiftList2 = this.EmployeeShiftList.filter(x => x.Id == id)[0];
    this.EmployeeShiftList2.ShiftId = shiftId;
    this.EmployeeShiftList2.Id = 0;

    let date = new Date(this.EmployeeShiftList2.FromDate);
    this.EmployeeShiftList2.InputFromDate = {
      Year: date.getFullYear(),
      Month: date.getMonth() + 1,
      Date: date.getDate()
    };
    this.updateShift = true;
    this.EmployeeShiftList.splice(index, 1);
    this.deleteShiftId = id;
  }

  public updateEmployeeShift() {
    this.EmployeeShift.EmployeeId = this.employeeId;
    this.EmployeeShift.GroupId = this.EmployeeShiftList2.GroupId;
    this.EmployeeShift.FromDate = this.EmployeeShiftList2.FromDate;
    this.EmployeeShift.AutoLogin = this.EmployeeShiftList2.AutoLogin;
    this.EmployeeShift.IsOneTimeLogin = this.EmployeeShiftList2.IsOneTimeLogin;
    this.EmployeeShift.LoginDeviceId = this.EmployeeShiftList2.LoginDeviceId;
    this.EmployeeShift.ModifiedBy = this.userId;

    let saveItem: IEmployeeShift = Object.assign({}, this.EmployeeShift);
    this.employeeShiftService.post(saveItem)
      .subscribe(() => {
        //this.EmployeeShiftList2 = <IEmployeeShiftVM>{};
        this.getEmployeeShift(this.employeeId);
        this.updateShift = false;
        this.filterEmployeeEdit();
        this.hideEmployeeDiv();
        this.selectedModalLoaded = false;

        var toastOptions: ToastOptions = {
          title: "Edited",
          msg: "Employee Shift has been successfully Updated",
          showClose: true,
          timeout: 5000,
          theme: 'bootstrap'
        };
        this.toastyService.success(toastOptions);
      });

    this.employeeShiftService.delete(this.deleteShiftId).subscribe(() => {
      this.getEmployeeShift(this.EmployeeShiftList2.EmployeeId);
    });
  }

  public addNewEmployeeShift() {
    this.EmployeeShiftList2 = <IEmployeeShiftVM>{};
    this.EmployeeShiftList2.InputFromDate = {
      Year: this.currentDate.getFullYear(),
      Month: this.currentDate.getMonth() + 1,
      Date: this.currentDate.getDate()
    };
    this.updateShift = true;
  }

  public cancelUpdateEmployeeShift() {
    this.EmployeeShiftList2 = <IEmployeeShiftVM>{};
    this.updateShift = false;
    this.getEmployeeShift(this.employeeId);
  }

  //for detail view
  public getEmployeePositionAllRecords(id: number) {
    let query = "$expand=WorkArea,Company,CostCenter,Category,Division,Designation,Department&$filter=EmployeeId eq " + id + "&$orderby=PostedOn desc";

    this.employeePositionService.getAll(query)
      .subscribe((list: IEmployeePosition[]) => {
        this.EmployeePositionListView2 = list;
        this.EmployeePositionListView2.forEach(item => {
          this.EmployeePositionListView.forEach(epItem => {
            if (epItem.CurrentFlag == true && epItem.Id == item.Id) {
              item.CurrentFlag = true;
            }
          })
        })
        this.EmployeePositionListView = this.EmployeePositionListView2;
      });
  }

  public getEPFuture(id: number) {
    this.getCurrentDateInString(this.currentDate);
    let query = "$expand=WorkArea,Company,CostCenter,Category,Division,Designation,Department&$filter=EmployeeId eq " + id + "and EffectiveFrom ge DateTime'" + this.currentdateInString + "'&$orderby=PostedOn desc";

    this.EmployeePositionListView = [];
    this.employeePositionService.getAll(query)
      .subscribe((list: IEmployeePosition[]) => {
        this.EmployeePositionListView2 = list;
        this.EmployeePositionListView2.forEach(item => {
          this.EmployeePositionListView.push(item);
        })
        this.getEmployeePositionCurrentRecords(id);
      });
  }

  //detail current
  public getEmployeePositionCurrentRecords(id: number) {
    this.getCurrentDateInString(this.currentDate);
    let query = "$expand=WorkArea,Company,CostCenter,Category,Division,Designation,Department&$filter=EmployeeId eq " + id + "and EffectiveFrom le DateTime'" + this.currentdateInString + "'&$orderby=PostedOn desc &$top=1";
    this.getEmployeeWorkArea(id);
    this.employeePositionService.getAll(query)
      .subscribe((list: IEmployeePosition[]) => {
        this.EmployeePositionListView3 = list;
        this.EmployeePositionListView3.forEach(item => {
          item.CurrentFlag = true;
          this.EmployeePositionListView.push(item);
          this.workId = [];
          if (this.employeeWorkAreaList.length > 0) {
            this.isMultipleWA = true;
            this.employeeWorkAreaList.forEach(item => {
              var fromDate = new Date(item.FromDate);
              fromDate.setHours(0, 0, 0, 0);
              var toDate = new Date(item.ToDate);
              toDate.setHours(0, 0, 0, 0);

              if (this.currentDate >= fromDate && this.currentDate <= toDate) {
                this.workId.push(item.WorkAreaId);
                //this.EmployeePosition2.WorkAreaId = this.employeeWorkAreaList[0].WorkAreaId;
              }
            });
            this.workArea = [];
            for (var i = 0; i < this.workId.length; i++) {
              this.workAreaList.forEach(item => {
                if (item.WorkAreaId == this.workId[i]) {
                  this.workArea2 = item;
                  this.workArea.push(this.workArea2);
                }
              })
            }
            this.workName = "";
            this.workArea.forEach(item => {
              if (this.workName == "") {
                this.workName += item.WorkAreaName;
              }
              else {
                this.workName += "," + item.WorkAreaName;
              }
            })
          }
          else {
            this.isMultipleWA = false;
            this.workId = [];
            this.workArea = [];
            this.workName = "";
            this.workId.push(item.WorkAreaId);
            for (var i = 0; i < this.workId.length; i++) {
              this.workAreaList.forEach(item => {
                if (item.WorkAreaId == this.workId[i]) {
                  this.workArea2 = item;
                  this.workArea.push(this.workArea2);
                }
              })
            }
            this.workName = "";
            this.workArea.forEach(item => {
              if (this.workName == "") {
                this.workName += item.WorkAreaName;
              }
              else {
                this.workName += "," + item.WorkAreaName;
              }
            })

          }
        })

      });
  }


  //EditModal
  openEditDiv() {
    this.copyAddress = false;
    this.isEditEmployee = true;
    this.isAddEmployee = false;
    this.selectedListDiv = false;
    this.selectedModalLoaded = true;
  }

  //edit
  public editEmployee() {
    this.Employee.ModifiedBy = this.userId;
    let saveItem: IEmployee = Object.assign({}, this.Employee);
    this.employeeService.put(saveItem.EmployeeId, saveItem)
      .subscribe(() => {
        if (this.isEditMyProfile == true) {
          this.hideEditProfile();
        }
        else {
          this.filterEmployeeEdit();
          this.isEditEmployee = false;
          this.InputEmployee = <IEmployee>{};
          this.hideEmployeeDiv();
          this.selectedModalLoaded = false;
          this.isAddEditToggle = false;

          var toastOptions: ToastOptions = {
            title: "Edited",
            msg: "Employee has been successfully Edited",
            showClose: true,
            timeout: 5000,
            theme: 'bootstrap'
          };
          this.toastyService.success(toastOptions);
        }
      });
  }

  public getOneEmployee(id: number) {
    let query = "$expand=Religion,EmployeePosition";
    this.employeeService.get(id, query)
      .subscribe((one: IEmployee) => {
        this.employeeDetail = one;
      });
  }

  public openDetails(id: number) {
    this.selectedDetailDiv = true;
    this.selectedListDiv = false;
    let query = "$expand=Religion,EmployeePosition,EmployeePosition/Company,EmployeePosition/CostCenter,EmployeePosition/Category,EmployeePosition/Division,EmployeePosition/Designation,EmployeePosition/Department,EmployeeShift,EmployeeShift/LoginGroup,EmployeeShift/LoginDeviceType,EmployeeStatus";
    this.employeeService.get(id, query)
      .subscribe((one: IEmployee) => {
        let religion: IReligion = one.Religion;
        let loginGroup: ILoginGroup = one.LoginGroup;
        this.DetailEmployee = one;
        this.DetailEmployee.Religion = religion;
        this.DetailEmployee.LoginGroup = loginGroup;

        if (one.Street2 != null) {
          if (one.Street1 != null && one.City != null && one.State != null && one.Country != null) {
            this.DetailEmployee.TemporaryAddress = one.Street2 + "," + one.Street1 + "," + one.City + "," + one.State + "," + one.Country;
          }
          else {
            this.DetailEmployee.TemporaryAddress = "N/A";
          }
        } else {
          if (one.Street1 != null && one.City != null && one.State != null && one.Country != null) {
            this.DetailEmployee.TemporaryAddress = one.Street1 + "," + one.City + "," + one.State + "," + one.Country;
          }
          else {
            this.DetailEmployee.TemporaryAddress = "N/A";
          }
        }
        if (one.PerStreet2 != null) {
          if (one.PerStreet1 != null && one.PerCity != null && one.PerState != null && one.PerCountry != null) {
            this.DetailEmployee.PermanentAddress = one.PerStreet2 + "," + one.PerStreet1 + "," + one.PerCity + "," + one.PerState + "," + one.PerCountry;
          }
          else {
            this.DetailEmployee.PermanentAddress = "N/A";
          }

        } else {
          if (one.PerStreet1 != null && one.PerCity != null && one.PerState != null && one.PerCountry != null) {
            this.DetailEmployee.PermanentAddress = one.PerStreet1 + "," + one.PerCity + "," + one.PerState + "," + one.PerCountry;
          }
          else {
            this.DetailEmployee.PermanentAddress = "N/A";
          }
        }

        this.getCurrentEmployeeStatus(one.EmployeeId);
        //this.getEmployeePosition(one.EmployeeId);
        this.getEPFuture(one.EmployeeId);
        this.getEmployeeReportTo(one.EmployeeId);
        this.getEmployeeShiftOnlyTrueStatus(one.EmployeeId);
        this.getEmployeeHolidayList(one.EmployeeId);
      });
  }

  public hideDetailDiv() {
    this.selectedDetailDiv = false;
    this.selectedListDiv = true;
  }

  public getCurrentEmployeeStatus(id: number) {
    var query = "$filter=EmployeeId eq " + id;
    query += "&$orderby=ChangedOn desc &$top=1";
    this.employeeStatusHistoryService.getAll(query)
      .subscribe((list: IEmployeeStatusHistory[]) => {
        this.employeeStatusList = list;
        if (this.employeeStatusList.length > 0) {
          this.employeeStatusList.forEach(item => {
            this.DetailEmployee.Status = item.Status;
          })
        }
      });
  }

  //InputEmployee.Photo
  onChange(item: any, evt: any) {
    var obj: any = evt.currentTarget;
    this.tempIconPath = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(obj.files[0]));
    item = this.tempIconPath;

    var files = evt.target.files;
    var file = files[0];

    if (files && file) {
      if (this.isAddEmployee == false) {
        this.Employee.Photo = null;
      }
      else {
        this.InputEmployee.Photo = null;
      }
      let image = new Image();
      image.src = URL.createObjectURL(file);
      image.onload = () => {
        let width = image.width;
        let height = image.height;
        let ratio: any;

        ratio = width / height;
        if (ratio == 1 || (height == 300 && width == 300)) {
          this.invalidImage = false;
          var reader = new FileReader();
          reader.onload = this._handleReaderLoaded.bind(this);
          reader.readAsBinaryString(file);
        }
        else {
          this.invalidImage = true;
        }
      };
    }
  }

  _handleReaderLoaded(readerEvt: any) {
    var binaryString = readerEvt.target.result;
    this.base64textString = btoa(binaryString);
    if (this.isAddEmployee == true) {
      this.InputEmployee.Photo = 'data:image/png;base64,' + this.base64textString;
      //this.employeeList.filter(x => x.EmployeeId == this.InputEmployee.EmployeeId)[0] = this.InputEmployee;
    }
    else {
      this.Employee.Photo = 'data:image/png;base64,' + this.base64textString;
      //this.employeeList.filter(x => x.EmployeeId == this.Employee.EmployeeId)[0] = this.Employee;
    }
  }

  public onEmployeeNoChange(event: any) {
    this.showDiv = false;
    let query = "$filter=EmployeeNo eq " + event;
    this.employeeService.getAll(query)
      .subscribe((list: IEmployee[]) => {
        this.empList = list;
        if (this.empList.length != 0) {
          this.showDiv = true;
        }
      });
  }

  public generalDateInString(date: Date) {
    let dateInString: any;
    return dateInString = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
  }

  public onGroupIdChangeES(event: any) {
    this.InputEmployeeShift.GroupId = event.GroupId;
    this.InputEmployeeShift.ShiftId = event.ShiftId;
    this.gName = event.GroupName;
  }

  public copyToPmtAddress() {
    this.InputEmployee.PerStreet2 = this.InputEmployee.Street2;
    this.InputEmployee.PerStreet1 = this.InputEmployee.Street1;
    this.InputEmployee.PerCity = this.InputEmployee.City;
    this.InputEmployee.PerState = this.InputEmployee.State;
    this.InputEmployee.PerCountry = this.InputEmployee.Country;
  }

  public cancelCopy() {
    this.InputEmployee.PerStreet2 = "";
    this.InputEmployee.PerStreet1 = "";
    this.InputEmployee.PerCity = "";
    this.InputEmployee.PerState = "";
    this.InputEmployee.PerCountry = "";
  }

  public copyToPmtAddressEdit() {
    this.Employee.PerStreet2 = this.Employee.Street2;
    this.Employee.PerStreet1 = this.Employee.Street1;
    this.Employee.PerCity = this.Employee.City;
    this.Employee.PerState = this.Employee.State;
    this.Employee.PerCountry = this.Employee.Country;
  }

  public cancelCopyEdit() {
    this.Employee.PerStreet2 = "";
    this.Employee.PerStreet1 = "";
    this.Employee.PerCity = "";
    this.Employee.PerState = "";
    this.Employee.PerCountry = "";
  }

  public addressCopy(event: any) {
    if (event == true) {
      this.copyToPmtAddress();
    }
    //else {
    //    this.cancelCopy();
    //}
  }

  public onStreet2(event: any) {
    if (this.copyAddress == true) {
      this.InputEmployee.PerStreet2 = this.InputEmployee.Street2;
    }
  }

  public onStreet1(event: any) {
    if (this.copyAddress == true) {
      this.InputEmployee.PerStreet1 = this.InputEmployee.Street1;
    }
  }

  public onCity(event: any) {
    if (this.copyAddress == true) {
      this.InputEmployee.PerCity = this.InputEmployee.City;
    }
  }

  public onState(event: any) {
    if (this.copyAddress == true) {
      this.InputEmployee.PerState = this.InputEmployee.State;
    }
  }

  public onCountry(event: any) {
    if (this.copyAddress == true) {
      this.InputEmployee.PerCountry = this.InputEmployee.Country;
    }
  }

  public addressCopyEdit(event: any) {
    if (event == true) {
      this.copyToPmtAddressEdit();
    }
    //else {
    //    this.cancelCopyEdit();
    //}
  }

  public onStreet2Edit(event: any) {
    if (this.copyAddress == true) {
      this.Employee.PerStreet2 = this.Employee.Street2;
    }
  }

  public onStreet1Edit(event: any) {
    if (this.copyAddress == true) {
      this.Employee.PerStreet1 = this.Employee.Street1;
    }
  }

  public onCityEdit(event: any) {
    if (this.copyAddress == true) {
      this.Employee.PerCity = this.Employee.City;
    }
  }

  public onStateEdit(event: any) {
    if (this.copyAddress == true) {
      this.Employee.PerState = this.Employee.State;
    }
  }

  public onCountryEdit(event: any) {
    if (this.copyAddress == true) {
      this.Employee.PerCountry = this.Employee.Country;
    }
  }

  onDOBSelect(selectedDate: IInputDateVM) {
    this.inputDOB = selectedDate;
    this.InputEmployee.DateOfBirth = new Date(this.inputDOB.Year, this.inputDOB.Month - 1, this.inputDOB.Date, 5, 45, 0, 0);
  }

  onDOJSelect(selectedDate: IInputDateVM) {
    this.inputDOJ = selectedDate;
    var date = new Date(this.inputDOJ.Year, this.inputDOJ.Month - 1, this.inputDOJ.Date, 5, 45, 0, 0);
    //if (date < this.currentDate) {
    //    this.DOJLTCurrentDate = true;
    //}
    //else {
    //    this.DOJLTCurrentDate = false;
    //    this.InputEmployee.DateOfJoin = new Date(this.inputDOJ.Year, this.inputDOJ.Month - 1, this.inputDOJ.Date);
    //}
    this.InputEmployee.DateOfJoin = new Date(this.inputDOJ.Year, this.inputDOJ.Month - 1, this.inputDOJ.Date, 5, 45, 0, 0);
    //this.InputEmployeeShift.FromDate = new Date(Date.UTC(this.inputDOJ.Year, this.inputDOJ.Month - 1, this.inputDOJ.Date));
    //this.InputEmployeePosition.Date = new Date(Date.UTC(this.inputDOJ.Year, this.inputDOJ.Month - 1, this.inputDOJ.Date));
    //this.InputEmployeePosition.EffectiveFrom = new Date(Date.UTC(this.inputDOJ.Year, this.inputDOJ.Month - 1, this.inputDOJ.Date));
    //this.InputHolidayList.EffectiveFrom = new Date(Date.UTC(this.inputDOJ.Year, this.inputDOJ.Month - 1, this.inputDOJ.Date));

    //same date as Joined date in Employee Shift Effective From
    this.inputESFromDate = {
      Year: this.inputDOJ.Year,
      Month: this.inputDOJ.Month,
      Date: this.inputDOJ.Date
    }
    this.onESFromDateSelect(this.inputESFromDate);

    //same date as Joined date in Holiday Effective From
    this.inputEHEffectiveFromDate = {
      Year: this.inputDOJ.Year,
      Month: this.inputDOJ.Month,
      Date: this.inputDOJ.Date
    }
    this.onEHEffectiveFromDateSelect(this.inputESFromDate);

    //same date as Joined date in Employee Position Decision Date
    this.inputEPDate = {
      Year: this.inputDOJ.Year,
      Month: this.inputDOJ.Month,
      Date: this.inputDOJ.Date
    }
    this.onEPDateSelect(this.inputESFromDate);

    //same date as Joined date in Employee Position Effective From Date
    this.inputEPEffectiveFromDate = {
      Year: this.inputDOJ.Year,
      Month: this.inputDOJ.Month,
      Date: this.inputDOJ.Date
    }
    this.onEPEffectiveFromSelect(this.inputESFromDate);
  }

  onESFromDateSelect(selectedDate: IInputDateVM) {
    this.inputESFromDate = selectedDate;
    var date = new Date(this.inputESFromDate.Year, this.inputESFromDate.Month - 1, this.inputESFromDate.Date, 5, 45, 0, 0);
    this.InputEmployeeShift.FromDate = new Date(this.inputESFromDate.Year, this.inputESFromDate.Month - 1, this.inputESFromDate.Date, 5, 45);
  }

  onEPDateSelect(selectedDate: IInputDateVM) {
    this.inputEPDate = selectedDate;
    var date = new Date(this.inputEPDate.Year, this.inputEPDate.Month - 1, this.inputEPDate.Date);
    //if (date < this.currentDate) {
    //    this.DecisionDateLTCurrentDate = true;
    //}
    //else {
    //    this.DecisionDateLTCurrentDate = false;
    //    this.InputEmployeePosition.Date = new Date(this.inputEPDate.Year, this.inputEPDate.Month - 1, this.inputEPDate.Date);
    //}
    this.InputEmployeePosition.Date = new Date(this.inputEPDate.Year, this.inputEPDate.Month - 1, this.inputEPDate.Date, 5, 45, 0, 0);

  }

  onEPEffectiveFromSelect(selectedDate: IInputDateVM) {
    this.inputEPEffectiveFromDate = selectedDate;
    var date = new Date(this.inputEPEffectiveFromDate.Year, this.inputEPEffectiveFromDate.Month - 1, this.inputEPEffectiveFromDate.Date);
    //if (date < this.currentDate) {
    //    this.EffectiveDateLTCurrentDate = true;
    //}

    this.InputEmployeePosition.EffectiveFrom = new Date(this.inputEPEffectiveFromDate.Year, this.inputEPEffectiveFromDate.Month - 1, this.inputEPEffectiveFromDate.Date, 5, 45, 0, 0);
    if (this.InputEmployeePosition.Date > this.InputEmployeePosition.EffectiveFrom) {
      this.DecisionDateLTEffectiveFrom = true;
    }
    else {
      this.DecisionDateLTEffectiveFrom = false;
    }


  }

  onEHEffectiveFromDateSelect(selectedDate: IInputDateVM) {
    this.inputEHEffectiveFromDate = selectedDate;
    var date = new Date(this.inputEHEffectiveFromDate.Year, this.inputEHEffectiveFromDate.Month - 1, this.inputEHEffectiveFromDate.Date);

    this.InputHolidayList.EffectiveFrom = new Date(this.inputEHEffectiveFromDate.Year, this.inputEHEffectiveFromDate.Month - 1, this.inputEHEffectiveFromDate.Date, 5, 45, 0, 0);

  }

  onDOBEditSelect(selectedDate: IInputDateVM) {
    this.inputDOB = selectedDate;
    this.Employee.DateOfBirth = new Date(this.inputDOB.Year, this.inputDOB.Month - 1, this.inputDOB.Date, 5, 45, 0, 0);
  }

  onDOJEditSelect(selectedDate: IInputDateVM) {
    this.inputDOJ = selectedDate;
    this.Employee.DateOfJoin = new Date(this.inputDOJ.Year, this.inputDOJ.Month - 1, this.inputDOJ.Date, 5, 45, 0, 0);
  }

  onESFromDateEditSelect(selectedDate: IInputDateVM, id?: number) {
    this.EmployeeShiftList2.FromDate = new Date(selectedDate.Year, selectedDate.Month - 1, selectedDate.Date, 5, 45, 0, 0);
  }

  onEPDateEditSelect(selectedDate: IInputDateVM) {
    this.inputEPDate = selectedDate;
    this.EmployeePositionListView.forEach(item => {
      item.Date = new Date(this.inputEPDate.Year, this.inputEPDate.Month - 1, this.inputEPDate.Date, 5, 45, 0, 0);
    })
  }

  onEPEffectiveFromEditSelect(selectedDate: IInputDateVM) {
    this.inputEPEffectiveFromDate = selectedDate;
    this.EmployeePositionListView.forEach(item => {
      item.EffectiveFrom = new Date(this.inputEPEffectiveFromDate.Year, this.inputEPEffectiveFromDate.Month - 1, this.inputEPEffectiveFromDate.Date, 5, 45, 0, 0);
    })
  }

  loginDeviceChange(event?: any) {
    this.lName = event.LoginDeviceName;
    this.InputEmployeeShift.LoginDeviceId = event.LoginDeviceId;
  }

  public isEmployeePositionEditable() {
    let query = "$expand=MenuTemplate,MenuTemplate/MenuVsTemplate";
    this.userService.get(localStorage.getItem('UserId'), query)
      .subscribe((list: IUser) => {
        this.UserList = list;
        this.isUpdateEmployeePosition = this.UserList.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1043 || x.MenuId == 1022).length > 0 ? true : false;
      });
  }
  public isEmployeeShiftEditable() {
    let query = "$expand=MenuTemplate,MenuTemplate/MenuVsTemplate";
    this.userService.get(localStorage.getItem('UserId'), query)
      .subscribe((list: IUser) => {
        this.UserList = list;
        this.isUpdateEmployeeShift = this.UserList.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1043).length > 0 ? true : false;
      });
  }

  public isEmployeeTransferAndPromotion() {
    let query = "$expand=MenuTemplate,MenuTemplate/MenuVsTemplate";
    this.userService.get(localStorage.getItem('UserId'), query)
      .subscribe((list: IUser) => {
        this.UserList = list;
        this.employeeTransferAndPromotion = this.UserList.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1021).length > 0 ? true : false;
      });
  }

  public isEmployeeShiftChange() {
    let query = "$expand=MenuTemplate,MenuTemplate/MenuVsTemplate";
    this.userService.get(localStorage.getItem('UserId'), query)
      .subscribe((list: IUser) => {
        this.UserList = list;
        this.employeeShiftChange = this.UserList.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1044).length > 0 ? true : false;
      });
  }

  public goToTransferAndPromotion(id: number) {
    this.selectedEmp = id;
    this.openEmpTAndP = true;
    this.openEmpShift = false;
  }

  public goToChangeShift(id: number, no: number, employeeName: string) {
    this.empName = employeeName;
    this.selectedEmpShift = id;
    this.empNo = no;
    this.openEmpShift = true;
    this.openEmpTAndP = false;
  }

  selectedEmployeePosition(event: any) {
  }

  selectedEmployeeShift(event: any) {
    //this.isRefreshEmployee = false;
  }

  public selectEmployeeDetail() {
    this.openDetails(this.selectedId);
    this.showEmployeeDetail.emit(this.DetailEmployee);
  }

  public close() {
    if (this.showEmployee == true) {
      this.router.navigateByUrl('layout/employee');
    }
    else {
      this.router.navigateByUrl('layout');
    }
  }

  public empNoClick(event: any) {
    this.router.navigateByUrl('layout/myProfile/' + event);
  }

  public sortBy(sortBy: string) {
    this.toggleSort = !this.toggleSort;
    if (this.toggleSort == true) {
      this.filterObj.Sort = "true";
    }
    else {
      this.filterObj.Sort = "false";
    }

    this.filterObj.SortingAttribute = sortBy;
    if (this.resigned == false) {
      this.getAllEmployee(this.filterObj);
    }
    else {
      this.getAllResignedEmployee(this.filterObj);
    }
  }

  public AutoLoginChecked(event: any) {
    if (this.InputEmployeeShift.AutoLogin == true) {
      this.disableIOTL = true;
      this.disableLDC = true;
    }
    else {
      this.disableIOTL = false;
      this.disableLDC = false;
    }
    this.selectedValue2 = {
      LoginDeviceId: 6,
      LoginDeviceName: "All"
    }
    this.InputEmployeeShift.LoginDeviceId = 6;
    this.lName = "All";
  }

  public IsOneTimeLoginChecked() {
    if (this.InputEmployeeShift.IsOneTimeLogin == true) {
      this.disableAL = true;
    }
    else {
      this.disableAL = false;
    }
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

    if (event.CategoryId == 4) {
      this.isContractEmp = true;
    } else {
      this.isContractEmp = false;
    }
  }

  public selectedDeptEdit(event: any, id: number) {
    this.EmployeePositionList2.forEach(item => {
      if (item.Id == id) {
        item.DepartmentId = event.DepartmentId;
        this.DepartmentName = event.DepartmentName;
      }
    })
  }

  public selectedDesgEdit(event: any, id: number) {
    this.EmployeePositionList2.forEach(item => {
      if (item.Id == id) {
        item.DesignationId = event.DesignationId;
        this.DesignationName = event.DesignationName;
      }
    })
  }

  public selectedDivEdit(event: any, id: number) {
    this.EmployeePositionList2.forEach(item => {
      if (item.Id == id) {
        item.DivisionId = event.DivisionId;
        this.DivisionName = event.DivisionName;
      }
    })
  }

  public selectedCatEdit(event: any, id: number) {
    this.EmployeePositionList2.forEach(item => {
      if (item.Id == id) {
        item.CategoryId = event.CategoryId;
        this.CategoryName = event.CategoryName;

      }
    });

    if (event.CategoryId == 4) {
      this.isContractEmp = true;
    } else {
      this.isContractEmp = false;
    }

  }
  getCurrentDateInString(currentDate: Date) {
    var year = currentDate.getFullYear();
    var month = currentDate.getMonth() + 1;
    var date = currentDate.getDate();

    if (date < 10 || month < 10) {
      var dateInString = date.toString();
      var monthInString = month.toString();
      if (date < 10) {
        var dateString = "0" + dateInString;
      }
      if (month < 10) {
        var monthString = "0" + monthInString;
      }

      if (date < 10 && month > 9) {
        this.currentdateInString = year.toString() + "-" + month.toString() + "-" + dateString;
      }
      else if (month < 10 && date > 9) {
        this.currentdateInString = year.toString() + "-" + monthString + "-" + date.toString();
      }
      else {
        this.currentdateInString = year.toString() + "-" + monthString + "-" + dateString;
      }
    }
    else {
      this.currentdateInString = year.toString() + "-" + month.toString() + "-" + date.toString();
    }
  }

  public getEmployeeWorkArea(id: number) {
    let queryForEmpWA = "$filter=EmployeeId eq " + id + " and (FromDate gt DateTime'" + this.currentdateInString + "' or ToDate gt DateTime'" + this.currentdateInString + "')";
    this.employeeWorkAreaService.getAll(queryForEmpWA)
      .subscribe((list: IEmployeeWorkArea[]) => {
        this.employeeWorkAreaList = list;
      });
  }

  public viewHistoryES(id: number) {
    this.toggleHistoryES = !this.toggleHistoryES;
    if (this.toggleHistoryES == true) {
      this.getEmployeeShift(id);
    }
    else {
      this.getEmployeeShiftOnlyTrueStatus(id);
    }
  }

  public viewHistoryEP(id: number) {
    this.toggleHistoryEP = !this.toggleHistoryEP;
    if (this.toggleHistoryEP == true) {
      this.getEmployeePositionAllRecords(id);
    }
    else {
      this.getEPFuture(id);
    }
  }

  public viewHistoryEH(id: number) {
    this.toggleHistoryEH = !this.toggleHistoryEH;
    if (this.toggleHistoryEH == true) {
      this.getEmployeeHolidayListAllRecords(id);
    }
    else {
      this.getEmployeeHolidayList(id);
    }
  }

  public getActiveEmployee() {
    this.active = true;
    this.inactive = false;
    this.resigned = false;
    this.filterObj = { Name: "", Sort: "false", SortingAttribute: "PostedOn", SearchBy: null };
    this.onPageSelect(this.pagination);
    //this.getAllEmployee(this.filterObj);
  }

  public getInactiveEmployee() {
    this.active = false;
    this.inactive = true;
    this.resigned = false;
    this.filterObj = { Name: "", Sort: "false", SortingAttribute: "PostedOn", SearchBy: null };
    this.onPageSelect(this.pagination);
    //this.getAllEmployee(this.filterObj);
  }
  public getResignedEmployee() {
    this.active = false;
    this.inactive = false;
    this.resigned = true;
    this.filterObj = { Name: "", Sort: "false", SortingAttribute: "EffectiveFrom", SearchBy: null };
    this.onPageSelect(this.pagination);

    //this.getAllResignedEmployee(this.filterObj);
  }

  public getSupervisor() {
    var query = '$expand=MenuTemplate/User/Employee&$filter=MenuId eq 1043 or MenuId eq 1048';
    this.menuVsTemplateService.getAll(query).subscribe((data: IMenuVsTemplate[]) => {
      this.supervisorList = [];
      this.menuVsTemplateList = data;
      this.uniqueArray = [];
      this.menuVsTemplateList.forEach(item => {
        item.MenuTemplate.User.forEach(userObj => {
          this.employeeObj = userObj.Employee;/* this.svEmployeeList.filter(x => x.EmployeeId == userObj.Employee.EmployeeId)[0];*/
          this.employeeObj.ReportToId = userObj.EmployeeId;
          this.employeeObj.employeeNameJoint = "";
          if (userObj.Employee.FirstName != null) {
            this.employeeObj.employeeNameJoint += userObj.Employee.FirstName + " ";
          }
          if (userObj.Employee.MiddleName != null) {
            this.employeeObj.employeeNameJoint += userObj.Employee.MiddleName + " ";
          }
          if (userObj.Employee.LastName != null) {
            this.employeeObj.employeeNameJoint += userObj.Employee.LastName;
          }
          var unique = this.uniqueArray.filter(x => x == this.employeeObj.EmployeeId).length;
          if (unique == 0) {
            this.uniqueArray.push(this.employeeObj.EmployeeId);
            if (this.employeeObj != null && typeof this.employeeObj != undefined) {
              this.supervisorList.push(this.employeeObj);
            }
          }
        })
      })
    })
  }

  public selectedReportTo(event: any) {
    this.report.ReportTo1 = event;
    this.report.Status = true;
    this.report.PostedBy = this.userId;
    let saveEmployeeReportTo: IReportTo = Object.assign({}, this.report);
    this.InputEmployee.ReportTo = [];
    this.InputEmployee.ReportTo.push(saveEmployeeReportTo);
  }

  onPageSelect(pagination: IPagination) {
    this.pagination = pagination;
    if (this.userDetails.Employee != null) {
      if (this.resigned == false) {
        this.getAllEmployee(this.filterObj);
      }
      else {
        this.getAllResignedEmployee(this.filterObj);
      }
    } else {
      this.getUserDetails();
    }
  }

  public openEditProfile() {
    this.copyAddress = false;
    this.hideDetailDiv();
    this.getEmployee(this.selectedId);
    this.isEditMyProfile = true;
    this.isAddEmployee = false;
    this.isEditEmployee = false;
    this.selectedModalLoaded = true;
    this.selectedListDiv = false;
  }

  public hideEditProfile() {
    this.copyAddress = false;
    this.isEditMyProfile = false;
    this.selectedModalLoaded = false;
    this.openDetails(this.selectedId);
  }

  public openAttendanceDetails(empId: number) {
    this.showAttendance = true;
    this.selectedModalLoaded = false;
    this.selectedListDiv = false;
    this.attendanceId = empId;
    this.isRefreshCalendar = true;
  }

  public hideAttendanceDetail() {
    this.showAttendance = false;
    this.selectedModalLoaded = false;
    this.selectedListDiv = true;
    this.isRefreshCalendar = false;
  }

  public resetPagination() {
    this.pagination = <IPagination>{
      CurrentPage: 1,
      ItemsPerPage: 50,
      TotalItems: 0,
      SortBy: null
    };
  }

  public exportToCSV(empList: IEmployeeWithEmpPosVM[]) {
    let dataList: any = [];
    let FileName: string = "";

    empList.forEach(item => {
      let joinDate = item.DateOfJoin.toString().split('T');
      let data = {
        "Employee No": item.EmployeeNo,
        "Employee Name": item.EmployeeName,
        "Joined Date": joinDate[0],
        "Department": item.DepartmentName || "",
        "Designation": item.DesignationName || item.Designationname || "",
        Email: item.Email || "",
        "Contact Number": item.ContactNumber || ""
      }

      dataList.push(data);
    });
    FileName = "EmployeeList";
    if (this.filterObj.Name != null && this.filterObj.Name != '') {
      FileName += "_" + this.filterObj.Name;
    }
    this.csvService.download(dataList, FileName);
  }

  public exportToCSVResigned(resEmpList: IFEmployeeResign[]) {
    let dataList: any = [];
    let FileName: string = "";

    resEmpList.forEach(item => {
      let joinDate = item.DateOfJoin.toString().split('T');
      let regDate = item.EffectiveFrom.toString().split('T');
      let data = {
        "Employee No": item.EmployeeNo,
        "Employee Name": item.EmployeeName,
        "Joined Date": joinDate[0],
        "Department": item.DepartmentName || "",
        "Designation": item.DesignationName || item.Designationname || "",
        Email: item.Email || "",
        "Contact Number": item.ContactNumber || "",
        "Resigned On": regDate[0]
      }

      dataList.push(data);
    });
    FileName = "ResignedEmployeeList";
    if (this.filterObj.Name != null && this.filterObj.Name != '') {
      FileName += "_" + this.filterObj.Name;
    }
    this.csvService.download(dataList, FileName);
  }

  getLoginDetails($event: any) {
    //console.log($event);
  }

  getENList(empNomineeList: IEmployeeNominee[]) {
    this.InputEmployee.Employee_Nominee = empNomineeList;
    this.Employee.Employee_Nominee = empNomineeList;
  }

  saveContract(empContract: IEmployeeContract) {
    this.InputEmployee.Employee_Contract = [];
    this.InputEmployee.Employee_Contract.push(empContract);
  }

  getEmpImage(empId: number) {
    return this.employeeService.get(empId, `$select=Photo`);
  }


  //company branch list
  EmpCurrentPost: IFgetCurrentEmployeePosition_Result;
  CBList: ICompanyVM[] = [];
  svCBList: ICompanyVM[] = [];
  CompanyName: string;
  getBranches() {
    this.commonService.GetCompanyBranches().subscribe((data: ICompanyVM[]) => {
      this.svCBList = data;
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

  selectBranch(company?: ICompanyVM) {
    if (company.ParentId != null) {
      this.CompanyName = company.CompanyName;
      this.InputEmployeePosition.CompanyId = company.CompanyId;
    }
  }

  selectBranchEdit(company?: ICompanyVM) {
    this.CompanyName = company.CompanyName;
    this.EmployeePositionList2[0].CompanyId = company.CompanyId;
  }

  CBSelectIsExpand: boolean = false;
}


export class ShiftListView {

  public GroupName: string;
  public FromDate: Date;
  public AutoLogin: boolean;
  public IsOneTimeLogin: boolean;
  public LoginDeviceName: string;

  constructor(GroupName: string, FromDate: Date, AutoLogin: boolean, IsOneTimeLogin: boolean, LoginDeviceName: string) {
    this.GroupName = GroupName;
    this.FromDate = FromDate;
    this.AutoLogin = AutoLogin;
    this.IsOneTimeLogin = IsOneTimeLogin;
    this.LoginDeviceName = LoginDeviceName;
  }
}
