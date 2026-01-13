export type DatabaseConfigDto = {
  user: string;
  host: string;
  database: string;
  password: string;
  port: number;
  ssl?: boolean | {
    require?: boolean;
    rejectUnauthorized?: boolean;
  };
};
