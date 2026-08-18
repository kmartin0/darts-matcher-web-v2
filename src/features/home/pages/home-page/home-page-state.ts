export interface HomePageState {
  isCreatingX01Match: boolean;
  createdX01MatchId: string | null;
}

export const initialHomeState: HomePageState = {
  isCreatingX01Match: false,
  createdX01MatchId: null
};
