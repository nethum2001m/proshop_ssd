import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import {
  Row,
  Col,
  Image,
  ListGroup,
  Card,
  Button,
  Form,
} from 'react-bootstrap';
import Rating from '../components/Rating';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Meta from '../components/Meta';
import {
  listProductDetails,
  createProductReview,
} from '../actions/productActions';
import { addToCart } from '../actions/cartActions';
import { PRODUCT_CREATE_REVIEW_RESET } from '../constants/productConstants';

const ProductScreen = () => {
  const dispatch = useDispatch();

  const params = useParams();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const productDetails = useSelector((state) => state.productDetails);
  const { loading, error, product } = productDetails;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const productCreateReview = useSelector((state) => state.productCreateReview);
  const { loading: loadingProductReview, success: successProductReview } =
    productCreateReview;

  useEffect(() => {
    if (successProductReview) {
      setRating(0);
      setComment('');
      dispatch({ type: PRODUCT_CREATE_REVIEW_RESET });
    }
    dispatch(listProductDetails(params.id));
  }, [dispatch, params.id, successProductReview]);

  const addToCartHandler = () => {
    dispatch(addToCart(params.id, quantity));
    navigate('../cart');
  };

  const submitReviewHandler = (event) => {
    event.preventDefault();
    dispatch(createProductReview(product._id, { rating, comment }));
  };

  return (
    <>
      <Button className='btn btn-light my-3' as={Link} to={-1}>
        Go Back
      </Button>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <>
          <Meta title={`ProShop | ${product.name}`} />
          <Row className='pt-3 align-items-stretch d-flex'>
            <Col md={6}>
              <Image src={product.image} alt={product.name} fluid />
            </Col>
            <Col md={6}>
              <ListGroup variant='flush' style={{ padding: '1rem' }}>
                <ListGroup.Item>
                  <h3>{product.name}</h3>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Rating
                    value={product.rating}
                    text={`${product.numReviews} ${
                      product.numReviews === 1 ? 'review' : 'reviews'
                    }`}
                  />
                </ListGroup.Item>
                <ListGroup.Item>Price: ${product.price}</ListGroup.Item>
                <ListGroup.Item>
                  Description: {product.description}
                </ListGroup.Item>
              </ListGroup>

              <Card>
                <ListGroup style={{ padding: '1rem', textAlign: 'center' }}>
                  <ListGroup.Item>
                    <Row>
                      <Col>Price:</Col>
                      <Col>
                        <strong>${product.price}</strong>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Status:</Col>
                      <Col>
                        {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
                      </Col>
                    </Row>
                  </ListGroup.Item>

                  {product.countInStock > 0 && (
                    <ListGroup.Item>
                      <Row>
                        <Col>Quantity:</Col>
                        <Col>
                          <Form.Control
                            as='select'
                            value={quantity}
                            onChange={({ target }) =>
                              setQuantity(Number(target.value))
                            }
                            style={{
                              margin: 'auto',
                              padding: '0',
                              textAlign: 'center',
                              maxWidth: '50%',
                            }}
                          >
                            {[...Array(product.countInStock).keys()].map(
                              (idx) => (
                                <option key={idx + 1} value={idx + 1}>
                                  {idx + 1}
                                </option>
                              )
                            )}
                          </Form.Control>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  )}

                  <ListGroup.Item>
                    <Button
                      onClick={addToCartHandler}
                      className='btn-block'
                      type='button'
                      disabled={product.countInStock > 0 ? false : true}
                      style={{
                        width: '60%',
                        display: 'block',
                        margin: '1rem auto',
                      }}
                    >
                      Add to Cart
                    </Button>
                  </ListGroup.Item>
                </ListGroup>
              </Card>
            </Col>
          </Row>
          {loadingProductReview ? (
            <Loader />
          ) : (
            <Row>
              <Col md={6} className='my-3'>
                <h2>Reviews:</h2>
                {product.reviews.length === 0 ? (
                  <Message>No reviews yet.</Message>
                ) : (
                  <ListGroup variant='flush'>
                    {product.reviews.map((review) => (
                      <ListGroup.Item key={review._id}>
                        <strong>{review.name}</strong>
                        <Rating value={review.rating} text='' />
                        <p>{review.createdAt.substring(0, 10)}</p>
                        <p>{review.comment}</p>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Col>
              <Col md={6} className='my-3'>
                {!userInfo ? (
                  <small>
                    Please <Link to='/login'>sign in</Link> to write a review
                  </small>
                ) : (
                  <>
                    {' '}
                    <h2>Write a review:</h2>
                    <Form onSubmit={submitReviewHandler}>
                      <Form.Group controlId='rating'>
                        <Form.Label>Rating</Form.Label>
                        <Form.Control
                          as='select'
                          value={rating}
                          onChange={(e) => setRating(e.target.value)}
                        >
                          <option value=''>Select...</option>
                          <option value='1'>1 - Poor</option>
                          <option value='2'>2 - Below Expectations</option>
                          <option value='3'>3 - Fair</option>
                          <option value='4'>4 - Good</option>
                          <option value='5'>5 - Excellent</option>
                        </Form.Control>
                      </Form.Group>
                      <Form.Group controlId='comment' className='mt-2'>
                        <Form.Label>Comment</Form.Label>
                        <Form.Control
                          as='textarea'
                          row='3'
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          maxLength={500}
                          style={{
                            resize: 'none',
                            height: '10rem',
                          }}
                        ></Form.Control>
                      </Form.Group>
                      <Button type='submit' variant='primary' className='my-3'>
                        Submit Review
                      </Button>
                    </Form>
                  </>
                )}
              </Col>
            </Row>
          )}
        </>
      )}
    </>
  );
};

export default ProductScreen;
