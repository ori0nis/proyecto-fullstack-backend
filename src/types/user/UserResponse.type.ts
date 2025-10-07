export interface UserResponseType<T> {
  data: T | null;
  message: string;
  status: number;
}
