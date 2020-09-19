import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { domain } from './BaseService';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    constructor(private http: HttpClient) {
    }

    login(loginData: any) {
        let clientId: 'ngAuthApp';

        var data = `grant_type=password&username=${loginData.userName}&password=${loginData.password}&client_id=${clientId}`;
        var url = `${domain}token`;

        return this.http.post(url, data)
            .pipe(map((res: any) => {
                if (res) {
                    var res1 = res;
                    if (loginData.useRefreshTokens) {
                        localStorage.setItem('authorizationData', JSON.stringify({ token: res.access_token, userName: loginData.userName, refreshToken: res.refresh_token, useRefreshTokens: true }));
                    }
                    else {
                        localStorage.setItem('authorizationData', JSON.stringify({ token: res.access_token, userName: loginData.userName, refreshToken: "", useRefreshTokens: false }));
                    }
                    return res1;
                } else {
                    return res.json();
                }
            }), catchError((error) => {
                console.error('An error occurred', error); // for demo purposes only
                return throwError(error.message || error);
            }));
    }

    logout() {
        localStorage.removeItem('authorizationData');
        localStorage.clear();
    }
}
