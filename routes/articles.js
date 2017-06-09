const express = require("express");
const router = express.Router();

//article model
let Article = require("../models/article");
//user model
let User = require("../models/user");

//add route
router.get("/add", ensureAuthenticated, function(req, res){
  res.render("add_article", {
    title: "Add Article",
  });
});

//get article edit
router.get("/edit/:id", ensureAuthenticated, function(req, res){
  Article.findById(req.params.id, function(err, article){
    if(article.author != req.user._id){
      req.flash("danger", "Not Authorized");
      res.redirect("/");
    }
    res.render("edit_article", {
      title: "Edit Article",
      article: article
    });
  });
});

//add submit post route
router.post("/add", ensureAuthenticated, function(req, res){
  req.checkBody("title", "Title is required").notEmpty();
  //req.checkBody("author", "Author is required").notEmpty();
  req.checkBody("body", "Body needs beetwen 5 and 500 characters").len(5, 500);

  //get errors
  let errors = req.validationErrors();

  if(errors){
    res.render("add_article", {
      title: "Add Article",
      errors: errors
    });
  } else {
    let article = new Article();
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;

    article.save(function(err){
      if(err){
        console.log(err);
      } else {
        req.flash("success", "Article Added");
        res.redirect("/");
      }
    });
  }
});

//edit submit post route
router.post("/edit/:id", ensureAuthenticated, function(req, res){
  let article = {};
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  let query = {_id:req.params.id}

  Article.update(query, article, function(err){
    if(err){
      console.log(err);
    } else {
      req.flash("success", "Article Edited");
      res.redirect("/");
    }
  });
});

router.delete("/:id", function(req, res){
  if(!req.user._id){
    res.status(500).send();
  }

  let query = {_id:req.params.id}

  Article.findById(req.params.id, function(err, article){
    if(article.author != req.user._id){
      res.status(500).send();
    } else {
      Article.remove(query, function(err){
        if(err){
          console.log(err);
        }
        req.flash("success", "Article Deleted");
        res.send("Success");
      });
    }
  });

});

//get single article
router.get("/:id", function(req, res){
  Article.findById(req.params.id, function(err, article){
    User.findById(article.author, function(err, user){
      res.render("article", {
        article: article,
        author: user.name
      });
    });
  });
});

//access control
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash("danger", "Please login");
    res.redirect("/users/login")
  }
}

module.exports = router;
