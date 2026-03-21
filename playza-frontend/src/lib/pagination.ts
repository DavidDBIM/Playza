import { type MatchHistory } from "@/data/matchHistory";

export const pagination = (page: number, data: MatchHistory[]) => {
  const itemsPerPage = 5;
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const paginatedData = data.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  return { paginatedData, totalPages };
};
