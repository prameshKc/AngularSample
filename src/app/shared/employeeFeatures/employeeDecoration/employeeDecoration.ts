import { Component, Input, ViewChild } from "@angular/core";
import { IEmployee, IEmployeeDecoration } from "../../../models/Models";
import { EmployeeDecorationService, ParamValueService, UserService } from "../../../services/BaseService";
import { IDatePickerOptionsVM, IInputDateVM, IDateVM } from "../../datepicker/models/datepickerVM";
import { ToastyService, ToastOptions } from "ngx-toasty";
import { DatePickerService } from "../../datepicker/modules/datePickerService";
import { DomSanitizer } from "@angular/platform-browser";
import { ModalDirective } from "ngx-bootstrap";

@Component({
    selector: 'employee-decoration',
    templateUrl: 'employeeDecoration.html'
})
export class EmployeeDecorationComponent {
    @Input() empId?: number;

    displayECList: IEmployeeDecoration[] = [];
    yearList: number[] = [];

    //form variable
    InputEDeco: IEmployeeDecoration = <IEmployeeDecoration>{};
    formToggle: boolean = false;
    isUploading: boolean = false;
    isValidFile?: string;

    //datepicker variable
    TDateVM: IInputDateVM;
    dateOptions: IDatePickerOptionsVM = {
        closeOnDateSelect: true,
        maxDate: null,
        minDate: null
    };

    constructor(
        public userService: UserService,
        private toastyService: ToastyService,
        public ECService: EmployeeDecorationService,
        public dateFunction: DatePickerService,
        public pvService: ParamValueService
    ) {
    }

    ngOnInit() {
        this.hasParamAccess();
        this.hasPermToEdit();
        this.initialize();
    }

    initialize() {
        if (this.empId != null) {
            this.getEmployeeDecorations(this.empId);
            this.setInputEDeco();
            this.TDateVM = { Year: new Date().getFullYear(), Month: new Date().getMonth() + 1, Date: new Date().getDate() };
        }
    }

    setInputEDeco() {
        this.InputEDeco = {
            RowId: 0,
            EmployeeId: this.empId,
            Description: null,
            TDate: new Date(),
            PostedBy: localStorage.getItem('UserId'),
            PostedOn: new Date()
        }
    }

    getEmployeeDecorations(empId: number) {
        let query: string = `$select=RowId,EmployeeId,Description,TDate,PostedBy,PostedOn&$filter=EmployeeId eq ${empId}`;
        this.displayECList = [];
        this.ECService.getAll(query).subscribe((data: IEmployeeDecoration[]) => {
            this.displayECList = data;
        });
    }

    addDecoration() {
        if (this.empId) {
            let saveItem: IEmployeeDecoration = {
                RowId: this.InputEDeco.RowId,
                EmployeeId: this.empId,
                Description: this.InputEDeco.Description,
                TDate: this.InputEDeco.TDate,
                PostedBy: localStorage.getItem('UserId'),
                PostedOn: new Date()
            }
            this.isUploading = true;
            if (saveItem.RowId == 0) {
                this.ECService.post(saveItem).subscribe(data => {
                    this.setInputEDeco();
                    this.showToasty();
                    this.isUploading = false;
                }, (er) => {
                    this.isUploading = false;
                })
            } else {
                this.ECService.put(saveItem.RowId, saveItem).subscribe(data => {
                    this.setInputEDeco();
                    this.showToasty();
                    this.isUploading = false;
                }, (er) => {
                    this.isUploading = false;
                })
            }
        }
    }

    showToasty() {
        var toastOptions: ToastOptions = {
            title: "Success",
            msg: "Employee Decorations has been successfully updated",
            showClose: true,
            timeout: 5000,
            theme: 'bootstrap'
        };
        this.toastyService.success(toastOptions);
        this.initialize();
    }

    editDecoration(empCert: IEmployeeDecoration) {
        this.InputEDeco = Object.assign({}, empCert);

        this.TDateVM = { Year: new Date(empCert.TDate).getFullYear(), Month: new Date(empCert.TDate).getMonth() + 1, Date: new Date(empCert.TDate).getDate() };
    }

    dateSelect(inputDate: IInputDateVM, flag: string) {
        this.InputEDeco[flag] = new Date(inputDate.Year, inputDate.Month - 1, inputDate.Date, 5, 45, 0);
        this[`${flag}VM`] = inputDate;
    }

  @ViewChild('deleteModal', { static: false }) public deleteModal: ModalDirective;
    deleteId: number;
    deleteModalLoaded: boolean
    /**
     * to open delete modal
     */
    public openDeleteModal(Id: number) {
        this.deleteId = Id;
        this.deleteModalLoaded = true;
        this.deleteModal.show();
    }
    /**
     * to hide delete modal
     */
    public hideDeleteChildModal(): void {
        this.deleteModal.hide();
    }
    delete() {
        this.ECService.delete(this.deleteId).subscribe(data => {
            this.showToasty();
            this.deleteId = null;
            this.deleteModal.hide();
        })
    }

    formToggleFunc() {
        this.formToggle = !this.formToggle;
        if (this.formToggle == true) {
            this.initialize();
        }
    }

    isAccess: boolean = false;
    hasParamAccess() {
        this.pvService.get('EmpDeco').subscribe(data => {
            if (data.PValue == 'true') {
                this.isAccess = true;
            } else {
                this.isAccess = false;
            }
        })
    }

    isEditAccess: boolean = false;
    editAccessParam: string = '#/layout/AFEA';
    hasPermToEdit() {
        let userId: string = localStorage.getItem('UserId');
        let query: string = `$select=MenuTemplate/MenuVsTemplate/Menu/*&$expand=MenuTemplate/MenuVsTemplate/Menu`;
        this.isEditAccess = false;
        this.userService.get(userId, query).subscribe(data => {
            if (data != null) {
                if (data.MenuTemplate.MenuVsTemplate.length > 0) {
                    if (data.MenuTemplate.MenuVsTemplate.filter(x => x.Menu.Url == this.editAccessParam).length > 0) {
                        this.isEditAccess = true;
                    }
                }
            }
        })
    }
}
