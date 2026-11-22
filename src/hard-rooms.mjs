import {city} from '../public/v2-city-plan.mjs';
import {sunken} from '../public/v2-sunken-plan.mjs';
import {chaos} from '../public/v2-chaos-plan.mjs';
// DICEBOUND 4.0 — unique, deterministically authored Hard maps. #=wall, .=floor.
export const HARD_BLUEPRINTS={
  ...Object.fromEntries(Object.entries(chaos).map(([id,room])=>[id,room.blueprint])),
  ...Object.fromEntries(Object.entries(sunken).map(([id, room]) => [id, room.blueprint])),
  ...Object.fromEntries(Object.entries(city).map(([id, room]) => [id, room.blueprint])),
};
