import { Component } from '@angular/core';
import { Router } from '@angular/router';

export var authorizationData = () => {
  return JSON.parse(localStorage.getItem('authorizationData'))
};

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(public router: Router) {
    if (!localStorage.getItem('UserId') || !localStorage.getItem('authorizationData')) {
      localStorage.clear();
      this.router.navigateByUrl('login');
    }
  }
  ngOnInit() {
    // document.body.setAttribute('style', 'background:#f4f4f4');
  }
}
