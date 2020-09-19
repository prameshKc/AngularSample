import { Component, OnInit, Injectable, Input, Output, EventEmitter } from '@angular/core';

import { CategoryService } from '../../../services/BaseService';
import { ICategory } from '../../../models/Models';
import { ICategoryVM } from '../../../models/ViewModels';

@Component({
    selector: 'childCategory',
    templateUrl: 'childCategory.component.html',
    styleUrls: ['childCategory.component.css']
})
export class ChildCategoryComponent implements OnInit {
    categoryObj?: ICategoryVM;

    @Input() categoryListObj: ICategoryVM[];
    @Output() returnCategoryList: EventEmitter<ICategory> = new EventEmitter<ICategory>();

    IsExpanded: boolean = false;
    category: ICategory;
    parentId?: number;

    constructor(
        public categoryService: CategoryService
    ) {
        if (this.categoryListObj != null) {
            this.categoryListObj.forEach(item => {
                if (item.isOpen == null) {
                    item.isOpen = false;
                }
            })
        }
    }

    ngOnInit() { }

    toggle(categoryListItem: ICategory) {
        if (this.categoryListObj.length > 0) {
            this.categoryListObj.filter(x => x.CategoryId = categoryListItem.CategoryId)[0].isOpen = !this.categoryListObj.filter(x => x.CategoryId = categoryListItem.CategoryId)[0].isOpen;
        }
    }

    filterSelected(categoryListItem?: ICategoryVM) {
        this.returnCategoryList.emit(categoryListItem);
    }


    findSelectedChild(categoryListObj?: ICategoryVM[], categoryItem?: ICategoryVM) {
        this.categoryListObj.forEach(item => {
            if (item.CategoryId == categoryItem.CategoryId) {
                item.isSelected = true;
                this.categoryObj = item;
            } else {
                item.isSelected = null;
            }

            if (item.ChildCategory.length > 0) {
                this.findSelectedChild(item.ChildCategory);
            }
        });

        this.returnCategoryList.emit(this.categoryObj);
    }
}
