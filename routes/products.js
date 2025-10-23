// Import the express router as shown in the lecture code
// Note: please do not forget to export the router!

import {Router} from 'express';
const router = Router();
import * as productsFunctions from '../data/products.js';
import * as helper from '../helpers.js';

router
  .route('/')
  .get(async (req, res) => {
    
    try { 
      const productList = await productsFunctions.getAll();
      return res.json(productList);
    }
    
    catch (e) {
      return res.status(500).json({error: e.message});
    }

  })
  .post(async (req, res) => {
    
    const productData = req.body;

    if (!productData || Object.keys(productData).length === 0){
      
      return res.status(400).json({error: e.message})

    }

    try {

      //Checks
        helper.checkArg(productData.productName, 'string', 'productName');
        helper.checkArg(productData.productDescription, 'string', 'productDescription');
        helper.checkArg(productData.modelNumber, 'string', 'modelNumber');
        helper.checkArg(productData.price, 'number', 'price');
        helper.checkArg(productData.manufacturer, 'string', 'manufacturer');
        helper.checkArg(productData.manufacturerWebsite, 'string', 'manufacturerWebsite');
        helper.checkArg(productData.keywords, 'array', 'keywords');
        helper.checkArg(productData.categories, 'array', 'categories');
        helper.checkArg(productData.dateReleased, 'string', 'dateReleased');       
        helper.checkArg(productData.discontinued, 'boolean', 'discontinued');

      //Trims
        productData.productName = productData.productName.trim();
        productData.productDescription = productData.productDescription.trim();
        productData.modelNumber = productData.modelNumber.trim();
        productData.manufacturer = productData.manufacturer.trim();
        productData.manufacturerWebsite = productData.manufacturerWebsite.trim();
        productData.dateReleased = productData.dateReleased.trim();

        for (let i in productData.keywords){
          productData.keywords[i] = productData.keywords[i].trim();
        }

        for (let i in productData.categories){
          productData.categories[i] = productData.categories[i].trim();
        }

    }

    catch (e) {
      return res.status(400).json({error: e.message});
    }

    try{
      
      const {productName,
        productDescription,
        modelNumber,
        price,
        manufacturer,
        manufacturerWebsite,
        keywords,
        categories,
        dateReleased,
        discontinued} = productData;

      const newProduct = await productsFunctions.create(productName,
        productDescription,
        modelNumber,
        price,
        manufacturer,
        manufacturerWebsite,
        keywords,
        categories,
        dateReleased,
        discontinued);
      
        return res.status(200).json(newProduct);

    } catch (e) {

      return res.status(500).json({error: e.message});
    }

  });

router
  .route('/:productId')
  .get(async (req, res) => {
    

    try{
      //Checks and trim id
      helper.checkArg(req.params.productId, 'string', 'id');
      req.params.productId = req.params.productId.trim();
      helper.checkObjectId(req.params.productId);
    } catch (e) {
      return res.status(400).json({error: e.message});
    }

    try {
      const product = await productsFunctions.get(req.params.productId);
      return res.status(200).json(product);
    } catch (e) {
      return res.status(404).json({error: e.message});
    }
  })

  .delete(async (req, res) => {
    
    try{
      //Checks and trim id
      helper.checkArg(req.params.productId, 'string', 'id');
      req.params.productId = req.params.productId.trim();
      helper.checkObjectId(req.params.productId);
    } catch (e) {
      return res.status(400).json({error: e.message});
    }

    try {
      const deletedProduct = await productsFunctions.remove(req.params.productId);
      return res.status(200).json({"_id": deletedProduct._id, "deleted": true});
    } catch (e) {
      return res.status(404).json({error: e.message});
    }
  })

  .put(async (req, res) => {
    
    const updatedData = req.body;

    if (!updatedData || Object.keys(updatedData).length === 0){
      return res.status(400).json({error: e.message});
    }

    try {

      //Checks
        helper.checkArg(updatedData.productName, 'string', 'productName');
        helper.checkArg(updatedData.productDescription, 'string', 'productDescription');
        helper.checkArg(updatedData.modelNumber, 'string', 'modelNumber');
        helper.checkArg(updatedData.price, 'number', 'price');
        helper.checkArg(updatedData.manufacturer, 'string', 'manufacturer');
        helper.checkArg(updatedData.manufacturerWebsite, 'string', 'manufacturerWebsite');
        helper.checkArg(updatedData.keywords, 'array', 'keywords');
        helper.checkArg(updatedData.categories, 'array', 'categories');
        helper.checkArg(updatedData.dateReleased, 'string', 'dateReleased');       
        helper.checkArg(updatedData.discontinued, 'boolean', 'discontinued');

      //Trims
        updatedData.productName = updatedData.productName.trim();
        updatedData.productDescription = updatedData.productDescription.trim();
        updatedData.modelNumber = updatedData.modelNumber.trim();
        updatedData.manufacturer = updatedData.manufacturer.trim();
        updatedData.manufacturerWebsite = updatedData.manufacturerWebsite.trim();
        updatedData.dateReleased = updatedData.dateReleased.trim();

        for (let i in updatedData.keywords){
          updatedData.keywords[i] = updatedData.keywords[i].trim();
        }

        for (let i in updatedData.categories){
          updatedData.categories[i] = updatedData.categories[i].trim();
        }

    }

    catch (e) {
      return res.status(400).json({error: e.message});
    }

    try {

      const {productName,
        productDescription,
        modelNumber,
        price,
        manufacturer,
        manufacturerWebsite,
        keywords,
        categories,
        dateReleased,
        discontinued} = updatedData;

      const updatedProduct = await productsFunctions.update(
        req.params.productId,
        productName,
        productDescription,
        modelNumber,
        price,
        manufacturer,
        manufacturerWebsite,
        keywords,
        categories,
        dateReleased,
        discontinued);

      return res.status(200).json(updatedProduct);
    
      } catch (e) {
        return res.status(404).json({error: e.message});
      }

  });

  export default router;
