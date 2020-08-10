var mongoose = require('mongoose')


var blackSchema = new mongoose.Schema({ 
    name:String,
    image:String,
    description:String,

    author:{ 
        id:{ 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
         },
         username: String
     },

   
    comments :[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:'comment'


    }
]
  
   })
  
  // model setup
 module.exports = mongoose.model("black",blackSchema);