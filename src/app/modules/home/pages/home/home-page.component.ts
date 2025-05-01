import {Component} from '@angular/core';
import {MatchFormComponent} from '../../components/match-form/match-form.component';

@Component({
  selector: 'app-home',
  imports: [
    MatchFormComponent
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  standalone: true
})
export class HomePageComponent {

}
