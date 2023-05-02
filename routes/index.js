const { query } = require('express');
var express = require('express');
var router = express.Router();


var con = require('../config/config');
const { route } = require('./users');
const { ckeckUser} = require('../middlewares/checkUser');
let razorpay = require("../payment/razorpay")
/* GET home page. */
// cart


router.get('/', function (req, res, next) {
  let sql = "select * from addproduct"
  con.query(sql, (err, product) => {
    if (err) {
      console.log(err)
    } else {
      if (req.session.user) {
        var user = req.session.user;
        var userid = req.session.user.id;
        var sql3 = "select count(*) as CartData from cart where userId=?"
        con.query(sql3, [userid], (err, rows) => {
          console.log(rows)
          let cart = rows[0].CartData;
          user.cart = cart;
          res.render('user/userhome', { user, product });
        })
        // res.render('user/userhome', { user, product });
      } else {
        res.render('user/userhome', { product });
      }
    }
  });
});
router.get('/', function (req, res, next) {
  if (req.session.user) {
    var user = req.session.user;
    res.render('user/userhome', { user });
  } else {
    res.render('user/userhome');
  }
  res.render('user/userhome', { title: 'Express' });
});
router.get('/usercart', function (req, res, next) {
  var user = req.session.user;
  let userid = user.id;
  var total=0;
  var sql = "select addproduct.id,addproduct.Name, addproduct.des, addproduct.price, addproduct.img,cart.qty,cart.userid from addproduct inner join cart on addproduct.id=cart.productid where cart.userid=?";
  con.query(sql, [userid], (err, result) => {
    if (err) {
      console.log(err)
    } else {
      console.log(result)
      let product = result;
      product.forEach(object=> {
        console.log(object.price)
        total=object.price*object.qty+total;
      });
      console.log("total:",total)
      let GST = (total*18)/100;
      let subTotal = total+GST;
      user.total=total;
      user.GST=GST;
      user.subTotal=subTotal;
      res.render('user/usercart', { user, product });

    }
  })
   
});

router.get('/addqnty/:id',(req,res)=>{
  var id = req.params.id;
  var userid = req.session.user.id;
  var sql = "select * from cart where userid = ? and productid =?";
  con.query(sql,[userid,id],(err,row)=>{
    if(err){
      console.log(err)
    }else{
      var fqty = row[0].qty;
      var newqty = fqty + 1;
      var sql2 = "update cart set qty = ? where productid= ? and userid = ?"
      con.query(sql2,[newqty,id,userid],(err,result)=>{
        if(err){
          console.log(err)
        }else{
          res.redirect('/usercart')
        }
      })
    }
  })
})

router.get('/subqnty/:id',(req,res)=>{
  var id = req.params.id;
  var userid = req.session.user.id;
  var sql = "select * from cart where userid = ? and productid =?";
  con.query(sql,[userid,id],(err,row)=>{
    if(err){
      console.log(err)
    }else{
      var fqty = row[0].qty;
      var newqty = fqty - 1;
      var sql2 = "update cart set qty = ? where productid= ? and userid = ?"
      con.query(sql2,[newqty,id,userid],(err,result)=>{
        if(err){
          console.log(err)
        }else{
          res.redirect('/usercart')
        }
      })
    }
  })
})


router.get('/userlogin', function (req, res, next) {
  res.render('user/userlogin', { title: 'Express' });
});
router.get('/userregistration', function (req, res, next) {
  res.render('user/userregistration', { title: 'Express' });
});
router.post('/register', function (req, res, next) {
  console.log(req.body)
  let email = req.body.email;
  let password = req.body.password;
  let sql = "select * from login where email = ? and password ";
  con.query(sql, [email, password], (err, row) => {
    if (err) {
      console.log(err)
    } else {
      if (row.length > 0) {
        console.log("email exist")
      } else {
        let data = req.body;
        let q = "insert into login set ?";
        con.query(q, data, function (err, result) {
          if (err) {
            console.log(err);
          }
          else {
            console.log("data inserted")
            res.redirect('/')
          }
        })

      }
    }
  })
})
/*router.post('/login')*/

router.post('/login', (req, res) => {
  console.log(req.body)
  let email = req.body.email;
  let password = req.body.password;
  let sql = "select * from login where email =? and password=?";
  con.query(sql, [email, password], (err, row) => {
    if (err) {
      console.log(err)
    } else {
      if (row.length > 0) {
        console.log("login sucess")
        req.session.user = row[0]
        res.redirect('/')
      } else {
        console.log("login error")
      }
    }
  })

})

router.post('/userlogin', function (req, res, next) {
  console.log(req.body)
  let email = req.body.email;
  let password = req.body.password;
  let sql = "select * from login where email = ? and password ";
  con.query(sql, [email, password], (err, row) => {
    if (err) {
      console.log(err)
    } else {
      if (row.length > 0) {
        console.log("email exist")
      } else {
        let data = req.body;
        let q = "insert into login set ?";
        con.query(q, data, function (err, result) {
          if (err) {
            console.log(err);
          }
          else {
            console.log("data inserted")
            res.redirect('/')
          }
        })

      }
    }
  })
})
router.post('/login')

router.get('/mylogin', function (req, res, next) {
  res.render('admin/adminLogin', { title: 'Express' });
});

router.get('/myhome', function (req, res, next) {
  res.render('admin/adminHome', { title: 'Express' });
});
router.get("/addtocart/:id",ckeckUser, (req, res) => {
  console.log(req.params.id);
  let productid = req.params.id;
  userid = req.session.user.id;
  let sql1 = "select * from cart where userid = ? and productid =?";
  con.query(sql1, [userid, productid], (err, row) => {
    if (err) {
      console.log(err)
    } else {
      if (row.length > 0) {
        let q = row[0].qty;
        let cartId = row[0].id;
        q = q + 1;
        let sql2 = "update cart set qty=? where id=?"
        con.query(sql2, [q, cartId], (err, results) => {
          if (err) {
            console.log(err)
          } else {
            res.redirect("/")
          }
        })
      } else {
        let data = {
          productid, userid
        }
        let sql = "insert into cart set ?"
        con.query(sql, data, (err, result) => {
          if (err) {
            console.log(err)
          } else {
            res.redirect('/')
          }
        })
        console.log("add to cart working")
      }
    }
  })

})
router.get("/logout",(req, res,)=>{
   req.session.destroy();
   res.redirect('/')
});


router.get("/createOrder/:amount",(req,res)=>{
  console.log(req.params.amount)
  let amount=req.params.amount;
    var options={
    amount:amount*100,
    currency:"INR",
    receipt:" order_rcptid_11"
  };
  razorpay.orders.create(options,function(err,order){
    console.log(err); 
    console.log(order)
    let user = req.session.user;
    res.render('user/checkO',{ order,user})
  });
})
router.post('/varify',async(req,res)=>{
  console.log(req.body);
  console.log("varify" )
   let data=req.body;
    var crypto = require('crypto')
    var order_id = data['response[razorpay_order_id]']
    var payment_id = data['response[razorpay_payment_id]']
    const razorpay_signature=data['response[razorpay_signature]']
    const key_secret="BruC4t1R7B0lHf4PrQZDfa3Z";
    let hmac=crypto.createHmac('sha256',key_secret);
    await hmac.update(order_id + "|" + payment_id);
    const generated_signature=hmac.digest('hex');
     console.log( razorpay_signature,generated_signature)
    if(  razorpay_signature === generated_signature)
    {
      console.log("verifed transation")
      let sql="update cart set status='purchased' where  userid= ?";
      let userId=req.session.user.id;
      con.query(sql,[userId],(err,result)=>{
        if(err){
          console.log(err)
        }else{
          res.redirect('myorders')
        }
      })
    }else{
      console.log("payment error....")
    }
    });

    router.get('/myorders',(req,res)=>{
      var sql ="select addproduct.id,addproduct.Name, addproduct.des, addproduct.price, addproduct.img,cart.qty,cart.userid from addproduct inner join cart on addproduct.id=cart.productid where cart.userid=? and cart.status='purchased'";
      let  userid=req.session.user.id;
      let user=req.session.user;
      con.query(sql,[userid],(err,result)=>{
        if(err){
          console.log(err)
        }else{
          let orderProducts= result;
           console.log(result);
          res.render("user/myorders",{user,orderProducts})
        }
      })
    })

module.exports = router;

