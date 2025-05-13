import {ObjectId} from '../models/object-id';

export const AppEndpoints = {
  home: () => ``,
  match: (id: ObjectId) => `matches/${id}`,
}
