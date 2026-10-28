import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NAV_LINKS } from '../../config/navigation';

/** Barre d'onglets fixée en bas de l'écran sur mobile, comme dans l'appli IDFM. */
@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-bottom-nav',
  styleUrl: './bottom-nav.scss',
  templateUrl: './bottom-nav.html',
})
export class BottomNav {
  protected readonly links = NAV_LINKS;
}
