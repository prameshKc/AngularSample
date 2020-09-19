 import { Component, Injectable } from '@angular/core';
import { ToastyService, ToastOptions } from 'ngx-toasty';

import { ParamService, DataTypeService, ScriptExecuteService } from '../../services/BaseService';
import { IParam, IPaginationViewModel, ISelectListItem } from '../../models/Models';

import { IFilterViewModel, IParamVM } from '../../models/ViewModels';

@Component({
    selector: 'userParamSetup',
    templateUrl: 'userParam.component.html'
})
export class UserParamComponent {
    svParamList: IParamVM = {
        PId: 0,
        PName: 'Root',
        isGroup: true,
        ParentId: null
    };
    tempParamList: IParamVM[] = [];
    displayParamList: IParamVM[] = [];
    svParamFileList: IParamVM[] = [];
    collectionParamFile: any[] = [];
    options: ISelectListItem[] = [];

    toastOptions: ToastOptions;
    userParamList: any = {};

    parentIdArray: number[] = [];

    displayGroup: {
        Name: string,
        ParamList: IParamVM[]
    }[];

    filterObj?: IFilterViewModel = {
        Name: '',
        Sort: ''
    };

    pagination?: IPaginationViewModel = {
        CurrentPage: 1,
        MaxItems: 50,
        ItemsPerPage: 50,
        TotalPage: 1
    };

    constructor(
        private toastyService: ToastyService,
        private paramService: ParamService,
        private scriptExecuteService: ScriptExecuteService
    ) { }

    ngOnInit() {
        this.getAllSvParamList();
    }

    getAllSvParamList() {
        this.displayGroup = [];
        let query = "$expand=ParamScript,ParamValue";

        this.paramService.getAll(query).subscribe((data: IParamVM[]) => {
            localStorage.setItem('Param.DateType', data.filter(x => x.PId == 12)[0].ParamValue.PValue);
            localStorage.setItem('Param.DefaultFormatAD', data.filter(x => x.PId == 13)[0].ParamValue.PValue);
            localStorage.setItem('Param.DefaultFormatBS', data.filter(x => x.PId == 14)[0].ParamValue.PValue);

            this.tempParamList = data;
            this.displayParamList = data;

            this.displayParamList.filter(x => x.ParentId == null).forEach(item => {
                item.fileDepthFolders = [];
                this.getChild(item);
            })
            this.svParamList.ChildParam = this.displayParamList.filter(x => x.ParentId == null);

            this.svParamList.fileDepthPath = "Root/";
            this.svParamList.fileDepthFolders = [];

            this.svParamFileList = data.filter(x => x.isGroup != true);

            this.svParamFileList.forEach(item => {
                item.fileDepthPath = this.displayParamList.find(x => x.PId == item.PId).fileDepthPath;
                let pids: any[] = [];
                if (item.fileDepthPath != null) {
                    pids = item.fileDepthPath.split('/');
                } else {
                    item.fileDepthPath = '';
                }
                item.fileDepthFolders = this.displayParamList.filter(x => pids.lastIndexOf(x.PName.toString()) != -1);

                if (item.fileDepthPath.startsWith("Root/User Parameter")) {
                    if (this.displayGroup.filter(x => x.Name == item.fileDepthPath).length > 0) {
                        this.displayGroup.filter(x => x.Name == item.fileDepthPath)[0].ParamList.push(item);
                    } else {
                        this.displayGroup.push({
                            Name: item.fileDepthPath.toString(),
                            ParamList: [item]
                        });
                    }
                }
            });
        })
    }

    getChild(paramObj: IParamVM) {
        this.displayParamList.filter(x => x.PId == paramObj.PId)[0].ChildParam = this.displayParamList.filter(x => x.ParentId == paramObj.PId);
        this.displayParamList.filter(x => x.ParentId == paramObj.PId).forEach(item => {
            if (paramObj.fileDepthPath == null) {
                paramObj.fileDepthPath = "Root/";
            }
            item.fileDepthFolders = paramObj.fileDepthFolders;

            item.fileDepthPath = paramObj.fileDepthPath.toString() + paramObj.PName.toString() + "/";

            if (item.isGroup == true) {
                this.getChild(item);
            }
        });
    }

    toggleEdit(PId: number) {
        this.svParamFileList.filter(x => x.PId == PId)[0].editToggle = true;

        if (this.svParamFileList.filter(x => x.PId == PId)[0].ParamValue.DTId == 5) {
            this.scriptExecuteService.executeSql(this.svParamFileList.filter(x => x.PId == PId)[0].ParamScript.PScript).subscribe((data: ISelectListItem[]) => {
                this.svParamFileList.filter(x => x.PId == PId)[0].options = data;
            })
        } else if (this.svParamFileList.filter(x => x.PId == PId)[0].ParamValue.DTId == 3) {
            if (this.svParamFileList.filter(x => x.PId == PId)[0].ParamValue.PValue == "true") {
                this.svParamFileList.filter(x => x.PId == PId)[0].ParamValue.PValue = true;
            } else {
                this.svParamFileList.filter(x => x.PId == PId)[0].ParamValue.PValue = false;
            }
        }
    }

    editParam(paramObj: IParamVM) {
        if (paramObj.ParamValue.PValue != null) {
            paramObj.ParamValue.PValue = paramObj.ParamValue.PValue.toString();
        }

        let param: IParam = {
            PId: paramObj.PId,
            PName: paramObj.PName,
            isGroup: paramObj.isGroup,
            ParentId: paramObj.ParentId,
            ParamScript: paramObj.ParamScript,
            ParamValue: paramObj.ParamValue
        };

        this.paramService.put(paramObj.PId, param).subscribe(data => {
            var toastOptions: ToastOptions = {
                title: "Success",
                msg: "Parameter has been successfully Added",
                showClose: true,
                timeout: 5000,
                theme: 'bootstrap'
            };
            this.toastyService.success(toastOptions);

            //this.getAllSvParamList();
            this.svParamFileList.filter(x => x.PId == paramObj.PId)[0] = data;
            this.svParamFileList.filter(x => x.PId == paramObj.PId)[0].editToggle = false;
        })
    }

    cancel(PId: number) {
        let query = "$expand=ParamScript,ParamValue";

        this.paramService.get(PId, query).subscribe((data: IParamVM) => {
            this.svParamFileList.filter(x => x.PId == PId)[0] = data;
            this.svParamFileList.filter(x => x.PId == PId)[0].editToggle = false;
        })
        //Object.assign(this.svParamFileList.filter(x => x.PId == PId)[0], this.tempParamList.filter(x => x.PId == PId)[0].ParamValue);
    }
}
