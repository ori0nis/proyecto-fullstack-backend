export interface UserResponse<T> {
  data: T | null;
  message: string;
  status: number;
}
