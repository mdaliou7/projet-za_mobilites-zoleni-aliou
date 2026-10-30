import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_NAME } from '../../config/app-info';
import { NAV_LINKS } from '../../config/navigation';

@Component({
  imports: [RouterLink],
  selector: 'app-accueil',
  styleUrl: './accueil.scss',
  templateUrl: './accueil.html',
})
export class Accueil {
  protected readonly appName = APP_NAME;
  protected readonly links = NAV_LINKS;
}
