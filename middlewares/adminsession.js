

const adminSession = (req,res,next)=>{
    console.log('session checking')
    if(req.session.loged){
        next();
    }else{
        res.redirect('/admin');
    }
}

const adminSessionAxios = (req,res,next) => {
    console.log('session checking in axios session')
    if(req.session.loged){
        console.log('have session')
        next();
    }else{ 
        console.log('session destroyed ..middleware')
        req.session.adminlostsession = true
        res.json({admin:'noSession'});
    }
}

module.exports = { 
    adminSession, 
    adminSessionAxios 
   }