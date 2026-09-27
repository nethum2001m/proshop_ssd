import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';
import Meta from '../components/Meta';
import { login } from '../actions/userActions';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();

  const userLogin = useSelector((state) => state.userLogin);
  const { loading, userInfo } = userLogin;

  const location = useLocation();
  const redirect = location.search ? location.search.split('=')[1] : '/';

  const navigate = useNavigate();

  useEffect(() => {
    if (userInfo) {
      navigate(`../${redirect}`);
    }
  }, [userInfo, navigate, redirect]);

  const submitHandler = (event) => {
    event.preventDefault();
    dispatch(login(email, password));
  };

  return (
    <FormContainer>
      <Meta title={'ProShop | Sign In'} />
      <h1>Sign In:</h1>
      {loading && <Loader />}
      <Form onSubmit={submitHandler}>
        <Form.Group controlId='email' style={{ marginBottom: '20px' }}>
          <Form.Label>Email Address:</Form.Label>
          <Form.Control
            type='email'
            placeholder='Enter Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group controlId='password' style={{ marginBottom: '20px' }}>
          <Form.Label>Password:</Form.Label>
          <Form.Control
            type='password'
            placeholder='Enter password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Button type='submit' variant='primary'>
          Sign In
        </Button>
      </Form>

      <Row className='py-3'>
        <Col>
          Need to Register?{' '}
          <Link to={redirect ? `/register?redirect=${redirect}` : '/register'}>
            Click here.
          </Link>
        </Col>
      </Row>
    </FormContainer>
  );
};

export default LoginScreen;
