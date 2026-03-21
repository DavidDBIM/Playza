export const formatNaira = (fee: number | undefined) => {
  const currency = "₦";

  return `${currency}${fee?.toLocaleString()}`;
};
