/*
 |--------------------------------------
 | Dependencies
 |--------------------------------------
 */

const jwt = require('express-jwt');
const jwks = require('jwks-rsa');
const Product = require('./models/Product');
// const Rsvp = require('./models/Rsvp');

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
    // @TODO Check api auth
    // if (roles.indexOf('admin') > -1) {
    //   next();
    // } else {
    //   res.status(401).send({message: 'Not authorized for admin access'});
    // }
    next();
  }

/*
 |--------------------------------------
 | API Routes
 |--------------------------------------
 */

  const _productListProjection = 'title price stock description';

  // GET API root
  app.get('/api/', (req, res) => {
    res.send('API works');
  });

  // GET list of public products starting in the future
  app.get('/api/products', (req, res) => {
    Product.find({},
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

  // GET RSVPs by product ID
  // app.get('/api/product/:productId/rsvps', jwtCheck, (req, res) => {
  //   Rsvp.find({productId: req.params.productId}, (err, rsvps) => {
  //     let rsvpsArr = [];
  //     if (err) {
  //       return res.status(500).send({message: err.message});
  //     }
  //     if (rsvps) {
  //       rsvps.forEach(rsvp => {
  //         rsvpsArr.push(rsvp);
  //       });
  //     }
  //     res.send(rsvpsArr);
  //   });
  // });

  // GET list of upcoming products user has RSVPed to
  // app.get('/api/products/:userId', jwtCheck, (req, res) => {
  //   Rsvp.find({userId: req.params.userId}, 'productId', (err, rsvps) => {
  //     const _productIdsArr = rsvps.map(rsvp => rsvp.productId);
  //     const _rsvpProductsProjection = 'title startDatetime endDatetime';
  //     let productsArr = [];

  //     if (err) {
  //       return res.status(500).send({message: err.message});
  //     }
  //     if (rsvps) {
  //       Product.find(
  //         {_id: {$in: _productIdsArr}, startDatetime: { $gte: new Date() }},
  //         _rsvpProductsProjection, (err, products) => {
  //         if (err) {
  //           return res.status(500).send({message: err.message});
  //         }
  //         if (products) {
  //           products.forEach(product => {
  //             productsArr.push(product);
  //           });
  //         }
  //         res.send(productsArr);
  //       });
  //     }
  //   });
  // });

  // POST a new product
  app.post('/api/product/new', jwtCheck, adminCheck, (req, res) => {
    console.log(req.body)
    const product = new Product({
      title: req.body.title,
      price: req.body.price,
      stock: req.body.stock,
      photo: req.body.photo,
      description: req.body.description
    });
    product.save((err) => {
      if (err) {
        console.error(err);
        return res.status(500).send({message: err.message});
      }
      res.send(product);
    });
  });

  // // PUT (edit) an existing product
  app.put('/api/product/:id', jwtCheck, adminCheck, (req, res) => {
    Product.findById(req.params.id, (err, product) => {
      if (err) {
        return res.status(500).send({message: err.message});
      }
      if (!product) {
        return res.status(400).send({message: 'Product not found.'});
      }
      product.title = req.body.title,
      product.price = req.body.price,
      product.stock = req.body.stock,
      product.photo = req.body.photo,
      product.description = req.body.description

      product.save(err => {
        if (err) {
          return res.status(500).send({message: err.message});
        }
        res.send(product);
      });
    });
  });

  // DELETE an product and all associated RSVPs
  app.delete('/api/product/:id', jwtCheck, adminCheck, (req, res) => {
    Product.findById(req.params.id, (err, product) => {
      if (err) {
        return res.status(500).send({message: err.message});
      }
      if (!product) {
        return res.status(400).send({message: 'Product not found.'});
      }

      product.remove(err => {
        if (err) {
          return res.status(500).send({ message: err.message });
        }
        res.status(200).send({ message: 'Product successfully deleted.' });
      });

    });
  });

  // POST a new RSVP
  // app.post('/api/rsvp/new', jwtCheck, (req, res) => {
  //   Rsvp.findOne({productId: req.body.productId, userId: req.body.userId}, (err, existingRsvp) => {
  //     if (err) {
  //       return res.status(500).send({message: err.message});
  //     }
  //     if (existingRsvp) {
  //       return res.status(409).send({message: 'You have already RSVPed to this product.'});
  //     }
  //     const rsvp = new Rsvp({
  //       userId: req.body.userId,
  //       name: req.body.name,
  //       productId: req.body.productId,
  //       attending: req.body.attending,
  //       guests: req.body.guests,
  //       comments: req.body.comments
  //     });
  //     rsvp.save((err) => {
  //       if (err) {
  //         return res.status(500).send({message: err.message});
  //       }
  //       res.send(rsvp);
  //     });
  //   });
  // });

  // PUT (edit) an existing RSVP
  // app.put('/api/rsvp/:id', jwtCheck, (req, res) => {
  //   Rsvp.findById(req.params.id, (err, rsvp) => {
  //     if (err) {
  //       return res.status(500).send({message: err.message});
  //     }
  //     if (!rsvp) {
  //       return res.status(400).send({message: 'RSVP not found.'});
  //     }
  //     if (rsvp.userId !== req.user.sub) {
  //       return res.status(401).send({message: 'You cannot edit someone else\'s RSVP.'});
  //     }
  //     rsvp.name = req.body.name;
  //     rsvp.attending = req.body.attending;
  //     rsvp.guests = req.body.guests;
  //     rsvp.comments = req.body.comments;

  //     rsvp.save(err => {
  //       if (err) {
  //         return res.status(500).send({message: err.message});
  //       }
  //       res.send(rsvp);
  //     });
  //   });
  // });

};
