import { Component, Injectable, ViewChild, Input, Output, SimpleChange, EventEmitter } from '@angular/core';
import { EmployeeShiftService, LoginGroup, LoginDeviceTypeService, UserService, ParamService } from '../../services/BaseService';
import { IEmployeeShift, ILoginGroup, ILoginDeviceType, IUser, IEmployee, IPagination, IParam } from '../../models/Models';
import { IEmployeeShiftVM } from '../../models/ViewModels';
import { ModalDirective } from 'ngx-bootstrap';
import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';
import { IInputDateVM, IDatePickerOptionsVM } from '../../shared/datepicker/models/datepickerVM';
import { IEmployeeSearchOption } from '../../shared/employeeSearch/employeeSearch.component';
import { Router } from '@angular/router';


@Component({
  selector: 'employee-shift',
  templateUrl: 'changeEmployeeShift.component.html'
})
export class EmployeeShiftComponent {
  @Input() selectedId: number;
  @Input() refresh: boolean;
  @Input() empName: string;
  @Input() empNo: number;
  @Output() selectedEmployeeShift: EventEmitter<IEmployeeShiftVM[]> = new EventEmitter<IEmployeeShiftVM[]>();
  showEmployeeShift: boolean = true;
  isBreadcrumb: boolean = true;

  EmployeeShift: IEmployeeShift = <IEmployeeShift>{};
  EmployeeShiftVM: IEmployeeShiftVM = <IEmployeeShiftVM>{};
  EmployeeShiftVMOld: IEmployeeShiftVM = <IEmployeeShiftVM>{};
  EmployeeShiftPost: IEmployeeShift = <IEmployeeShift>{};

  EmployeeShiftList: IEmployeeShiftVM[] = [];
  EmpList: IEmployeeShift[] = [];
  showMultipleShiftEdit: boolean = false;
  updateShift: boolean = false;
  loginDeviceTypeList: ILoginDeviceType[] = [];
  svloginGroupList: ILoginGroup[] = [];
  loginGroupList: ILoginGroup[] = [];
  isAddShift: boolean = false;
  postedModifiedInfo: IEmployeeShiftVM[] = [];
  inputESFromDate: IInputDateVM;
  inputESFromDateOptions: IDatePickerOptionsVM;
  showEmployeeList: boolean = false;
  employeeId: number;
  duplicateDate: boolean = false;
  userId: string;
  userList: IUser[] = [];
  countEnableShift: number = 0;
  countForHasMultipleShift: number = 0;
  disableAL: boolean = false;
  disableIOTL: boolean = false;
  disableLDC: boolean = false;

  //for information modal
  @ViewChild('infoModal', { static: false }) public infoModal: ModalDirective
  @ViewChild('modal', { static: false })
  ModalDirective: any;
  selectedModalLoaded: boolean = false;
  backToEmployee: boolean = false;

  //for pagination
  pagination?: IPagination;

  selectEmployeeOptions: IEmployeeSearchOption = <IEmployeeSearchOption>{
    showOpenModalButton: true
  };

  InputParam: IParam = <IParam>{};
  showMultipleShiftCheckbox: boolean = false;

  constructor(
    public employeeShiftService: EmployeeShiftService,
    public loginGroupService: LoginGroup,
    public loginDeviceTypeService: LoginDeviceTypeService,
    public userService: UserService,
    public paramService: ParamService,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig,
    private router: Router
  ) {
    this.getAllLoginGroup();
    this.getAllLoginDeviceType();
    this.getUsers();
    this.MultipleShift(17);
    this.pagination = <IPagination>{
      CurrentPage: 1,
      ItemsPerPage: 50,
      TotalItems: 0,
      SortBy: null
    };

    let currentDate: Date = new Date();
    this.inputESFromDate = <IInputDateVM>{
      Year: currentDate.getFullYear(),
      Month: currentDate.getMonth() + 1,
      Date: currentDate.getDate(),
    };
    this.inputESFromDateOptions = <IDatePickerOptionsVM>{
      closeOnDateSelect: true,
      minDate: null,
      maxDate: null
    };

    this.userId = localStorage.getItem('UserId');
  }

  ngOnInit() {
    this.selectedId = this.selectedId != null ? this.selectedId : null;
    if (this.selectedId != null) {
      this.isBreadcrumb = false;
      this.showEmployeeShift = true;
    }
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    if (this.refresh == true) {
      if (this.selectedId != null) {
        this.isBreadcrumb = false;
        this.showEmployeeShift = true;
      }
      this.getEmployeeShift(this.selectedId);
      this.selectEmployeeShift();
    }
    //this.selectedId = this.selectedId != null ? this.selectedId : null; 
  }

  //ngOnDestroy() {
  //    this.selectedId = null;
  //}
  public getUsers() {
    var query = "$expand=Employee";
    this.userService.getAll(query).subscribe((data: IUser[]) => {
      this.userList = data;
    })
  }

  public getAllLoginGroup() {
    var query = "$expand=LoginShift";

    this.loginGroupService.getAll(query)
      .subscribe((list: ILoginGroup[]) => {
        this.svloginGroupList = list;
        this.loginGroupList = list;
      });
  }

  public getAllLoginDeviceType() {
    this.loginDeviceTypeService.getAll()
      .subscribe((list: ILoginDeviceType[]) => {
        this.loginDeviceTypeList = list;
      });
  }

  public getEmployeeShift(id: number) {
    this.countForHasMultipleShift = 0;
    let query = "$expand=LoginGroup,LoginDeviceType&$filter=EmployeeId eq " + id;
    let skipCount = (this.pagination.ItemsPerPage * (this.pagination.CurrentPage - 1));
    query += `&$orderby=Status desc&$inlinecount=allpages&$skip=${skipCount}&$top=${this.pagination.ItemsPerPage}`;

    let query1 = "$expand=LoginGroup,LoginDeviceType&$filter=EmployeeId eq " + id;

    this.employeeShiftService.getAll(query1)
      .subscribe((list: IEmployeeShift[]) => {
        this.EmpList = list;
        if (this.showMultipleShiftCheckbox == true) {
          document.getElementById("isMultipleShift").focus();
        }
        this.EmpList.forEach(item => {
          if (item.Status == true) {
            this.countForHasMultipleShift = this.countForHasMultipleShift + 1;
          }
        })
        if (this.countForHasMultipleShift > 1) {
          this.showMultipleShiftEdit = true;
        }
        else {
          this.showMultipleShiftEdit = false;
        }
      });

    this.employeeShiftService.getAll(query)
      .subscribe((list: any) => {
        this.pagination = {
          ItemsPerPage: this.pagination.ItemsPerPage,
          TotalItems: <number>(list["odata.count"]),
          CurrentPage: this.pagination.CurrentPage,
          SortBy: this.pagination.SortBy
        };
        this.EmployeeShiftList = <IEmployeeShiftVM[]>list.value;
        //if (this.EmployeeShiftList.length > 1) {
        //    this.showMultipleShiftEdit = true;
        //}
        this.EmployeeShiftList.forEach(item => {
          let date = new Date(item.FromDate);
          item.InputFromDate = {
            Year: date.getFullYear(),
            Month: date.getMonth() + 1,
            Date: date.getDate()
          };

        })

      });
  }

  public editEmployeeShift(id: number, index: number, employeeId: number) {

    this.EmployeeShiftVM = this.EmployeeShiftList.filter(x => x.Id == id)[0];
    this.EmployeeShiftVMOld = Object.assign({}, this.EmployeeShiftVM);

    let date = new Date(this.EmployeeShiftVM.FromDate);
    this.EmployeeShiftVM.InputFromDate = {
      Year: date.getFullYear(),
      Month: date.getMonth() + 1,
      Date: date.getDate()
    };
    this.updateShift = true;
    this.EmployeeShiftList.splice(index, 1);
  }

  public updateEmployeeShift() {
    this.EmployeeShift.Id = this.EmployeeShiftVMOld.Id;
    this.EmployeeShift.EmployeeId = this.EmployeeShiftVMOld.EmployeeId;
    this.EmployeeShift.GroupId = this.EmployeeShiftVMOld.GroupId;
    this.EmployeeShift.FromDate = this.EmployeeShiftVMOld.FromDate;
    this.EmployeeShift.AutoLogin = this.EmployeeShiftVMOld.AutoLogin;
    this.EmployeeShift.IsOneTimeLogin = this.EmployeeShiftVMOld.IsOneTimeLogin;
    this.EmployeeShift.LoginDeviceId = this.EmployeeShiftVMOld.LoginDeviceId;
    this.EmployeeShift.Status = false;
    this.EmployeeShift.PostedOn = this.EmployeeShiftVMOld.PostedOn;
    this.EmployeeShift.PostedBy = this.EmployeeShiftVMOld.PostedBy;
    this.EmployeeShift.ModifiedBy = this.userId;

    let saveItem: IEmployeeShift = Object.assign({}, this.EmployeeShift);
    this.employeeShiftService.put(saveItem.Id, saveItem)
      .subscribe(() => {
        this.getEmployeeShift(this.employeeId);
        this.updateShift = false;

        var toastOptions: ToastOptions = {
          title: "Edited",
          msg: "Employee Shift has been successfully Updated",
          showClose: true,
          timeout: 5000,
          theme: 'bootstrap'
        };
        this.toastyService.success(toastOptions);
      });
    this.addEmployeeShift();
  }

  public cancelUpdateEmployeeShift() {
    this.disableAL = false;
    this.disableIOTL = false;
    this.disableLDC = false;
    this.updateShift = false;
    this.isAddShift = false;
    this.getEmployeeShift(this.employeeId);
  }

  public update() {
    this.countEnableShift = 0;
    let saveItem: IEmployeeShift = <IEmployeeShift>{};
    this.EmpList = this.EmployeeShiftList;
    this.EmployeeShiftList.forEach(item => {
      if (item.Status == true) {
        this.countEnableShift = this.countEnableShift + 1;
      }
    })
    if (this.countEnableShift == 0) {
      var toastOptions: ToastOptions = {
        title: "Warning",
        msg: "Atleast one Employee Shift must be assigned",
        showClose: true,
        timeout: 5000,
        theme: 'bootstrap'
      };
      this.toastyService.warning(toastOptions);
    }
    else {
      if (this.countEnableShift > 1) {
        this.showMultipleShiftEdit = true;
      }

      if (this.countEnableShift >= 1) {
        this.EmployeeShiftList.forEach(item => {
          saveItem.Id = item.Id;
          saveItem.EmployeeId = item.EmployeeId;
          saveItem.GroupId = item.GroupId;
          saveItem.FromDate = item.FromDate;
          saveItem.AutoLogin = item.AutoLogin;
          saveItem.IsOneTimeLogin = item.IsOneTimeLogin;
          saveItem.LoginDeviceId = item.LoginDeviceId;
          saveItem.Status = item.Status;
          saveItem.PostedOn = item.PostedOn;
          saveItem.PostedBy = item.PostedBy;
          if (item.ModifiedBy != null) {
            saveItem.ModifiedBy = item.ModifiedBy;
          }
          if (this.countEnableShift >= 1) {
            this.employeeShiftService.put(saveItem.Id, saveItem)
              .subscribe(() => {
              });
          }
          //this.getEmployeeShift(saveItem.EmployeeId);
        })
        var toastOptions: ToastOptions = {
          title: "Update",
          msg: "Employee Shift has been successfully updated",
          showClose: true,
          timeout: 5000,
          theme: 'bootstrap'
        };
        this.toastyService.success(toastOptions);
      }
    }

    this.getEmployeeShift(this.employeeId);
    if (this.selectedId != null) {
      this.showEmployeeShift = false;
    }
  }

  public cancelUpdate() {
    this.getEmployeeShift(this.employeeId);
  }

  public addNewEmployeeShift() {
    this.EmployeeShiftVM = <IEmployeeShiftVM>{};
    let currentDate: Date = new Date();
    this.EmployeeShiftVM.InputFromDate = {
      Year: currentDate.getFullYear(),
      Month: currentDate.getMonth() + 1,
      Date: currentDate.getDate()
    };
    this.updateShift = true;
    this.isAddShift = true;
  }

  public addEmployeeShift() {
    if (this.EmployeeShiftVM.FromDate == null) {
      this.EmployeeShiftVM.FromDate = new Date(this.inputESFromDate.Year, this.inputESFromDate.Month - 1, this.inputESFromDate.Date, 5, 45, 0, 0);
    }
    if (this.selectedId != null) {
      this.EmployeeShiftPost.EmployeeId = this.selectedId;
    }
    else {
      this.EmployeeShiftPost.EmployeeId = this.employeeId;
    }
    this.EmployeeShiftPost.GroupId = this.EmployeeShiftVM.GroupId;
    this.EmployeeShiftPost.FromDate = this.EmployeeShiftVM.FromDate;
    this.EmployeeShiftPost.AutoLogin = this.EmployeeShiftVM.AutoLogin;
    this.EmployeeShiftPost.IsOneTimeLogin = this.EmployeeShiftVM.IsOneTimeLogin;
    this.EmployeeShiftPost.LoginDeviceId = this.EmployeeShiftVM.LoginDeviceId;
    this.EmployeeShiftPost.Status = true;
    this.EmployeeShiftPost.PostedBy = this.userId;

    let saveItem: IEmployeeShift = Object.assign({}, this.EmployeeShiftPost);

    this.employeeShiftService.post(saveItem)
      .subscribe(() => {
        this.disableAL = false;
        this.disableIOTL = false;
        this.disableLDC = false;
        this.updateShift = false;
        this.isAddShift = false;
        this.getEmployeeShift(this.EmployeeShiftPost.EmployeeId);

        var toastOptions: ToastOptions = {
          title: "Added",
          msg: "Employee Shift has been successfully Added",
          showClose: true,
          timeout: 5000,
          theme: 'bootstrap'
        };
        this.toastyService.success(toastOptions);
      });
  }

  public onESFromDateEditSelect(selectedDate: IInputDateVM, id?: number) {
    this.inputESFromDate = selectedDate;
    this.EmployeeShiftVM.FromDate = new Date(this.inputESFromDate.Year, this.inputESFromDate.Month - 1, this.inputESFromDate.Date, 5, 45, 0, 0);
    if (this.EmployeeShiftList.filter(x => x.InputFromDate.Year == selectedDate.Year && x.InputFromDate.Month == selectedDate.Month && x.InputFromDate.Date == selectedDate.Date && x.GroupId == this.EmployeeShiftVM.GroupId).length > 0) {
      this.duplicateDate = true;
    }
    else {
      this.duplicateDate = false;
    }
  }

  public onGroupIdChange(event: any) {
    let date = new Date(this.EmployeeShiftVM.FromDate);
    this.EmployeeShiftVM.InputFromDate = {
      Year: date.getFullYear(),
      Month: date.getMonth() + 1,
      Date: date.getDate()
    }

    if (this.EmployeeShiftList.filter(x => x.InputFromDate.Year == this.EmployeeShiftVM.InputFromDate.Year && x.InputFromDate.Month == this.EmployeeShiftVM.InputFromDate.Month && x.InputFromDate.Date == this.EmployeeShiftVM.InputFromDate.Date && x.GroupId == this.EmployeeShiftVM.GroupId).length > 0) {
      this.duplicateDate = true;
    }
    else {
      this.duplicateDate = false;
    }
  }

  getPostedModifyInfo(id: number) {
    let query = "$expand=User,User/Employee,User1,User1/Employee&$filter=Id eq " + id;
    query += "&$select=PostedOn,ModifiedOn,PostedBy,ModifiedBy,User/Id,User1/Id,User/Employee/FirstName,User/Employee/MiddleName,User/Employee/LastName,User1/Employee/FirstName,User1/Employee/MiddleName,User1/Employee/LastName";

    this.employeeShiftService.getAll(query)
      .subscribe((list: IEmployeeShift[]) => {
        this.postedModifiedInfo = <IEmployeeShiftVM[]>list;
        this.postedModifiedInfo.forEach(item => {
          if (item.PostedBy != null) {
            if (item.User.Id == item.PostedBy) {
              item.PostedUserName = "";
              if (item.User.Employee.FirstName != null) {
                item.PostedUserName += item.User.Employee.FirstName + " ";
              }
              if (item.User.Employee.MiddleName != null) {
                item.PostedUserName += item.User.Employee.MiddleName + " ";
              }
              if (item.User.Employee.LastName != null) {
                item.PostedUserName += item.User.Employee.LastName;
              }
            }

          }
          if (item.ModifiedBy != null) {

            if (item.User1.Id == item.ModifiedBy) {
              item.ModifiedUserName = "";
              if (item.User1.Employee.FirstName != null) {
                item.ModifiedUserName += item.User1.Employee.FirstName + " ";
              }
              if (item.User.Employee.MiddleName != null) {
                item.ModifiedUserName += item.User1.Employee.MiddleName + " ";
              }
              if (item.User.Employee.LastName != null) {
                item.ModifiedUserName += item.User1.Employee.LastName;
              }
            }
          }
        })
      });
  }

  public openInfoModal(id: number) {
    this.getPostedModifyInfo(id);
    this.selectedModalLoaded = true;
    if (this.infoModal != undefined) {
      this.infoModal.config.backdrop = false;
    }
    let el = document.createElement('div');
    el.className = 'modal-backdrop fade in';
    document.body.appendChild(el);
    this.infoModal.show();
  }

  public hideInfoModal() {
    document.body.removeChild(document.querySelector('.modal-backdrop'));
    this.infoModal.hide();
    this.selectedModalLoaded = false;
  }

  public selectedEmployee(event: IEmployee) {
    if (event != null) {
      this.employeeId = event.EmployeeId;
      this.getEmployeeShift(event.EmployeeId);
      this.showEmployeeList = true;
    }
    else {
      this.showEmployeeList = false;
    }
  }

  public selectEmployeeShift() {
    this.selectedEmployeeShift.emit(this.EmployeeShiftList);
  }

  public goToEmployee() {
    this.showEmployeeShift = false;
    //this.router.navigateByUrl('layout/employee');        
  }

  public AutoLoginChecked(event: any) {
    if (this.EmployeeShiftVM.AutoLogin == true) {
      this.disableIOTL = true;
      this.disableLDC = true;
    }
    else {
      this.disableIOTL = false;
      this.disableLDC = false;
    }
    this.EmployeeShiftVM.LoginDeviceId = 6;

  }

  public IsOneTimeLoginChecked() {
    if (this.EmployeeShiftVM.IsOneTimeLogin == true) {
      this.disableAL = true;
    }
    else {
      this.disableAL = false;
    }
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

  onPageSelect(pagination: IPagination) {
    this.pagination = pagination;
    this.getEmployeeShift(this.employeeId);
  }
}
