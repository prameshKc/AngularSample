import { Component, OnInit, Injectable, Input, Output, EventEmitter } from '@angular/core';

import { DivisionService } from '../../../services/BaseService';
import { IDivision } from '../../../models/Models';
import { IDivisionVM } from '../../../models/ViewModels';

@Component({
    selector: 'childDivision',
    templateUrl: 'childDivision.component.html',
})
export class ChildDivisionComponent implements OnInit {
    divisionObj?: IDivisionVM;

    @Input() divisionListObj: IDivisionVM[];

    @Output() returnDivisionList: EventEmitter<IDivision> = new EventEmitter<IDivision>();

    IsExpanded: boolean = false;

    division: IDivision;

    parentId?: number;

    constructor(
        public divisionService: DivisionService
    ) {
        if (this.divisionListObj != null) {
            this.divisionListObj.forEach(item => {
                if (item.isOpen == null) {
                    item.isOpen = false;
                }
            })
        }
    }

    ngOnInit() { }

    toggle(divisionListItem: IDivision) {
        if (this.divisionListObj.length > 0) {
            this.divisionListObj.filter(x => x.DivisionId = divisionListItem.DivisionId)[0].isOpen = !this.divisionListObj.filter(x => x.DivisionId = divisionListItem.DivisionId)[0].isOpen;
        }
    }

    filterSelected(divisionListItem?: IDivisionVM) {
        this.returnDivisionList.emit(divisionListItem);
    }


    findSelectedChild(divisionListObj?: IDivisionVM[], divisionItem?: IDivisionVM) {
        this.divisionListObj.forEach(item => {
            if (item.DivisionId == divisionItem.DivisionId) {
                item.isSelected = true;
                this.divisionObj = item;
            } else {
                item.isSelected = null;
            }

            if (item.ChildDivision.length > 0) {
                this.findSelectedChild(item.ChildDivision);
            }
        });

        this.returnDivisionList.emit(this.divisionObj);
    }
}
