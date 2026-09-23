import asyncHandler from 'express-async-handler';
import Product from '../models/ProductModel.js';

// @desc    Fetch all products
// @routes  GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 6;
  const page = Number(req.query.pageNumber) || 1;
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  const count = await Product.count({ ...keyword });

  const products = await Product.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1));
  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Fetch single product by id
// @routes  GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error(
      `Product with id of ${req.params.id} not found.  Either the product does not exist or the id you've entered is incorrect.`
    );
  } else {
    res.json(product);
  }
});

// @desc    delete single product by id
// @routes  DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error(
      `Product with id of ${req.params.id} not found.  Either the product does not exist or the id you've entered is incorrect.`
    );
  } else {
    await product.remove();
    res.json({ message: 'Product deleted', product });
  }
});

// @desc    create single product by id
// @routes  POST /api/products/
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: 'SampleName',
    price: '0',
    user: req.user._id,
    image: '/images/sample.png',
    brand: 'sampleBrand',
    category: 'sampleCategory',
    countInStock: 0,
    numReviews: 0,
    description: 'sampleDescription',
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update/edit single product by id
// @routes  PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, image, brand, category, countInStock, description } =
    req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found!');
  } else {
    product.name = name;
    product.price = price;
    product.image = image;
    product.brand = brand;
    product.category = category;
    product.countInStock = countInStock;
    product.description = description;

    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  }
});

// @desc    Create new review
// @routes  POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found!');
  } else {
    const alreadyReviewed = product.reviews.find(
      (review) => review.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    } else {
      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };
      product.reviews = [...product.reviews, review];
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((total, item) => item.rating + total, 0) /
        product.reviews.length;

      const updatedReview = await product.save();

      res.status(200).json({ message: 'Review added', updatedReview });
    }
  }
});

// @desc    Get Top Rated Products
// @routes  GET /api/products/top
// @access  Public
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(3);
  if (!products) {
    throw new Error('Could not find top products');
  } else {
    res.json(products);
  }
});

export {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  getTopProducts,
};
