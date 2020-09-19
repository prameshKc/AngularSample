import { Component, Input, ViewChild } from "@angular/core";
import { IEmployeeGrievance } from "../../../models/Models";
import { EmployeeGrievanceService, ParamValueService, FetchFileService, UserService } from "../../../services/BaseService";
import { IDatePickerOptionsVM, IInputDateVM } from "../../datepicker/models/datepickerVM";
import { ToastyService, ToastOptions } from "ngx-toasty";
import { DatePickerService } from "../../datepicker/modules/datePickerService";
import { ModalDirective } from "ngx-bootstrap";

@Component({
    selector: 'employee-grievance',
    templateUrl: 'employeeGrievance.html'
})
export class EmployeeGrievanceComponent {
    @Input() empId?: number;
    //@Output() employeeNomineeList: EventEmitter<IEmployeeGrievance[]> = new EventEmitter<IEmployeeGrievance[]>();

    displayECList: IEmployeeGrievance[] = [];
    yearList: number[] = [];

    //form variable
    InputEGriev: IEmployeeGrievance = <IEmployeeGrievance>{};
    tempIconPath: any;
    GrievCert: any;
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
        public ECService: EmployeeGrievanceService,
        public dateFunction: DatePickerService,
        public pvService: ParamValueService,
        public fetchFileService: FetchFileService
    ) {
    }

    ngOnInit() {
        this.hasParamAccess();
        this.hasPermToEdit();
        this.initialize();
    }

    initialize() {
        if (this.empId != null) {
            this.getEmployeeGrievances(this.empId);
            this.setInputEGriev();
            this.StartDTVM = { Year: new Date().getFullYear(), Month: new Date().getMonth() + 1, Date: new Date().getDate() };
            this.EndDTVM = { Year: new Date().getFullYear(), Month: new Date().getMonth() + 1, Date: new Date().getDate() };
        }
    }

    setInputEGriev() {
        this.InputEGriev = {
            Id: 0,
            EmployeeId: this.empId,
            Name: null,
            Code: null,
            NatureOfGrievance: null,
            Description: null,
            AdditionalInfo: null,
            Doc: null,
            PostedBy: localStorage.getItem('UserId'),
            PostedOn: new Date()
        }
        this.GrievCert = null;
    }

    getEmployeeGrievances(empId: number) {
        let query: string = `$filter=EmployeeId eq ${empId}`;
        this.displayECList = [];
        this.ECService.getAll(query).subscribe((data: IEmployeeGrievance[]) => {
            this.displayECList = data;
        });
    }

    addGrievance() {
        if (this.empId) {
            let saveItem: IEmployeeGrievance = {
                Id: this.InputEGriev.Id,
                EmployeeId: this.empId,
                Name: this.InputEGriev.Name,
                Code: this.InputEGriev.Code,
                NatureOfGrievance: this.InputEGriev.NatureOfGrievance,
                Description: this.InputEGriev.Description,
                AdditionalInfo: this.InputEGriev.AdditionalInfo,
                Doc: this.InputEGriev.Doc,
                PostedBy: localStorage.getItem('UserId'),
                PostedOn: new Date()
            }
            this.isUploading = true;
            if (saveItem.Id == 0) {
                this.ECService.post(saveItem).subscribe(() => {
                    this.setInputEGriev();
                    this.showToasty();
                    this.isUploading = false;
                }, () => {
                    this.isUploading = false;
                })
            } else {
                this.ECService.put(saveItem.Id, saveItem).subscribe(() => {
                    this.setInputEGriev();
                    this.showToasty();
                    this.isUploading = false;
                }, () => {
                    this.isUploading = false;
                })
            }
        }
    }

    onFileChange(evt: any) {
        var files = evt.target.files;
        var file = files[0];
        var that = this;
        if (files && file) {
            if (file.type != 'application/pdf') {
                this.isValidFile = 'Only pdf files are accepted.';
            } else {
                var size = file.size * (4 / 3);
                if (size >= 4500000) {
                    this.isValidFile = 'Maximum file size exceeded.';
                } else {
                    this.isValidFile = null;
                    var reader = new FileReader();
                    reader.onload = function () {
                        var base64textString = btoa(JSON.stringify(this.result));
                        that.InputEGriev.Doc = base64textString;
                    };
                    reader.readAsBinaryString(file);
                }
            }
        }
    }

    showToasty() {
        var toastOptions: ToastOptions = {
            title: "Success",
            msg: "Employee Grievances has been successfully updated",
            showClose: true,
            timeout: 5000,
            theme: 'bootstrap'
        };
        this.toastyService.success(toastOptions);
        this.initialize();
    }

    editGrievance(empCert: IEmployeeGrievance) {
        var that = this;
        this.InputEGriev = Object.assign({}, empCert);

        this.fetchFileService.getPdfFile(empCert.Doc).subscribe(data => {
            this.isValidFile = null;
            var reader = new FileReader();
            reader.onload = function () {
                var base64textString = btoa(JSON.stringify(this.result));
                that.InputEGriev.Doc = base64textString;
            };
            reader.readAsBinaryString(data);
        })
    }

    dateSelect(inputDate: IInputDateVM, flag: string) {
        this.InputEGriev[flag] = new Date(inputDate.Year, inputDate.Month - 1, inputDate.Date, 5, 45, 0);
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
        this.pvService.get('EmpGriev').subscribe(data => {
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
