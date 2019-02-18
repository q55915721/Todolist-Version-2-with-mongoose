//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");

const mongoose = require('mongoose');
const app = express();
mongoose.connect('mongodb://localhost:27017/todolistDB', {
  useNewUrlParser: true
});

const itemSchema = {
  name: String
};

const Item = mongoose.model('Item', itemSchema);

const item1 = new Item({

  name: "welcome to todoList"

});

const item2 = new Item({

  name: "hit + button to add a new item"

});

const item3 = new Item({

  name: "<-- hit this to delete this item"

});

const defaultItem = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model('List', listSchema);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItem, function(err) {

        if (err) {
          console.log('there is a err');
        } else {
          console.log('successfully save');
        }
      });
      res.redirect('/');
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });

    }
  });
});

app.post("/", function(req, res) {

  const newitemName = req.body.newItem;
  const listName = req.body.list;
  console.log(listName);
  console.log(newitemName);
  const item = new Item({
    name: newitemName
  });



  if (listName === 'Today') {
    item.save();
    res.redirect('/');
  } else {

    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect('/' + listName);
    });


  }

  // if (listTitle === "Today") {
  //   item.save();
  //   res.redirect('/');
  // } else {
  //   List.findOne({
  //     name: listTitle
  //   }, function(err, foundList) {
  //
  //     foundList.items.push(item);
  //     foundList.save();
  //     res.redirect('/' + listTitle);
  //
  //   });
  // }

});

app.post('/delete', function(req, res) {

  const selectedItemId = req.body.checkbox;
  const listTitle = req.body.listTitle;

  if (listTitle === "Today") {


    Item.findByIdAndRemove(selectedItemId, function(err) {

      if (err) {
        console.log('we had a err');
      } else {
        console.log('deleted...');
      }

      res.redirect('/');
    });

  } else {

    List.findOneAndUpdate({
      name: listTitle
    }, {
      $pull: {
        items: {
          _id: selectedItemId
        }
      }
    }, function(err, foundItem) {

      if (!err) {

        res.redirect('/' + listTitle);
      }
    });


  }



});

app.get('/:title', function(req, res) {

  console.log(defaultItem);
  const title = _.capitalize(req.params.title);

  console.log(title);
  List.findOne({
    name: title
  }, function(err, foundList) {

    if (!err) {
      if (!foundList) {
        console.log("doesn't exist");
        const newlist = new List({
          name: title,
          items: defaultItem
        });
        console.log(newlist);
        newlist.save();
        res.redirect('/' + newlist.name);

      } else {
        console.log("Exists");
        res.render('list', {
          listTitle: foundList.name,
          newListItems: foundList.items
        });

      }
    }

  });
});


app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});