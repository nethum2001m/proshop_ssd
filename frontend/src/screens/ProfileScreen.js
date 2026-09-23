import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Table, Nav } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import Loader from '../components/Loader';
import Message from '../components/Message';
import Meta from '../components/Meta';

import { getUserDetails, updateUserProfile } from '../actions/userActions';
import { myOrderList } from '../actions/orderActions';
import { USER_UPDATE_PROFILE_RESET } from '../constants/userConstants';

import { toast } from 'react-toastify';
import { formatter } from '../utils/formatter';
import { Link } from 'react-router-dom';

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const dispatch = useDispatch();

  const userDetails = useSelector((state) => state.userDetails);
  const { loading, user } = userDetails;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const userUpdateProfile = useSelector((state) => state.userUpdateProfile);
  const { success } = userUpdateProfile;

  const myOrders = useSelector((state) => state.myOrderList);
  const { loading: loadingOrders, error: errorOrders, orders } = myOrders;

  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo) {
      navigate(`../login`);
    } else {
      if (!user || !user.name || success) {
        dispatch({ type: USER_UPDATE_PROFILE_RESET });
        dispatch(getUserDetails('profile'));
        dispatch(myOrderList());
      } else {
        setName(user.name);
        setEmail(user.email);
      }
    }
  }, [dispatch, navigate, userInfo, user, success]);

  const submitHandler = (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error(`Passwords do not match!`, { autoClose: 5000 });
    } else {
      dispatch(updateUserProfile({ id: user._id, name, email, password }));
    }
  };

  return (
    <Row>
      <Meta title={`ProShop | Profile | ${name}`} />
      <Col md={3}>
        <h2>User Profile:</h2>

        {loading && <Loader />}
        <Form onSubmit={submitHandler}>
          <Form.Group controlId='name' style={{ marginBottom: '20px' }}>
            <Form.Label>Name:</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter name'
              value={name}
              onChange={(e) => setName(e.target.value)}
            ></Form.Control>
          </Form.Group>

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
            <Form.Label>Update Password:</Form.Label>
            <Form.Control
              type='password'
              placeholder='Enter password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Form.Group
            controlId='confirmPassword'
            style={{ marginBottom: '20px' }}
          >
            <Form.Label>Confirm Updated Password:</Form.Label>
            <Form.Control
              type='password'
              placeholder='Confirm password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Button type='submit' variant='primary'>
            Update Details
          </Button>
        </Form>
      </Col>
      <Col md={9}>
        <h2>My orders:</h2>
        {loadingOrders ? (
          <Loader />
        ) : errorOrders ? (
          <Message variant='warning'>{errorOrders}</Message>
        ) : (
          <Table striped bordered hover responsive className='table-sm'>
            <thead>
              <tr>
                <th>ID</th>
                <th>DATE</th>
                <th>TOTAL</th>
                <th>PAID</th>
                <th>DELIVERED</th>
                <th>DETAILS</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.createdAt.substring(0, 10)}</td>
                  <td>{formatter.format(order.totalPrice)}</td>
                  <td>
                    {order.isPaid ? (
                      <span style={{ color: '#00aead' }}>
                        {order.paidAt.substring(0, 10)}
                      </span>
                    ) : (
                      <i className='fas fa-times' style={{ color: '#f00' }}></i>
                    )}
                  </td>
                  <td>
                    {order.isDelivered ? (
                      <span style={{ color: '#00aead' }}>
                        {order.deliveredAt.substring(0, 10)}
                      </span>
                    ) : (
                      <i className='fas fa-times' style={{ color: '#f00' }}></i>
                    )}
                  </td>
                  <td>
                    <Nav.Link as={Link} to={`/order/${order._id}`}>
                      <Button className='btn-sm' variant='light'>
                        Details
                      </Button>
                    </Nav.Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Col>
    </Row>
  );
};

export default ProfileScreen;
