import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { authorizationData } from '../app.component';

@Injectable({ providedIn: 'root' })
export class AuthInterceptorService implements HttpInterceptor {

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const authdata = authorizationData(); // you probably want to store it in localStorage or something
        if (!authdata) {
            return next.handle(req);
        }

        req.headers.set('Accept', 'application/json');
        req.headers.set('Content-Type', 'application/json');
        const req1 = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${authdata.token}`),
        });

        return next.handle(req1);
    }

}