export type X01StandingsTimeline = Map<number, X01SetStandingsTimeline>;
export type X01SetStandingsTimeline = Map<number, X01LegStandings>;
export type X01LegStandings = {
  setNumber: number;
  legNumber: number;
  standings: Map<string, X01PlayerLegStanding>
};
export type X01PlayerLegStanding = {
  setsWon: number;
  legsWonInSet: number;
};
