import { Component, Injectable, ViewChild } from '@angular/core';
import { ILoginShift, IPagination } from '../../models/Models';
import { IFilterViewModel } from '../../models/ViewModels';
import { LoginShiftService } from '../../services/BaseService';
import { ModalDirective } from 'ngx-bootstrap';
import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';

@Component({
    templateUrl: 'loginShift.component.html',
})
export class LoginShiftComponent {
    isAddLoginShift: boolean = false;
    InputLoginShift: ILoginShift = <ILoginShift>{};
    loginShiftList: ILoginShift[] = [];
    isAddEditToggle: boolean = false;
    isEditLoginShift: boolean = false;
    toggleJRB: boolean = false;
    selectedPromptModalLoaded: boolean;

    //searching and sorting
    filterObj?: IFilterViewModel;

    //for pagination
    pagination?: IPagination;

    //for delete modal
  @ViewChild('deleteModal', { static: false }) public deleteModal: ModalDirective
  @ViewChild('modal', { static: false })
    ModalDirectiveDelete: any;
    deleteModalLoaded: boolean = false;
    deleteId: number;

    //for login modal
  @ViewChild('loginShiftModal', { static: false }) public loginShiftModal: ModalDirective
  @ViewChild('modal', { static: false })
    ModalDirective: any;
    selectedModalLoaded: boolean = false;
    userId: string;
    toggleSort: boolean = false;

    constructor(public loginShiftService: LoginShiftService, private toastyService: ToastyService,
        private toastyConfig: ToastyConfig) {
        this.userId = localStorage.getItem('UserId');
        this.pagination = <IPagination>{
            CurrentPage: 1,
            ItemsPerPage: 50,
            TotalItems: 0,
            SortBy: null
        };
        this.filterObj = { Name: '', Sort: '', SortingAttribute: '', SearchBy: '' };
        this.getAllLoginShift(this.filterObj);
    }    

    convertToTimeSpanFormat(date: string) {
        var obj = new Date(date);
        return "PT" + obj.getHours() + "H" + obj.getMinutes() + "M" + obj.getSeconds() + "S";
    }

    //used for retrieving date in edit modal
    convertFromTimeSpanFormat1(date: any): any {
        var newDate = new Date();
        var time = date;
        var index: number;
        time = time.replace("PT", "");
        if (time.indexOf("H") < 0) {
            index = 0;
            time = [time.slice(0, index), "00H", time.slice(index)].join('');
        }
        if (time.indexOf("M") < 0) {
            index = time.indexOf("H") + 1;
            time = [time.slice(0, index), "00M", time.slice(index)].join('');
        }
        if (time.indexOf("S") < 0) {
            index = time.indexOf("M") + 1;
            time = [time.slice(0, index), "00S", time.slice(index)].join('');
        }
        time = time.replace("PT", '').replace("H", ":").replace("M", ":").replace("S", "")
        var c = time.split(":");

        newDate.setHours(c[0]);
        newDate.setMinutes(c[1]);
        newDate.setSeconds(c[2]);

        return newDate;
    }

    convertFromTimeSpanFormat(date: any): string {
        var time = date;
        var index: number;
        time = time.replace("PT", "");
        if (time.indexOf("H") < 0) {
            index = 0;
            time = [time.slice(0, index), "00H", time.slice(index)].join('');
        }
        if (time.indexOf("M") < 0) {
            index = time.indexOf("H") + 1;
            time = [time.slice(0, index), "00M", time.slice(index)].join('');
        }
        if (time.indexOf("S") < 0) {
            index = time.indexOf("M") + 1;
            time = [time.slice(0, index), "00S", time.slice(index)].join('');
        }
        time = time.replace("PT", '').replace("H", ":").replace("M", ":").replace("S", "")
        var c = time.split(":");
        if (c[0] < 10 && c[0] != "00") {
            c[0] = "0" + c[0];
        }
        if (c[1] < 10 && c[1] != "00") {
            c[1] = "0" + c[1];
        }
        if (c[0] > 12 && c[0] < 24) {
            var time2 = c[0] - 12 + ":" + c[1] + " " + "PM";
        }
        else if (c[0] < 12 && c[0] > 0) {
            var time2 = c[0] + ":" + c[1] + " " + "AM";
        }
        else {
            if (c[0] == 12) {
                var time2 = "12" + ":" + c[1] + " " + "PM";
            }
            else {
                var time2 = "12" + ":" + c[1] + " " + "AM";
            }
        }
        return time2;
    }

    convertTimeToString(data: any) {
        var newDate = new Date();
        var time = data.split('PT');
        var c = time[1].split(/[A-Z]/);

        newDate.setHours(c[0]);
        newDate.setMinutes(c[1]);

        return newDate;
    }

    //getall
    public getAllLoginShift(filterObj?: IFilterViewModel) {
        var query = `$expand=LoginGroup`;

        if (filterObj != undefined || filterObj != null) {

            if (filterObj.Sort != undefined && filterObj.Sort != "") {

                if (filterObj.Sort == 'true') {
                    query += "&$orderby=" + filterObj.SortingAttribute;
                }
                else {
                    query += "&$orderby=" + filterObj.SortingAttribute + " desc";
                }
            }
        }
        else {
            if (this.isAddEditToggle == true) {
                query += "&$orderby=LastUpdatedOn desc";
            }
            else {
                query += "&$orderby=PostedOn desc";
            }
        }
        let skipCount = (this.pagination.ItemsPerPage * (this.pagination.CurrentPage - 1));
        query += `&$inlinecount=allpages&$skip=${skipCount}&$top=${this.pagination.ItemsPerPage}`;

        this.loginShiftList = [];

        this.loginShiftService.getAll(query)
            .subscribe((list: any) => {
                list.value.forEach((item: any) => {
                    item.JobRunTime = this.convertFromTimeSpanFormat(item.JobRunTime);
                })

                this.loginShiftList = list.value;
                this.pagination = {
                    ItemsPerPage: this.pagination.ItemsPerPage,
                    TotalItems: <number>(list["odata.count"]),
                    CurrentPage: this.pagination.CurrentPage,
                    SortBy: this.pagination.SortBy
                };
            });
    }

    //loginShift AddModal
    public openLoginShiftModal() {
        this.InputLoginShift.JobRunTime = new Date().toString();
        this.isAddLoginShift = true;
        this.isEditLoginShift = false;
        this.selectedModalLoaded = true;
        if (this.loginShiftModal != undefined) {
            this.loginShiftModal.config.backdrop = false;
        }
        let el = document.createElement('div');
        el.className = 'modal-backdrop fade in';
        document.body.appendChild(el);
        this.loginShiftModal.show();
    }

    public hideLoginShiftModal() {
        document.body.removeChild(document.querySelector('.modal-backdrop'));
        this.loginShiftModal.hide();
        this.isAddLoginShift = false;
        this.isEditLoginShift = false;
        this.isAddEditToggle = false;
        this.InputLoginShift = <ILoginShift>{};
        this.selectedModalLoaded = false;
        this.toggleJRB = false;
    }

    //post
    public saveLoginShift() {
        this.InputLoginShift.PostedBy = this.userId;
        let saveItem: ILoginShift = Object.assign({}, this.InputLoginShift);
        saveItem.JobRunTime = this.convertToTimeSpanFormat(saveItem.JobRunTime.toString());

        this.loginShiftService.post(saveItem)
            .subscribe(() => {
                this.InputLoginShift = <ILoginShift>{};
                this.isAddEditToggle = false;
                //this.filterLoginShift();
                this.getAllLoginShift(this.filterObj);
                this.selectedModalLoaded = false;
                this.hideLoginShiftModal();
                var toastOptions: ToastOptions = {
                    title: "Success",
                    msg: "Login Shift has been successfully Added",
                    showClose: true,
                    timeout: 5000,
                    theme: 'bootstrap'
                };
                this.toastyService.success(toastOptions);
            });
    }

    //for editing
    //getOne
    public getLoginShift(id: number) {
        this.openEditModal();
        this.loginShiftService.get(id)
            .subscribe((one: ILoginShift) => {

                this.InputLoginShift = one;
                this.InputLoginShift.JobRunTime = this.convertFromTimeSpanFormat1(one.JobRunTime).toString();

                this.isAddEditToggle = true;
            });
    }

    //loginShift EditModal
    openEditModal() {
        this.isEditLoginShift = true;
        this.isAddLoginShift = false;
        this.selectedModalLoaded = true;
        if (this.loginShiftModal != undefined) {
            this.loginShiftModal.config.backdrop = false;
        }
        let el = document.createElement('div');
        el.className = 'modal-backdrop fade in';
        document.body.appendChild(el);
        this.loginShiftModal.show();
    }

    //edit
    public editLoginShift() {
        this.InputLoginShift.LastUpdatedBy = this.userId;
        let saveItem: ILoginShift = Object.assign({}, this.InputLoginShift);

        saveItem.JobRunTime = this.convertToTimeSpanFormat(saveItem.JobRunTime.toString());
        this.loginShiftService.put(this.InputLoginShift.ShiftId, saveItem)
            .subscribe(() => {
                //this.filterLoginShift();
                this.getAllLoginShift(this.filterObj);
                this.isEditLoginShift = false;
                this.InputLoginShift = <ILoginShift>{};
                this.hideLoginShiftModal();
                this.selectedModalLoaded = false;

                var toastOptions: ToastOptions = {
                    title: "Edited",
                    msg: "Login Shift has been successfully Edited",
                    showClose: true,
                    timeout: 5000,
                    theme: 'bootstrap'
                };
                this.toastyService.success(toastOptions);

            });
    }

    //deleteModal
    openDeleteModal(Id: number) {
        this.deleteId = Id;
        this.deleteModalLoaded = true;
        if (this.deleteModal != undefined) {
            this.deleteModal.config.backdrop = false;
        }
        this.deleteModal.show();
    }

    public hideDeleteModal(): void {
        this.deleteModal.hide();
    }

    //delete
    public deleteLoginShift() {

        if (this.loginShiftList.filter(x => x.ShiftId == this.deleteId)[0].LoginGroup.length > 0) {
            var toastOptions: ToastOptions = {
                title: "Delete",
                msg: "Login Shift could not be deleted. It is dependent with Login Group.",
                showClose: true,
                timeout: 5000,
                theme: 'bootstrap'
            };
            this.toastyService.error(toastOptions);

        } else {
            this.loginShiftService.delete(this.deleteId)
                .subscribe(() => {
                    this.getAllLoginShift(this.filterObj);
                    this.deleteModalLoaded = false;
                    this.hideDeleteModal();

                    var toastOptions: ToastOptions = {
                        title: "Delete",
                        msg: "Login Shift has been deleted successfully",
                        showClose: true,
                        timeout: 5000,
                        theme: 'bootstrap'
                    };
                    this.toastyService.error(toastOptions);
                });
        }
    }

    dateClick(event: any) {
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
        this.getAllLoginShift(this.filterObj);
    }

    onPageSelect(pagination: IPagination) {
        this.pagination = pagination;
        this.getAllLoginShift(this.filterObj);
    }

}
