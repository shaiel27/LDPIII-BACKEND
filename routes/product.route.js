import express from 'express'
import { productController } from '../controllers/product.controller.js'
import { verifyToken, verifyAdmin } from '../Middlewares/jwt.middleware.js'

const router = express.Router()

// Todas las rutas requieren autenticación y permisos de administrador
router.use(verifyToken, verifyAdmin)

router.post('/', productController.createProduct)
router.get('/', productController.getAllProducts)
router.get('/:id', productController.getProductById)
router.put('/:id', productController.updateProduct)
router.delete('/:id', productController.deleteProduct)
router.put('/:id/inventory', productController.updateInventory)

export default router