import { Component, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NavViewModel } from '../../../../models/ViewModels';

@Component({
  selector: 'branchNMSelect',
  templateUrl: 'branchNMSelect.html'
})
export class BranchNMSelectComponent implements OnChanges {
  @Input() selectedNavOption?: string;
  @Input() navOptions?: NavViewModel[] = [];
  @Output() returnselectedNavOption: EventEmitter<string> = new EventEmitter<string>();
  openSearch: boolean = false;

  constructor() { }

  ngOnChanges(simpleChange: SimpleChanges) {
    console.log(simpleChange);
    console.log(this.selectedNavOption);
  }


  selectedNavOptionChange() {
    this.returnselectedNavOption.emit(this.selectedNavOption);
  }

}
