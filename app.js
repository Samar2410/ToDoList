

const express = require("express");
const bodyParser = require("body-parser");

const mongoose=require("mongoose");

const app = express();
const _=require("lodash")
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
var arr=[]

mongoose.connect("mongodb://localhost:27017/TODOList");
const itemsSchema={
  name:String
};
const Item=mongoose.model("Item",itemsSchema);
const item1=new Item({
   name:"Welcome to your todolist!"
});
const item2=new Item({
   name:"Hit the + button to add a new item. "
});
const item3=new Item({
   name:"<- Hit this to delete an item"
});
const listSchema={
  name:String,
  items:[itemsSchema]
}
const List=mongoose.model("List",listSchema);

const defaultItems=[item1,item2,item3];

const day=new Date();
const year=day.getFullYear();


app.get("/", function(req, res) {
  
  
  List.find({},(err,lists1)=>{
    arr=lists1
  })
  Item.find({},function(err,data){
  
  
    
    if(data.length==0){
      Item.insertMany(defaultItems,function(err){
        if(err)console.log(err);
        else console.log("successfully inserted default elements");
      
      })
    res.redirect("/")
    }
    else 
    res.render("list", {listTitle: "Today", newListItems: data,lists:arr,year:year});
  

});

});
app.get("/Alllists",(req,res)=>{
  List.find({},(err,data)=>{
    if(err)console.log(err);
    else arr=data;
   })
  
  res.render("All",{lists:arr,year:year});
})
app.get("/:customlist",function(req,res){
 
  
  List.findOne({name:_.capitalize(req.params.customlist)},(err,data)=>{
    if(! err){
      if(! data){
     const list=new List({
    name:_.capitalize(req.params.customlist),
    items:defaultItems
     })
     list.save()
     res.redirect("/"+_.capitalize(req.params.customlist))
      }
      
      else{
         List.find({},(err,lists)=>{
        arr=lists
        })
        
        res.render("list", {listTitle:data.name , newListItems:data.items,lists:arr,year:year})
      }
    }
  })
 
});
app.post("/", function(req, res){
  const itemname=_.capitalize(req.body.newItem);
  const listname=_.capitalize(req.body.list);
  
  const newitem= new Item({
    name:req.body.newItem
  })
  
  if(listname=="Today"){
  Item.insertMany([newitem],(err)=>{
    if(err)console.log(err);                                    // we can use item.save() for saving this new item
    else console.log("successfully inserted new item")
    res.redirect("/")
  });}
 else{
  List.findOne({name:listname},function(err,data){
    data.items.push(newitem);
    data.save();
    res.redirect("/"+listname);
  })
 }
});

app.post("/delete",(req,res)=>{
  const checkeditemid=req.body.checkbox;
  const listname=_.capitalize(req.body.listname);
  if(listname=="Today"){
    Item.deleteMany({_id:checkeditemid},(err)=>{
          if(err)console.log(err);
          else {
            console.log("deleted successfully");
            res.redirect("/");
          }
          
      });
  }
  else{
    List.findOneAndUpdate({name:listname},{$pull:{items:{_id:checkeditemid}}},(err,data)=>{
        if(!err)res.redirect("/"+listname)
    })
  }
  

});

app.post("/route",(req,res)=>{
  const list=_.capitalize(req.body.listname);
  
  if(list=="Today")res.redirect("/");
  else res.redirect("/"+list)
})



app.post("/newlist",(req,res)=>{
  const listname=_.capitalize(req.body.newlist);
  const oldlist=_.capitalize(req.body.oldlist);
  List.findOne({name:listname},(err,data)=>{
    if(!err){
      if(!data){
        const newlist=new List({
          name:listname,
          items:defaultItems
        })
         newlist.save();
        
        res.redirect("/"+listname)

      }
      else res.redirect("/"+listname)
    }
  })
})
// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

// app.get("/about", function(req, res){
//   res.render("about");
// });

app.post("/deletelist",(req,res)=>{
  const lname=_.capitalize(req.body.deletelistname);
  List.deleteMany({name:lname},(err)=>{
    if(err)console.log(err);
    List.find({},(err,data)=>{
   res.render("All",{lists:data,year:year});
  
  });
  })
  
  
  
})

app.post("/changelist",(req,res)=>{
  const lname=_.capitalize(req.body.changelistname);
  const newname=_.capitalize(req.body.newname);
  List.findOne({name:newname},(err,data)=>{
        if(!err){
          if(data)res.redirect("/"+newname)
          else{
            List.findOne({name:lname},(err,data)=>{
              if(!err){
               if(data){
                data.name=newname;
                data.save();
                res.redirect("/"+newname)
               }
              }
            })
          }
        }
  })
  
  
  

})

// let port=process.env.PORT;
// if(port==null || port==""){
//   port=3000;
// }
let port=3000;
app.listen(port, function() {
  console.log("Server started on port 3000");
});
