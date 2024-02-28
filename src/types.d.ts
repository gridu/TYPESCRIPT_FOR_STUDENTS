enum HTTP_METHODS {
  "GET",
  "POST",
}

enum HTTP_STATUSES {
  "OK" = 200,
  "INTERNAL_SERVER_ERROR" = 500,
}
type UserRoles = "user" | "admin";

type UserMock = {
  name: string;
  age: number;
  roles: UserRoles[];
  createdAt: Date;
  isDeleted: boolean;
};

type Params = {
  [key: string]: string;
};

type RequestMock = {
  method: HTTP_METHODS;
  host: string;
  path: string;
  body?: UserMock;
  params: Params;
};

type Handlers<T> = {
  next?: (value: T) => void;
  error?: (error: any) => void;
  complete?: () => void;
};
