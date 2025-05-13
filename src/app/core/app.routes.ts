import {Routes} from '@angular/router';
import {homeRoutes} from '../modules/home/home-routing';
import {PageNotFoundComponent} from '../shared/components/page-not-found/page-not-found.component';

export const appRoutes: Routes = [
  {
    path: '',
    children: homeRoutes,
    data: {title: 'Home'}
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];
