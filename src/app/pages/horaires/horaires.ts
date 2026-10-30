import { Component, input } from '@angular/core';

@Component({
  selector: 'app-horaires',
  styleUrl: './horaires.scss',
  templateUrl: './horaires.html',
})
export class Horaires {
  /** Paramètre de route `/horaires/:stopAreaId`, lié par `withComponentInputBinding()`. */
  readonly stopAreaId = input<string>();
}
