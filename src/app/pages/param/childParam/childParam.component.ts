﻿import { Component, Injectable, Input, Output, EventEmitter } from '@angular/core';

import { ParamService } from '../../../services/BaseService';
import { IParam } from '../../../models/Models';
import { IParamVM } from '../../../models/ViewModels';

@Component({
    selector: 'childParam',
    templateUrl: 'childParam.component.html',
})
export class ChildParamComponent {
    paramObj?: IParamVM;

    @Input() paramListObj: IParamVM[];
    @Output() returnParamList: EventEmitter<IParam> = new EventEmitter<IParam>();

    IsExpanded: boolean = false;
    param: IParam;
    parentId?: number;

    constructor(
        public paramService: ParamService
    ) {
        if (this.paramListObj != null) {
            this.paramListObj.forEach(item => {
                if (item.isOpen == null) {
                    item.isOpen = false;
                }
            })
        }
    }

    ngOnInit() { }

    toggle(paramListItem: IParam) {
        if (this.paramListObj.length > 0) {
            this.paramListObj.filter(x => x.PId = paramListItem.PId)[0].isOpen = !this.paramListObj.filter(x => x.PId = paramListItem.PId)[0].isOpen;
        }
    }

    filterSelected(paramListItem?: IParamVM) {
        this.returnParamList.emit(paramListItem);
    }


    findSelectedChild(paramListObj?: IParamVM[], paramItem?: IParamVM) {
        this.paramListObj.forEach(item => {
            if (item.PId == paramItem.PId) {
                item.isSelected = true;
                this.paramObj = item;
            } else {
                item.isSelected = null;
            }

            if (item.ChildParam.length > 0) {
                this.findSelectedChild(item.ChildParam);
            }
        });

        this.returnParamList.emit(this.paramObj);
    }
}
