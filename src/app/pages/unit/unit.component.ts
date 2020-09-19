import { Component, ViewChild } from '@angular/core';
import { UnitService } from '../../services/BaseService';
import { IUnit, IPagination } from '../../models/Models';
import { IFilterViewModel, IUnitVM } from '../../models/ViewModels';

import { ModalDirective } from 'ngx-bootstrap';
import { ToastyService, ToastOptions } from 'ngx-toasty';

@Component({
    templateUrl: 'unit.component.html'
})
export class UnitComponent {
    unitList: IUnitVM[] = [];
    InputUnit: IUnit = <IUnit>{};
    filterObj?: IFilterViewModel;
    toggleSort: boolean = false;
    userId: string;
    duplicateCode: boolean = false;
    duplicateName: boolean = false;
    invalidForm: boolean = false;
    twoDigit: boolean = false;
    pagination: IPagination;

    //for unit Modal
  @ViewChild('UnitModal', { static: false }) public UnitModal: ModalDirective
  @ViewChild('modal', { static: false })
    ModalDirective: any;
    selectedModalLoaded: boolean = false;

    constructor(
        public unitService: UnitService,
        private toastyService: ToastyService    ) {
        this.userId = localStorage.getItem('UserId');
        this.pagination = <IPagination>{
            CurrentPage: 1,
            ItemsPerPage: 50,
            TotalItems: 0,
            SortBy: null
        };
        this.filterObj = { Name: '', Sort: '', SortingAttribute: '', SearchBy: '' };
        this.getAllUnit();
    }

    public UnitAndFilter() {
        this.filterObj = { Name: '', Sort: '', SortingAttribute: '', SearchBy: '' };
        this.getAllUnit();
    }

    public filterUnit() {
        this.getAllUnit(this.filterObj);
    }

    public getAllUnit(filterObj?: IFilterViewModel) {
        var query: string = "";

        if (filterObj != undefined || filterObj != null) {
            if (filterObj.Name != undefined && filterObj.Name != "" && filterObj.SearchBy != undefined && filterObj.SearchBy != "") {
                if (query != null && query != "") {
                    query += "&$filter=startswith(" + filterObj.SearchBy + ", '" + this.filterObj.Name + "')";
                }
                else {
                    query += "$filter=startswith(" + filterObj.SearchBy + ", '" + this.filterObj.Name + "')";
                }
            }
            if (filterObj.Sort != undefined && filterObj.Sort != "") {
                if (filterObj.Sort == 'true') {
                    if (query != null && query != "") {
                        query += "&$orderby=" + filterObj.SortingAttribute;
                    }
                    else {
                        query += "$orderby=" + filterObj.SortingAttribute;
                    }
                }
                else {
                    if (query != null && query != "") {
                        query += "&$orderby=" + filterObj.SortingAttribute + " desc";
                    }
                    else {
                        query += "$orderby=" + filterObj.SortingAttribute + " desc";
                    }
                }
            }
        }
        else {
            if (query != null && query != "") {
                query += "&$orderby=Id desc";
            }
            else {
                query += "$orderby=Id desc";
            }
        }
        let skipCount = (this.pagination.ItemsPerPage * (this.pagination.CurrentPage - 1));
        if (query != null && query != "") {
            query += `&$inlinecount=allpages&$skip=${skipCount}&$top=${this.pagination.ItemsPerPage}`;
        }
        else {
            query += `$inlinecount=allpages&$skip=${skipCount}&$top=${this.pagination.ItemsPerPage}`;
        }
        this.unitService.getAll(query).subscribe((list: any) => {
            this.unitList = list.value;
            this.pagination = {
                ItemsPerPage: this.pagination.ItemsPerPage,
                TotalItems: <number>(list["odata.count"]),
                CurrentPage: this.pagination.CurrentPage,
                SortBy: this.pagination.SortBy
            };
        });
    }

    //unit AddModal
    public openUnitModal() {
        this.selectedModalLoaded = true;
        this.UnitModal.show();
    }

    public hideUnitModal() {
        this.UnitModal.hide();
        this.duplicateCode = false;
        this.duplicateName = false;
        this.InputUnit = <IUnit>{};
        this.selectedModalLoaded = false;
    }

    public saveUnit() {
        let saveObj: IUnit = Object.assign({}, this.InputUnit);
        saveObj.PostedBy = this.userId;
        saveObj.PostedOn = new Date();

        this.unitService.post(saveObj)
            .subscribe(() => {
                this.InputUnit = <IUnit>{};
                this.getAllUnit();
                this.selectedModalLoaded = false;
                this.hideUnitModal();

                var toastOptions: ToastOptions = {
                    title: "Success",
                    msg: "Unit has been successfully Added",
                    showClose: true,
                    timeout: 5000,
                    theme: 'bootstrap'
                };
                this.toastyService.success(toastOptions);

            });

    }

    public toggleEdit(id: number) {
        this.unitList.filter(x => x.Id == id)[0].editToggle = true;
    }

    editUnit(unitObj: IUnitVM) {

        let unit: IUnit = {
            Id: unitObj.Id,
            UnitName: unitObj.UnitName,
            UnitCode: unitObj.UnitCode,
            PostedBy: unitObj.PostedBy,
            PostedOn: unitObj.PostedOn,
            ModifiedBy: this.userId,
            ModifiedOn: new Date()
        };

        this.unitService.put(unitObj.Id, unit).subscribe(data => {
            var toastOptions: ToastOptions = {
                title: "Success",
                msg: "Parameter has been successfully Added",
                showClose: true,
                timeout: 5000,
                theme: 'bootstrap'
            };
            this.toastyService.success(toastOptions);

            //this.getAllSvParamList();
            this.unitList.filter(x => x.Id == unitObj.Id)[0] = data;
            this.unitList.filter(x => x.Id == unitObj.Id)[0].editToggle = false;
        })
    }

    cancel(id: number) {
        this.unitService.get(id).subscribe((data: IUnitVM) => {
            this.unitList.filter(x => x.Id == id)[0] = data;
            this.unitList.filter(x => x.Id == id)[0].editToggle = false;
        })
    }

    public sortBy(sortBy: string) {
        this.toggleSort = !this.toggleSort;
        if (this.toggleSort == true) {
            this.filterObj.Sort = "true";
        }
        else {
            this.filterObj.Sort = "false";
        }

        this.filterObj.SortingAttribute = sortBy;
        this.getAllUnit(this.filterObj);
    }

    public onUnitNameChange(event: any) {
        var query = `$filter=UnitName eq '${event}'`;
        this.unitService.getAll(query).subscribe((list: IUnit[]) => {
            if (list.length > 0) {
                this.duplicateName = true;
                this.invalidForm = true;

            }
            else {
                this.duplicateName = false;
                this.invalidForm = false;
            }
        })
    }

    public onUnitCodeChange(event: any) {
        var query = `$filter=UnitCode eq '${event}'`;
        if (event < 100 && event.length == 2) {
            this.twoDigit = false;
            this.unitService.getAll(query).subscribe((list: IUnit[]) => {

                if (list.length > 0) {
                    this.duplicateCode = true;
                    this.invalidForm = true;
                }
                else {
                    this.duplicateCode = false;
                    this.invalidForm = false;
                }
            })
        }
        else {
            this.twoDigit = true;
            this.duplicateCode = false;
            this.invalidForm = true;
        }

    }

    onPageSelect(pagination: IPagination) {
        this.pagination = pagination;
        this.getAllUnit(this.filterObj);
    }
}
