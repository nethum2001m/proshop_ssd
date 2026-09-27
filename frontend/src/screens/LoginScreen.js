import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';
import Meta from '../components/Meta';
import { login, googleLogin } from '../actions/userActions';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';


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


  const signInWithGoogle = useGoogleLogin({
  flow: 'auth-code',

  // OpenID Connect identity scopes
  scope: 'openid email profile',

  ux_mode: 'popup',

  onSuccess: (codeResponse) => {
    if (!codeResponse.code) {
      toast.error('Google did not return an authorization code');
      return;
    }

    dispatch(googleLogin(codeResponse.code));
  },

  onError: () => {
    toast.error('Google authentication was cancelled or failed');
  },
});

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
        <div
  style={{
    display: 'flex',
    alignItems: 'center',
    margin: '20px 0',
  }}
>
  <div
    style={{
      flex: 1,
      height: '1px',
      backgroundColor: '#ddd',
    }}
  />

  <span
    style={{
      padding: '0 12px',
      color: '#777',
    }}
  >
    OR
  </span>

  <div
    style={{
      flex: 1,
      height: '1px',
      backgroundColor: '#ddd',
    }}
  />
</div>

<Button
  type='button'
  variant='light'
  className='google-signin-btn'
  disabled={loading}
  onClick={() => signInWithGoogle()}
>
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.55 10.79l7.98-6.2z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
  Sign in with Google
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
