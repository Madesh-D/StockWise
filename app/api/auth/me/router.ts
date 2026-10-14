
import { verifyAdminSession } from "../../../../lib/auth";

export async function GET(request: Request) {
  const isAuthenticated = await verifyAdminSession(request);

  if (!isAuthenticated) {
    return Response.json(
      {
        success: false,
        message: "Please log in first.",
      },
      { status: 401 }
    );
  }

  return Response.json({
    success: true,
    message: "Admin session is valid.",
  });
}
