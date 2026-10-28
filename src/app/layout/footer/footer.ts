import { Component } from '@angular/core';
import { APP_NAME } from '../../config/app-info';

@Component({
  selector: 'app-footer',
  styleUrl: './footer.scss',
  templateUrl: './footer.html',
})
export class Footer {
  protected readonly appName = APP_NAME;
  protected readonly year = new Date().getFullYear();
}
