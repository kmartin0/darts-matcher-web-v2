import {Component, inject} from '@angular/core';
import {HomeStore} from './home-store';
import {ThemeToggle} from '../../shared/components/theme-toggle';

@Component({
  selector: 'app-home-page',
  providers: [HomeStore],
  templateUrl: './home-page.html',
  imports: [ThemeToggle],
  styleUrl: './home-page.scss'
})
export class HomePage {
  protected readonly store = inject(HomeStore);
}
