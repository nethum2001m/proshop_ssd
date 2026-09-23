import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import FormContainer from '../components/FormContainer';
import CheckoutSteps from '../components/CheckoutSteps';
import Meta from '../components/Meta';
import { saveShippingAddress } from '../actions/cartActions';

const ShippingScreen = () => {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [address, setAddress] = useState(
    shippingAddress.address ? shippingAddress.address : ''
  );
  const [city, setCity] = useState(
    shippingAddress.city ? shippingAddress.city : ''
  );
  const [state, setState] = useState(
    shippingAddress.state ? shippingAddress.state : ''
  );
  const [postalCode, setPostalCode] = useState(
    shippingAddress.postalCode ? shippingAddress.postalCode : ''
  );
  const [country, setCountry] = useState(
    shippingAddress.country ? shippingAddress.country : ''
  );

  const submitHandler = (event) => {
    event.preventDefault();
    dispatch(
      saveShippingAddress({ address, city, postalCode, state, country })
    );
    navigate('../payment');
  };

  return (
    <FormContainer>
      <Meta title={'ProShop | Shipping'} />
      <CheckoutSteps step1 step2 />
      <h1>Shipping</h1>

      <Form onSubmit={submitHandler}>
        <Form.Group controlId='address' style={{ marginBottom: '20px' }}>
          <Form.Label>Address:</Form.Label>
          <Form.Control
            type='text'
            placeholder='Enter Address'
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Form.Group controlId='city' style={{ marginBottom: '20px' }}>
          <Form.Label>City:</Form.Label>
          <Form.Control
            type='text'
            placeholder='Enter City'
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Form.Group controlId='postalCode' style={{ marginBottom: '20px' }}>
          <Form.Label>Postal Code:</Form.Label>
          <Form.Control
            type='text'
            placeholder='Enter postal code'
            required
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Form.Group controlId='state' style={{ marginBottom: '20px' }}>
          <Form.Label>State:</Form.Label>
          <Form.Control
            type='text'
            placeholder='Enter state'
            required
            value={state}
            onChange={(e) => setState(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Form.Group controlId='country' style={{ marginBottom: '20px' }}>
          <Form.Label>Country:</Form.Label>
          <Form.Control
            type='text'
            placeholder='Enter Country'
            required
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Button type='submit' variant='primary'>
          Continue
        </Button>
      </Form>
    </FormContainer>
  );
};

export default ShippingScreen;
