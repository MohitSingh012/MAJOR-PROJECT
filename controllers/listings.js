const { request } = require("express");
const Listing=require('../models/listing');
const ExpressError = require("../utils/ExpressError");

module.exports.index=async (req,res)=>{
    // const allListings=await Listing.find({});
    let search = req.query.search || "";
    let category = req.query.category || "";
    let allListings = [];
    if(category!="") {
        allListings = await Listing.find({category: `${category}`});
    }else if(search !== "") {
        // allListings = await Listing.find({ title: { $regex: `\\b${search}`, $options: 'i' } }).populate("owner");
        // allListings = await Listing.find({
        //     $or: [
        //       { title: { $regex: `\\b${search}`, $options: 'i' } },
        //       { location: { $regex: `\\b${search}`, $options: 'i' } },
        //       { country: { $regex: `\\b${search}`, $options: 'i' } },
        //       { 'owner.username': { $regex: `\\b${search}`, $options: 'i' } }
        //     ]
        //   }).populate("owner").populate("reviews");
        allListings = await Listing.aggregate([
            {
              $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "result"
              }
            },
            {
              $match: {
                $or: [
                  { title: { $regex: `\\b${search}`, $options: 'i' } },
                  { location: { $regex: `\\b${search}`, $options: 'i' } },
                  { country: { $regex: `\\b${search}`, $options: 'i' } },
                  { 'result.username': { $regex: `\\b${search}`, $options: 'i' } },
                  {category: { $regex: `\\b${search}`, $options: 'i' }}
                ]
              }
            }
          ]);
        if(allListings.length === 0) {
            throw new ExpressError(404, "No match found");
        }
    }else {
        allListings = await Listing.find({});
    }

    res.render("listings/index.ejs",{allListings});
 };



 

 module.exports.renderNewForm=(req,res)=>{
    
    res.render('listings/new.ejs');
  }

module.exports.showListing=async (req,res)=>{
    let {id}=req.params;
    const listing =await Listing.findById(id).populate({path:"reviews",populate:{
     path:"author",
    }}).populate("owner");
    if(!listing){
       req.flash("error","Listing you requested for does not exist");
       res.redirect('/listings');
    }
    console.log(listing);
    res.render('listings/show.ejs',{listing});
}

module.exports.createListing=async(req,res,next)=>{
    let url=req.file.path;
    let filename=req.file.filename;
    const newListing= new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.image={url,filename};
    await newListing.save();
req.flash("success","New Listing Created!");
res.redirect('/listings');
}

module.exports.renderEditForm=async (req,res)=>{
    let {id}=req.params;
    const listing =await Listing.findById(id);
    if(!listing){
      req.flash("error","Listing you requested for does not exist");
      res.redirect('/listings');
   }

   let orignalImageUrl=listing.image.url;
   orignalImageUrl=orignalImageUrl.replace('/upload','/upload/w_250');
    res.render('listings/edit.ejs',{listing,orignalImageUrl});
   };

module.exports.updateListiing=async (req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if(typeof req.file!='undefined'){
      let url=req.file.path;
      let filename=req.file.filename;
      listing.image={url,filename};
      await listing.save();
    }
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
   };

module.exports.destroyListing=async(req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success"," Listing Deleted!");
    res.redirect('/listings')
  };