import { Component, input } from '@angular/core';

@Component({
  selector: 'app-trafic',
  styleUrl: './trafic.scss',
  templateUrl: './trafic.html',
})
export class Trafic {
  /** Paramètre de route `/trafic/:lineId`, lié par `withComponentInputBinding()`. */
  readonly lineId = input<string>();
}
