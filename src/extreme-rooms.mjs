import {citadel} from '../public/v2-citadel-plan.mjs';
import {abyss} from '../public/v2-abyss-plan.mjs';
import {sky} from '../public/v2-sky-plan.mjs';
// DICEBOUND Extreme — 45 connected rooms.
export const EXTREME_BLUEPRINTS={
  ...Object.fromEntries(Object.entries(sky).map(([id, plan]) => [id, plan.blueprint])),
  ...Object.fromEntries(Object.entries(abyss).map(([id, plan]) => [id, plan.blueprint])),
  ...Object.fromEntries(Object.entries(citadel).map(([id, plan]) => [id, plan.blueprint])),
};
export const ABYSS_LANTERNS = Object.fromEntries(Object.entries(abyss).map(([id, plan]) => [id, plan.lanterns]));
