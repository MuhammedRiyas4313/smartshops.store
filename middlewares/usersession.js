
const User = require("../models/user");

const userSession = async (req,res,next)=>{

    console.log(req.url,' url requesstt...')
    if(req.session.logeduser){
        console.log("session...")
        const { _id } = req.session.logeduser;
        const user = await User.findOne({_id:Object(_id)})
        console.log(user.status,'user in session middle ware')

        if(user.status){
            next();
        }else{
            console('blocked user')
          res.redirect("/user/logout"); 
        }    
    }else{
        console.log(' no session');
        req.session.notloged = true;
        res.redirect('/user-login');
    }
}

const userSessionAxios = async (req,res,next) => {
    if(req.session.logeduser){
        const { _id } = req.session.logeduser;
        const user = await User.findOne({_id:Object(_id)})
        if(user.status){
            next();
        }else{
          res.json({ user:'noSession' });
          req.session.destroy();
        }    
    }else{
        console.log('user session axios ')
        res.json({ user:'noSession' });
    }
}
module.exports = { userSession, userSessionAxios }