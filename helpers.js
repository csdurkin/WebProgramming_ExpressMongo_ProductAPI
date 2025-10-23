//TO DO: ADD 
//helper.checkArg(title, 'string', 'title');
//helper.checkArg(reviewerName, 'string', 'reviewerName');
//helper.checkArg(review, 'string', 'review');
//helper.checkArg(rating, 'number', 'rating');


// You can add and export any helper functions you want here - if you aren't using any, then you can just leave this file as is
// You can add and export any helper functions you want here. If you aren't using any, then you can just leave this file as is.
import {ObjectId} from 'mongodb';
import {products} from './config/mongoCollections.js';

//Function checkArg

    const checkArg = (argument, type, argumentName) => {

        if (argument === undefined) {
            throw new Error(`The argument (${argumentName}) is undefined.`); 
        } 
            
        else if (argument === null) {
            throw new Error(`The argument (${argumentName}) is null.`);
        }

        else if (type === 'array' && !Array.isArray(argument)) {
            throw new Error(`(${argumentName}) is not a valid array.`);
        }

        else if (type !== 'array' && typeof argument !==  type) {
            throw new Error(`The argument (${argumentName}) is not a ${type}.`);
        }

        if (type === 'string'){

            if (argument.trim().length === 0) {
                throw new Error(`The argument (${argumentName}) only includes spaces and is therefore considered an empty string.`);
            }

        }

        if (argumentName === 'manufacturerWebsite') {
        
            //if (argument.slice(0,11) !== 'http://www.'){
            if(!argument.startsWith('http://www.')) {
                throw new Error(`The website's url must start with 'http://www.'`);
            } 
            
            //else if (argument.slice(-4) !== '.com'){
            else if (!argument.endsWith('.com')){
                throw new Error(`The website's url must end with '.com'`);
            }
    
            else if ((argument.slice(11, -4)).length < 5){
                throw new Error(`The website's url must have at least 5 characters in-between the 'http://www.' and '.com'`);
            } 
    
        }

        if (argumentName === 'dateReleased') {

            let dateObject = new Date(argument.trim());

            //Must use isNan and not (!dateObject) because the new Date() will return 'Invalid Date' and thus be truthy.
            if(isNaN(dateObject)) {
                throw new Error (`The 'datereleased' is not a valid date or is not formatted properly.`)
            }

        }

        if (type === 'array'){

            if (argument.length === 0) {
                throw new Error(`The (${argumentName}) array must have at least one item.`);
            }

            for (let value of argument){
                
                if (typeof value !== 'string'){
                    throw new Error(`The values within the ${argumentName} array must be strings.`);
                } 
                
                else if (value.trim().length === 0){
                    throw new Error(`The values within the ${argumentName} array cannot be strings with just spaces.`);
                }
            }

        }

        if (type === 'number'){

            if (argumentName === 'price'){

                if (argument <= 0) {
                    throw new Error(`The price (${argumentName}) must be greater than $0.`);
                } 

                let priceSplit = argument.toString().split('.');

                if (priceSplit[1] && priceSplit[1].length > 2){
                    throw new Error(`The price (${argumentName}) can only have two demimal points for the cents.`);
                }
            
            }
            
            if (argumentName === 'rating'){

                if (argument < 1 || argument > 5) {
                    throw new Error(`The (${argumentName}) must be within the range of 1 to 5, inclusive.`);
                }

                let ratingSplit = argument.toString().split('.');

                if (ratingSplit[1] && ratingSplit[1].length > 1){
                    throw new Error(`The (${argumentName}) can only have one demimal place.`);
                }
            }
            
        }
        
    }

//Function: checkObjectId

    const checkObjectId = (id) => {

        if (!ObjectId.isValid(id)){
            throw new Error('Invalid object ID.')
        }

    }

//Function: currentDate

    const currentDate = () => {

        //Pulls current date and time
        const currentDate = new Date();

        //Isolate month, day, year
        const month = currentDate.getMonth() + 1; //Fixes zero-based indexing
        const day = currentDate.getDate();
        const year = currentDate.getFullYear();

        //Format as string (mm/dd/yyyy)
        //padStart: adds designated character to the front of string to ensure the length specified is reached
        const stringDate = `${month.toString().padStart(2, '0')}/${day.toString().padStart(2,'0')}/${year.toString().padStart(4, '0')}`;

        return stringDate;

    }


//Function: updateRating

    const updateRating = async (productId) => {
        
        checkObjectId(productId);

        //Pull Product Collection
            const productCollection = await products();

        //Pull Product
            const product = await productCollection.findOne({_id: new ObjectId(productId)});

        if (!product){
            throw new Error('Product not found.');
        }

        let ratingTotal = 0;
        for (let review of product.reviews){
            ratingTotal += review.rating;
        }

        const newAverageRating = ratingTotal / product.reviews.length;

        await productCollection.updateOne(
            {_id: new ObjectId(productId)},
            {$set: {averageRating: newAverageRating}}
        );

    }

//Export
export {
    checkArg,
    checkObjectId,
    currentDate,
    updateRating
};