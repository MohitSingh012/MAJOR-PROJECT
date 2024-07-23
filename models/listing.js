const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const Review=require('./review.js');
const listingSchema=new Schema({
title:{
    type:"String",
    required:"True",
},
description:'String',
image:{
   url:String,
   filename:String,
},
price:"Number",
location:"String",
country:"String",
reviews:[
    {
        type:Schema.Types.ObjectId,
        ref:"Review",
    },
],
owner:{
    type:Schema.Types.ObjectId,
    ref:"User",
},
    category: {
      type: String,
      enum: ['Trending', 'Rooms', 'Iconic_Cities', 'Mountains', 'Castles', 'Amazing_Pool', 'Camping', 'Farms', 'Arctic', 'Domes', 'House_Boats'],
    }
});

listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
    await Review.deleteMany({_id:{$in:listing.reviews}});
}
    
});

const Listing=mongoose.model('Listing',listingSchema);
module.exports=Listing;