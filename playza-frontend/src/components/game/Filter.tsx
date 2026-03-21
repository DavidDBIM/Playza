import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ListFilter } from "lucide-react";
import { useState } from "react";

export type FilterOption =
  | "Most Played"
  | "Highest Pool"
  | "Newest"
  | "Trending"
  | "Entry Fee"
  | "Filter By"
  | "Hottest";

type Props = {
  fn: (option: FilterOption) => void;
};

const Filter = ({ fn }: Props) => {
  const [filterBy, setFilterBy] = useState<string>("Filter By");

  const options: FilterOption[] = [
    "Filter By",
    "Most Played",
    "Highest Pool",
    "Newest",
    "Hottest",
    "Trending",
    "Entry Fee",
  ];

  const handleOnClick = async (option: FilterOption) => {
   fn(option);
    setFilterBy(option);
  };


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            filterBy && filterBy !== "Filter By" && "bg-secondary",
            `h-11 rounded-lg`,
          )}
        >
          <ListFilter className="md:hidden" />
          <span className="hidden md:block">
            {filterBy === "" ? "filter by" : filterBy}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-40">
        <DropdownMenuGroup>
          {options.map((option) => (
            <DropdownMenuItem
              key={option}
              onClick={() => handleOnClick(option)}
              className={cn(filterBy === option && "bg-secondary")}
            >
              {option}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Filter;
