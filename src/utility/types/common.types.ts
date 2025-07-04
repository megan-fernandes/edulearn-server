export interface IGetCommon {
  id?: string;
  page: number;
  limit?: number;
  search?: string;
  filterBy?: string;
  filterValue?: string;
  view?: "cms" | "website";
}
