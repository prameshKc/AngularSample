import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class BranchService {
    constructor() { }

    getBranch() {
        return localStorage.getItem('Branch');
    }

    changeBranch(newBranch: string) {
        localStorage.setItem('Branch', newBranch);
    }
}