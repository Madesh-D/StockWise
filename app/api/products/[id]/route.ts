
import pool from "../../../../lib/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

type Context = {
  params: Promise<{ id: string }>;
};

// PUT: Update an existing product
export async function PUT(request: Request, { params }: Context) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      return Response.json(
        { success: false, message: "Invalid product ID." },
        { status: 400 }
      );
    }

    const body = await request.json();

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
        { success: false, message: "Please provide valid product details." },
        { status: 400 }
      );
    }

    const [existing] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM products WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return Response.json(
        { success: false, message: "Product not found." },
        { status: 404 }
      );
    }

    await pool.execute<ResultSetHeader>(
      `UPDATE products
       SET name = ?, category = ?, price = ?, quantity = ?,
           low_stock_threshold = ?
       WHERE id = ?`,
      [name, category, price, quantity, threshold, id]
    );

    return Response.json({
      success: true,
      message: "Product updated successfully!",
    });
  } catch (error) {
    console.error("Update product error:", error);

    return Response.json(
      { success: false, message: "Failed to update product." },
      { status: 500 }
    );
  }
}

// DELETE: Delete a product
export async function DELETE(_request: Request, { params }: Context) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      return Response.json(
        { success: false, message: "Invalid product ID." },
        { status: 400 }
      );
    }

    const [result] = await pool.execute<ResultSetHeader>(
      "DELETE FROM products WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return Response.json(
        { success: false, message: "Product not found." },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Product deleted successfully!",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return Response.json(
      { success: false, message: "Failed to delete product." },
      { status: 500 }
    );
  }
}
