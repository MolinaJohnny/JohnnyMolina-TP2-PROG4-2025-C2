declare global {
  namespace Express {
    interface Request {
      user?: any; // o UserPayload
    }
  }
}

export {};
