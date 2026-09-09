import {Component, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly matIconRegistry = inject(MatIconRegistry);
  private readonly domSanitizer = inject(DomSanitizer);

  constructor() {
    this.registerIcons();
  }

  /**
   * Registers the custom application icons.
   */
  private registerIcons(): void {
    this.matIconRegistry.addSvgIcon(
      'darts', this.domSanitizer.bypassSecurityTrustResourceUrl('darts.svg')
    );
  }
}
