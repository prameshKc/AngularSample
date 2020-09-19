import { Component, ViewChild } from '@angular/core';
import { ReligionService } from '../../services/BaseService';
import { IReligion, IPaginationViewModel } from '../../models/Models';
import { IFilterViewModel } from '../../models/ViewModels';

import { ModalDirective } from 'ngx-bootstrap';
import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';

@Component({
    templateUrl: 'religion.component.html',
})
export class ReligionComponent {
    isAddReligion: boolean = false;
    isEditReligion: boolean = false;
    isAddEditToggle: boolean = false;
    InputReligion: IReligion = <IReligion>{};
    religionList: IReligion[] = [];

    //Religion Modal
  @ViewChild('religionModal', { static: false }) public religionModal: ModalDirective
  @ViewChild('modal', { static: false })
    ModalDirective: any;
    selectedModalLoaded: boolean = false;

    //deleteModal
  @ViewChild('deleteModal', { static: false }) public deleteModal: ModalDirective
  @ViewChild('modal', { static: false })
    ModalDirectiveDelete: any;
    deleteModalLoaded: boolean = false;
    deleteId: number;

    //searching and sorting
    filterObj?: IFilterViewModel;

    //for pagination
    pagination?: IPaginationViewModel = {
        CurrentPage: 1,
        MaxItems: 50,
        ItemsPerPage: 50,
        TotalPage: 0
    };

    constructor(
        public religionService: ReligionService,
        private toastyService: ToastyService,
        private toastyConfig: ToastyConfig      
    ) 
    {  
        this.filterObj = { Name: '', Sort: '' };
        this.getAllReligion();
    }

    //getAll
    public getAllReligion(filterObj?: IFilterViewModel) {
        this.pagination.TotalPage = Math.ceil(this.pagination.TotalItems / this.pagination.ItemsPerPage);

        let skipCount = (this.pagination.CurrentPage * this.pagination.ItemsPerPage) - this.pagination.ItemsPerPage;
        var query = `$inlinecount=allpages&$skip=${skipCount}&$top=${this.pagination.ItemsPerPage}`;

        if (filterObj != undefined || filterObj != null) {
            if (filterObj.Name != undefined && filterObj.Name != "") {
                query += "&$filter=startswith(ReligionName, '" + this.filterObj.Name + "')";
            }
            if (filterObj.Sort != undefined && filterObj.Sort != "") {
                if (filterObj.Sort == 'true') {
                    query += "&$orderby=ReligionName";
                }
                else {
                    query += "&$orderby=ReligionName desc";
                }
            }
        }
        else {
            query += "&$orderby=ReligionId desc";
        }
        

        this.religionService.getAll(query)
            .subscribe((list: any) => {
                this.pagination.TotalItems = <number>(list["odata.count"]);
                this.pagination.TotalPage = Math.ceil(this.pagination.TotalItems / this.pagination.ItemsPerPage);   
                this.religionList = list.value;
            });
    }

    public filterHome(pagination: number = 1) {

        this.pagination.CurrentPage = pagination <= 1 ? 1 : pagination > this.pagination.TotalPage ? this.pagination.TotalPage : pagination;
        this.getAllReligion(this.filterObj);
    }

    //filter
    public filterReligion() {
        this.pagination.CurrentPage = 1;
        this.getAllReligion(this.filterObj);
    }

    public religionAndFilter() {
        this.filterObj = { Name: '', Sort: '' };
        this.getAllReligion();
    }

    //post
    //openModal
    public openReligionModal() {
        this.isAddReligion = true;
        this.isEditReligion = false;
        this.selectedModalLoaded = true;
        if (this.religionModal != undefined) {
            this.religionModal.config.backdrop = false;
        }
        let el = document.createElement('div');
        el.className = 'modal-backdrop fade in';
        document.body.appendChild(el);
        this.religionModal.show();
    }

    public hideReligionModal() {
        document.body.removeChild(document.querySelector('.modal-backdrop'));
        this.religionModal.hide();
        this.isAddReligion = false;
        this.isEditReligion = false;
        this.isAddEditToggle = false;
        this.InputReligion = <IReligion>{};
        this.selectedModalLoaded = false;
    }

    public saveReligion() {
        this.religionService.post(this.InputReligion)
            .subscribe(() => {
                this.InputReligion = <IReligion>{};
                this.isAddEditToggle = false;
                this.selectedModalLoaded = false;
                this.hideReligionModal();
                this.getAllReligion();

                var toastOptions: ToastOptions = {
                    title: "Success",
                    msg: "Religion has been successfully Added",
                    showClose: true,
                    timeout: 5000,
                    theme: 'bootstrap'
                };
                this.toastyService.success(toastOptions);

            });
    }

    //delete
    openDeleteModal(Id: number) {
        this.deleteId = Id;
        this.deleteModalLoaded = true;
        if (this.deleteModal != undefined) {
            this.deleteModal.config.backdrop = false;
        }
        let el = document.createElement('div');
        el.className = 'modal-backdrop fade in';
        document.body.appendChild(el);
        this.deleteModal.show();
    }

    public hideDeleteModal(): void {
        document.body.removeChild(document.querySelector('.modal-backdrop'));
        this.deleteModal.hide();
    }

    public deleteReligion() {
        this.religionService.delete(this.deleteId)
            .subscribe(() => {
                this.filterReligion();
                this.deleteModalLoaded = false;
                this.hideDeleteModal();

                var toastOptions: ToastOptions = {
                    title: "Delete",
                    msg: "Religion has been deleted successfully",
                    showClose: true,
                    timeout: 5000,
                    theme: 'bootstrap'
                };
                this.toastyService.error(toastOptions);

            });
    }

    //EditModal
    openEditModal() {
        this.isEditReligion = true;
        this.isAddReligion = false;
        this.selectedModalLoaded = true;
        if (this.religionModal != undefined) {
            this.religionModal.config.backdrop = false;
        }
        let el = document.createElement('div');
        el.className = 'modal-backdrop fade in';
        document.body.appendChild(el);
        this.religionModal.show();
    }


    //getOne
    public getReligion(id: number) {
        this.openEditModal();
        this.religionService.get(id)
            .subscribe((one: IReligion) => {
                this.InputReligion = one;
                this.isAddEditToggle = true;
            });
    }

    //edit
    public editReligion() {
        this.religionService.put(this.InputReligion.ReligionId, this.InputReligion)
            .subscribe(() => {
                this.getAllReligion();                
                this.isEditReligion = false;
                this.InputReligion = <IReligion>{};
                this.hideReligionModal();
                this.selectedModalLoaded = false;

                var toastOptions: ToastOptions = {
                    title: "Edited",
                    msg: "Religion has been successfully Edited",
                    showClose: true,
                    timeout: 5000,
                    theme: 'bootstrap'
                };
                this.toastyService.success(toastOptions);

            });
    }
}
