//jshint esverison:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname+"/date.js");
const mongoose = require("mongoose");
const ejs = require("ejs");

const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your To-Do- List!"
});
const item2 = new Item({
  name: "Hit the + button to add a new task"
});
const item3 = new Item({
  name: "<--Hit this to delete a task"
});
const defaultItems = [item1, item2, item3];




app.set('view engine', "ejs");

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static('public'));

app.get("/", function (req, res) {

  // const day = date.getDate();
  

  Item.find()
    .then(function (items) {
        if (items.length === 0){
          Item.insertMany(defaultItems);
          res.redirect("/");
        }else{
          res.render("list", {listTitle: "Today", newListItems: items});
        }      
        });
    })


app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  
  const item = new Item({
    name: itemName
  });

  item.save();
  res.redirect("/");

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");

  // }


});

// app.post("/delete", function(req, res){
//   const checkedItemId = req.body.checkbox;
//   Item.findByIdAndRemove(checkedItemId);
//   res.redirect("/");
// });

app.post("/delete", async function (req, res) {
  const checkedItemId = req.body.checkbox;
  if(checkedItemId != undefined){
  await Item.findByIdAndRemove(checkedItemId)
  .then(()=>console.log(`Deleted ${checkedItemId} Successfully`))
  .catch((err) => console.log("Deletion Error: " + err));
  res.redirect("/");
  }
});



app.get("/about", function(req, res){
  res.render("about");
})

app.listen(3000, function () {
  console.log("Server started on Port 3000");
});

