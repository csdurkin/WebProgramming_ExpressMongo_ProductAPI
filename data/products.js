// This data file should export all functions using the ES6 standard as shown in the lecture code

//Notes: Use of two periods (..) will navigate up to the parent directory
import {products} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
import * as helper from '../helpers.js';

const create = async (
  productName,
  productDescription,
  modelNumber,
  price,
  manufacturer,
  manufacturerWebsite,
  keywords,
  categories,
  dateReleased,
  discontinued
) => {

  //Checks
  helper.checkArg(productName, 'string', 'productName');
  helper.checkArg(productDescription, 'string', 'productDescription');
  helper.checkArg(modelNumber, 'string', 'modelNumber');
  helper.checkArg(price, 'number', 'price');
  helper.checkArg(manufacturer, 'string', 'manufacturer');
  helper.checkArg(manufacturerWebsite, 'string', 'manufacturerWebsite');
  helper.checkArg(keywords, 'array', 'keywords');
  helper.checkArg(categories, 'array', 'categories');
  helper.checkArg(dateReleased, 'string', 'dateReleased');       
  helper.checkArg(discontinued, 'boolean', 'discontinued');

  //Trims
  productName = productName.trim();
  productDescription = productDescription.trim();
  modelNumber = modelNumber.trim();
  manufacturer = manufacturer.trim();
  manufacturerWebsite = manufacturerWebsite.trim();
  dateReleased = dateReleased.trim();

  for (let i in keywords){
    keywords[i] = keywords[i].trim();
  }

  for (let i in categories){
    categories[i] = categories[i].trim();
  }

  //Create Object for New Product
  let newProduct = {
    productName: productName,
    productDescription: productDescription,
    modelNumber: modelNumber,
    price: price,
    manufacturer: manufacturer,
    manufacturerWebsite: manufacturerWebsite,
    keywords: keywords,
    categories: categories,
    dateReleased: dateReleased,
    discontinued: discontinued,
    reviews: [],                                  //Initializes reviews for each new product to an empty array
    averageRating: 0                              //Initializes the averageRating for each new product to be 0
  }

  //Pull collection of all product documents
  const productCollection = await products();

  //insertOne: Inserts a single document into a collection. Returns a document with: acknowledged (boolean, true if ran with right concern) and insertedId (_id value of the inserted document)
  const insertInfo = await productCollection.insertOne(newProduct);

  //If not inserted, throw error. 
  if (!insertInfo.acknowledged || !insertInfo.insertedId){
    throw new Error(`The product could not be added.`);
  }

  //Return product object
  return await get(insertInfo.insertedId.toString());

};

const getAll = async () => {

  //Pull collection of product documents
  const productCollection = await products();

  //Create an array of the objects
  let productList = await productCollection.find({}, {projection: { _id: 1, productName: 1}}).toArray();

  if (!productList) throw new Error('Could not pull all products.')

  //Loop through array, replacing Object Ids with string Ids
  /*productList = productList.map((product) => {
    product._id = product._id.toString();
    return product;
  })*/

  //Return all products array
  return productList; 

};

const get = async (productId) => {
  
  //Checks and trim
  helper.checkArg(productId, 'string', 'productId');
  productId = productId.trim();
  helper.checkObjectId(productId);

  //Pull collection of product documents
  const productCollection = await products();

  //findOne: erturns one document from the collection that satisfies the query's criteria
  //If more than one, returns the first document according to the "natural order" (order of objects on the disk).
  const gottenProduct = await productCollection.findOne({_id: new ObjectId(productId)});

  //findOne: returns null if no document found. Throw error if null (no product found)
  if (!gottenProduct) throw new Error('No product found with this ID.')

  //Set the pulled product's id to string value.
  //pulledProduct._id = pulledProduct._id.toString();

  //Return pulled product's object
  return gottenProduct;
};

const remove = async (productId) => {

  //Checks and trims
  helper.checkArg(productId, 'string', 'id');
  productId = productId.trim();
  helper.checkObjectId(productId);

  //Pull collection of product documents
  const productCollection = await products();

  //findOneAndDelete: Deletes a single document based on filter and sort criteria. Returns the deleted object.
  //Set arguement id to objectId to work with Mongo
  const deletedInfo = await productCollection.findOneAndDelete({_id: new ObjectId(productId)});

  //Checks number of records affected. Throw error if no product deleted.
  if (!deletedInfo) {
    throw new Error (`Could not delete product with id of ${productId}.`)
  }

  //Return name of object deleted.
  return deletedInfo;

};

//Notes: Updates all data of the product currently in the database; all new data fields must be provided as arguments.
const update = async (
  productId,
  productName,
  productDescription,
  modelNumber,
  price,
  manufacturer,
  manufacturerWebsite,
  keywords,
  categories,
  dateReleased,
  discontinued
) => {

  //Checks and trim ID
    helper.checkArg(productId, 'string', 'id');
    productId = productId.trim();
    helper.checkObjectId(productId);

  //Checks
    helper.checkArg(productName, 'string', 'productName');
    helper.checkArg(productDescription, 'string', 'productDescription');
    helper.checkArg(modelNumber, 'string', 'modelNumber');
    helper.checkArg(price, 'number', 'price');
    helper.checkArg(manufacturer, 'string', 'manufacturer');
    helper.checkArg(manufacturerWebsite, 'string', 'manufacturerWebsite');
    helper.checkArg(keywords, 'array', 'keywords');
    helper.checkArg(categories, 'array', 'categories');
    helper.checkArg(dateReleased, 'string', 'dateReleased');       
    helper.checkArg(discontinued, 'boolean', 'discontinued');

  //Trims
    productName = productName.trim();
    productDescription = productDescription.trim();
    modelNumber = modelNumber.trim();
    manufacturer = manufacturer.trim();
    manufacturerWebsite = manufacturerWebsite.trim();
    dateReleased = dateReleased.trim();

    for (let i in keywords){
      keywords[i] = keywords[i].trim();
    }

    for (let i in categories){
      categories[i] = categories[i].trim();
    }

  //Create new object with updates to be stored
    const updatedProduct = {
      productName: productName,
      productDescription: productDescription,
      modelNumber: modelNumber,
      price: price,
      manufacturer: manufacturer,
      manufacturerWebsite: manufacturerWebsite,
      keywords: keywords,
      categories: categories,
      dateReleased: dateReleased,
      discontinued: discontinued
    }

  //Pull collection of product documents
    const productCollection = await products();

  //findOneAndUpdae: Updates a single document based on the filter and sort criteria
  //Matchs to argument id (converted to object id), sets other key/values according to the updatedProduct object, returns updated document bc of 'returnDocument' is set to after
    const updatedInfo = await productCollection.findOneAndUpdate(
      {_id: new ObjectId(productId)},
      {$set: updatedProduct}, 
      {returnDocument: 'after'}
    );

  //Check number of records affected. Throw error is no records updated.
    if (!updatedInfo) {
      throw new Error ('Could not update product successfully.')
    }

  //Set id value of return object to string id
    //updatedInfo._id = updatedInfo._id.toString();

  //Return object
    return updatedInfo;

};


//Export
export {
  create,
  get,
  getAll,
  remove,
  update
};