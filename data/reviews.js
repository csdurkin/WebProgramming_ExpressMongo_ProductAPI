// This data file should export all functions using the ES6 standard as shown in the lecture code

import {ObjectId} from 'mongodb';
import {products} from '../config/mongoCollections.js';
import * as productsFunctions from './products.js';
import * as helper from '../helpers.js';

const createReview = async (
  productId,
  title,
  reviewerName,
  review,
  rating
) => {

  //Checks

    helper.checkArg(productId, 'string', 'productId');
    productId = productId.trim();
    helper.checkObjectId(productId);

    helper.checkArg(title, 'string', 'title');
    helper.checkArg(reviewerName, 'string', 'reviewerName');
    helper.checkArg(review, 'string', 'review');
    helper.checkArg(rating, 'number', 'rating');

   //Trims

    title = title.trim();
    reviewerName = reviewerName.trim();
    review = review.trim();

  //Create reviewId
    
    let reviewId = new ObjectId();
  
  //Create Object for New Subdocument (Review)
  
    let newReview = {
      _id: reviewId,
      title: title,
      reviewerName: reviewerName,
      review: review,
      rating: rating,
      reviewDate: helper.currentDate()
    }
 
  //Pull collection of all product documents
    const productCollection = await products();

  //findOneAndUpdate: Updates a single document based on the filter and sort criteria
  //Matchs to argument id (converted to object id), sets other key/values according to the updatedProduct object, returns updated document bc of 'returnDocument' is set to after
    
    const updatedInfo = await productCollection.findOneAndUpdate(
      {_id: new ObjectId(productId)},
      {$addToSet: {'reviews': newReview}}, 
      {returnDocument: 'after'}
    );

  //Check number of records affected. Throw error is no records updated.
    
    if (!updatedInfo) {
      throw new Error ('Could not update product successfully.')
    }

  //Update Average Rating
    
    helper.updateRating(productId);
  
  //Return newly added review object
   
    return updatedInfo.reviews[updatedInfo.reviews.length - 1];

};

const getAllReviews = async (productId) => {

  //Checks and trim
    
    helper.checkArg(productId, 'string', 'productId');
    productId = productId.trim();
    helper.checkObjectId(productId);

  //Pull collection of product documents
    
    const productCollection = await products();

  //findOne: erturns one document from the collection that satisfies the query's criteria
  //findOne: returns null if no document found. Throw error if null (no product found)
  //If more than one, returns the first document according to the "natural order" (order of objects on the disk).
  
    const pulledProduct = await productCollection.findOne({_id: new ObjectId(productId)});
  
    if (!pulledProduct) throw new Error('No product found with this ID.');

    return pulledProduct.reviews;

};

const getReview = async (reviewId) => {

  //Checks and trim
    helper.checkArg(reviewId, 'string', 'reviewId');
    reviewId = reviewId.trim();
    helper.checkObjectId(reviewId);

  //Pull collection of product documents
    const productCollection = await products();

  //Pull specific review
    const foundReview = await productCollection.findOne(
      {'reviews._id': new ObjectId(reviewId)},
      {projection: {_id: 0, 'reviews.$': 1}}
    );

  if (!foundReview) {
    throw new Error ('No review found with this id.')
  }

  return foundReview.reviews[0];

};

const updateReview = async (reviewId, updateObject) => {

  //Constant: Updated Product Data
    const updatedProductData = {};

  //Check and Trim ID

    helper.checkArg(reviewId, 'string', 'reviewId');
    reviewId = reviewId.trim();
    helper.checkObjectId(reviewId);

  //Pull Review and Check if Exists

    const review = await getReview(reviewId);

  //Check updateObject

    if(Object.keys(updateObject).length === 0){
      throw new Error('The update object cannot be empty.')
    }

    if(updateObject.title){
      helper.checkArg(updateObject.title, 'string', 'title');
    } 

    if(updateObject.reviewerName){
      helper.checkArg(updateObject.reviewerName, 'string', 'reviewerName');
    } 

    if(updateObject.review){
      helper.checkArg(updateObject.review, 'string', 'review');
    } 

    if(updateObject.rating){
      helper.checkArg(updateObject.rating, 'number', 'rating');
    } 

  // Assign default values from review if updateObject fields are missing
    if (!updateObject.hasOwnProperty('title')) {
      updateObject.title = review.title;
    }

    if (!updateObject.hasOwnProperty('reviewerName')) {
      updateObject.reviewerName = review.reviewerName;
    }

    if (!updateObject.hasOwnProperty('review')) {
        updateObject.review = review.review;
    }

    if (!updateObject.hasOwnProperty('rating')) {
        updateObject.rating = review.rating;
    }

  //Add time to update object
    updateObject.reviewDate = helper.currentDate();

  //Pull product collection
    const productCollection = await products();

  // Find product containing the review
    const product = await productCollection.findOne({'reviews._id': new ObjectId(reviewId)});

    if (!product) {
      throw new Error(`Product containing review with ID ${reviewId} not found.`);
    }

  // Get product ID from the product document
    const productIdString = product._id.toString();

  //Try to Update
    await productCollection.findOneAndUpdate(
      {'reviews._id': new ObjectId(reviewId)},
      {$set: {
        'reviews.$.title': updateObject.title,
        'reviews.$.reviewerName': updateObject.reviewerName,
        'reviews.$.review': updateObject.review,
        'reviews.$.rating': updateObject.rating,
        'reviews.$.reviewDate': updateObject.reviewDate}},
    );
   
  //Update Average Rating
    helper.updateRating(productIdString);

  //Return updated product
    return productsFunctions.get(productIdString);
};

const removeReview = async (reviewId) => {
  
  //Check and Trim ID
    helper.checkArg(reviewId, 'string', 'reviewId');
    reviewId = reviewId.trim();
    helper.checkObjectId(reviewId);

  //Check if Review Exists
    const review = await getReview(reviewId);
    if (!review){
      throw new Error('Review not found with the provided reviewId.');
    }
  
  //Pull Product Collection
    const productCollection = await products();


  // Find product containing the review
    const product = await productCollection.findOne({'reviews._id': new ObjectId(reviewId)});

    if (!product) {
      throw new Error(`Product containing review with ID ${reviewId} not found.`);
    }

  // Get product ID from the product document
    const productIdString = product._id.toString();
  
  //Create objectId from reviewId
    const reviewIdObj = new ObjectId(reviewId); 

  //Try to remmove
    await productCollection.findOneAndUpdate(
      {'reviews._id': reviewIdObj},
      {$pull: {reviews: {_id: reviewIdObj}}}
    );

  //Update Average Rating
    helper.updateRating(productIdString);

  //Return updated product
    return productsFunctions.get(productIdString);

};

//Export
export {
  createReview,
  getAllReviews,
  getReview,
  updateReview,
  removeReview
};

