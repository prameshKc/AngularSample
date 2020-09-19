import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from "@angular/core";
import { IEmployeeContract, IEmployeeContractRenew } from "../../models/Models";
import { EmployeeContractService, EmployeeContractAPIService } from "../../services/BaseService";
import { IDatePickerOptionsVM, IInputDateVM } from "../datepicker/models/datepickerVM";
import { ToastOptions, ToastyService } from "ngx-toasty";

@Component({
    selector: 'employee-contract',
    templateUrl: './employeeContract.html'
})
export class EmployeeContractComponent implements OnChanges {
    @Input() empId?: number;
    @Output() employeeContract: EventEmitter<IEmployeeContract> = new EventEmitter<IEmployeeContract>();

    displayECList: IEmployeeContractRenew[] = [];
    isPosted: boolean = false;
    isValidFile: string = null;
    eduCert: any;

    //form variable
    svData: IEmployeeContract;
    InputEC: IEmployeeContract = <IEmployeeContract>{};
    InputECRenew: IEmployeeContractRenew = <IEmployeeContractRenew>{};

    InputECCD: IInputDateVM;
    InputECED: IInputDateVM;
    InputECRenewCD: IInputDateVM;
    InputECRenewED: IInputDateVM;


    //datepicker variables
    defaultDateOpts: IDatePickerOptionsVM = <IDatePickerOptionsVM>{};

    constructor(
        public ECService: EmployeeContractService,
        public ECAPIService: EmployeeContractAPIService,
        public toastyService: ToastyService
    ) {
        this.InputEC.ContractDate = new Date();
        this.InputEC.ExpiryDate = new Date();
        this.InputECCD = this.getDateFormat(this.InputEC.ContractDate);
        this.InputECED = this.getDateFormat(this.InputEC.ExpiryDate);
        this.initialize();
    }

    initialize() {
        this.eduCert = null;
        this.InputECRenew.AmendOn = new Date();
        this.InputECRenew.ExpiryDate = new Date();
        this.InputECRenewCD = this.getDateFormat(this.InputECRenew.AmendOn);
        this.InputECRenewED = this.getDateFormat(this.InputECRenew.ExpiryDate);
    }

    getDateFormat(date: Date): IInputDateVM {
        return <IInputDateVM>{
            Year: date.getFullYear(),
            Month: date.getMonth() + 1,
            Date: date.getDate()
        }
    }

    getDate(date: IInputDateVM): Date {
        return new Date(date.Year, date.Month - 1, date.Date, 5, 45, 0, 0);
    }

    ngOnChanges(changes: SimpleChanges) {
        this.eduCert = null;
        if (this.empId == null) {
            this.displayECList = [];
        } else {
            this.getEmployeeContract(this.empId);
        }
    }

    getEmployeeContract(empId: number) {
        this.displayECList = [];

        this.ECService.getAll(`$filter=EmployeeId eq ${empId}`).subscribe((singleResult: IEmployeeContract[]) => {
            if (singleResult.length > 0) {
                this.InputEC = singleResult[0];
                this.svData = Object.assign({}, singleResult[0]);
            } else {
                this.svData = null;
                this.InputEC = <IEmployeeContract>{};
            }

            this.ECAPIService.GetEmployeeContract(empId).subscribe((data: IEmployeeContractRenew[]) => {
                if (data.length > 0) {
                    this.displayECList = data;

                    this.InputECRenew = <IEmployeeContractRenew>{
                        ECRowId: this.svData.ECRowId,
                        AmendOn: this.svData.ContractEndOn,
                        ExpiryDate: this.svData.ContractEndOn
                    }
                }

                //if (this.svData.ContractEndOn) {
                //    let newEOD = new Date(this.svData.ContractEndOn);
                //    this.InputECRenewCD = this.getDateFormat(newEOD);
                //    this.InputECRenewED = this.getDateFormat(newEOD);
                //}
            });
        })

    }

    dateSelect(date: IInputDateVM, flag: string) {
        if (flag == "ContractDate") {
            this.InputECCD = date;
            this.InputEC.ContractDate = this.getDate(date);
        }
        if (flag == "ExpiryDate") {
            this.InputECED = date;
            this.InputEC.ExpiryDate = this.getDate(date);
        }
        this.emitContract();
    }

    dateSelectRenew(date: IInputDateVM, flag: string) {
        if (flag == "AmendOn") {
            this.InputECRenewCD = date;
            this.InputECRenew.AmendOn = this.getDate(date);
        }
        if (flag == "ExpiryDate") {
            this.InputECRenewED = date;
            this.InputECRenew.ExpiryDate = this.getDate(date);
        }
    }

    onFileChangeRenew(evt: any) {
        var files = evt.target.files;
        var file = files[0];
        var that = this;
        if (files && file) {
            if (file.type != 'application/pdf') {
                this.isValidFile = 'Only pdf files are accepted.';
            } else {
                var size = file.size * (4 / 3);
                console.log(size);
                if (size >= 4500000) {
                    this.isValidFile = 'Maximum file size exceeded.';
                } else {
                    this.isValidFile = null;
                    var reader = new FileReader();
                    reader.onload = function () {
                        var base64textString = btoa(JSON.stringify(this.result));
                        that.InputECRenew.Image = base64textString;
                    };
                    reader.readAsBinaryString(file);
                }
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
                console.log(size);
                if (size >= 4500000) {
                    this.isValidFile = 'Maximum file size exceeded.';
                } else {
                    this.isValidFile = null;
                    var reader = new FileReader();
                    reader.onload = function () {
                        var base64textString = btoa(JSON.stringify(this.result));
                        that.InputEC.ContractImage = base64textString;
                    };
                    reader.readAsBinaryString(file);
                }
            }
        }
    }

    emitContract() {
        if (this.empId != null) {
            this.employeeContract.emit(this.InputEC);
        }

        this.isPosted = false;
    }

    submitToDatabase() {
        let saveObj: IEmployeeContract = {
            ECRowId: 0,
            EmployeeId: this.empId,
            ContractDate: this.getDate(this.InputECCD),
            ExpiryDate: this.getDate(this.InputECED),
            ContractNo: this.InputEC.ContractNo,
            ContractImage: this.InputEC.ContractImage,
            ContractEndOn: null,
            ContractId: 0,
            JobDescription: this.InputEC.JobDescription,
            PostedOn: new Date(),
            PostedBy: 1
        }

        this.ECAPIService.SaveContract(saveObj).subscribe((data: boolean) => {
            if (data == true) {
                var toastOptions: ToastOptions = {
                    title: "Contract Posted Successfully",
                    msg: "Employee Contract has been successfully Added.",
                    showClose: true,
                    timeout: 5000,
                    theme: 'bootstrap'
                };
                this.toastyService.success(toastOptions);
                this.getEmployeeContract(this.empId);
                this.isPosted = true;
            } else {
                this.isPosted = false;
            }
        })
    }

    renewContract() {
        let saveObj: IEmployeeContractRenew = {
            ECARowId: 0,
            ECRowId: this.svData.ECRowId,
            AmendOn: this.getDate(this.InputECRenewCD),
            ExpiryDate: this.getDate(this.InputECRenewED),
            Remarks: this.InputECRenew.Remarks,
            Image: this.InputECRenew.Image,
            PostedOn: new Date(),
            PostedBy: 1
        }

        this.ECAPIService.SaveRenewContract(saveObj).subscribe((data: boolean) => {
            if (data == true) {
                var toastOptions: ToastOptions = {
                    title: "Contract Renew Success",
                    msg: "Employee Contract has been successfully Updated",
                    showClose: true,
                    timeout: 5000,
                    theme: 'bootstrap'
                };
                this.initialize();
                this.toastyService.success(toastOptions);
                this.getEmployeeContract(this.empId);

            }
        })
    }

}