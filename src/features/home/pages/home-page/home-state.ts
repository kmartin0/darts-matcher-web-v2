export interface HomeState {
  isCreatingX01Match: boolean;
  createdX01MatchId: string | null;
}

export const initialHomeState: HomeState = {
  isCreatingX01Match: false,
  createdX01MatchId: null
};
