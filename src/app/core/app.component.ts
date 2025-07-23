import {Component, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material/icon';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true
})
export class AppComponent {
  private matIconRegistry = inject(MatIconRegistry);
  private domSanitizer = inject(DomSanitizer);

  constructor() {
    this.registerIcons();
  }

  registerIcons(): void {
    // Register the icon by name and URL
    this.matIconRegistry.addSvgIcon('darts', this.domSanitizer.bypassSecurityTrustResourceUrl('darts.svg')
    );
  }
 }
