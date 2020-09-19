import { Component, ViewChild, Injectable } from '@angular/core';
import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';

import { ParamService, DataTypeService } from '../../services/BaseService';
import { IParam, IPaginationViewModel, IParamScript, IParamValue, IDataType } from '../../models/Models';

import { IFilterViewModel, IParamVM, IParamForm } from '../../models/ViewModels';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
    selector: 'paramSetup',
    templateUrl: 'param.component.html'
})
export class ParamComponent {
    toggleListVsIcon: boolean;
    selected: string;
    output: string;

  @ViewChild('childModal', { static: false }) public childModal: ModalDirective;
  @ViewChild('deleteModal', { static: false }) public deleteModal: ModalDirective;
  @ViewChild('loadingModal', { static: false }) public loadingModal: ModalDirective;

    isLoading?: boolean = false;

    isAddParam: boolean = false;
    isExpanded: boolean = false;
    InputParam: IParamForm = <IParamForm>{};
    requiredParentId: number;
    closeForm: boolean = true;
    isEditParam: boolean = false;
    selectedModalLoaded: boolean = false;
    deleteModalLoaded: boolean = false;
    deleteId: number;

    pagination?: IPaginationViewModel = {
        CurrentPage: 1,
        ItemsPerPage: 50,
        TotalPage: 1
    };

    toastOptions: ToastOptions;
    filterObj?: IFilterViewModel = <IFilterViewModel>{};

    parentId?: number;

    currentParam?: IParamVM;
    svParamList: IParamVM[] = [];
    arrangedParamList: IParamVM[] = [];
    displayParamList: IParamVM[] = [];
    displayParamListPerPage: IParamVM[] = [];

    tempParamList: IParamVM[] = [];
    qaParamList: IParamVM[] = [];
    selectParamList: IParamVM[] = [];
    paramList: IParamVM[] = [];

    dataTypeList: IDataType[] = [];

    constructor(
        public paramService: ParamService,
        public dataTypeService: DataTypeService,
        private toastyService: ToastyService,
        private toastyConfig: ToastyConfig
    ) {
        this.filterObj = { Name: '', Sort: '' };
    }

    ngOnInit() {
        this.getAllParam();
    }

    /**
     * to open loading modal
     */
    public openLoadingModal() {
        this.isLoading = true;
    }

    /**
     * to hide loading modal
     */
    public hideLoadingModal() {
        setTimeout(() => {
            this.isLoading = false;
        }, 250);
    }

    /**
     * to open add modal
     */
    public openAddModal() {
        this.isAddParam = true;
        this.isEditParam = false;
        this.selectedModalLoaded = true;

        if (this.parentId == null) {
            this.InputParam.ParentId = 0;
        } else {
            this.InputParam.ParentId = this.parentId;
        }
        this.InputParam.ParentId = this.parentId;
        this.getAllDataType();
        this.selectParamList = this.getArrangedParams(true).filter(x => x.ParentId == null);
        this.childModal.show();
    }

    /**
     * to open edit modal
     */
    public openEditModal(id?: number) {
        this.getParam(id)
        this.isEditParam = true;
        this.isAddParam = false;
        this.selectedModalLoaded = true;
        this.getAllDataType();

        this.childModal.show();
    }

    /**
     * to open delete modal
     */
    public openDeleteModal(id: number) {
        this.deleteId = id;
        this.deleteModalLoaded = true;
        this.deleteModal.show();
    }

    /**
     * to hide add/edit modal
     */
    public hideChildModal(): void {
        this.childModal.hide();
        this.isAddParam = false;
        this.isEditParam = false;
        this.InputParam = <IParamForm>{};
        this.getDisplayParam(this.parentId);
    }

    /**
     * to hide delete modal
     */
    public hideDeleteChildModal(): void {
        this.getDisplayParam(this.parentId);
        this.deleteModal.hide();
    }

    /**
     * to save new param
     */
    public saveParam() {
        this.openLoadingModal();
        this.InputParam.ParentId = this.parentId;

        let paramScript: IParamScript;
        let paramValue: IParamValue;

        paramScript = {
            PScript: this.InputParam.PScript ? this.InputParam.PScript : ''
        };

        paramValue = {
            DTId: this.InputParam.DTId,
            PDescription: this.InputParam.PDescription ? this.InputParam.PDescription : '',
            PCode: this.InputParam.PCode ? this.InputParam.PCode : '',
            PValue: this.InputParam.PValue ? this.InputParam.PValue : null
        };

        let param: IParam = {
            PName: this.InputParam.PName,
            ParentId: this.InputParam.ParentId,
            isGroup: this.InputParam.isGroup,
            ParamScript: paramScript,
            ParamValue: paramValue
        };

        this.paramService.post(param).subscribe(() => {
            var toastOptions: ToastOptions = {
                title: "Success",
                msg: "Parameter has been successfully Added",
                showClose: true,
                timeout: 5000,
                theme: 'bootstrap'
            };
            this.toastyService.success(toastOptions);
            this.parentId = this.InputParam.ParentId;

            this.InputParam = <IParamForm>{};
            this.svParamList = [];
            this.getAllParam();
            this.isAddParam = false;
            this.selectedModalLoaded = false;
            this.hideChildModal();
            this.hideLoadingModal();
        });

    }

    /**
     * to update existing param
     */
    public updateParam() {
        this.openLoadingModal();
        let saveParamItem: IParam = {
            PId: this.InputParam.PId,
            PName: this.InputParam.PName,
            ParentId: this.InputParam.ParentId,
            isGroup: this.InputParam.isGroup ? this.InputParam.isGroup : false
        }

        this.paramService.put(saveParamItem.PId, saveParamItem).subscribe(data => {
            this.parentId = this.InputParam.ParentId;
            this.getAllParam(this.parentId);
            this.hideChildModal();
            this.hideLoadingModal();
        })
    }

    public deleteParam() {
        this.paramService.delete(this.deleteId).subscribe(item => {
            this.getAllParam(this.parentId);
        });
    }

    /**
     * to go back to parent folder in tree structure
     */
    public back(parentId?: number) {
        this.currentParam = this.svParamList.filter(y => y.PId == parentId)[0];
        this.parentId = this.currentParam.ParentId;
        this.getDisplayParam(this.parentId);
    }

    /**
     * to filter data in current list
     */
    public filterData() {
        this.svParamList.sort()

        this.tempParamList = this.displayParamList;

        if (this.filterObj != null) {
            if (this.filterObj.Sort == 'true') {
                this.displayParamList = this.displayParamList.sort(function (a, b) {
                    if (a.PName < b.PName) return -1;
                    if (a.PName > b.PName) return 1;
                    return 0;
                });
            }
            else if (this.filterObj.Sort == 'false') {
                this.displayParamList = this.displayParamList.sort(function (a, b) {
                    if (a.PName < b.PName) return 1;
                    if (a.PName > b.PName) return -1;
                    return 0;
                });
            }
            else {
                this.displayParamList = this.tempParamList;
            }
        }
    }

    getAllDataType() {
        this.openLoadingModal();
        this.dataTypeService.getAll().subscribe((data: IDataType[]) => {
            this.dataTypeList = data;

            this.hideLoadingModal();
        });
    }

    getAllParam(parentId?: number) {
        this.openLoadingModal();
        this.paramService.getAll().subscribe((data: IParamVM[]) => {

            this.svParamList = data;
            this.paramList = data;

            this.paramList.forEach(item => {
                if (this.currentParam == null) {
                    item.isOpen = true;
                }

                item.fileDepthPath = "";
                item.fileDepthFolders = [];
            })

            this.getDisplayParam(this.parentId);
            this.hideLoadingModal();
        });
    }

    getParam(paramId: number) {
        this.openLoadingModal();

        let query: string = "$expand=ParamScript,ParamValue,ParamValue/DataType";

        this.paramService.get(paramId, query).subscribe((param: IParam) => {
            this.hideLoadingModal();

            this.InputParam.PId = param.PId;
            this.InputParam.PName = param.PName;
            this.InputParam.ParentId = param.ParentId;
            this.InputParam.isGroup = param.isGroup;

            if (param.isGroup != true) {
                this.InputParam.PScript = param.ParamScript.PScript;
                this.InputParam.DTId = param.ParamValue.DTId;
                this.InputParam.PCode = param.ParamValue.PCode;
                this.InputParam.PDescription = param.ParamValue.PDescription;
                this.InputParam.PValue = param.ParamValue.PValue;
            }
            this.selectParamList = this.getArrangedParams(true, paramId).filter(x => x.ParentId == null);
        });
    }

    getArrangedParams(isGroup?: any, hideId?: number): IParamVM[] {
        this.arrangedParamList = this.paramList;

        if (isGroup != null) {
            this.arrangedParamList = this.arrangedParamList.filter(x => x.isGroup == true);
        }

        if (hideId != null) {
            this.arrangedParamList = this.arrangedParamList.filter(x => x.PId != hideId);
            if (this.svParamList.filter(x => x.ParentId == hideId).length > 0) {
                this.svParamList.filter(x => x.ParentId == hideId)[0].isSelected = true;
            }
        }

        this.arrangedParamList.forEach(paramItem => {
            paramItem.ChildParam = this.paramList.filter(x => x.ParentId == paramItem.PId);

            if (hideId != null) {
                paramItem.ChildParam = paramItem.ChildParam.filter(x => x.PId != hideId);
            }

            if (paramItem.ParentId == null) {
                paramItem.fileDepthPath = "0 " + paramItem.PId.toString() + " ";
            } else {
                paramItem.fileDepthPath = this.svParamList.filter(x => x.PId == paramItem.ParentId)[0].fileDepthPath + paramItem.PId.toString() + " ";
            }

            if (this.currentParam != null) {
                if (paramItem.fileDepthPath.startsWith(this.currentParam.fileDepthPath)) {
                    paramItem.isOpen = true;
                }
            } else {
                paramItem.isOpen = true;
            }
            paramItem.fileDepthFolders = this.svParamList.filter(x => paramItem.fileDepthPath.split(" ").lastIndexOf(x.PId.toString()) != -1);
        });

        return this.arrangedParamList;
    }

    getDisplayParam(parentId?: number) {
        if (parentId == null && this.parentId == null) {
            this.parentId = null;
            this.currentParam = null;
        } else {
            this.parentId = parentId;
            this.currentParam = this.svParamList.filter(x => x.PId == this.parentId)[0];
        }

        this.arrangedParamList.forEach(item => {
            if (item.PId == this.parentId) {
                item.isSelected = true;
                this.currentParam = item;
            } else {
                item.isSelected = false;
            }
        });

        if ((this.filterObj.Name != null && this.filterObj.Name != "")) {
            this.filterQaParamList(this.getArrangedParams());
        } else {
            this.qaParamList = this.getArrangedParams().filter(x => x.ParentId == null);
        }
        //this.displayParamList = this.svParamList.filter(x => x.ParentId == this.parentId);

        this.setPagination();
    }

    getParamFrmChild(paramItem?: IParamVM) {
        if (paramItem.isGroup == true) {
            this.currentParam = paramItem;
            this.parentId = paramItem.PId;
            this.getDisplayParam(paramItem.PId);
        } else {
            this.currentParam = this.svParamList.filter(x => x.PId == paramItem.ParentId)[0];

            if (this.currentParam != null) {
                this.currentParam.isSelected = true;
                this.parentId = this.currentParam.PId;
            }

            this.svParamList.filter(x => x.PId != this.parentId).forEach(item => {
                item.isSelected = false;
            })

            this.openEditModal(paramItem.PId);
            //this.getAllParam(this.parentId);
            //this.getDisplayParam(this.parentId);
        }
    }

    getParamFrmSelectChild(paramItem?: IParamVM) {
        if (paramItem == null || paramItem == undefined) {
            this.InputParam.ParentId = null;

            this.svParamList.forEach(item => {
                item.isSelected = false;
            })
        } else {
            this.InputParam.ParentId = paramItem.PId;

            this.svParamList.forEach(item => {
                if (item.PId != paramItem.PId) {
                    item.isSelected = false;
                }

                if (item.PId == paramItem.PId) {
                    item.isSelected = true;
                }
            })
        }
        this.selectParamList = this.getArrangedParams(true, this.InputParam.PId).filter(x => x.ParentId == null);
    }

    hasSubitem(paramId: number) {
        if (this.svParamList.filter(x => x.ParentId == paramId).length > 0) {
            return true;
        } else {
            return false;
        }
    }

    filterQaParamList(paramList?: IParamVM[]) {
        let newParamList: IParamVM[] = [];
        let filteredParamList: IParamVM[] = [];

        filteredParamList = paramList.filter(it => it.PName.toUpperCase().lastIndexOf(this.filterObj.Name.toUpperCase()) != -1);

        filteredParamList.forEach(filteredItem => {
            filteredItem.fileDepthFolders.forEach(item => {
                if (newParamList.filter(x => x.PId == item.PId).length == 0) {
                    item.isOpen = true;

                    if (this.parentId == item.PId) {
                        item.isSelected = true;
                    }
                    newParamList.push(item);
                }
            })
        })

        newParamList.forEach(item => {
            if (item.isGroup == true) {
                item.ChildParam = newParamList.filter(y => y.ParentId == item.PId);
            }
        });

        //this.paramList = newParamList;
        this.qaParamList = newParamList.filter(x => x.ParentId == null);
        this.setPagination();
    }

    gotoPage(pageNum?: number) {
        this.pagination.CurrentPage = pageNum <= 1 ? 1 : pageNum > this.pagination.TotalPage ? this.pagination.TotalPage : pageNum;

        this.displayParamList = this.svParamList.filter(x => x.ParentId == this.parentId);

        if (this.filterObj.Name != '' || this.filterObj.Name != null) {
            this.displayParamList = this.displayParamList.filter(x => x.PName.toLowerCase().lastIndexOf(this.filterObj.Name.toLowerCase()) != -1).slice((this.pagination.CurrentPage * this.pagination.ItemsPerPage) - this.pagination.ItemsPerPage, this.pagination.CurrentPage * this.pagination.ItemsPerPage);
        } else {
            this.displayParamList = this.displayParamList.slice((this.pagination.CurrentPage * this.pagination.ItemsPerPage) - this.pagination.ItemsPerPage, this.pagination.CurrentPage * this.pagination.ItemsPerPage);
        }
    }

    setPagination() {
        this.pagination.TotalItems = this.svParamList.filter(x => x.ParentId == this.parentId && x.PName.toLowerCase().lastIndexOf(this.filterObj.Name.toLowerCase()) != -1).length;
        this.pagination.TotalPage = Math.ceil(this.pagination.TotalItems / this.pagination.ItemsPerPage);

        if (this.pagination.TotalPage == 0) {
            this.pagination.TotalPage = 1;
        }

        this.gotoPage(1);
    }
}
