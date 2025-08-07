// src/app/loader/loader.component.ts
import { Component, OnInit } from '@angular/core';
import { LoadingService } from '../loading.service';
import {AsyncPipe} from '@angular/common';

@Component({
  selector: 'app-loader',
  template: `
    <div id="loading-overlay" [class.hidden]="!(loadingService.loading$ | async)">
      <div class="spinner"></div>
      <p class="ml-3 text-lg text-primary">Chargement...</p>
    </div>
  `,
  imports: [
    AsyncPipe
  ],
  styles: [] // Styles sont dans styles.css global
})
export class LoaderComponent implements OnInit {
  constructor(public loadingService: LoadingService) { }

  ngOnInit(): void {
    // Le loader est géré par le service, pas besoin de logique ici
  }
}
