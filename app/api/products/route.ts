
import pool from "../../../lib/db";
import type { ResultSetHeader } from "mysql2";

import { verifyAdminSession } from "../../../lib/auth";


 // GET: Retrieve all products
export async function GET(request: Request) {
  const isAuthenticated = await verifyAdminSession(request);

  if (!isAuthenticated) {
    return Response.json(
      {
        success: false,
        message: "Please log in as an admin first.",
      },
      { status: 401 }
    );
  }

  try {
    const [rows] = await pool.query(
      `SELECT id, name, category, price, quantity,
              low_stock_threshold, created_at
       FROM products
       ORDER BY id DESC`
    );

    return Response.json({
      success: true,
      products: rows,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return Response.json(
      { success: false, message: "Failed to retrieve products." },
      { status: 500 }
    );
  }
}

// POST: Add a new product
export async function POST(request: Request) {

      const isAuthenticated = await verifyAdminSession(request);

  if (!isAuthenticated) {
    return Response.json(
      {
        success: false,
        message: "Please log in as an admin first.",
      },
      { status: 401 }
    );
  }


  try {
    const body = await request.json();

    if (
  !body ||
  typeof body !== "object" ||
  Array.isArray(body)
) {
  return Response.json(
    {
      success: false,
      message: "Invalid product data."
    },
    { status: 400 }
  );
}

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const category =
      typeof body.category === "string" ? body.category.trim() : "";
    const price = Number(body.price);
    const quantity = Number(body.quantity);
    const threshold =
      body.low_stock_threshold === undefined
        ? 5
        : Number(body.low_stock_threshold);

   if (
  !name ||
  name.length > 150 ||
  !category ||
  category.length > 100 ||
  body.price === "" ||
  body.quantity === "" ||
  !Number.isFinite(price) ||
  price < 0 ||
  !Number.isInteger(quantity) ||
  quantity < 0 ||
  !Number.isInteger(threshold) ||
  threshold < 0
) {
  return Response.json(
    {
      success: false,
      message: "Please provide valid product details.",
    },
    { status: 400 }
  );
}

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO products
       (name, category, price, quantity, low_stock_threshold)
       VALUES (?, ?, ?, ?, ?)`,
      [name, category, price, quantity, threshold]
    );

    return Response.json(
      {
        success: true,
        message: "Product added successfully!",
        productId: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add product error:", error);

    return Response.json(
      { success: false, message: "Failed to add product." },
      { status: 500 }
    );
  }
}
