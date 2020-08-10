var mongoose = require('mongoose');


//Create a Schema

var commentSchema = mongoose.Schema({ 
    title:String,
    author:String
    
 })

// Create a model
 module.exports = mongoose.model('comment',commentSchema)