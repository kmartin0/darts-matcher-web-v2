import {Routes} from '@angular/router';
import {X01MatchPageComponent} from './pages/x01-match/x01-match-page.component';
import {PageNotFoundComponent} from '../../shared/components/page-not-found/page-not-found.component';


export const x01MatchRoutes: Routes = [
  {
    path: '',
    component: PageNotFoundComponent
  },
  {
    path: ':id',
    component: X01MatchPageComponent
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];
