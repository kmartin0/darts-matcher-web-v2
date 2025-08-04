import {ResultType} from '../../../../models/basematch/result-type';
import {X01BestOfType} from '../../../../models/x01-match/x01-best-of-type';

export interface X01MatchInformationViewmodel {
  results: PlayerResults;
  rules: {
    x01: number;
    format: string;
    goal: string;
    bestOfType: X01BestOfType;
    bestOfTypeDisplay: string;
    sets: number;
    legs: number;
    clearByTwoSetsDisplay: string;
    clearByTwoLegsDisplay: string;
    clearByTwoLegsInFinalSetDisplay: string;
  };
  date: {
    startDate: Date | null;
    endDate: Date | null;
    matchTimeDisplay: string;
  };
  trivia: {
    setsPlayed: number;
    legsPlayed: number;
    matchId: string;
  };
}

export interface PlayerResults {
  [playerId: string]: { name: string, numWon: number, result: ResultType | null };
}
