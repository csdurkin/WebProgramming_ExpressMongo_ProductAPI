// Import the express router as shown in the lecture code
// Note: please do not forget to export the router!

import {Router} from 'express';
const router = Router();
import * as reviews from '../data/reviews.js';
import * as helper from '../helpers.js';
import * as productsFunction from '../data/products.js';

router
  .route('/:productId')
  .get(async (req, res) => {
    
    try{
      helper.checkArg(req.params.productId, 'string', 'id');
      req.params.productId = req.params.productId.trim();
      helper.checkObjectId(req.params.productId);
    } catch (e) {
      return res.status(400).json({error: e.message});
    }

    try { 
      const reviewsList = await reviews.getAllReviews(req.params.productId);

      if (reviewsList.length === 0  || !reviewsList){
        throw new Error('No review found for this product.')
      }

      return res.status(200).json(reviewsList);

    } catch (e) {
      return res.status(404).json({error: e.message});
    }

  })
  .post(async (req, res) => {

    try {

      helper.checkArg(req.params.productId, 'string', 'id');
      req.params.productId = req.params.productId.trim();
      helper.checkObjectId(req.params.productId);

    } catch (e) {
      return res.status(400).json({error: e.message});
    }
    
    const reviewData = req.body;

    if (!reviewData || Object.keys(reviewData).length === 0){
      
      return res.status(400).json({error: 'There are no fields in the request body.'})

    }

    try {

      //Check

        helper.checkArg(reviewData.title, 'string', 'title');
        helper.checkArg(reviewData.reviewerName, 'string', 'reviewerName');
        helper.checkArg(reviewData.review, 'string', 'review');
        helper.checkArg(reviewData.rating, 'number', 'rating');

      //Trims

        reviewData.title = reviewData.title.trim();
        reviewData.reviewerName = reviewData.reviewerName.trim();
        reviewData.review = reviewData.review.trim();

    }

    catch (e) {
      return res.status(400).json({error: e.message});
    }

    try{
      
      const {
        title,
        reviewerName,
        review,
        rating} = reviewData;

      const newReview = await reviews.createReview(
        req.params.productId, 
        title,
        reviewerName,
        review,
        rating);
      
        const updatedProduct = await productsFunction.get(req.params.productId);

        return res.status(200).json(updatedProduct);

    } catch (e) {
      return res.status(404).json({error: e.message});
    }

  });

router
  .route('/review/:reviewId')
  
  .get(async (req, res) => {
    
    try{
      //Checks and trim id
      helper.checkArg(req.params.reviewId, 'string', 'id');
      req.params.reviewId = req.params.reviewId.trim();
      helper.checkObjectId(req.params.reviewId);
    } catch (e) {
      return res.status(400).json({error: e.message});
    }

    try {
      const review = await reviews.getReview(req.params.reviewId);

      if (review.length === 0  || !review){
        throw new Error('No review found for this product.')
      }

      return res.status(200).json(review);
    } catch (e) {
      return res.status(404).json({error: e.message});
    }
  })
  .patch(async (req, res) => {
    
    const requestBody = req.body;

    if (!requestBody || Object.keys(requestBody).length === 0) {
      return res
        .status(400)
        .json({error: 'There are no fields in the request body'});
    }

    try {

      //Checks

        helper.checkArg(req.params.reviewId, 'string', 'id');
        req.params.reviewId = req.params.reviewId.trim();
        helper.checkObjectId(req.params.reviewId);

        if (requestBody.title){
          helper.checkArg(requestBody.title, 'string', 'title');
          requestBody.title = requestBody.title.trim();
        }

        if (requestBody.reviewerName){
          helper.checkArg(requestBody.reviewerName, 'string', 'reviewerName');
          requestBody.reviewerName = requestBody.reviewerName.trim();
        }

        if (requestBody.review){
          helper.checkArg(requestBody.review, 'string', 'review');
          requestBody.review = requestBody.review.trim();
        }

        if (requestBody.rating){
          helper.checkArg(requestBody.rating, 'number', 'rating');
        }

    }

    catch (e) {
      return res.status(400).json({error: e.message});
    }


    //Try to perform update
    try {
      
      const updatedProduct = await reviews.updateReview(req.params.reviewId, requestBody);
      
      //const productId = updatedReview._id;
      //const updatedProduct = await productsFunction.get(productId);

      return res.status(200).json(updatedProduct);

    } catch (e) {
      return res.status(404).json({error: e.message});
    }
})
  
  .delete(async (req, res) => {
    
    try{
      //Checks and trim id
      helper.checkArg(req.params.reviewId, 'string', 'id');
      req.params.reviewId = req.params.reviewId.trim();
      helper.checkObjectId(req.params.reviewId);
    } catch (e) {
      return res.status(400).json({error: e.message});
    }

    try {
      const deletedReview = await reviews.removeReview(req.params.reviewId);
      return res.status(200).json(deletedReview);
    } catch (e) {
      return res.status(404).json({error: e.message});
    }

  });

export default router;
  