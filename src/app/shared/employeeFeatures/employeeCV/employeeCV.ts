import { Component, Input, ViewChild } from "@angular/core";
import { IEmployeeCV } from "../../../models/Models";
import { EmployeeCVService, ParamValueService, FetchFileService, UserService } from "../../../services/BaseService";
import { IDatePickerOptionsVM } from "../../datepicker/models/datepickerVM";
import { ToastyService, ToastOptions } from "ngx-toasty";
import { DatePickerService } from "../../datepicker/modules/datePickerService";
import { ModalDirective } from "ngx-bootstrap";

@Component({
    selector: 'employee-cv',
    templateUrl: 'employeeCV.html'
})
export class EmployeeCVComponent {
    @Input() empId?: number;
    //@Output() employeeNomineeList: EventEmitter<IEmployeeCV[]> = new EventEmitter<IEmployeeCV[]>();
  @ViewChild('deleteModal', { static: false }) public deleteModal: ModalDirective;

    //global variables
    displayECList: IEmployeeCV[] = [];
    yearList: number[] = [];

    //form variable
    InputEEdu: IEmployeeCV = <IEmployeeCV>{};
    tempIconPath: any;
    eduCert: any;
    formToggle: boolean = false;
    isUploading: boolean = false;
    isValidFile?: string;

    //datepicker variable
    dateOptions: IDatePickerOptionsVM = {
        closeOnDateSelect: true,
        maxDate: null,
        minDate: null
    };

    constructor(
        public userService: UserService,
        private toastyService: ToastyService,
        public ECService: EmployeeCVService,
        public dateFunction: DatePickerService,
        public pvService: ParamValueService,
        public fetchFileService: FetchFileService
    ) {
    }

    ngOnInit() {
        this.initialize();
    }


    initialize() {
        this.hasParamAccess();
        this.hasPermToEdit();
        if (this.empId != null) {
            this.getEmployeeCVs(this.empId);
            this.setInputEEdu();
        }
    }

    setInputEEdu() {
        this.InputEEdu = {
            EmployeeId: this.empId,
            CVDoc: null,
        }
        this.eduCert = null;
    }

    getEmployeeCVs(empId: number) {
        let query: string = `$filter=EmployeeId eq ${empId}`;
        this.displayECList = [];

        this.ECService.getAll(query).subscribe((data: IEmployeeCV[]) => {
            this.displayECList = data;
        });
    }

    addCV() {
        if (this.empId) {
            let saveItem: IEmployeeCV = {
                EmployeeId: this.empId,
                CVDoc: this.InputEEdu.CVDoc
            }
            this.isUploading = true;
            if (this.displayECList.length == 0) {
                this.ECService.post(saveItem).subscribe(data => {
                    this.setInputEEdu();
                    this.showToasty();
                    this.isUploading = false;
                }, (er) => {
                    this.isUploading = false;
                })
            } else {
                this.ECService.put(saveItem.EmployeeId, saveItem).subscribe(data => {
                    this.setInputEEdu();
                    this.showToasty();
                    this.isUploading = false;
                }, (er) => {
                    this.isUploading = false;
                })
            }
        } else {
            alert('I need that employee id....');
        }
    }

    onFileChange(item: any, evt: any) {
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
                        var base64textString = btoa(this.result.toString());
                        that.InputEEdu.CVDoc = base64textString;
                    };
                    reader.readAsBinaryString(file);
                }
            }
        }
    }

    showToasty() {
        var toastOptions: ToastOptions = {
            title: "Success",
            msg: "Employee CVs has been successfully updated",
            showClose: true,
            timeout: 5000,
            theme: 'bootstrap'
        };
        this.toastyService.success(toastOptions);
        this.initialize();
    }

    editCV(empCert: IEmployeeCV) {
        this.InputEEdu = Object.assign({}, empCert);
        var that = this;
        this.fetchFileService.getPdfFile(empCert.CVDoc).subscribe(data => {
            this.isValidFile = null;
            var reader = new FileReader();
            reader.onload = function () {
                var base64textString = btoa(this.result.toString());
                that.InputEEdu.CVDoc = base64textString;
            };
            reader.readAsBinaryString(data);
        })
    }

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
        this.pvService.get('EmpEdu').subscribe(data => {
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
