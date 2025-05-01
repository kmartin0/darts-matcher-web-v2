import { Routes } from '@angular/router';
import {homeRoutes} from '../modules/home/home-routing';

export const appRoutes: Routes = [
  {
    path: '',
    children: homeRoutes,
    data: {title: 'Home'}
  },
];
