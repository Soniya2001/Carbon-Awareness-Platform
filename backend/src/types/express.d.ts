// Augment Express Request to include our JWT token payload
import { TokenPayload } from '../utils/jwt.utils';

declare namespace Express {
  interface Request {
    user?: TokenPayload;
  }
}
