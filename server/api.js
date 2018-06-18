/*
 |--------------------------------------
 | Dependencies
 |--------------------------------------
 */

const jwt = require('express-jwt');
const jwks = require('jwks-rsa');
const Product = require('./models/Product');
const Order = require('./models/Order');

/*
 |--------------------------------------
 | Authentication Middleware
 |--------------------------------------
 */

module.exports = function(app, config) {
  // Authentication middleware
  const jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://${config.AUTH0_DOMAIN}/.well-known/jwks.json`
    }),
    audience: config.AUTH0_API_AUDIENCE,
    issuer: `https://${config.AUTH0_DOMAIN}/`,
    algorithm: 'RS256'
  });

  // Check for an authenticated admin user
  const adminCheck = (req, res, next) => {
    const roles = req.user[config.NAMESPACE] || [];
    if (roles.indexOf('admin') > -1) {
      next();
    } else {
      res.status(401).send({message: 'Not authorized for admin access'});
    }
  }

/*
 |--------------------------------------
 | API Routes
 |--------------------------------------
 */

  const _productListProjection = 'title startDatetime endDatetime viewPublic';

  // GET API root
  app.get('/api/', (req, res) => {
    res.send('API works');
  });

  // GET list of public products starting in the future
  app.get('/api/products', (req, res) => {
    Product.find({viewPublic: true, startDatetime: { $gte: new Date() }},
      _productListProjection, (err, products) => {
        let productsArr = [];
        if (err) {
          return res.status(500).send({message: err.message});
        }
        if (products) {
          products.forEach(product => {
            productsArr.push(product);
          });
        }
        res.send(productsArr);
      }
    );
  });

  // GET list of all products, public and private (admin only)
  app.get('/api/products/admin', jwtCheck, adminCheck, (req, res) => {
    Product.find({}, _productListProjection, (err, products) => {
        let productsArr = [];
        if (err) {
          return res.status(500).send({message: err.message});
        }
        if (products) {
          products.forEach(product => {
            productsArr.push(product);
          });
        }
        res.send(productsArr);
      }
    );
  });

  // GET product by product ID
  app.get('/api/product/:id', jwtCheck, (req, res) => {
    Product.findById(req.params.id, (err, product) => {
      if (err) {
        return res.status(500).send({message: err.message});
      }
      if (!product) {
        return res.status(400).send({message: 'Product not found.'});
      }
      res.send(product);
    });
  });

  // GET Orders by product ID
  app.get('/api/product/:productId/orders', jwtCheck, (req, res) => {
    Order.find({productId: req.params.productId}, (err, orders) => {
      let ordersArr = [];
      if (err) {
        return res.status(500).send({message: err.message});
      }
      if (orders) {
        orders.forEach(order => {
          ordersArr.push(order);
        });
      }
      res.send(ordersArr);
    });
  });

  // GET list of upcoming products user has Ordered to
  app.get('/api/products/:userId', jwtCheck, (req, res) => {
    Order.find({userId: req.params.userId}, 'productId', (err, orders) => {
      const _productIdsArr = orders.map(order => order.productId);
      const _orderProductsProjection = 'title startDatetime endDatetime';
      let productsArr = [];

      if (err) {
        return res.status(500).send({message: err.message});
      }
      if (orders) {
        Product.find(
          {_id: {$in: _productIdsArr}, startDatetime: { $gte: new Date() }},
          _orderProductsProjection, (err, products) => {
          if (err) {
            return res.status(500).send({message: err.message});
          }
          if (products) {
            products.forEach(product => {
              productsArr.push(product);
            });
          }
          res.send(productsArr);
        });
      }
    });
  });

  // POST a new product
  app.post('/api/product/new', jwtCheck, adminCheck, (req, res) => {
    Product.findOne({
      title: req.body.title,
      location: req.body.location,
      startDatetime: req.body.startDatetime}, (err, existingProduct) => {
      if (err) {
        return res.status(500).send({message: err.message});
      }
      if (existingProduct) {
        return res.status(409).send({message: 'You have already created an product with this title, location, and start date/time.'});
      }
      const product = new Product({
        title: req.body.title,
        location: req.body.location,
        startDatetime: req.body.startDatetime,
        endDatetime: req.body.endDatetime,
        description: req.body.description,
        viewPublic: req.body.viewPublic
      });
      product.save((err) => {
        if (err) {
          return res.status(500).send({message: err.message});
        }
        res.send(product);
      });
    });
  });

  // PUT (edit) an existing product
  app.put('/api/product/:id', jwtCheck, adminCheck, (req, res) => {
    Product.findById(req.params.id, (err, product) => {
      if (err) {
        return res.status(500).send({message: err.message});
      }
      if (!product) {
        return res.status(400).send({message: 'Product not found.'});
      }
      product.title = req.body.title;
      product.location = req.body.location;
      product.startDatetime = req.body.startDatetime;
      product.endDatetime = req.body.endDatetime;
      product.viewPublic = req.body.viewPublic;
      product.description = req.body.description;

      product.save(err => {
        if (err) {
          return res.status(500).send({message: err.message});
        }
        res.send(product);
      });
    });
  });

  // DELETE an product and all associated Orders
  app.delete('/api/product/:id', jwtCheck, adminCheck, (req, res) => {
    Product.findById(req.params.id, (err, product) => {
      if (err) {
        return res.status(500).send({message: err.message});
      }
      if (!product) {
        return res.status(400).send({message: 'Product not found.'});
      }
      Order.find({productId: req.params.id}, (err, orders) => {
        if (orders) {
          orders.forEach(order => {
            order.remove();
          });
        }
        product.remove(err => {
          if (err) {
            return res.status(500).send({message: err.message});
          }
          res.status(200).send({message: 'Product and Orders successfully deleted.'});
        });
      });
    });
  });

  // POST a new Order
  app.post('/api/order/new', jwtCheck, (req, res) => {
    Order.findOne({productId: req.body.productId, userId: req.body.userId}, (err, existingOrder) => {
      if (err) {
        return res.status(500).send({message: err.message});
      }
      if (existingOrder) {
        return res.status(409).send({message: 'You have already Ordered to this product.'});
      }
      const order = new Order({
        userId: req.body.userId,
        name: req.body.name,
        productId: req.body.productId,
        attending: req.body.attending,
        guests: req.body.guests,
        comments: req.body.comments
      });
      order.save((err) => {
        if (err) {
          return res.status(500).send({message: err.message});
        }
        res.send(order);
      });
    });
  });

  // PUT (edit) an existing Order
  app.put('/api/order/:id', jwtCheck, (req, res) => {
    Order.findById(req.params.id, (err, order) => {
      if (err) {
        return res.status(500).send({message: err.message});
      }
      if (!order) {
        return res.status(400).send({message: 'Order not found.'});
      }
      if (order.userId !== req.user.sub) {
        return res.status(401).send({message: 'You cannot edit someone else\'s Order.'});
      }
      order.name = req.body.name;
      order.attending = req.body.attending;
      order.guests = req.body.guests;
      order.comments = req.body.comments;

      order.save(err => {
        if (err) {
          return res.status(500).send({message: err.message});
        }
        res.send(order);
      });
    });
  });

};
