import {Routes} from '@angular/router';
import {homeRoutes} from '../modules/home/home-routing';
import {PageNotFoundComponent} from '../shared/components/page-not-found/page-not-found.component';
import {x01MatchRoutes} from '../modules/x01-match/x01-match-routing';

export const appRoutes: Routes = [
  {
    path: '',
    children: homeRoutes,
    data: {title: 'Home'}
  },
  {
    path: 'matches',
    children: x01MatchRoutes,
    data: {title: 'X01 Match'}
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];
