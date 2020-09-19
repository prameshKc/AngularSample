import { Component, Injectable, ViewChild, Input, SimpleChange } from '@angular/core';
import {
    GtnSubUnitService, GtnJobCodeService, FiscalYearService,
    CommonService
} from '../../services/BaseService';
import {
    IGtnSubUnit, IGtnJobCode,
} from '../../models/Models';
import { IFgetFiscialyearID_Result } from '../../models/ViewModels';

import { ModalDirective } from 'ngx-bootstrap'
import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';

@Component({
    selector: 'GtnSubUnit',
    templateUrl: 'gtnSubUnit.component.html'
})
export class GtnSubUnitComponent {
    @Input() userId: string;
    @Input() showSubUnitDetail: boolean = false;
    
    @Input() deptId: number;
    @Input() deptCode: string;
    @Input() unitId: number;
    @Input() unitCode: string;
    @Input() subUnitId: number;
    isAddSubUnit: boolean = false;
    isEditSubUnit: boolean = false;
    isAddEditToggle: boolean = false;
    subUnitList: IGtnSubUnit[] = [];
    InputSubUnit: IGtnSubUnit = <IGtnSubUnit>{};
    InputJobCode: IGtnJobCode = <IGtnJobCode>{};
    FiscalYearDetail: IFgetFiscialyearID_Result[] = [];
    FYCode: string;

    //SubUnit Modal
  @ViewChild('subUnitModal', { static: false }) public subUnitModal: ModalDirective
  @ViewChild('modal', { static: false })
    ModalDirective: any;
    selectedModalLoaded: boolean = false;

    toggleSort: boolean = false;
    duplicateCode: boolean = false;
    duplicateName: boolean = false;
    validDigit: boolean = false;

    constructor(
        private subUnitService: GtnSubUnitService,
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
    public openSubUnitModal() {
        this.InputSubUnit.Visibility = true;
        this.isAddSubUnit = true;
        this.isEditSubUnit = false;
        this.selectedModalLoaded = true;
        this.subUnitModal.show();
    }

    public hideSubUnitModal() {
        this.isAddSubUnit = false;
        this.isEditSubUnit = false;
        this.isAddEditToggle = false;
        this.InputSubUnit = <IGtnSubUnit>{};
        this.selectedModalLoaded = false;
        this.subUnitModal.hide();
    }

    public saveSubUnit() {
        if (this.InputSubUnit.Visibility != true) {
            this.InputSubUnit.Visibility = false;
        }
        this.InputSubUnit.DepartmentID = this.deptId;
        this.InputSubUnit.UnitID = this.unitId;
        this.InputSubUnit.PostedBy = this.userId;
        let saveItem: IGtnSubUnit = Object.assign({}, this.InputSubUnit);
        this.subUnitService.post(saveItem)
            .subscribe(() => {
                this.InputSubUnit = <IGtnSubUnit>{};
                this.isAddEditToggle = false;
                this.selectedModalLoaded = false;
                this.hideSubUnitModal();
                this.saveJobCode(saveItem.SubUnitCode).then((data) => {
                    if (data == true) {
                        var toastOptions: ToastOptions = {
                            title: "Success",
                            msg: "SubUnit has been successfully Added and Job Code is Created",
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
        this.isEditSubUnit = true;
        this.isAddSubUnit = false;
        this.selectedModalLoaded = true;
        this.subUnitModal.show();
    }

    //getOne
    public getSubUnit(id: number) {
        this.subUnitService.get(id)
            .subscribe((one: IGtnSubUnit) => {
                this.InputSubUnit = one;
                this.isAddEditToggle = true;
                this.openEditModal();
            });
    }

    //edit
    public editSubUnit() {
        this.InputSubUnit.ModifiedBy = this.userId;
        let editItem: IGtnSubUnit = Object.assign({}, this.InputSubUnit);

        this.subUnitService.put(editItem.SubUnitID, editItem)
            .subscribe(() => {
                this.isEditSubUnit = false;
                this.InputSubUnit = <IGtnSubUnit>{};
                this.hideSubUnitModal();
                this.selectedModalLoaded = false;

                var toastOptions: ToastOptions = {
                    title: "Edited",
                    msg: "SubUnit has been successfully Edited",
                    showClose: true,
                    timeout: 5000,
                    theme: 'bootstrap'
                };
                this.toastyService.success(toastOptions);

            });
    }

    public onSubUnitCodeChange(data: any) {
        const query = `$filter=SubUnitCode eq '${data}'`;
        if (data < 100 && data.length == 2) {
            this.validDigit = false;
            this.subUnitService.getAll(query).subscribe((list: IGtnSubUnit[]) => {
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

    public onSubUnitNameChange(data: string) {
        const query = `$filter=SubUnitName eq '${data}'`;
        this.subUnitService.getAll(query).subscribe((list: IGtnSubUnit[]) => {
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
            const query = `$filter=SubUnitCode eq '${code}'`;
            this.subUnitService.getAll(query).subscribe((list: IGtnSubUnit[]) => {
                let currentDate = new Date();
                this.InputJobCode = {
                    DepartmentCode: list[0].DepartmentID,
                    UnitCode: list[0].UnitID,
                    SubUnitCode: list[0].SubUnitID,
                    FiscalYearID: this.FiscalYearDetail[0].FYID,
                    JobCode1: this.deptCode + this.unitCode + code + "00" + this.FYCode,
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
