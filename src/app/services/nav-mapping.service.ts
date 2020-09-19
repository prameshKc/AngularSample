import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

import { NavViewModel } from "../models/ViewModels";
import { domain } from "./BaseService";
import { IHRMLedger, ICompany, INavLedger } from "../models/Models";
import { map, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class NavMappingService {
  public baseUrl = `${domain}api/NavMapping`;
  constructor(public http: HttpClient) {
  }

  getNMHRMLedger(query?: string): Observable<NavViewModel[]> {
    if (query != null) {
      query = `?${query}`;
    } else {
      query = ``;
    }
    return this.http.get(this.baseUrl + `/getNMHRMLedger` + query).pipe(
      map((res: any) => {
        return res;
      }), catchError((err) => {
        return Observable.throw(err);
      })
    );
  }

  getNMBranch(query?: string): Observable<NavViewModel[]> {
    if (query != null) {
      query = `?${query}`;
    } else {
      query = ``;
    }
    return this.http.get(this.baseUrl + `/getNMBranch` + query).pipe(
      map((res: any) => {
        return res;
      }), catchError((err) => {
        return Observable.throw(err);
      })
    );
  }

  updateLedgerNav(ledgerList: INavLedger[]) {
    return this.http.post(this.baseUrl + `/updateLedgerNav`, ledgerList).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  updateBranchNav(branchList: ICompany[]) {
    return this.http.post(this.baseUrl + `/updateBranchNav`, branchList).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }
}
