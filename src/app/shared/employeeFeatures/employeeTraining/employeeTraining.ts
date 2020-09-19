import { Component, Input, ViewChild } from "@angular/core";
import { IEmployeeTraining } from "../../../models/Models";
import { EmployeeTrainingService, ParamValueService, FetchFileService, UserService } from "../../../services/BaseService";
import { IDatePickerOptionsVM, IInputDateVM } from "../../datepicker/models/datepickerVM";
import { ToastyService, ToastOptions } from "ngx-toasty";
import { DatePickerService } from "../../datepicker/modules/datePickerService";
import { ModalDirective } from "ngx-bootstrap";

@Component({
    selector: 'employee-training',
    templateUrl: 'employeeTraining.html',
})
export class EmployeeTrainingComponent {
    @Input() empId?: number;
    //@Output() employeeNomineeList: EventEmitter<IEmployeeTraining[]> = new EventEmitter<IEmployeeTraining[]>();

    displayECList: IEmployeeTraining[] = [];
    yearList: number[] = [];

    //form variable
    InputETrn: IEmployeeTraining = <IEmployeeTraining>{};
    tempIconPath: any;
    TrnCert: any;
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
        public ECService: EmployeeTrainingService,
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
            this.getEmployeeTrainings(this.empId);
            this.setInputETrn();
            this.StartDTVM = { Year: new Date().getFullYear(), Month: new Date().getMonth() + 1, Date: new Date().getDate() };
            this.EndDTVM = { Year: new Date().getFullYear(), Month: new Date().getMonth() + 1, Date: new Date().getDate() };
        }
    }

    setInputETrn() {
        this.InputETrn = {
            Id: 0,
            EmployeeId: this.empId,
            TName: null,
            Institution: null,
            StartDT: new Date(),
            EndDT: new Date(),
            SponsoredBy: null,
            TDOC: null,
            PostedBy: localStorage.getItem('UserId'),
            PostedOn: new Date()
        }
        this.TrnCert = null;
    }

    getEmployeeTrainings(empId: number) {
        let query: string = `$filter=EmployeeId eq ${empId}`;
        this.displayECList = [];
        this.ECService.getAll(query).subscribe((data: IEmployeeTraining[]) => {
            this.displayECList = data;
        });
    }

    getTrnDoc(Id: number) {
        let query: string = `$select=TDOC`;
        this.ECService.get(Id, query).subscribe((data: IEmployeeTraining) => {
            if (data.TDOC == null) {
                var toastOptions: ToastOptions = {
                    title: "Error",
                    msg: "Sorry, no document found.",
                    showClose: true,
                    timeout: 5000,
                    theme: 'bootstrap'
                };
                this.toastyService.error(toastOptions);
            } else {
                this.urltoFile(`data:application/pdf;base64,${data.TDOC}`, 'download.pdf', 'application/pdf')
                    .then(function (file) {
                        console.log(file);

                        // create a download anchor tag
                        var downloadLink = document.createElement('a');
                        downloadLink.target = '_blank';
                        downloadLink.download = 'download.pdf';

                        // convert downloaded data to a Blob
                        var blob = file;

                        // create an object URL from the Blob
                        var URL = window.URL;
                        var downloadUrl = URL.createObjectURL(blob);

                        // set object URL as the anchor's href
                        downloadLink.href = downloadUrl;

                        // append the anchor to document body
                        document.body.appendChild(downloadLink);

                        // fire a click event on the anchor
                        downloadLink.click();

                        // cleanup: remove element and revoke object URL
                        document.body.removeChild(downloadLink);
                        URL.revokeObjectURL(downloadUrl);
                    });
            }
        });
    }

    //return a promise that resolves with a File instance
    urltoFile(url, filename, mimeType) {
        return (fetch(url)
            .then(function (res) { return res.arrayBuffer(); })
            .then(function (buf) { return new File([buf], filename, { type: mimeType }); })
        );
    }

    addTraining() {
        if (this.empId) {
            let saveItem: IEmployeeTraining = {
                Id: this.InputETrn.Id,
                EmployeeId: this.empId,
                TName: this.InputETrn.TName,
                Institution: this.InputETrn.Institution,
                StartDT: this.InputETrn.StartDT,
                EndDT: this.InputETrn.EndDT,
                SponsoredBy: this.InputETrn.SponsoredBy,
                TDOC: this.InputETrn.TDOC,
                PostedBy: localStorage.getItem('UserId'),
                PostedOn: new Date()
            }
            this.isUploading = true;
            if (saveItem.Id == 0) {
                this.ECService.post(saveItem).subscribe(() => {
                    this.setInputETrn();
                    this.showToasty();
                    this.isUploading = false;
                }, () => {
                    this.isUploading = false;
                })
            } else {
                this.ECService.put(saveItem.Id, saveItem).subscribe(() => {
                    this.setInputETrn();
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
                if (size >= 2000000) {
                    this.isValidFile = 'Maximum file size exceeded.';
                } else {
                    this.isValidFile = null;
                    var reader = new FileReader();
                    reader.onload = function () {
                        var base64textString = btoa(JSON.stringify(this.result));
                        that.InputETrn.TDOC = base64textString;
                    };
                    reader.readAsBinaryString(file);
                }
            }
        }
    }

    showToasty() {
        var toastOptions: ToastOptions = {
            title: "Success",
            msg: "Employee Trainings has been successfully updated",
            showClose: true,
            timeout: 5000,
            theme: 'bootstrap'
        };
        this.toastyService.success(toastOptions);
        this.initialize();
    }

    editTraining(empCert: IEmployeeTraining) {
        this.InputETrn = Object.assign({}, empCert);
        var that = this;
        this.fetchFileService.getPdfFile(empCert.TDOC).subscribe(data => {
            this.isValidFile = null;
            var reader = new FileReader();
            reader.onload = function () {
                var base64textString = btoa(JSON.stringify(this.result));
                that.InputETrn.TDOC = base64textString;
            };
            reader.readAsBinaryString(data);
        })
        this.StartDTVM = { Year: new Date(empCert.StartDT).getFullYear(), Month: new Date(empCert.StartDT).getMonth() + 1, Date: new Date(empCert.StartDT).getDate() };
        this.EndDTVM = { Year: new Date(empCert.EndDT).getFullYear(), Month: new Date(empCert.EndDT).getMonth() + 1, Date: new Date(empCert.EndDT).getDate() };
    }

    dateSelect(inputDate: IInputDateVM, flag: string) {
        this.InputETrn[flag] = new Date(inputDate.Year, inputDate.Month - 1, inputDate.Date, 5, 45, 0);
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
        this.pvService.get('EmpTrn').subscribe(data => {
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
