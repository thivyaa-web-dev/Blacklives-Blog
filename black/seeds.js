var mongoose = require('mongoose');
var black    = require('./models/black');
var  comment = require('./models/comment');


var data   =  [ 
    { 
        name: 'George Floyd', 
        image: 'https://images.unsplash.com/photo-1590940343077-256fb4ef5f92?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 
        description: 'Black Lives Matter'
        
           
        
     },

     {
        name: 'Breyona Taylor', 
        image: 'https://images.unsplash.com/photo-1590949499082-3f2aad1184e2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 
        description: 'Blacks lives matter'


      },
      {
        name: 'Street name changed', 
        image: 'https://ichef.bbci.co.uk/news/624/cpsprodpb/18599/production/_112873799_blmplaza.jpg', 
        description: 'Black Lives Matter'


      },
      {
        name: 'Black Out Tuesday', 
        image: 'https://ichef.bbci.co.uk/news/485/socialembed/https://twitter.com/Spotify/status/1266727451029319682?s=20~/news/newsbeat-53007952', 
        description: 'Black Lives Matter'


      },
      {
        
        
            name: 'Fair & Lovely becomes Glow & Lovely', 
            image: 'https://www.utkaltoday.com/wp-content/uploads/2020/06/fair-and-lovely-utkal-1.jpeg', 
            description: 'Black Lives Matter'
    

      },
      {
        
        
        
        
            name: 'MAGA', 
            image: 'https://images.unsplash.com/photo-1585249988465-b9f684e8162b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 
            description: 'Vote poll for black gets increased from 11-22%,median salary gets increased'
    
  },
  {
     
    name: 'Police Officers Charged', 
    image: 'https://ichef.bbci.co.uk/news/624/cpsprodpb/5741/production/_112873322_cops.jpg', 
    description: 'Derek Chauvin, J Alexander Kueng, Thomas Lane and Tou Thao - the four officers who arrested George Floyd are charged'

},
{
     
    name: 'Statues being taken down', 
    image: 'https://ichef.bbci.co.uk/news/624/cpsprodpb/164C9/production/_112873319_statue.jpg', 
    description: 'Juneteenth was widely celebrated and was seen as a day for the freedom of black slaves'

}


]

function seedDB(){ 
    black.remove({},function(err){ 
        if(err){ 
            console.log(err);
         }
         console.log('removed blacks')
         data.forEach(function(seed){ 
             black.create(seed,function(err,black){ 
                 if(err){ 
                     console.log(err);
                  } else {  
                      console.log('added a campground')

                      comment.create(
                          {
                              text: 'thivyaa is very dumb',
                              author: 'homer'

                          },function(err,comment){ 
                              if(err){ 
                                  console.log(err);
                               } else { 
                                black.comments.push(comment);
                                black.save();
                                console.log('created new comment')
  

                                }
                              

                           })
                     

                  }

              })

          })

     })
 }




module.exports = seedDB;



    





