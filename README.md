# PROSHOP: MERN e-commerce store
ECommerce Site using React/Redux, NodeJS, Express, and Mongo DB
---

With thanks to Brad Traversy and [his teaching.](https://www.udemy.com/course/mern-ecommerce/)

---

** Update June 2022: ** There is a conflict with [`react-toastify`](https://www.npmjs.com/package/react-toastify) and some other versions of the dependencies I am using for this project. Currently, I have `react-toastify` running its version 4.1 to mitigate this issue.  Since this project is unmaintained, I almost certainly will not fix the issue properly unless it causes the project to not deploy correctly.

---

See the deployed project [here](https://frozen-waters-85538.herokuapp.com/).  The repo branch that is currently deployed to Heroku is `dev`.  

---

To run:
1. Clone the repo - `dev` branch is the one that is currently deployed and exampled here; `main` is my original project

`git clone https://github.com/jonathanjacka/proshop_mern_ecommerce.git`

2. Then, change directory into the project root folder:

`cd proshop_mern_ecommerce`

3. Now that you're in the root directory, install all dependencies.  Note, that you'll have to do this in the root, /frontend, and /backend folders.  The steps below will get this done:
```
//in root
npm install

//once completed, cd into frontend folder, and run npm install again
cd frontend
npm install

//Now do the same thing in the backend folder
cd ../backend
npm install
```

4. Next, you'll need to get your Mongo DB database set up.  I'll won't go into how to do that here, but if this is relatively new to you, I would suggest completing [Brad's course](https://www.udemy.com/course/mern-ecommerce/).  You'll need to get your database URI and use it as an environment variable - `MONGO_URI` - for things to work correctly (See *** environment variables *** below).

5. Once your database it correctly working, you can populate your collection using the seeder scripts in the /backend folder:
```
//from the root
cd backend
npm run data:import
```
*Note: use `npm run data:destroy` to remove all data from the collection*

7.  Additionally, I used [Cloudinary](https://cloudinary.com/) to host any uploaded images when create new products on the site, as by default these images would not persist when hosted on Heroku.  You'll also need to set this up and locate the necessary environment variables to get this to work (See *** environment variables *** below).  However, I found that Cloudinary was super-simple to set up and use.  All the variables you'll need are located on your dashboard.  

8. Furthermore, you'll have to set up a [PayPal developer account](https://developer.paypal.com) and access your client ID to have the PayPal sandbox payment interface to work.  This client ID will be saved as a environment variable (See *** environment variables *** below).  I found this relatively easy to navigate and set up as well.  You'll also be provided with a couple of dummie accounts so that your transactions will 'process.'

9. Lastly, you'll need to set up your environment variables.  

* Firstly, create a .env file in your root:
```
//from the root
touch .env
```
* Then, make sure to populate .env file with the variables according to the following list:
```
//for Cloudinary
CLOUD_API_KEY = 'your key here'
CLOUD_API_SECRET = 'your key here'
CLOUDINARY_URL = 'your key here'
CLOUD_NAME = 'your key here'

//for jwt
JWT_SECRET = 'your secret here'

//MongoDB
MONGO_URI = 'your db uri here'

//from Paypal Developer
PAYPAL_CLIENT_ID = `your dev account client ID here`

//I used this to help manage the running of dev dependencies; if exluded, will default to 'development'
NODE_ENV = `development`

/* If port is not set, will default to 5000.  
Also, if you're on a Mac, you'll need to change port as 5000 is currently in use by AirPlay Receiver.  
Alternatively, and the thing I did, was just to turn off Airplay Receiver in my MacBook settings */
PORT = 5000
```
10.  This should get you up and running.  I had a bunch of scripts to run the project, which are visible in the `package.json` file in the root directory:
```
//to run only the backend server with Node/Express WITHOUT Nodemon
npm start

//to run only the backend server with Node/Express WITH Nodemon
npm run server

//to run only the frontend
npm run client

//to run the entire project
npm run dev

```

---

Note that this project is largely unmaintained, and I'll probably only update anything if it no longer deploys.  
