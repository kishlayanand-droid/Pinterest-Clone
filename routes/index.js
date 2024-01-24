var express = require('express');
var router = express.Router();
const userModel = require("./users");
const postModel = require("./posts");
const passport = require('passport');
const { upload, uploadProfilePicture } = require("./multer");

const localStrategy = require('passport-local');
passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function(req, res, next) {
  res.render('login', {error: req.flash('error')});
});

router.get('/feed', isLoggedIn, async function(req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user })
  const postData = await postModel.find().populate("user")
  res.render('feed', {postData});
});

// Uploading profile picture.
router.post('/uploadProfilePicture', isLoggedIn, upload.single("image"), async function(req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user })
  user.profileImage = req.file.filename;
  await user.save();
  res.redirect("/profile");
});

// Uploading post.
router.post('/upload', isLoggedIn, upload.single("file"), async function(req, res, next) {
  if(!req.file){
    return res.status(404).send("no files were given");
  }
// the file which you uploaded save it as post, give the id of post to the user and id of user to the post.
  const user = await userModel.findOne({username: req.session.passport.user});
  const postdata = await postModel.create({
    imageText: req.body.imagecaption,
    image: req.file.filename,
    user: user._id,
  });
  user.posts.push(postdata._id);
  await user.save();
  res.redirect("/profile");
});

// Profile page 
router.get('/profile', isLoggedIn, async function(req, res, next){
  const user = await userModel.findOne({ username: req.session.passport.user })
  .populate("posts")
  res.render("profile",{user});
});

// Registration of user.
router.post('/register', function(req, res){
  const userData = new userModel({
    username: req.body.username,
    email: req.body.email,
    fullname: req.body.fullname,
  });
  userModel.register(userData, req.body.password)
  .then(function(){
    passport.authenticate("local")(req, res, function(){
      res.redirect("/profile");
    })
  })
})

// Login of user.
router.post('/login', passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/login",
  failureFlash: true
}), function(req, res){
});

//Logout of user.
router.get('/logout', function(req, res){
  req.logout(function(err){
    if (err) {return next(err);}
    res.redirect('/login');
  });
})

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()) return next();
  res.redirect("/login");
}

module.exports = router;
