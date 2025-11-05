export interface UserResponse<T> {
  message: string;
  status: number;
  data: {
    users: T[];
    meta: {
      page: number | null;
      limit: number | null;
      total: number | null;
      hasMore: boolean | null;
    } | null;
  } | null;
}
