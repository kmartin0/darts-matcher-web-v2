import {X01LegViewData} from './x01-leg-view-data';


export interface X01SetViewData {
  legs: {
    [leg: number]: X01LegViewData
  };
}
