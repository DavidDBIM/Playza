export const formatZA = (amount: number | string | undefined) => {
  if (amount === undefined || amount === null) return "ZA 0";
  const numericAmount = typeof amount === "string" ? parseFloat(amount.replace(/,/g, "")) : amount;
  return `ZA ${numericAmount.toLocaleString()}`;
};

export const formatNaira = formatZA; // Alias for backward compatibility during transition
