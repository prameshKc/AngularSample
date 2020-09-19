import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from "@angular/core";
import { IEmployeeNominee, IEmployee } from "../../models/Models";
import { EmployeeNomineeService } from "../../services/BaseService";

@Component({
    selector: 'employee-nominee',
    templateUrl: 'employeeNominee.html'
})
export class EmployeeNomineeComponent implements OnChanges {
    @Input() empId?: number;
    @Output() employeeNomineeList: EventEmitter<IEmployeeNominee[]> = new EventEmitter<IEmployeeNominee[]>();
    displayENList: IEmployeeNominee[] = [];

    //form variable
    InputEN: IEmployeeNominee = <IEmployeeNominee>{};
    constructor(
        public ENService: EmployeeNomineeService
    ) { }

    ngOnChanges(changes: SimpleChanges) {
        if (this.empId == null) {
            this.displayENList = [];
        } else {
            this.getEmployeeNominee(this.empId);
        }
    }

    getEmployeeNominee(empId: number) {
        let query: string = `$filter=EmployeeId eq ${empId}`;
        this.displayENList = [];

        this.ENService.getAll(query).subscribe((data: IEmployeeNominee[]) => {
            this.displayENList = data;
            this.employeeNomineeList.emit(data);
        });
    }

    addNominee() {
        this.InputEN.PostedBy = localStorage.getItem('UserId');
        this.displayENList.push(this.InputEN);
        this.InputEN = <IEmployeeNominee>{};
        let saveList: IEmployeeNominee[] = this.arrangeSaveList();
        this.employeeNomineeList.emit(saveList);
    }

    arrangeSaveList(): IEmployeeNominee[] {
        let saveList: IEmployeeNominee[] = [];
        this.displayENList.forEach(item => {
            saveList.push({
                RowId: item.RowId,
                EmployeeId: item.EmployeeId,
                NomineeName: item.NomineeName,
                NomineeAddress: item.NomineeAddress,
                NomineeContact: item.NomineeContact,
                PostedBy: item.PostedBy,
                PostedOn: item.isEdit ? new Date() : item.PostedOn
            })
        })
        return saveList;
    }

    editNominee(empNom: IEmployeeNominee) {
        if (empNom.isEdit == true) {
            empNom.isEdit = false;

            let saveList: IEmployeeNominee[] = this.arrangeSaveList();
            this.employeeNomineeList.emit(saveList);
        } else {
            empNom.isEdit = true;
        }
    }

    deleteNominee(empNom: IEmployeeNominee, index: number) {
        if (JSON.stringify(this.displayENList[index]) === JSON.stringify(empNom)) {
            this.displayENList.splice(index, 1);
        }

        let saveList: IEmployeeNominee[] = this.arrangeSaveList();
        this.employeeNomineeList.emit(saveList);
    }

}