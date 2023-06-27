//jshint esverison:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname+"/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
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

const listSchema={
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);
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
    });

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);


  // });
  List.findOne({ name: customListName })
  .then(result => {
    // Code for handling the result
    if(result!=null){
      res.render("list", {listTitle: result.name, newListItems: result.items});
    }else{
      const list = new List({
        name:customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
    }

  })
  .catch(err => {
    // Code for handling errors
    console.log("Error");
  });

 
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name : itemName
  });
 
  if(listName === "Today"){
    item.save();
    res.redirect("/")
  }else{
    List.findOne({name : listName}).then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});

// app.post("/delete", function(req, res){
//   const checkedItemId = req.body.checkbox;
//   Item.findByIdAndRemove(checkedItemId);
//   res.redirect("/");
// });

app.post("/delete", async (req, res) => {
  try {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if (listName === "Today") {
      await Item.findByIdAndDelete(checkedItemId);
      console.log("Successfully deleted checked item.");
      res.redirect("/");
    } else {
      const foundList = await List.findOne({ name: listName });
      foundList.items.pull({ _id: checkedItemId });
      await foundList.save();
      res.redirect("/" + listName);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error")
  }
});


// app.post("/delete", async function (req, res) {
//   const checkedItemId = req.body.checkbox;
//   const listName = req.body.listName;

//   if(listName ==="Today"){
//     if(checkedItemId != undefined){
//       await Item.findByIdAndRemove(checkedItemId)
//       .then(()=>console.log(`Deleted ${checkedItemId} Successfully`))
//       .catch((err) => console.log("Deletion Error: " + err));
//       res.redirect("/");
//       }

//   }else{
//     List.findByIdAndUpdate({name: listName}, {$pull: {items:{_id:checkedItemId}}}.then(function(foundList){
//       if(!err){
//         res.redirect("/"+ customListName);
//       }
//     }))

//   }


// });



app.get("/about", function(req, res){
  res.render("about");
})

app.listen(3000, function () {
  console.log("Server started on Port 3000");
});

