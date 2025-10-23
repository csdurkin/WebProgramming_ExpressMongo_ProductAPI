# WebProgramming_ExpressMongo_ProductAPI

A simple REST API that lets clients **Create, Read, Update, and Delete (CRUD)** **products** and **product reviews**.  
Built with **Node.js (ES Modules)**, **Express**, and **MongoDB** using a single `products` collection that embeds `reviews` as an array of sub-documents.

---

## Quick Start (TL;DR)

```bash
# 1) Start MongoDB locally (default port 27017)
mongod

# 2) Clone code, install deps, run server
npm install
npm start

# 3) Base URL
http://localhost:3000

# 4) Smoke test
curl http://localhost:3000/products
```

---

## Tech Stack

- Node.js with ES Modules (`"type": "module"`)
- Express 4
- MongoDB Driver 6
- Local MongoDB instance (default: `mongodb://localhost:27017/`)

## Project Structure

```
app.js                         # boots Express, JSON body middleware, mounts routes, listens on :3000
package.json                   # name, scripts, deps, ES modules
helpers.js                     # input/ID/date/rating helpers
config/
  ├─ settings.js               # mongoConfig: serverUrl + database
  ├─ mongoConnection.js        # dbConnection() / closeConnection()
  └─ mongoCollections.js       # lazy getter for "products" collection
data/
  ├─ products.js               # CRUD for products
  └─ reviews.js                # CRUD for review subdocuments
routes/
  ├─ index.js                  # mounts /products and /reviews, 404 fallback
  ├─ products.js               # /products routes
  └─ reviews.js                # /reviews routes
```

## Environment & Configuration

- Mongo connection string and DB name are in **`config/settings.js`**:

```js
export const mongoConfig = {
  serverUrl: 'mongodb://localhost:27017/',
  database: 'FirstName_LastName_lab6' // ← set this to your required lab DB name
};
```

> Update `database` to exactly match the required format: `FirstName_LastName_lab6` (e.g., `Connor_Durkin_lab6`).

## Install & Run

```bash
npm install
npm start
# Server logs:
# We've got a server!
# Our routes are running on http://localhost:3000
```

The app uses `express.json()` for JSON request bodies.

---

## Data Model

### Product (stored in `products` collection)
```json
{
  "_id": "ObjectId",
  "productName": "string",
  "productDescription": "string",
  "modelNumber": "string",
  "price": 199.99,
  "manufacturer": "string",
  "manufacturerWebsite": "http://www.example.com",
  "keywords": ["string", "..."],
  "categories": ["string", "..."],
  "dateReleased": "MM/DD/YYYY",
  "discontinued": false,
  "reviews": [ /* array of Review objects (see below) */ ],
  "averageRating": 0
}
```

### Review (sub-document embedded in `product.reviews`)
```json
{
  "_id": "ObjectId",
  "title": "string",
  "reviewDate": "MM/DD/YYYY",
  "reviewerName": "string",
  "review": "string",
  "rating": 1
}
```

> All reviews are embedded sub-documents under a single **`products`** collection. No separate `reviews` collection is used.

---

## Validation Rules (high level)

Implemented in `helpers.js` and enforced both at **route** level and in **data** functions:

- All string inputs are **required**, **trimmed**, and must not be empty/whitespace.
- `price` must be a **number > 0** with **max 2 decimal places**.
- `manufacturerWebsite` must **start** with `http://www.` and **end** with `.com` and have **≥5 chars** in between.
- `keywords` and `categories` must be **arrays with at least one non-empty string** element.
- `dateReleased` must be a **valid** date in `MM/DD/YYYY`.
- `discontinued` is **boolean**.
- IDs are validated as **MongoDB ObjectId** values.
- Reviews:
  - `rating` is a number from **1–5** (floats allowed) with **one decimal place max**.
  - `reviewDate` is automatically set/updated to the **current date** in `MM/DD/YYYY` when creating/updating a review.
  - After create/update/delete of a review, **`averageRating`** is recalculated and stored on the product.

---

## API

Base URL: `http://localhost:3000`

### Products

#### GET `/products`
Returns only `_id` and `productName` for all products (using projection).

**Response 200**
```json
[
  {"_id":"603d965568567f396ca44a72","productName":"83 inch LG C3 OLED TV"},
  {"_id":"704f456673467g306fc44c34","productName":"iPhone 14 Pro - 1TB Space Gray"}
]
```

```bash
curl http://localhost:3000/products
```

#### POST `/products`
Create a product. Request body must include all fields (except `_id`, `reviews`, `averageRating`).

**Request**
```json
{
  "productName": "83 inch LG C3 OLED TV",
  "productDescription": "…",
  "modelNumber": "OLED83C3PUA",
  "price": 4757.29,
  "manufacturer": "LG",
  "manufacturerWebsite": "http://www.lgelectronics.com",
  "keywords": ["TV","Smart TV","OLED","LG","Big Screen","83 Inch"],
  "categories": ["Electronics","Televisions","OLED TVs"],
  "dateReleased": "02/27/2023",
  "discontinued": false
}
```

**Response 200**
Returns the full created product (with initialized `reviews: []` and `averageRating: 0`).

```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d @new-product.json
```

#### GET `/products/:productId`
Returns the **full** product document.

```bash
curl http://localhost:3000/products/507f1f77bcf86cd799439011
```

- 400 if `:productId` is not a valid ObjectId
- 404 if no product found

#### PUT `/products/:productId`
Replaces the product data with the provided body (all fields required). `reviews` and `averageRating` are preserved.

```bash
curl -X PUT http://localhost:3000/products/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d @updated-product.json
```

- 400 for invalid input / invalid ObjectId
- 404 if product not found
- 200 returns updated product

#### DELETE `/products/:productId`
Deletes the product.

**Response 200**
```json
{"_id":"507f1f77bcf86cd799439011","deleted":true}
```

```bash
curl -X DELETE http://localhost:3000/products/507f1f77bcf86cd799439011
```

---

### Reviews

#### GET `/reviews/:productId`
Returns the **array of review sub-documents** for the given product (no product fields).

```bash
curl http://localhost:3000/reviews/507f1f77bcf86cd799439011
```

- 400 invalid `productId`
- 404 if product not found or no reviews

#### POST `/reviews/:productId`
Creates a new review for the product. `reviewDate` is set to current date.

**Request**
```json
{
  "title": "Wow!!",
  "reviewerName": "Patrick Hill",
  "review": "This TV was amazing! …",
  "rating": 5
}
```

**Response 200**
Returns the **full product** (review added and `averageRating` updated).

```bash
curl -X POST http://localhost:3000/reviews/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d @new-review.json
```

#### GET `/reviews/review/:reviewId`
Returns a **single review object** (projection) by `reviewId` (no product fields).

```bash
curl http://localhost:3000/reviews/review/603d992b919a503b9afb856e
```

- 400 invalid `reviewId`
- 404 if review not found

#### PATCH `/reviews/review/:reviewId`
Updates one or more fields of a review. `reviewDate` is set to current date if update succeeds. Returns the **full product** containing the updated review and recalculated `averageRating` (if rating changed).

```bash
curl -X PATCH http://localhost:3000/reviews/review/603d992b919a503b9afb856e \
  -H "Content-Type: application/json" \
  -d '{"title":"Amazing!!! Wow!!","rating":4.5}'
```

- 400 invalid input / invalid `reviewId`
- 404 if review not found
- 200 returns product with updated review

#### DELETE `/reviews/review/:reviewId`
Removes the review and returns the **full product** with updated `averageRating`.

```bash
curl -X DELETE http://localhost:3000/reviews/review/603d992b919a503b9afb856e
```

- 400 invalid `reviewId`
- 404 if review not found

---

## Implementation Notes

- **Single collection design**: `products` holds all product documents; reviews are embedded sub-documents in `reviews: []`.
- **Projection usage**:
  - `GET /products` returns only `{ _id, productName }` via projection.
  - `GET /reviews/review/:reviewId` projects the single review with `{'reviews.$': 1, _id: 0}`.
- **Average Rating**:
  - Recomputed in `helpers.updateRating(productId)` after review create/update/delete and stored in the product’s `averageRating` field.
- **Input validation** and **ObjectId checks** are performed in both routes and data modules; strings are trimmed.
- **Dates** are consistently formatted as `MM/DD/YYYY` via `helpers.currentDate()`.

---

## Seeding (Optional but Helpful)

You can create a simple script (e.g., `seed.mjs`) to insert ~10 products with 1–3 reviews each for faster testing. Run with:

```bash
node seed.mjs
```

---

## Scripts

- **Start**: `npm start` — runs `node app.js`

---

## Troubleshooting

- Ensure MongoDB is running locally on `27017`.
- Verify `config/settings.js` uses the required DB name format.
- All requests must be `application/json` where applicable.
- Validate IDs are 24-hex-character MongoDB ObjectIds.

---

## License

ISC
