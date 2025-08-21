import {ResultType} from '../../../../../models/basematch/result-type';

export interface X01PlayerCardData {
  name: string;
  threeDartAvg: number;
  firstNineAvg: number;
  matchResult: ResultType | null;
  setsWon: number;
  legsWonInCurrentSet: number;
}
