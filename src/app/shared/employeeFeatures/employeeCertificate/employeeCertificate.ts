import { Component, Input } from "@angular/core";
import { IEmployee, IEmployeeCertificate, IInfoCertificate } from "../../../models/Models";
import { EmployeeCertificateService, InfoCertificateService, ParamValueService, UserService } from "../../../services/BaseService";
import { IDatePickerOptionsVM, IInputDateVM } from "../../datepicker/models/datepickerVM";
import { ToastyService, ToastOptions } from "ngx-toasty";

@Component({
    selector: 'employee-certificate',
    templateUrl: 'employeeCertificate.html'
})
export class EmployeeCertificateComponent {
    @Input() empId?: number;
    //@Output() employeeNomineeList: EventEmitter<IEmployeeCertificate[]> = new EventEmitter<IEmployeeCertificate[]>();

    displayECList: IEmployeeCertificate[] = [];
    infoCertificateList: IInfoCertificate[] = [];

    //form variable
    InputEC: IEmployeeCertificate = <IEmployeeCertificate>{};
    formToggle: boolean = false;

    //datepicker variable
    dateOptions: IDatePickerOptionsVM = {
        closeOnDateSelect: true,
        maxDate: null,
        minDate: null
    };

    constructor(
        public userService: UserService,
        private toastyService: ToastyService,
        public ECService: EmployeeCertificateService,
        public infoCertService: InfoCertificateService,
        public pvService: ParamValueService
    ) {
    }

    ngOnInit() {
        this.hasParamAccess();
        this.hasPermToEdit();
    }

    getCertificateName(certId: number) {
        if (this.infoCertificateList.length > 0) {
            return this.infoCertificateList.filter(x => x.CertificateId == certId)[0].CertificateName;
        }
    }

    getInfoCertificate() {
        this.infoCertificateList = [];
        this.displayECList = [];
        this.infoCertService.getAll().subscribe((data: IInfoCertificate[]) => {
            this.infoCertificateList = data;

            if (this.empId == null) {
                this.displayECList = [];
            } else {
                this.getEmployeeCertificates(this.empId);
            }
        });
    }

    getEmployeeCertificates(empId: number) {
        let query: string = `$filter=EmployeeId eq ${empId}`;
        this.displayECList = [];

        this.ECService.getAll(query).subscribe((data: IEmployeeCertificate[]) => {

            this.infoCertificateList.forEach(newItem => {
                if (newItem.IsEnable == true) {
                    let pushItem: IEmployeeCertificate;
                    if (data.filter(x => x.CertificateId == newItem.CertificateId).length == 0) {
                        pushItem = {
                            ID: 0,
                            EmployeeId: empId,
                            CertificateId: newItem.CertificateId,
                            CertificateNo: null,
                            ExpiredDate: newItem.IsExpirable ? new Date() : null,
                            ExpiredDateVM: newItem.IsExpirable ? { Year: new Date().getFullYear(), Month: new Date().getMonth() + 1, Date: new Date().getDate() } : null,
                            Posteby: localStorage.getItem('UserId'),
                            PostedOn: new Date()
                        }

                    } else {
                        pushItem = Object.assign({}, data.filter(x => x.CertificateId == newItem.CertificateId)[0]);
                        if (newItem.IsExpirable) {
                            pushItem.ExpiredDateVM = {
                                Year: new Date(pushItem.ExpiredDate).getFullYear(),
                                Month: new Date(pushItem.ExpiredDate).getMonth() + 1,
                                Date: new Date(pushItem.ExpiredDate).getDate()
                            }
                        }
                    }

                    if (this.displayECList.filter(x => x.CertificateId == pushItem.CertificateId).length == 0) {
                        this.displayECList.push(pushItem);
                    }
                }

            });
        });
    }


    addCertificate() {
        let count: number = 0;
        this.displayECList.forEach(decItem => {
            if (decItem.isEdit == true) {
                let saveItem: IEmployeeCertificate = {
                    ID: decItem.ID,
                    EmployeeId: decItem.EmployeeId,
                    CertificateId: decItem.CertificateId,
                    CertificateNo: decItem.CertificateNo,
                    ExpiredDate: decItem.ExpiredDate,
                    Posteby: localStorage.getItem('UserId'),
                    PostedOn: new Date()
                }

                if (saveItem.ID == 0) {
                    this.ECService.post(saveItem).subscribe(data => {
                        count++;
                        this.showToasty(count);
                    })
                } else {
                    this.ECService.put(saveItem.ID, saveItem).subscribe(data => {
                        count++;
                        this.showToasty(count);
                    })
                }
            }
        });
    }

    showToasty(count: number) {
        if (count == this.displayECList.filter(x => x.isEdit == true).length) {
            var toastOptions: ToastOptions = {
                title: "Success",
                msg: "Employee Certificates has been successfully updated",
                showClose: true,
                timeout: 5000,
                theme: 'bootstrap'
            };
            this.toastyService.success(toastOptions);
        }
    }

    editCertificate(empCert: IEmployeeCertificate) {
        empCert.isEdit = true;
    }

    empty(e: any) {
        e = e.replace(/ /g, '');
        switch (e) {
            case "":
                return false;
            case null:
                return false;
            case false:
                return false;
            case typeof this == "undefined":
                return false;
            default:
                return true;
        }
    }

    deleteCertificate(empCert: IEmployeeCertificate, index: number) {
        if (JSON.stringify(this.displayECList[index]) === JSON.stringify(empCert)) {
            this.displayECList.splice(index, 1);
        }
    }

    dateSelect(inputDate: IInputDateVM, item: IEmployeeCertificate) {
        this.displayECList.forEach(decItem => {
            if (decItem.CertificateId == item.CertificateId) {
                if (JSON.stringify(decItem.ExpiredDateVM) != JSON.stringify(inputDate)) {
                    decItem.isEdit = true;
                }

                decItem.ExpiredDate = new Date(inputDate.Year, inputDate.Month - 1, inputDate.Date, 5, 45, 0);
                decItem.ExpiredDateVM = inputDate;

            }
        });
    }

    reset() {
        this.getInfoCertificate();
    }

    formToggleFunc() {
        this.formToggle = !this.formToggle;
        if (this.formToggle == true) {
            this.reset();
        }
    }

    isAccess: boolean = false;
    hasParamAccess() {
        this.pvService.get('EmpCert').subscribe(data => {
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