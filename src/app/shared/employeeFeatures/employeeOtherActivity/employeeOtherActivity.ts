import { Component, Input, ViewChild } from "@angular/core";
import { IEmployeeOtherActivity } from "../../../models/Models";
import { EmployeeOtherActivityService, ParamValueService, UserService } from "../../../services/BaseService";
import { IDatePickerOptionsVM, IInputDateVM } from "../../datepicker/models/datepickerVM";
import { ToastyService, ToastOptions } from "ngx-toasty";
import { DatePickerService } from "../../datepicker/modules/datePickerService";
import { ModalDirective } from "ngx-bootstrap";

@Component({
    selector: 'employee-other-activity',
    templateUrl: 'employeeOtherActivity.html'
})
export class EmployeeOtherActivityComponent {
    @Input() empId?: number;
    //@Output() employeeNomineeList: EventEmitter<IEmployeeOtherActivity[]> = new EventEmitter<IEmployeeOtherActivity[]>();

    displayECList: IEmployeeOtherActivity[] = [];
    yearList: number[] = [];

    //form variable
    InputEOA: IEmployeeOtherActivity = <IEmployeeOtherActivity>{};
    tempIconPath: any;
    OACert: any;
    formToggle: boolean = false;
    isUploading: boolean = false;
    isValidFile?: string;

    //datepicker variable
    StartDTVM: IInputDateVM;
    EndDTVM: IInputDateVM;
    dateOptions: IDatePickerOptionsVM = {
        closeOnDateSelect: true,
        maxDate: null,
        minDate: null
    };

    constructor(
        public userService: UserService,
        private toastyService: ToastyService,
        public ECService: EmployeeOtherActivityService,
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
            this.getEmployeeOtherActivitys(this.empId);
            this.setInputEOA();
            this.StartDTVM = { Year: new Date().getFullYear(), Month: new Date().getMonth() + 1, Date: new Date().getDate() };
            this.EndDTVM = { Year: new Date().getFullYear(), Month: new Date().getMonth() + 1, Date: new Date().getDate() };
        }
    }

    setInputEOA() {
        this.InputEOA = {
            RowId: 0,
            EmployeeId: this.empId,
            SpecialAbility: null,
            Interest: null,
            Remarks: null,
            Reference: null,
            PostedBy: localStorage.getItem('UserId'),
            PostedOn: new Date()
        }
        this.OACert = null;
    }

    getEmployeeOtherActivitys(empId: number) {
        let query: string = `$select=RowId,EmployeeId,SpecialAbility,Interest,Remarks,Reference,PostedBy,PostedOn&$filter=EmployeeId eq ${empId}`;
        this.displayECList = [];
        this.ECService.getAll(query).subscribe((data: IEmployeeOtherActivity[]) => {
            this.displayECList = data;
        });
    }

    addOtherActivity() {
        if (this.empId) {
            let saveItem: IEmployeeOtherActivity = {
                RowId: this.InputEOA.RowId,
                EmployeeId: this.empId,
                SpecialAbility: this.InputEOA.SpecialAbility,
                Interest: this.InputEOA.Interest,
                Remarks: this.InputEOA.Remarks,
                Reference: this.InputEOA.Reference,
                PostedBy: localStorage.getItem('UserId'),
                PostedOn: new Date()
            }
            this.isUploading = true;
            if (saveItem.RowId == 0) {
                this.ECService.post(saveItem).subscribe(() => {
                    this.setInputEOA();
                    this.showToasty();
                    this.isUploading = false;
                }, () => {
                    this.isUploading = false;
                })
            } else {
                this.ECService.put(saveItem.RowId, saveItem).subscribe(() => {
                    this.setInputEOA();
                    this.showToasty();
                    this.isUploading = false;
                }, () => {
                    this.isUploading = false;
                })
            }
        }
    }

    showToasty() {
        var toastOptions: ToastOptions = {
            title: "Success",
            msg: "Employee OtherActivitys has been successfully updated",
            showClose: true,
            timeout: 5000,
            theme: 'bootstrap'
        };
        this.toastyService.success(toastOptions);
        this.initialize();
    }

    editOtherActivity(empCert: IEmployeeOtherActivity) {
        this.InputEOA = Object.assign({},empCert);
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
        this.ECService.delete(this.deleteId).subscribe(() => {
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
        this.pvService.get('EmpOA').subscribe(data => {
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
