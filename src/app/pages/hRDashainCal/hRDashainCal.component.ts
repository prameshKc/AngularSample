import { Component, Injectable, ViewChild } from '@angular/core';
import {
    HRDashainCalService, FiscalYearService, NepaliMonthListService,
    EnglishMonthListService
} from '../../services/BaseService';
import {
    IHRDashainCal, IPagination, IFiscalYear,
    INepaliMonthList, IEnglishMonthList
} from '../../models/Models';
import { IFilterViewModel } from '../../models/ViewModels';

import { ModalDirective } from 'ngx-bootstrap'
import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';

@Component({
    templateUrl: 'hRDashainCal.component.html'
})
export class HRDashainInfoComponent {
    isAddDashainInfo: boolean = false;
    isEditDashainInfo: boolean = false;
    isAddEditToggle: boolean = false;
    dashainInfoList: IHRDashainCal[] = [];
    dispalyDashainInfoList: IHRDashainCal[] = [];
    InputDashainInfo: IHRDashainCal = <IHRDashainCal>{};
    fiscalYearList: IFiscalYear[] = [];
    displayFiscalYearList: IFiscalYear[] = [];
    NepaliMonthList: INepaliMonthList[] = [];
    EnglishMonthList: IEnglishMonthList[] = [];

    @ViewChild('dashainInfoModal', { static: false }) public dashainInfoModal: ModalDirective
  @ViewChild('modal', { static: false })
    ModalDirective: any;
    selectedModalLoaded: boolean = false;
    currentdateInString: string;
    userId: string;
    toggleSort: boolean = false;
    duplicateFY: boolean = false;

    //searching and sorting
    filterObj?: IFilterViewModel;

    //for pagination
    pagination?: IPagination;

    constructor(
        public hRDashainCalService: HRDashainCalService,
        private fiscalYearService: FiscalYearService,
        private nepaliMonthListService: NepaliMonthListService,
        private englishMonthListService: EnglishMonthListService,
        private toastyService: ToastyService,
        private toastyConfig: ToastyConfig
    ) {
        this.userId = localStorage.getItem('UserId');
        this.pagination = <IPagination>{
            CurrentPage: 1,
            ItemsPerPage: 50,
            TotalItems: 0,
            SortBy: null
        };
        this.filterObj = { Name: '', Sort: '', SortingAttribute: '', SearchBy: '' };
        this.getAllFiscalYear();
        this.getEnglishMonth();
        this.getNepaliMonth();
        this.getAllDashainInfo(this.filterObj);
    }

    public filterDashainInfo() {
        this.resetPagination();
        this.getAllDashainInfo(this.filterObj);
    }

    public dashainInfoAndFilter() {
        this.filterObj = { Name: '', Sort: '', SortingAttribute: '', SearchBy: '' };
        this.resetPagination();
        this.getAllDashainInfo(this.filterObj);
    }

    public getAllFiscalYear() {
        let date = new Date();

        this.fiscalYearService.getAll().subscribe((data: IFiscalYear[]) => {
            this.fiscalYearList = data;
            let showfiscalYear = this.fiscalYearList.filter(x => new Date(x.StartDT).getTime() >= date.getTime());

            this.displayFiscalYearList.push(showfiscalYear[0]);
            this.displayFiscalYearList.push(showfiscalYear[1]);
        });
    }

    public getNepaliMonth() {
        this.nepaliMonthListService.getAll().subscribe((data: INepaliMonthList[]) => {
            this.NepaliMonthList = data;
        });
    }

    public getEnglishMonth() {
        this.englishMonthListService.getAll().subscribe((data: IEnglishMonthList[]) => {
            this.EnglishMonthList = data;
        });
    }

    //getAll
    public getAllDashainInfo(filterObj?: IFilterViewModel) {
        var query: string = "$expand=FiscalYear,NepaliMonthList,EnglishMonthList";
        if (filterObj != undefined || filterObj != null) {
            if (filterObj.Name != undefined && filterObj.Name != "") {
                query += "&$filter=substringof('" + this.filterObj.Name + "',FiscalYear/FyName)";
            }
            else {
                query += `&$filter=FiscalYear/StartDT gt datetime'${this.getCurrentDateInString(new Date())}'`;
            }
            if (filterObj.Sort != undefined && filterObj.Sort != "") {
                if (filterObj.Sort == 'true') {
                    query += "&$orderby=" + filterObj.SortingAttribute;
                }
                else {
                    query += "&$orderby=" + filterObj.SortingAttribute + " desc";
                }
            }
            else {
                if (this.isAddEditToggle == true) {
                    query += "&$orderby=ModifiedOn desc";
                }
                else {
                    query += "&$orderby=PostedOn desc";
                }
            }
        }
        else {
            if (this.isAddEditToggle == true) {
                query += "&$orderby=ModifiedOn desc";
            }
            else {
                query += "&$orderby=PostedOn desc";
            }
        }
        let skipCount = (this.pagination.ItemsPerPage * (this.pagination.CurrentPage - 1));
        if (query != null && query != "") {
            query += `&$inlinecount=allpages&$skip=${skipCount}&$top=${this.pagination.ItemsPerPage}`;
        }
        else {
            query += `$inlinecount=allpages&$skip=${skipCount}&$top=${this.pagination.ItemsPerPage}`;
        }

        this.hRDashainCalService.getAll(query)
            .subscribe((list: any) => {
                this.dispalyDashainInfoList = list.value;
                let currentDate = new Date();

                this.pagination = {
                    ItemsPerPage: this.pagination.ItemsPerPage,
                    TotalItems: <number>(list["odata.count"]),
                    CurrentPage: this.pagination.CurrentPage,
                    SortBy: this.pagination.SortBy
                };
            });
    }

    //openModal
    public openModal() {
        this.isAddDashainInfo = true;
        this.isEditDashainInfo = false;
        this.selectedModalLoaded = true;
        this.dashainInfoModal.show();
        //var element = document.querySelector("#FYID");
        //element.scrollIntoView(true);
    }

    public hideModal() {
        this.dashainInfoModal.hide();
        this.isAddDashainInfo = false;
        this.isEditDashainInfo = false;
        this.isAddEditToggle = false;
        this.InputDashainInfo = <IHRDashainCal>{};
        this.duplicateFY = false;
        this.selectedModalLoaded = false;
    }

    public saveDashainInfo() {
        this.InputDashainInfo.PostedBy = this.userId;
        let saveItem: IHRDashainCal = Object.assign({}, this.InputDashainInfo);

        this.hRDashainCalService.post(saveItem)
            .subscribe(() => {
                this.InputDashainInfo = <IHRDashainCal>{};
                this.isAddEditToggle = false;
                this.selectedModalLoaded = false;
                this.hideModal();
                this.filterObj = { Name: '', Sort: 'false', SortingAttribute: 'PostedOn', SearchBy: '' };
                this.getAllDashainInfo(this.filterObj);

                var toastOptions: ToastOptions = {
                    title: "Success",
                    msg: "Dashain Information has been successfully Added",
                    showClose: true,
                    timeout: 5000,
                    theme: 'bootstrap'
                };
                this.toastyService.success(toastOptions);

            });
    }

    //EditModal
    openEditModal() {
        this.isEditDashainInfo = true;
        this.isAddDashainInfo = false;
        this.selectedModalLoaded = true;
        this.dashainInfoModal.show();
    }


    //getOne
    public getDashainInfo(id: number) {
        this.hRDashainCalService.get(id)
            .subscribe((one: IHRDashainCal) => {
                this.InputDashainInfo = one;
                this.isAddEditToggle = true;
                this.openEditModal();
            });
    }

    //edit
    public editDashainInfo() {
        this.InputDashainInfo.ModifiedBy = this.userId;
        let editItem: IHRDashainCal = Object.assign({}, this.InputDashainInfo);
        this.hRDashainCalService.put(editItem.FYId, editItem)
            .subscribe(() => {
                this.filterObj = { Name: '', Sort: 'false', SortingAttribute: 'ModifiedOn', SearchBy: '' };
                this.getAllDashainInfo(this.filterObj);
                this.isEditDashainInfo = false;
                this.InputDashainInfo = <IHRDashainCal>{};
                this.hideModal();
                this.selectedModalLoaded = false;

                var toastOptions: ToastOptions = {
                    title: "Edited",
                    msg: "Bank Information has been successfully Edited",
                    showClose: true,
                    timeout: 5000,
                    theme: 'bootstrap'
                };
                this.toastyService.success(toastOptions);

            });
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
        this.getAllDashainInfo(this.filterObj);
    }

    public resetPagination() {
        this.pagination = <IPagination>{
            CurrentPage: 1,
            ItemsPerPage: 50,
            TotalItems: 0,
            SortBy: null
        };
    }

    public isFormValid(bookForm: any): boolean {
        if (!bookForm.form.valid) {
            return false;
        }
        if (this.duplicateFY == true) {
            return false;
        }
        return true;
    }

    public checkFiscalYearDuplicate(event: any) {
        var query = "$filter=FYId eq " + event;
        this.hRDashainCalService.getAll(query).subscribe((data: IHRDashainCal[]) => {
            if (data.length > 0) {
                this.duplicateFY = true;
            }
            else {
                this.duplicateFY = false;
            }
        });
    }

    public disableEdit(id: number): boolean {
        if (this.dispalyDashainInfoList.filter(x => x.FYId==id && new Date(x.FiscalYear.StartDT).getTime() > new Date().getTime()).length > 0) {
            return false;
        }
        else {
            return true;
        }
    }

    public getCurrentDateInString(currentDate: Date): string {
        var year = currentDate.getFullYear();
        var month = currentDate.getMonth() + 1;
        var date = currentDate.getDate();

        var dateInString = date.toString();
        var monthInString = month.toString();
        if (date < 10) {
            dateInString = "0" + dateInString;
        }
        if (month < 10) {
            monthInString = "0" + monthInString;
        }

        let currentdateInString = year.toString() + "-" + monthInString + "-" + dateInString;

        return currentdateInString;
    }

    onPageSelect(pagination: IPagination) {
        this.pagination = pagination;
        this.getAllDashainInfo(this.filterObj);
    }
}
