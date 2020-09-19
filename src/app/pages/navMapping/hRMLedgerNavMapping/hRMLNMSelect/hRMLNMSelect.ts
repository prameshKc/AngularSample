import { Component, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NavViewModel } from '../../../../models/ViewModels';

@Component({
    selector: 'hRMLNMSelect',
    templateUrl: 'hRMLNMSelect.html'
})
export class HRMLNMSelectComponent implements OnChanges {
    @Input() selectedNavOption?: string;
    @Input() navOptions?: NavViewModel[] = [];
    @Output() returnselectedNavOption: EventEmitter<string> = new EventEmitter<string>();
    openSearch: boolean = false;

    constructor(
    ) {
    }

    ngOnChanges(simpleChange: SimpleChanges) {
        console.log(this.selectedNavOption);
    }


    selectedNavOptionChange() {
        this.returnselectedNavOption.emit(this.selectedNavOption);
    }

}