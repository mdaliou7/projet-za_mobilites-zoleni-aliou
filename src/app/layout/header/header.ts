import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { APP_NAME } from '../../config/app-info';
import { NAV_LINKS } from '../../config/navigation';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-header',
  styleUrl: './header.scss',
  templateUrl: './header.html',
})
export class Header {
  protected readonly appName = APP_NAME;
  protected readonly links = NAV_LINKS;
}
