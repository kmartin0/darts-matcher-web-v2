import {Routes} from '@angular/router';
import {HomePage} from '../features/home/pages/home-page/home-page';
import {MatchPage} from '../features/match/pages/match-page';
import {PageError} from '../shared/components/page-error/page-error';

export const routes: Routes = [
  {path: '', component: HomePage},
  {path: 'matches/:matchId', component: MatchPage},
  {path: '**', component: PageError, data: {message: '404 Page Not Found'}}
];
