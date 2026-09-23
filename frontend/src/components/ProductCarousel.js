import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Carousel, Image } from 'react-bootstrap';
import Loader from '../components/Loader';
import { listTopProducts } from '../actions/productActions';
import { formatter } from '../utils/formatter';

const ProductCarousel = () => {
  const dispatch = useDispatch();

  const productsTopRated = useSelector((state) => state.productsTopRated);
  const { loading, products } = productsTopRated;

  useEffect(() => {
    dispatch(listTopProducts());
  }, [dispatch]);

  return loading || !products ? (
    <Loader />
  ) : (
    <Carousel pause='hover' className='rounded card my-3'>
      {products.map((product) => (
        <Carousel.Item key={product._id}>
          <Link to={`/product/${product._id}`}>
            <Image src={product.image} alt={product.name} fluid />
            <Carousel.Caption className='carousel-caption'>
              <h2>
                {product.name} ({formatter.format(product.price)})
              </h2>
            </Carousel.Caption>
          </Link>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default ProductCarousel;
