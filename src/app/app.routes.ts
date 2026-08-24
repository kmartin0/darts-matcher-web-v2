import {Routes} from '@angular/router';
import {HomePage} from '../features/home/pages/home-page/home-page';
import {X01MatchPage} from '../features/x01match/pages/x01-match-page';
import {PageError} from '../shared/components/page-error/page-error';

export const routes: Routes = [
  {path: '', component: HomePage},
  {path: 'matches/x01/:matchId', component: X01MatchPage},
  {path: '**', component: PageError, data: {message: '404 Page Not Found'}}
];
