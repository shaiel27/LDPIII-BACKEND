import { productModel } from "../Models/product.model.js"
import { verifyToken, verifyAdmin } from "../Middlewares/jwt.middleware.js"

const createProduct = async (req, res) => {
  try {
    verifyAdmin(req, res, async () => {
      const { name, expiration_date, description, price, category_id } = req.body
      const newProduct = await productModel.create({ name, expiration_date, description, price, category_id })
      res.status(201).json({
        ok: true,
        msg: "Producto creado exitosamente",
        product: newProduct,
      })
    })
  } catch (error) {
    console.error("Error en createProduct:", error)
    res.status(500).json({
      ok: false,
      msg: "Error del servidor",
      error: error.message,
    })
  }
}

const getAllProducts = async (req, res) => {
  try {
    verifyToken(req, res, async () => {
      const products = await productModel.findAll()
      res.json({
        ok: true,
        products,
      })
    })
  } catch (error) {
    console.error("Error en getAllProducts:", error)
    res.status(500).json({
      ok: false,
      msg: "Error del servidor",
      error: error.message,
    })
  }
}

const getProductById = async (req, res) => {
  try {
    verifyToken(req, res, async () => {
      const { id } = req.params
      const product = await productModel.findById(id)
      if (!product) {
        return res.status(404).json({
          ok: false,
          msg: "Producto no encontrado",
        })
      }
      res.json({
        ok: true,
        product,
      })
    })
  } catch (error) {
    console.error("Error en getProductById:", error)
    res.status(500).json({
      ok: false,
      msg: "Error del servidor",
      error: error.message,
    })
  }
}

const updateProduct = async (req, res) => {
  try {
    verifyAdmin(req, res, async () => {
      const { id } = req.params
      const { name, expiration_date, description, price, category_id } = req.body
      const updatedProduct = await productModel.update(id, { name, expiration_date, description, price, category_id })
      if (!updatedProduct) {
        return res.status(404).json({
          ok: false,
          msg: "Producto no encontrado",
        })
      }
      res.json({
        ok: true,
        msg: "Producto actualizado exitosamente",
        product: updatedProduct,
      })
    })
  } catch (error) {
    console.error("Error en updateProduct:", error)
    res.status(500).json({
      ok: false,
      msg: "Error del servidor",
      error: error.message,
    })
  }
}

const deleteProduct = async (req, res) => {
  try {
    verifyAdmin(req, res, async () => {
      const { id } = req.params
      const deletedProduct = await productModel.remove(id)
      if (!deletedProduct) {
        return res.status(404).json({
          ok: false,
          msg: "Producto no encontrado",
        })
      }
      res.json({
        ok: true,
        msg: "Producto eliminado exitosamente",
        product: deletedProduct,
      })
    })
  } catch (error) {
    console.error("Error en deleteProduct:", error)
    res.status(500).json({
      ok: false,
      msg: "Error del servidor",
      error: error.message,
    })
  }
}

const updateInventory = async (req, res) => {
  try {
    verifyAdmin(req, res, async () => {
      const { id } = req.params
      const { quantity, status } = req.body
      const updatedInventory = await productModel.updateInventory(id, quantity, status)
      res.json({
        ok: true,
        msg: "Inventario actualizado exitosamente",
        inventory: updatedInventory,
      })
    })
  } catch (error) {
    console.error("Error en updateInventory:", error)
    res.status(500).json({
      ok: false,
      msg: "Error del servidor",
      error: error.message,
    })
  }
}

export const productController = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateInventory,
}

