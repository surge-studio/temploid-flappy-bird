export const collisionCheck = ({
  x1,
  x2,
  width,
  y1,
  y2,
  height,
}: {
  x1: number;
  x2: number;
  width: number;
  y1: number;
  y2: number;
  height: number;
}) => {
  return x1 > x2 && x1 < x2 + width && y1 > y2 && y1 < y2 + height;
};
