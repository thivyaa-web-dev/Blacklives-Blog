var express         = require('express'),
	app             = express(),
	bodyParser      = require('body-parser'),
	mongoose        = require('mongoose'),
	black           = require('./models/black'),
	comment         = require('./models/comment'),
	user            = require('./models/user');
	passport        = require('passport'),
	localStrategy   = require('passport-local'),
	methodOverride  = require('method-override'),
	flash           = require('connect-flash'),
	seedDB          = require('./seeds')
	


var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'learntocodeinfo', 
  api_key   : 485645483198373, 
  api_secret: 'L5LqzZarYH3ee1Tm3pudS8AmZaY'
});

seedDB();
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
app.use(flash());

//database connection
mongoose.connect('mongodb://localhost:27017/boots_12', {
	useUnifiedTopology: true,
	useNewUrlParser: true
});

// Passport configuration
app.use(require('express-session')({ 
	secret:'black lives',
	resave: false,
	saveUninitialized: false

 }));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use(function(req, res, next){ 
	res.locals.currentUser = req.user;
	next();
  })


app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
	res.render('landing');
});

app.get('/blacks', function(req, res){ 
	if(req.query.search){ 
		const regex = new RegExp(escapeRegex(req.query.search) ,'gi');
		black.find({name:regex},function(err,allBlacks){ 
			if(err){ 
				console.log(err);
			 } else{ 
				 var noMatch;
				 if(allBlacks.length<1){ 
					 noMatch = "No match found try again..";
				  }
				 res.render('index',{blacks:allBlacks,noMatch:noMatch});
			  }
		 });

	 } else { 
		 black.find({},function(err,allBlacks){ 
			 if(err){
				 console.log(err);
			   } else { 
				   res.render('index',{blacks:allBlacks});
			    }
		  })
	  }

 })

//create route
// app.post('/blacks',upload.single('image'), function(req, res) {
// 	var name = req.body.name;
// 	var image = req.body.image;
// 	var description = req.body.description;
	
// 	var newBlacks = { name: name, image: image, description: description };
// 	black.create(newBlacks, function(err, newlyCreated) {
// 		if (err) {
// 			console.log(err);
// 		} else {
// 			res.redirect('/blacks');
// 		}
// 	});
// });

app.post('/blacks',upload.single('image'),function(req, res){ 
	cloudinary.uploader.upload(req.file.path, function(result) {
		// add cloudinary url for the image to the campgr
		// ound object under image property
		req.body.black.image = result.secure_url;
		// add author to campground
		// req.body.black.author = {
		//   id: req.user._id,
		//   username: req.user.username
		// }
		black.create(req.body.black, function(err, black) {
		  if (err) {
			req.flash('error', err.message);
			return res.redirect('back');
		  }
		  res.redirect('/blacks/' + black.id);
		});
	  });
 })













//show form to create new campgrounds
app.get('/blacks/new', function(req, res) {
	res.render('new');
});

app.get('/blacks/:id', function(req, res) {
	black.findById(req.params.id).populate('comments').exec(function(err, foundBlack) {
		if (err) {
			console.log(err);
		} else {
			console.log(foundBlack);
			res.render('show', { black: foundBlack });
		}
	});
});

// app.get('/blacks/:id/comments/new', function(req, res) {
// 	res.render('newss')
// });

// comment Routes
app.get('/blacks/:id/comments/new', function(req, res) {
	black.findById(req.params.id, function(err, black) {
		if (err) {
			console.log(err);
		} else {
			res.render('newss', { black: black });
		}
	});
});

app.post('/blacks/:id/comments', function(req, res) {
	black.findById(req.params.id, function(err, black) {
		if (err) {
			console.log(err);
			res.redirect('/blacks');
		} else {
			comment.create(req.body.comment, function(err, comment) {
				if (err) {
					console.log(err);
				} else {
					black.comments.push(comment);
					black.save();
					res.redirect('/blacks/' + black._id);
				}
			});
		}
	});
});
//============================================================
// Auth Routes
//==================================================================

// show register form


app.get('/register', function(req, res){ 
	res.render('register');
 })

// handle sign up logical 
app.post('/register', function(req, res){ 
	var newUser  = new user({username: req.body.username});
	user.register(newUser,req.body.password,function(err,user){
		if(err){ 
			console.log(err);
			return res.render('register')
		 }
		 passport.authenticate('local')(req,res,function(){ 
			 res.redirect('/blacks')

		  }) 

	 })
 })

// show login form
app.get('/login',function(req,res){ 
	res.render('login');

 })


app.post('/login',passport.authenticate('local',
	{
		sucessRedirect:'/blacks',
		failureRedirect:'/login'

    }),function(req,res){ 

	

 })
 
 
// logic route
app.get('/logout',function(req,res){ 
	req.logout();
	req.flash('error','logged you out')
	res.redirect('/blacks');
 })

// Edit Campground Route
// update route
// is user logged in
	// does user own it 
	// if not redirect somewher

app.get('/blacks/:id/edit',checkBlackOwnership, function(req, res){  
	black.findById(req.params.id,function(err,foundBlack){ 
		res.render('edit',{black:foundBlack});
	 })
})
 

// Update routes
app.put('/blacks/:id',checkBlackOwnership, function(req,res) { 
	// find and update blacks
	black.findByIdAndUpdate(req.params.id, req.body.blacks, function(err,updatedBlacks) { 
		if(err) { 
			res.redirect('/blacks')
		 } else { 
			 res.redirect('/blacks/' + req.params.id)

		  }


	  })

 })

 // destroy rooute
app.delete('/blacks/:id',checkBlackOwnership,function(req,res){ 
	black.findByIdAndRemove(req.params.id,function(err){ 
		if(err){ 
			res.redirect('/blacks')
		 } else { 
			 res.redirect('/blacks')


		  }

	  })
	

  })


app.get('/blacks/:id/comments/:comment_id/edit', checkCommentOwnership,function(req,res){ 
	comment.findById(req.params.comment_id,function(err,foundComment){
		if(err){ 
			res.redirect('back');
		 }else{ 
			res.render('edits',{black_id : req.params.id, comment:foundComment});
		  }		 

	  });

 });

 // comment updatedBlacks
//  /blacks/:id/comments/:comment_id

app.put('/blacks/:id/comments/:comment_id',function(req,res){  
	comment.findByIdAndUpdate(req.params.comment_id, req.body.comment,function(err,updatedComment){ 
		if(err){  
			res.redirect('back');
		 } else {  
			 res.redirect('/blacks/' + req.params.id)

		 }

	})
	
})

// comment destroy
app.delete('/blacks/:id/comments/:comment_id',checkCommentOwnership, function (req, res) { 
	comment.findByIdAndRemove(req.params.comment_id,function(err){ 
		if(err){
			res.redirect('back');
		  } else { 
			  res.redirect('/blacks/' + req.params.id)
		   }
	 })
 })



function checkCommentOwnership(req,res,next){ 
	if(req.isAuthenticated()){ 
		comment.findById(req.params.comment_id,function(err,foundComment){ 
			if(err){ 
				res.redirect('back');
			 } else { 
				 if(foundComment.author.id.equals(req.user._id)){ 
					 next();
					
				  } else {
					 res.redirect('back');
				  }
				 			
			  }
		 });
	
	  } else { 
		  res.redirect('back');
		   
	   }
	
 }

// ================================================================
// is loggedIn() 
// ==============================================================



function isLoggedIn(req,res, next){ 
	if(req.isAuthenticated()){ 
		return next();
	 }
	 req.flash("error","Please Login First");
	 res.redirect('/login');

 }


function checkBlackOwnership(req,res,next){ 
	if(req.isAuthenticated()){ 
		black.findById(req.params.id,function(err,foundBlack){ 
			if(err){ 
				res.redirect('back');
			 } else { 
				 if(foundBlack.author.id.equals(req.user._id)){ 
					 next();
					
				  } else {
					 res.redirect('back');
				  }
				 			
			  }
		 });
		
	
	  } else { 
		  res.redirect('back');
		   
	     

	   }
	
 }


app.use(function(req, res, next) {   
	res.locals.currentUser = req.user;
	res.locals.error    = req.flash('error');
	res.locals.success  = req.flash('success');
	next();
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};



app.listen(3000, function() {
	console.log('The server is listening...');
});
