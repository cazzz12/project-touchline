// Coordinates follow the starting-XI slot order in engine.js; the attack is upwards.
// Keeping this separate from the saved selection preserves existing lineups and saves.
const defense = [[50, 89], [84, 69], [62, 69], [38, 69], [16, 69]];
const layouts = {
  '4-3-3': [...defense, [50, 49], [70, 38], [30, 38], [82, 17], [18, 17], [50, 12]],
  '4-4-2': [...defense, [84, 41], [62, 45], [38, 45], [16, 41], [66, 16], [34, 16]],
  '4-2-3-1': [...defense, [66, 49], [34, 49], [82, 29], [50, 30], [18, 29], [50, 12]],
};

export function pitchPosition(formation, slot) {
  const [x, y] = layouts[formation][slot];
  return `left:${x}%;top:${y}%`;
}
