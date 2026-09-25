import asyncHandler from 'express-async-handler';
import User from '../models/UserModel.js';
import generateToken from '../utils/generateToken.js';

import { OAuth2Client } from 'google-auth-library';

// @desc    Auth user and get token
// @routes  POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid username or password');
  } else {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  }
});


// @desc    Authenticate user using Google OAuth 2.0 / OpenID Connect
// @route   POST /api/users/google
// @access  Public

const googleAuthUser = asyncHandler(async (req, res) => {
  const { code } = req.body;

  // 1. Validate authorization code
  if (
    typeof code !== 'string' ||
    code.trim().length === 0 ||
    code.length > 4096
  ) {
    res.status(400);
    throw new Error('Google authorization code is required');
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000';

  if (!clientId || !clientSecret) {
    res.status(500);
    throw new Error('Google authentication is not configured');
  }

  // Create OAuth client after environment variables are loaded
  const googleClient = new OAuth2Client(
    clientId,
    clientSecret,
    redirectUri
  );

  // 2. Exchange the one-time authorization code for tokens
  let tokens;

  try {
    const tokenResponse = await googleClient.getToken(code);
    tokens = tokenResponse.tokens;
  } catch (error) {
    console.error(
      'Google authorization-code exchange failed:',
      error.message
    );

    res.status(401);
    throw new Error('Invalid or expired Google authorization code');
  }

  // We only need Google's ID token for authentication.
  if (!tokens.id_token) {
    res.status(401);
    throw new Error('Google did not return an ID token');
  }

  // 3. Cryptographically verify Google's ID token
  let payload;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: clientId,
    });

    payload = ticket.getPayload();
  } catch (error) {
    console.error(
      'Google ID token verification failed:',
      error.message
    );

    res.status(401);
    throw new Error('Unable to verify Google identity');
  }

  // 4. Validate important OpenID Connect claims
  if (
    !payload ||
    !payload.sub ||
    !payload.email ||
    payload.email_verified !== true
  ) {
    res.status(401);
    throw new Error('Google account identity could not be verified');
  }

  const googleSub = payload.sub;
  const normalizedEmail = payload.email.trim().toLowerCase();

  // 5. First search using Google's stable OIDC subject identifier
  let user = await User.findOne({
    googleSub,
  });

  // 6. If this Google account has not previously been linked,
  // check whether a local account already uses the verified email.
  if (!user) {
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      // Protect against linking two different Google identities
      // to the same local account.
      if (
        existingUser.googleSub &&
        existingUser.googleSub !== googleSub
      ) {
        res.status(409);
        throw new Error(
          'This email is already linked to another Google account'
        );
      }

      // Google has verified ownership of this email.
      existingUser.googleSub = googleSub;

      user = await existingUser.save();
    } else {
      // 7. Create a new Google-only ProShop account
      const displayName =
        typeof payload.name === 'string' && payload.name.trim()
          ? payload.name.trim()
          : normalizedEmail.split('@')[0];

      user = await User.create({
        name: displayName,
        email: normalizedEmail,
        googleSub,
      });
    }
  }

  if (!user) {
    res.status(500);
    throw new Error('Unable to create or retrieve user account');
  }

  // 8. Google authentication is complete.
  // From here ProShop uses its existing JWT authorization system.
  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    token: generateToken(user._id),
  });
});

// @desc    Register a new user
// @routes  POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User with chosen email address already exists.');
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid user data - unable to create profile');
  } else {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  }
});

// @desc    Get user profile
// @routes  GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found!');
  } else {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  }
});

// @desc    Update user profile
// @routes  PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found!');
  } else {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    req.body.password && (user.password = req.body.password);
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser._id),
    });
  }
});

// @desc    Get all users
// @routes  GET /api/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const pageSize = 5;
  const page = Number(req.query.pageNumber) || 1;

  const count = await User.count();

  const users = await User.find({})
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  if (!users) {
    res.status(404);
    throw new Error('Unable to return all users');
  } else {
    res.json({ users, page, pages: Math.ceil(count / pageSize) });
  }
});

// @desc    Delete user by ID
// @routes  DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found!');
  } else {
    await user.remove();
    res.json({ message: 'User removed', user });
  }
});

// @desc    Get user by id
// @routes  GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error(
      "User not found - either the user doesn't exist or the ID entered is incorrect."
    );
  } else {
    res.json(user);
  }
});

// @desc    Update user
// @routes  PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found!');
  } else {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin = req.body.isAdmin === true ? true : false;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  }
});

export {
  authUser,
  googleAuthUser,
  getUserProfile,
  registerUser,
  updateUserProfile,
  getAllUsers,
  deleteUser,
  getUserById,
  updateUser,
};
