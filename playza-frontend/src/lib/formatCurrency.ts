
export const formatZAAmount = (amount: number | string | undefined): string => {
  if (amount === undefined || amount === null) return "0";
  const numericAmount =
    typeof amount === "string" ? parseFloat(amount.replace(/,/g, "")) : amount;
  return numericAmount.toLocaleString();
};


export const formatZA = (amount: number | string | undefined): string => {
  if (amount === undefined || amount === null) return "ZA 0";
  const numericAmount =
    typeof amount === "string" ? parseFloat(amount.replace(/,/g, "")) : amount;
  return `ZA ${numericAmount.toLocaleString()}`;
};

export const formatNaira = formatZA; 
