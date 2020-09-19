import { Component, Injectable, ViewChild, Input, Output, SimpleChange, EventEmitter } from '@angular/core';
import {
    GtnUnitService, GtnJobCodeService, FiscalYearService,
    CommonService
} from '../../services/BaseService';
import {
    IGtnUnit, IGtnJobCode,
} from '../../models/Models';
import { IFgetFiscialyearID_Result } from '../../models/ViewModels';

import { ModalDirective } from 'ngx-bootstrap'
import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';

@Component({
    selector: 'GtnUnit',
    templateUrl: 'gtnUnit.component.html'
})
export class GtnUnitComponent {
    @Input() userId: string;
    @Input() showUnitDetail: boolean = false;
    @Input() unitId: number;
    @Input() deptId: number;
    @Input() deptCode: string;
    isAddUnit: boolean = false;
    isEditUnit: boolean = false;
    isAddEditToggle: boolean = false;
    unitList: IGtnUnit[] = [];
    InputUnit: IGtnUnit = <IGtnUnit>{};
    InputJobCode: IGtnJobCode = <IGtnJobCode>{};
    FiscalYearDetail: IFgetFiscialyearID_Result[] = [];
    FYCode: string;

    //Unit Modal
  @ViewChild('unitModal', { static: false }) public unitModal: ModalDirective
  @ViewChild('modal', { static: false })
    ModalDirective: any;
    selectedModalLoaded: boolean = false;

    toggleSort: boolean = false;
    duplicateCode: boolean = false;
    duplicateName: boolean = false;
    validDigit: boolean = false;

    constructor(
        private unitService: GtnUnitService,
        private jobCodeService: GtnJobCodeService,
        private fiscalYearService: FiscalYearService,
        private commonService: CommonService,
        private toastyService: ToastyService,
        private toastyConfig: ToastyConfig
    ) {
        this.getFiscalYear();
    }

    ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    }

    //post
    //openModal
    public openUnitModal() {
        this.InputUnit.Visibility = true;
        this.isAddUnit = true;
        this.isEditUnit = false;
        this.selectedModalLoaded = true;
        this.unitModal.show();
    }

    public hideUnitModal() {
        this.isAddUnit = false;
        this.isEditUnit = false;
        this.isAddEditToggle = false;
        this.InputUnit = <IGtnUnit>{};
        this.selectedModalLoaded = false;
        this.unitModal.hide();
    }

    public saveUnit() {
        if (this.InputUnit.Visibility != true) {
            this.InputUnit.Visibility = false;
        }
        this.InputUnit.DepartmentID = this.deptId;
        this.InputUnit.PostedBy = this.userId;
        let saveItem: IGtnUnit = Object.assign({}, this.InputUnit);
        this.unitService.post(saveItem)
            .subscribe(() => {
                this.InputUnit = <IGtnUnit>{};
                this.isAddEditToggle = false;
                this.selectedModalLoaded = false;
                this.hideUnitModal();
                this.saveJobCode(saveItem.UnitCode).then((data) => {
                    if (data == true) {
                        var toastOptions: ToastOptions = {
                            title: "Success",
                            msg: "Unit has been successfully Added and Job Code is Created",
                            showClose: true,
                            timeout: 5000,
                            theme: 'bootstrap'
                        };
                        this.toastyService.success(toastOptions);
                    }
                });

            });
    }

    //EditModal
    openEditModal() {
        this.isEditUnit = true;
        this.isAddUnit = false;
        this.selectedModalLoaded = true;
        this.unitModal.show();
    }

    //getOne
    public getUnit(id: number) {
        this.unitService.get(id)
            .subscribe((one: IGtnUnit) => {
                this.InputUnit = one;
                this.isAddEditToggle = true;
                this.openEditModal();
            });
    }

    //edit
    public editUnit() {
        this.InputUnit.ModifiedBy = this.userId;
        let editItem: IGtnUnit = Object.assign({}, this.InputUnit);

        this.unitService.put(editItem.UnitID, editItem)
            .subscribe(() => {
                this.isEditUnit = false;
                this.InputUnit = <IGtnUnit>{};
                this.hideUnitModal();
                this.selectedModalLoaded = false;

                var toastOptions: ToastOptions = {
                    title: "Edited",
                    msg: "Unit has been successfully Edited",
                    showClose: true,
                    timeout: 5000,
                    theme: 'bootstrap'
                };
                this.toastyService.success(toastOptions);

            });
    }

    public onUnitCodeChange(data: any) {
        const query = `$filter=UnitCode eq '${data}'`;
        if (data < 100 && data.length == 2) {
            this.validDigit = false;
            this.unitService.getAll(query).subscribe((list: IGtnUnit[]) => {
                if (list.length > 0) {
                    this.duplicateCode = true;
                }
                else {
                    this.duplicateCode = false;
                }
            });
        }
        else {
            this.validDigit = true;
            this.duplicateCode = false;
        }

    }

    public onUnitNameChange(data: string) {
        const query = `$filter=UnitName eq '${data}'`;
        this.unitService.getAll(query).subscribe((list: IGtnUnit[]) => {
            if (list.length > 0) {
                this.duplicateName = true;
            }
            else {
                this.duplicateName = false;
            }
        });
    }

    public getFiscalYear() {
        let date = new Date();
        this.commonService.getFiscalYear(date, 0).subscribe((list: IFgetFiscialyearID_Result[]) => {
            this.FiscalYearDetail = list;
            let splitData = this.FiscalYearDetail[0].FyName;
            let splitedData = splitData.split('/');
            let fyCode1 = parseInt(splitedData[0]) % 10;
            let fyCode2 = parseInt(splitedData[1]) % 10;
            this.FYCode = fyCode1.toString() + fyCode2.toString();
        });
    }

    public saveJobCode(code: string): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            const query = `$filter=UnitCode eq '${code}'`;
            this.unitService.getAll(query).subscribe((list: IGtnUnit[]) => {
                let currentDate = new Date();
                this.InputJobCode = {
                    DepartmentCode: list[0].DepartmentID,
                    UnitCode: list[0].UnitID,
                    FiscalYearID: this.FiscalYearDetail[0].FYID,
                    JobCode1: this.deptCode + code + "00" + "00" + this.FYCode,
                    IsVisible: true,
                    PostedBy: this.userId,
                    PostedOn: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate(), 5, 45, 0, 0)
                };
                this.jobCodeService.post(this.InputJobCode).subscribe(() => {
                    return true;
                });
            });
        });

    }

    public isFormValid(bookForm: any): boolean {
        if (!bookForm.form.valid) {
            return false;
        }
        if (this.duplicateCode == true) {
            return false;
        }
        return true;
    }
}
