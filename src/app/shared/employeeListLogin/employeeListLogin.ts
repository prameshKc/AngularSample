import { Component, EventEmitter, Output } from '@angular/core';
import { SupervisorListService } from '../../services/BaseService';
import {
  IDepartment,
  IUser,
  IODataResult,
  IPagination
} from '../../models/Models';
import { IGetEmployeeListLogin } from '../../models/ViewModels';
import {
  trigger,
  style,
  transition,
  query,
  stagger,
  animate,
  keyframes
} from '@angular/animations';

@Component({
  selector: 'employee-list-login',
  templateUrl: 'employeeListLogin.html',
  styleUrls: ['employeeListLogin.css'],
  animations: [
    trigger('fadeIn_left-sequence', [
      transition('* =>*', [
        query(':enter', style({ opacity: 0 }), {
          optional: true
        }),
        query(
          ':enter',
          [
            stagger('20ms', [
              animate(
                '200ms ease-in-out',
                keyframes([
                  style({ opacity: 0, transform: 'translateY(8px)' }),
                  style({ opacity: 1, transform: 'translateX(0px)' })
                ])
              )
            ])
          ],
          {
            optional: true
          }
        )
      ])
    ])
  ]
})
export class EmployeeListLoginComponent {
  @Output()
  close: EventEmitter<any> = new EventEmitter();
  svEmployeeList: IGetEmployeeListLogin[] = [];

  svDepartmentList: IDepartment[] = [];

  userId: string;
  userDetails: IUser;
  searchText: string;
  getList;
  //for pagination
  pagination?: IPagination;
  sortToggle: boolean = true;
  sortAttribute: string = 'EmployeeName';

  constructor(public supervisorListService: SupervisorListService) {
    this.pagination = <IPagination>{
      CurrentPage: 1,
      ItemsPerPage: 50,
      TotalItems: 0,
      SortBy: null
    };

    this.svEmployeeList = [];
  }
  getEmployeeList() {
    this.svEmployeeList = [];
    // tslint:disable-next-line:max-line-length
    this.supervisorListService
      .GetEmployeeListLogin(
        this.pagination,
        this.sortAttribute,
        this.sortToggle,
        this.searchText
      )
      .subscribe((data: IODataResult<IGetEmployeeListLogin[]>) => {
        this.svEmployeeList = data.value;

        this.pagination = {
          ItemsPerPage: this.pagination.ItemsPerPage,
          TotalItems: data.count,
          CurrentPage: this.pagination.CurrentPage,
          SortBy: this.pagination.SortBy
        };
      });
  }

  filter(x?: any) {
    this.pagination.CurrentPage = 1;
    clearTimeout(this.getList);
    this.getList = setTimeout(() => {
      this.getEmployeeList();
    }, 500);
  }

  selectEmployee($event: any) {
    if ($event.item == null || $event.item == undefined) {
      this.reset();
    } else {
      this.searchText = $event.item;
    }
    //this.selectedEmployee.emit(this.InputEmployee);
  }

  sort(sortA: string) {
    if (this.sortAttribute == sortA) {
      this.sortToggle = !this.sortToggle;
    } else {
      this.sortToggle = true;
    }
    this.sortAttribute = sortA;

    this.getEmployeeList();
  }

  reset() {
    this.searchText = '';
    this.filter();
  }

  onPageSelect(pagination: IPagination) {
    this.pagination = pagination;
    this.getEmployeeList();
  }
}
