export const truncateByDecimalPlace = (
  value: number,
  numDecimalPlaces: number
) =>
  Math.trunc(value * Math.pow(10, numDecimalPlaces)) /
  Math.pow(10, numDecimalPlaces);
