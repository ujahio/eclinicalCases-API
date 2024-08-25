import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export const verifyToken = async (req: any, res: Response, next: any) => {
  let token = req.headers.authorization;
  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }
  token = req.headers.authorization.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET ?? "", (err: any, decoded: any) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }
    const data = {
      id: decoded.id,
      email: decoded.email,
      roles: decoded.roles,
      firstname: decoded.firstname,
      lastname: decoded.lastname,
    };
    req.validatedUser = data;
    next();
  });
};
