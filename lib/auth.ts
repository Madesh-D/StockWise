
import { jwtVerify } from "jose";

export async function verifyAdminSession(
  request: Request
): Promise<boolean> {
  const sessionSecret = process.env.SESSION_SECRET;
  const adminUsername = process.env.ADMIN_USERNAME;

  if (!sessionSecret || !adminUsername) {
    return false;
  }

  const cookieHeader = request.headers.get("cookie") ?? "";

  const cookie = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("stockwise_session="));

  const token = cookie?.slice("stockwise_session=".length);

  if (!token) {
    return false;
  }

  try {
    const secret = new TextEncoder().encode(sessionSecret);
    const { payload } = await jwtVerify(token, secret);

    return payload.username === adminUsername;
  } catch {
    return false;
  }
}
