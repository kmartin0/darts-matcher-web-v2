import {Routes} from '@angular/router';
import {HomePage} from '../features/home/pages/home-page/home-page';
import {X01MatchPage} from '../features/x01match/pages/x01-match-page';

export const routes: Routes = [
  {path: '', component: HomePage},
  {path: 'matches/:matchId', component: X01MatchPage}
];
