const { query } = require('express');
var express = require('express');
const con = require('../config/config');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.render('admin/adminlogin')
});
router.get('/adminHome',(req,res)=>{
  if(req.session.admin){
    res.render('admin/adminHome')
  }
 
})
router.post('/adminlogin', (req, res) => {
  console.log(req.body)
  let mail = "admin@gmail.com";
  let pass = "admin";
  if (mail == req.body.email && pass == req.body.pass) {
    console.log("login success")
    let adminData ={
      mail,
      pass
    }
    req.session.admin=adminData;
    res.render("admin/adminHome")
  }
  else {
    console.log("login error")
    res.redirect("/users")
  }
})
router.post('/addproduct', (req, res) => {
  console.log(req.body);
  console.log(req.files);
  if (!req.files) return res.status(400).send("no files where uploded");
  var file = req.files.img;
  var upload_img = file.name;
  let sql = "insert into addproduct set ?"
  if (file.mimetype=="image/jpeg"||file.mimetype=="image/png"||file.mimetype=="image/gif"){   
    file.mv("public/images/product/"+file.name, function (err){
    if (err) {
      res.send("error while uploading img")
    } else {
      var data = req.body;
      data.img = upload_img;
      con.query(sql, data, (err, result) => {
        if (err) {
          console.log(err)
        } else {
          res.redirect('/users/adminHome')
        }
      })
    }
  })
}else {
  console.log("uploading error")

}
})

router.get('/orderadmin',(req,res)=>{
  var sql="select addproduct.id,addproduct.Name,addproduct.price,cart.id,cart.userid,cart.qty from addproduct inner join cart on productid where card.status='purchased'";
  let user = req.session.user;
  con.query(sql,(err,result)=>{
    if(err){
      console.log(err)
    }else{
      console.log("my order",result)
      res.render('admin/orderadmin',{result})
    }
  })
})
 

  module.exports = router;
