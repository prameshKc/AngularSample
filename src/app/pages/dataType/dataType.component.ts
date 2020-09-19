import { Component, ViewChild, OnInit, Injectable } from '@angular/core';
import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';
import { DataTypeService } from '../../services/BaseService';
import { IDataType, IPaginationViewModel } from '../../models/Models';

import { IFilterViewModel } from '../../models/ViewModels';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
  selector: 'DataType',
  templateUrl: 'dataType.component.html',
})
export class DataTypeComponent implements OnInit {

  @ViewChild('childModal', { static: false }) public childModal: ModalDirective
  @ViewChild('modal', { static: false })
  ModalDirective: any;
  selected: string;
  output: string;

  @ViewChild('deleteModal', { static: false }) public deleteModal: ModalDirective
  @ViewChild('modal', { static: false })
  ModalDirectiveDelete: any;


  isAddDataType: boolean = false;
  isExpanded: boolean = false;
  InputDataType: IDataType = <IDataType>{};
  requiredParentId: number;
  closeForm: boolean = true;
  isEditDataType: boolean = false;
  selectedModalLoaded: boolean = false;
  deleteModalLoaded: boolean = false;
  deleteId: number;
  toggleListVsIcon: boolean = false;

  filterObj?: IFilterViewModel;

  svDataTypeList: IDataType[] = [];
  dataTypeList: IDataType[] = [];
  qaDataTypeList: IDataType[] = [];
  tempDataTypeList: IDataType[] = [];
  nameList: IDataType[] = [];

  parentId: number;

  pagination?: IPaginationViewModel = {
    CurrentPage: 1,
    MaxItems: 50,
    ItemsPerPage: 50,
    TotalPage: 0
  };

  constructor(
    public dataTypeService: DataTypeService,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig
  ) {
    this.getDataTypes();
    this.filterObj = { Name: '', Sort: '' }
  }

  ngOnInit() {
    this.filterObj = { Name: '', Sort: '' }
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
  }

  /**
   * to open add modal
   */
  openAddModal() {
    this.isAddDataType = true;
    this.isEditDataType = false;
    this.selectedModalLoaded = true;
    if (this.childModal != undefined) {
      this.childModal.config.backdrop = false;
    }
    let el = document.createElement('div');
    el.className = 'modal-backdrop fade in';
    document.body.appendChild(el);
    this.childModal.show();
  }


  /**
   * to open edit modal
   */

  openEditModal() {
    this.isEditDataType = true;
    this.isAddDataType = false;
    this.selectedModalLoaded = true;
    if (this.childModal != undefined) {
      this.childModal.config.backdrop = false;
    }
    let el = document.createElement('div');
    el.className = 'modal-backdrop fade in';
    document.body.appendChild(el);
    this.childModal.show();
  }


  /**
   * to open delete modal
   */

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


  /**
   * to hide add/edit modal
   */

  public hideChildModal(): void {
    document.body.removeChild(document.querySelector('.modal-backdrop'));
    this.childModal.hide();
    this.isAddDataType = false;
    this.isEditDataType = false;
    this.InputDataType = <IDataType>{};

  }


  /**
   * to hide delete modal
   */

  public hideDeleteChildModal(): void {
    document.body.removeChild(document.querySelector('.modal-backdrop'));
    this.deleteModal.hide();

  }


  resetPagination() {
    this.pagination = {
      CurrentPage: 1,
      MaxItems: 50,
      ItemsPerPage: 50,
      TotalPage: 0
    };
  }

  getPaginatedDataTypeResult(DTId?: number, filterObj?: IFilterViewModel) {

    this.dataTypeService.getAll().subscribe((data: IDataType[]) => {
      this.svDataTypeList = data;
      if (DTId != null) {
        this.dataTypeList = this.svDataTypeList.filter(x => x.DTId == DTId);
      } else {
        this.dataTypeList = this.svDataTypeList;
      }
      this.filter(DTId, filterObj);
      this.pagination.TotalPage = Math.ceil(this.svDataTypeList.length / this.pagination.ItemsPerPage);
      this.pagination.TotalItems = this.svDataTypeList.length;
      this.dataTypeList = this.svDataTypeList.slice((this.pagination.CurrentPage * this.pagination.ItemsPerPage) - this.pagination.ItemsPerPage, this.pagination.CurrentPage * this.pagination.ItemsPerPage)
    })
  }


  /**
  @summary : to get list of all DataType list  
   * @param DataTypeId
   */
  getDataTypes(DataTypeId?: number, filterObj?: IFilterViewModel) {
    //this.resetPagination();
    this.parentId = DataTypeId;
    this.getPaginatedDataTypeResult(DataTypeId, filterObj);
  }

  filter(DataTypeId?: number, filterObj?: IFilterViewModel) {
    this.tempDataTypeList = this.svDataTypeList;

    if (filterObj != null) {
      if (filterObj.Name != null && filterObj.Name != '') {
        this.dataTypeList = this.svDataTypeList.filter(x => x.DType.toLowerCase().startsWith(filterObj.Name.toLowerCase()));
      } else {
        this.dataTypeList = this.svDataTypeList;
      }
      if (filterObj.Sort == 'true') {
        this.dataTypeList = this.svDataTypeList;
      }
      if (filterObj.Sort == 'true') {
        this.dataTypeList = this.dataTypeList.sort(function (a, b) {
          if (a.DType < b.DType) return -1;
          if (a.DType > b.DType) return 1;
          return 0;
        });
      }
      else if (filterObj.Sort == 'false') {
        this.dataTypeList = this.dataTypeList.sort(function (a, b) {
          if (a.DType < b.DType) return 1;
          if (a.DType > b.DType) return -1;
          return 0;
        });
      }
      else {
        this.dataTypeList = this.tempDataTypeList;
      }
    }
  }

  toggleListVsIconFn() {
    this.toggleListVsIcon = !this.toggleListVsIcon;
  }


  public filterHome(pagination: number = 1) {
    this.pagination.CurrentPage = pagination <= 1 ? 1 : pagination > this.pagination.TotalPage ? this.pagination.TotalPage : pagination;
    this.getDataTypes(this.parentId, this.filterObj);
  }


  //Add DataType
  public saveDataType() {
    this.dataTypeService.post(this.InputDataType)
      .subscribe(() => {
        var toastOptions: ToastOptions = {
          title: "Success",
          msg: "DataType has been successfully Added",
          showClose: true,
          timeout: 5000,
          theme: 'bootstrap'
        };
        this.toastyService.success(toastOptions);

        this.InputDataType = <IDataType>{};
        this.svDataTypeList = [];
        this.getDataTypes();
        this.isAddDataType = false;
        this.selectedModalLoaded = false;
        this.hideChildModal();
      });

  }

  //Edit DataType

  public getDataType(id: number) {
    this.openEditModal();
    this.dataTypeService.get(id)
      .subscribe((div: any) => {
        this.InputDataType = div;
      });
  }

  public editDataType(dataTypeObj: IDataType) {
    this.dataTypeService.put(dataTypeObj.DTId, dataTypeObj)
      .subscribe(() => {
        this.isEditDataType = false;
        this.svDataTypeList = [];
        this.InputDataType = <IDataType>{};
        this.getDataTypes(this.parentId);
        this.selectedModalLoaded = false;
        this.hideChildModal();
      });

  }

  //Delete DataType
  public deleteDataType() {
    this.dataTypeService.delete(this.deleteId)
      .subscribe(() => {
        this.svDataTypeList = [];
        //this.InputDataType = <IDataType>{};
        this.getDataTypes(this.parentId);
        this.deleteModalLoaded = false;
        this.hideChildModal();
      });
  }

}
