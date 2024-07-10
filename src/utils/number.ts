export const truncateByDecimalPlace = (
  value: number | string | bigint,
  numDecimalPlaces: number
) => {
  const valueNumber =
    typeof value === "bigint" || typeof value === "string"
      ? Number(value)
      : value;
  return (
    Math.trunc(valueNumber * Math.pow(10, numDecimalPlaces)) /
    Math.pow(10, numDecimalPlaces)
  );
};
