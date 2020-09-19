import { Component, OnInit, Injectable, Input, Output, EventEmitter } from '@angular/core';


import { DesignationService } from '../../../services/BaseService';
import { IDesignation } from '../../../models/Models';
import { IDesignationVM } from '../../../models/ViewModels';

@Component({
    selector: 'selectChildDesignation',
    templateUrl: 'selectChildDesignation.component.html',
})
export class SelectChildDesignationComponent implements OnInit {
    designationObj?: IDesignationVM;

    @Input() designationListObj: IDesignationVM[];

    @Output() returnDesignationList: EventEmitter<IDesignation> = new EventEmitter<IDesignation>();

    IsExpanded: boolean = false;

    designation: IDesignation;

    parentId?: number;

    constructor(
        public designationService: DesignationService
    ) {
        if (this.designationListObj != null) {
            this.designationListObj.forEach(item => {
                if (item.isOpen == null) {
                    item.isOpen = false;
                }
            })
        }
    }

    ngOnInit() { }

    toggle(designationListItem: IDesignation) {
        if (this.designationListObj.length > 0) {
            this.designationListObj.filter(x => x.DesignationId = designationListItem.DesignationId)[0].isOpen = !this.designationListObj.filter(x => x.DesignationId = designationListItem.DesignationId)[0].isOpen;
        }
    }

    filterSelected(designationListItem?: IDesignationVM) {
        this.returnDesignationList.emit(designationListItem);
    }

    findSelectedChild(designationListObj?: IDesignationVM[], designationItem?: IDesignationVM) {
        this.designationListObj.forEach(item => {
            if (item.DesignationId == designationItem.DesignationId) {
                item.isSelected = true;
                this.designationObj = item;
            } else {
                item.isSelected = null;
            }

            if (item.ChildDesignation.length > 0) {
                this.findSelectedChild(item.ChildDesignation);
            }
        });

        this.returnDesignationList.emit(this.designationObj);
    }
}
