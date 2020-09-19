import { Component, ViewChild, OnInit } from '@angular/core';
import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';

import { CategoryService } from '../../services/BaseService';
import { ICategory, IPaginationViewModel } from '../../models/Models';

import { IFilterViewModel, ICategoryVM } from '../../models/ViewModels';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
    selector: 'categorySetup',
    templateUrl: 'category.component.html',
})
export class CategoryComponent implements OnInit {
    toggleListVsIcon: boolean;
    selected: string;
    output: string;

  @ViewChild('childModal', { static : false}) public childModal: ModalDirective;
  @ViewChild('deleteModal', { static: false }) public deleteModal: ModalDirective;
  @ViewChild('loadingModal', { static: false }) public loadingModal: ModalDirective;

    isLoading?: boolean = false;

    isAddCategory: boolean = false;
    isExpanded: boolean = false;
    InputCategory: ICategoryVM = <ICategoryVM>{};
    requiredParentId: number;
    closeForm: boolean = true;
    isEditCategory: boolean = false;
    selectedModalLoaded: boolean = false;
    deleteModalLoaded: boolean = false;
    deleteId: number;

    pagination?: IPaginationViewModel = {
        CurrentPage: 1,
        MaxItems: 50,
        ItemsPerPage: 18,
        TotalPage: 1
    };

    toastOptions: ToastOptions;
    filterObj?: IFilterViewModel = <IFilterViewModel>{};

    parentId?: number;

    currentCategory?: ICategoryVM;
    svCategoryList: ICategoryVM[] = [];
    arrangedCategoryList: ICategoryVM[] = [];
    displayCategoryList: ICategoryVM[] = [];
    displayCategoryListPerPage: ICategoryVM[] = [];

    tempCategoryList: ICategoryVM[] = [];
    qaCategoryList: ICategoryVM[] = [];
    selectCategoryList: ICategoryVM[] = [];
    categoryList: ICategoryVM[] = [];
    userId: string;

    constructor(
        public categoryService: CategoryService    ) {
        this.userId = localStorage.getItem('UserId');
        this.filterObj = { Name: '', Sort: '' };
    }

    ngOnInit() {
        this.getAllCategory();
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
            //this.isLoading = false;
            if (this.loadingModal != undefined) {
                this.loadingModal.hide();
            }
        }, 1000);
    }

    /**
     * to open add modal
     */
    public openAddModal() {
        this.isAddCategory = true;
        this.isEditCategory = false;
        this.selectedModalLoaded = true;

        if (this.parentId == null) {
            this.InputCategory.ParentId = 0;
        } else {
            this.InputCategory.ParentId = this.parentId;
        }
        this.InputCategory.ParentId = this.parentId;

        this.selectCategoryList = this.getArrangedCategories(true).filter(x => x.ParentId == null);
        this.childModal.show();
    }

    /**
     * to open edit modal
     */
    public openEditModal(id?: number) {
        this.getCategory(id)
        this.isEditCategory = true;
        this.isAddCategory = false;
        this.selectedModalLoaded = true;

        this.selectCategoryList = this.getArrangedCategories(true).filter(x => x.ParentId == null);

        this.childModal.show();
    }

    /**
     * to open delete modal
     */
    public openDeleteModal(Id: number) {
        this.deleteId = Id;
        this.deleteModalLoaded = true;
        this.deleteModal.show();
    }

    /**
     * to hide add/edit modal
     */
    public hideChildModal(): void {
        this.childModal.hide();
        this.isAddCategory = false;
        this.isEditCategory = false;
        this.InputCategory = <ICategoryVM>{};
        this.getDisplayCategory(this.parentId);
    }

    /**
     * to hide delete modal
     */
    public hideDeleteChildModal(): void {
        this.getDisplayCategory(this.parentId);
        this.deleteModal.hide();
    }

    /**
     * to save new category
     */
    public saveCategory() {
        let saveCategoryItem: ICategory = {
            CategoryName: this.InputCategory.CategoryName,
            ParentId: this.InputCategory.ParentId,
            IsGroup: this.InputCategory.IsGroup ? this.InputCategory.IsGroup : false,
            PostedBy: this.userId
        }

        this.parentId = this.InputCategory.ParentId;

        this.categoryService.post(saveCategoryItem).subscribe(() => {
            this.getAllCategory();
            this.hideChildModal();
        })
    }

    /**
     * to update existing category
     */
    public updateCategory() {
        let saveCategoryItem: ICategory = {
            CategoryId: this.InputCategory.CategoryId,
            CategoryName: this.InputCategory.CategoryName,
            ParentId: this.InputCategory.ParentId,
            IsGroup: this.InputCategory.IsGroup ? this.InputCategory.IsGroup : false,
            PostedOn: this.InputCategory.PostedOn,
            PostedBy: this.InputCategory.PostedBy,
            ModifiedBy: this.userId
        }

        this.categoryService.put(saveCategoryItem.CategoryId, saveCategoryItem).subscribe(() => {
            this.parentId = this.InputCategory.ParentId;
            this.getAllCategory();
            this.hideChildModal();
        })
    }

    public deleteCategory() {
        this.categoryService.delete(this.deleteId).subscribe(() => {
            this.getAllCategory();
            this.hideDeleteChildModal();
        });
    }

    /**
     * to go back to parent folder in tree structure
     */
    public back(parentId?: number) {
        this.currentCategory = this.svCategoryList.filter(y => y.CategoryId == parentId)[0];
        this.parentId = this.currentCategory.ParentId;
        this.getDisplayCategory(this.parentId);
    }

    /**
     * to filter data in current list
     */
    public filterData() {
        this.svCategoryList.sort()

        this.tempCategoryList = this.displayCategoryList;

        if (this.filterObj != null) {
            if (this.filterObj.Sort == 'true') {
                this.displayCategoryList = this.displayCategoryList.sort(function (a, b) {
                    if (a.CategoryName < b.CategoryName) return -1;
                    if (a.CategoryName > b.CategoryName) return 1;
                    return 0;
                });
            }
            else if (this.filterObj.Sort == 'false') {
                this.displayCategoryList = this.displayCategoryList.sort(function (a, b) {
                    if (a.CategoryName < b.CategoryName) return 1;
                    if (a.CategoryName > b.CategoryName) return -1;
                    return 0;
                });
            }
            else {
                this.displayCategoryList = this.tempCategoryList;
            }
        }
    }

    getAllCategory() {
        this.openLoadingModal();
        this.categoryService.getAll().subscribe((data: ICategoryVM[]) => {
            this.hideLoadingModal();

            this.svCategoryList = data;
            this.categoryList = data;

            this.categoryList.forEach(item => {
                if (this.currentCategory == null) {
                    item.isOpen = true;
                }

                item.fileDepthPath = "";
                item.fileDepthFolders = [];
            })

            this.getDisplayCategory(this.parentId);
        });
    }

    getCategory(categoryId: number) {
        this.categoryService.get(categoryId).subscribe((data: ICategoryVM) => {
            this.InputCategory = data;
        });
    }

    getArrangedCategories(IsGroup?: any): ICategoryVM[] {
        if (IsGroup != null) {
            this.arrangedCategoryList = this.categoryList.filter(x => x.IsGroup == true);
        } else {
            this.arrangedCategoryList = this.categoryList;
        }

        this.arrangedCategoryList.forEach(categoryItem => {
            categoryItem.ChildCategory = this.categoryList.filter(x => x.ParentId == categoryItem.CategoryId);
            if (categoryItem.ParentId == null) {
                categoryItem.fileDepthPath = "0 " + categoryItem.CategoryId.toString() + " ";
            } else {
                categoryItem.fileDepthPath = this.svCategoryList.filter(x => x.CategoryId == categoryItem.ParentId)[0].fileDepthPath + categoryItem.CategoryId.toString() + " ";
            }

            if (this.currentCategory != null) {
                if (categoryItem.fileDepthPath.startsWith(this.currentCategory.fileDepthPath)) {
                    categoryItem.isOpen = true;
                }
            } else {
                categoryItem.isOpen = true;
            }
            categoryItem.fileDepthFolders = this.svCategoryList.filter(x => categoryItem.fileDepthPath.split(" ").lastIndexOf(x.CategoryId.toString()) != -1);
        });

        return this.arrangedCategoryList;
    }

    getDisplayCategory(parentId?: number) {
        if (parentId == null && this.parentId == null) {
            this.parentId = null;
            this.currentCategory = null;
        } else {
            this.parentId = parentId;
            this.currentCategory = this.svCategoryList.filter(x => x.CategoryId == this.parentId)[0];
        }

        this.arrangedCategoryList.forEach(item => {
            if (item.CategoryId == this.parentId) {
                item.isSelected = true;
                this.currentCategory = item;
            } else {
                item.isSelected = false;
            }
        });

        if ((this.filterObj.Name != null && this.filterObj.Name != "")) {
            this.filterQaCategoryList(this.getArrangedCategories());
        } else {
            this.qaCategoryList = this.getArrangedCategories().filter(x => x.ParentId == null);
        }
        this.setPagination();
    }

    getCategoryFrmChild(categoryItem?: ICategoryVM) {
        if (categoryItem.IsGroup == true) {
            this.currentCategory = categoryItem;
            this.parentId = categoryItem.CategoryId;
            this.getDisplayCategory(categoryItem.CategoryId);
        } else {
            this.currentCategory = this.svCategoryList.filter(x => x.CategoryId == categoryItem.ParentId)[0];
            if (this.currentCategory != null) {
                this.currentCategory.isSelected = true;
                this.parentId = this.currentCategory.CategoryId;
            }

            this.svCategoryList.filter(x => x.CategoryId != this.parentId).forEach(item => {
                item.isSelected = false;
            })

            this.openEditModal(categoryItem.CategoryId);
        }
    }

    getCategoryFrmSelectChild(categoryItem?: ICategoryVM) {
        if (categoryItem == null || categoryItem == undefined) {
            this.InputCategory.ParentId = null;

            this.selectCategoryList.forEach(item => {
                item.isSelected = false;
            })
        } else {
            this.InputCategory.ParentId = categoryItem.CategoryId;
        }
    }

    hasSubitem(categoryId: number) {
        if (this.svCategoryList.filter(x => x.ParentId == categoryId).length > 0) {
            return true;
        } else {
            return false;
        }
    }

    filterQaCategoryList(categoryList?: ICategoryVM[]) {
        let newCategoryList: ICategoryVM[] = [];
        let filteredCategoryList: ICategoryVM[] = [];

        filteredCategoryList = categoryList.filter(it => it.CategoryName.toUpperCase().lastIndexOf(this.filterObj.Name.toUpperCase()) != -1);

        filteredCategoryList.forEach(filteredItem => {
            filteredItem.fileDepthFolders.forEach(item => {
                if (newCategoryList.filter(x => x.CategoryId == item.CategoryId).length == 0) {
                    item.isOpen = true;

                    if (this.parentId == item.CategoryId) {
                        item.isSelected = true;
                    }
                    newCategoryList.push(item);
                }
            })
        })

        newCategoryList.forEach(item => {
            if (item.IsGroup == true) {
                item.ChildCategory = newCategoryList.filter(y => y.ParentId == item.CategoryId);
            }
        });

        this.qaCategoryList = newCategoryList.filter(x => x.ParentId == null);
        this.setPagination();
    }


    gotoPage(pageNum?: number) {
        this.pagination.CurrentPage = pageNum <= 1 ? 1 : pageNum > this.pagination.TotalPage ? this.pagination.TotalPage : pageNum;

        this.displayCategoryList = this.svCategoryList.filter(x => x.ParentId == this.parentId);

        if (this.filterObj.Name != '' || this.filterObj.Name != null) {
            this.displayCategoryList = this.displayCategoryList.filter(x => x.CategoryName.toLowerCase().lastIndexOf(this.filterObj.Name.toLowerCase()) != -1).slice((this.pagination.CurrentPage * this.pagination.ItemsPerPage) - this.pagination.ItemsPerPage, this.pagination.CurrentPage * this.pagination.ItemsPerPage);
        } else {
            this.displayCategoryList = this.displayCategoryList.slice((this.pagination.CurrentPage * this.pagination.ItemsPerPage) - this.pagination.ItemsPerPage, this.pagination.CurrentPage * this.pagination.ItemsPerPage);
        }
    }

    setPagination() {
        this.pagination.TotalItems = this.svCategoryList.filter(x => x.ParentId == this.parentId && x.CategoryName.toLowerCase().lastIndexOf(this.filterObj.Name.toLowerCase()) != -1).length;
        this.pagination.TotalPage = Math.ceil(this.pagination.TotalItems / this.pagination.ItemsPerPage);

        if (this.pagination.TotalPage == 0) {
            this.pagination.TotalPage = 1;
        }

        this.gotoPage(1);
    }

}
