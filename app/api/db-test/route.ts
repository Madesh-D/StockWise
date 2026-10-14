
import pool from "../../../lib/db";

export async function GET() {
  try {
    await pool.query("SELECT 1");

    return Response.json({
      success: true,
      message: "MySQL connection successful!",
      database: process.env.DB_NAME,
    });
  } catch (error) {
    const err = error as { code?: string };

    console.error("MySQL connection error:", err.code);

    return Response.json(
      {
        success: false,
        message: "Database connection failed.",
        errorCode: err.code ?? "UNKNOWN_ERROR",
      },
      { status: 500 }
    );
  }
}
