import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { IPagination } from '../../models/models';

@Component({
  selector: 'app-pagination',
  templateUrl: 'pagination.component.html'
})
export class PaginationComponent implements OnChanges {
  @Input() PaginationSetting: IPagination;
  @Output() setPagination = new EventEmitter<IPagination>();
  pages: number;

  constructor() {
    this.PaginationSetting = {
      ItemsPerPage: 50,
      TotalItems: 0,
      CurrentPage: 1,
      SortBy: null
    };
  }


  ngOnChanges(changes: SimpleChanges) {
    if (this.PaginationSetting == null) {
      this.PaginationSetting = {
        ItemsPerPage: 50,
        TotalItems: 0,
        CurrentPage: 1,
        SortBy: null
      };
    }
    let newChanges: any = changes;
    if (JSON.stringify(newChanges.PaginationSetting.currentValue) !== JSON.stringify(newChanges.PaginationSetting.previousValue)) {
      this.gotoPage(this.PaginationSetting.CurrentPage);
    }
  }

  setPaginationSetting() {
    this.pages = Math.ceil(this.PaginationSetting.TotalItems / this.PaginationSetting.ItemsPerPage);
    if (this.pages == 0) {
      this.pages = 1;
    }
    this.setPagination.emit(this.PaginationSetting);
  }

  gotoPage(pageNo: number) {
    this.PaginationSetting.CurrentPage = pageNo;
    this.setPaginationSetting();
  }

  previousPage() {
    this.PaginationSetting.CurrentPage = this.PaginationSetting.CurrentPage - 1;
    this.gotoPage(this.PaginationSetting.CurrentPage);
  }

  nextPage() {
    this.PaginationSetting.CurrentPage = this.PaginationSetting.CurrentPage + 1;
    this.gotoPage(this.PaginationSetting.CurrentPage);
  }

  selectItemsPerPage(itemsPerPage: any) {
    this.PaginationSetting.ItemsPerPage = parseInt(itemsPerPage);
    this.PaginationSetting.CurrentPage = 1;
    this.setPaginationSetting();
  }
}
