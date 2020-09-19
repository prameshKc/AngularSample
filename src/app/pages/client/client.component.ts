import { Component, Injectable, ViewChild } from '@angular/core';
import { ClientService } from '../../services/BaseService';
import { IClient, IPagination } from '../../models/Models';
import { IFilterViewModel } from '../../models/ViewModels';

import { ModalDirective } from 'ngx-bootstrap';
import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';

@Component({
    selector: 'client',
    templateUrl: 'client.component.html'
})
export class ClientComponent {
    isAddEditToggle: boolean = false;
    isAddClient: boolean = false;
    isEditClient: boolean = false;
    clientList: IClient[] = [];
    InputClient: IClient = <IClient>{};
    filterObj?: IFilterViewModel;
    toggleSort: boolean = false;
    userId: string;
    duplicateName: boolean = false;
    duplicateCode: boolean = false;
    twoDigit: boolean = false;
    pagination: IPagination;

    //for client Modal
  @ViewChild('clientModal', { static: false }) public clientModal: ModalDirective
  @ViewChild('modal', { static: false })
    ModalDirective: any;
    selectedModalLoaded: boolean = false;

    constructor(
        public clientService: ClientService,
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
        this.getAllClient();
    }

    public clientAndFilter() {
        this.filterObj = { Name: '', Sort: '', SortingAttribute: '', SearchBy: '' };
        this.getAllClient();
    }

    public filterClient() {
        this.getAllClient(this.filterObj);
    }

    public getAllClient(filterObj?: IFilterViewModel) {
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

        this.clientService.getAll(query).subscribe((list: any) => {
            this.clientList = list.value;
            this.pagination = {
                ItemsPerPage: this.pagination.ItemsPerPage,
                TotalItems: <number>(list["odata.count"]),
                CurrentPage: this.pagination.CurrentPage,
                SortBy: this.pagination.SortBy
            };
        });
    }

    //client AddModal
    public openClientModal() {
        this.isAddClient = true;
        this.isEditClient = false;
        this.selectedModalLoaded = true;
        this.clientModal.show();
    }

    public hideClientModal() {
        this.isAddClient = false;
        this.isEditClient = false;
        this.isAddEditToggle = false;
        this.duplicateCode = false;
        this.duplicateName = false;
        this.twoDigit = false;
        this.clientModal.hide();
        this.InputClient = <IClient>{};
        this.selectedModalLoaded = false;
    }

    public saveClient() {
        let saveObj: IClient = Object.assign({}, this.InputClient);
        saveObj.PostedBy = this.userId;
        saveObj.PostedOn = new Date();

        this.clientService.post(saveObj)
            .subscribe(() => {
                this.InputClient = <IClient>{};
                this.getAllClient();
                this.isAddEditToggle = false;
                this.selectedModalLoaded = false;
                this.hideClientModal();

                var toastOptions: ToastOptions = {
                    title: "Success",
                    msg: "Client has been successfully Added",
                    showClose: true,
                    timeout: 5000,
                    theme: 'bootstrap'
                };
                this.toastyService.success(toastOptions);

            });
    }

    openEditModal() {
        this.isEditClient = true;
        this.isAddClient = false;
        this.selectedModalLoaded = true;
        this.clientModal.show();
    }


    //getOne
    public getClient(id: number) {
        this.openEditModal();
        this.clientService.get(id)
            .subscribe((one: IClient) => {
                this.InputClient = one;
                this.isAddEditToggle = true;
            });
    }

    //edit
    public editClient() {
        let editObj: IClient = Object.assign({}, this.InputClient);
        editObj.ModifiedBy = this.userId;
        editObj.ModifiedOn = new Date();

        this.clientService.put(editObj.Id, editObj)
            .subscribe(() => {
                //this.filterClient();
                this.getAllClient();
                this.isEditClient = false;
                this.InputClient = <IClient>{};
                this.hideClientModal();
                this.selectedModalLoaded = false;

                var toastOptions: ToastOptions = {
                    title: "Edited",
                    msg: "Client has been successfully Edited",
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
        this.getAllClient(this.filterObj);
    }

    public onCompanyNameChange(event: any) {
        var query = `$filter=CompanyName eq '${event}'`;
        this.clientService.getAll(query).subscribe((list: IClient[]) => {
            if (list.length > 0) {
                this.duplicateName = true;
            }
            else {
                this.duplicateName = false;
            }
        })
    }

    public onClientCodeChange(event: any) {
        var query = `$filter=ClientCode eq '${event}'`;
        if (event < 100 && event.length == 2) {
            this.twoDigit = false;
            this.clientService.getAll(query).subscribe((list: IClient[]) => {

                if (list.length > 0) {
                    this.duplicateCode = true;
                }
                else {
                    this.duplicateCode = false;
                }
            })
        }
        else {
            this.twoDigit = true;
            this.duplicateCode = false;
        }

    }
    onPageSelect(pagination: IPagination) {
        this.pagination = pagination;
        this.getAllClient(this.filterObj);
    }
}
