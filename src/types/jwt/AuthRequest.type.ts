//? This type of request protects all inner controllers/routes. It's the same as Express' Request type because it accepts the same 4 parameters, but it also includes my UserType so that it can be used to extract the req.user in isAuth() and pass it on to the controllers

import { Request } from "express";
import { UserType } from "../user/index.js";

// AuthRequest is typed to receive a generic parameter (P), so that it can be used in requests with plant/user id
export interface AuthRequest<P = {}, ReqBody = any, ResBody = any, ReqQuery = any>
  extends Request<P, ReqBody, ResBody, ReqQuery> {
  user?: UserType | null;
}
