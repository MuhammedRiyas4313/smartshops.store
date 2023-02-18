//  function tester(){

//   const form = document.getElementById('mobileform')
//   const formData = new FormData(form)
//   const data = Object.fromEntries(formData)
//   console.log(data,'mobile number for verify otp')
//     timer((validity)=>{
//         console.log(validity,'from the timer callback')
//         timerReminder((validity)=>{
//             console.log(validity,'from the timerReminder callback')
//         })
        
//     });
    
//       console.log('test function')
//  }

function forgotPassword(){
  renderPage('forgotPassword')
  $('.fade').modal('show');
  event.preventDefault();
  console.log('forgot password.........')


}

function mobileVerification (type){

    console.log('called mobileverify .....')
    const form = document.getElementById('mobileform')
    const formData = new FormData(form)
    formData.append("type",type)
    const data = Object.fromEntries(formData)
    console.log(data,'mobile number for verify otp')
    axios.post('/user-otp',data).then((res)=>{
        console.log(res.data.message,'res axios .....1')
        if(res.data.message == "success"){
            console.log(res.data.message,'res axios .....if')
            renderPage("otppage",data.newusermobile);
        }else{

            console.log(res.data.message,'res axios .....else')
            document.getElementById('validationmobile').innerHTML = res.data.message
            setTimeout(() => {
            document.getElementById('validationmobile').innerHTML ='&nbsp;&nbsp;&nbsp;' ;},3000);

        }
    })

}

function OTPverification (){

  console.log('called verify OTP')
  const form = document.getElementById('verifyOTP')
  const formData = new FormData(form)
  const data = Object.fromEntries(formData)
  console.log(data,'mobile number for verify otp')
  axios.post('/user/otp-confirm',data).then((res)=>{

      if(res.data.message == "success"){

        renderPage('signuppage');
        timer('stop');

      }else if(res.data.message == "resetSuccess"){

        renderPage('resetPassword');
        timer('stop');
            
      }else{
        document.getElementById('validationOTP').innerHTML = res.data.message
        setTimeout(() => {
        document.getElementById('validationOTP').innerHTML ='&nbsp;&nbsp;&nbsp;' ;},3000);                 
      }
  })

}



function signupVerification(type){

  

      event.preventDefault()
      const formsignup = document.getElementById('signupconfirm')
      const formsignupData = new FormData(formsignup)
      formsignupData.append('type',type)
      const datasignup = Object.fromEntries(formsignupData)
      console.log(datasignup,'data otp from the form')
      axios.post('/user/signup-confirm',datasignup).then((res)=>{
        if(res.data.message == "success"){
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Account has been created',
            showConfirmButton: false,
            timer: 1500
          }).then((res)=>{
            $('.fade').modal('hide');
            closeModalbutton();
          })
          
        }else if(res.data.message == "resetSuccess"){

          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: res.data.message,
            showConfirmButton: false,
            timer: 1500
          }).then((res)=>{
            $('.fade').modal('hide');
            closeModalbutton();
          })
           
            
        }else{
            document.getElementById('validationsignup').innerHTML = res.data.message
            setTimeout(() => {
            document.getElementById('validationsignup').innerHTML ='&nbsp;&nbsp;&nbsp;' ;},3000);
        }
      })

}






function timer(command){

  let timerId

    if(command == 'start'){

      console.log('timer started')

            let countdown = 60 ; // OTP validity time in seconds
            timerId = setInterval(function() {
            countdown--;
            document.getElementById('otptimer').innerHTML = `Time :  ${countdown}  seconds`
          
          console.log(countdown,'timer..')
            if (countdown <= 0) {

                const resendButton = document.getElementById('buttonresend')
                resendButton.disabled = false;
                document.getElementById('otptimer').innerHTML = "Time's up! OTP expired."
                document.getElementById('buttonOTP').style.display = 'none'  
                console.log(countdown,'timer..')
                clearInterval(timerId);
                
            }
        }, 1000);
    
    }else{
      clearInterval(timerId);
      console.log('timer is to be stop...............')
    }
    

}

function resendOTP(userMobile){

  const data = { newusermobile: userMobile }
  console.log(userMobile,'mobile come from the otppage')
  axios.post('/user-otp',data).then((res)=>{
    console.log(res.data.message,'res axios .....1')
    if(res.data.message == "success"){
        console.log(res.data.message,'res axios .....if')
        document.getElementById('buttonOTP').style.display = 'block'
        const resendButton = document.getElementById('buttonresend')
        resendButton.disabled = true;
        timer('start')
    }else if(res.data.message == "Try again later!"){

      document.getElementById('validationOTP').innerHTML = res.data.message
      setTimeout(() => {
        closeModal(); },3000);

    }else{
        console.log(res.data.message,'res axios .....else')
        document.getElementById('validationOTP').innerHTML = res.data.message
        setTimeout(() => {
        document.getElementById('validationOTP').innerHTML ='&nbsp;&nbsp;&nbsp;' ;},3000);
    }
  })
}


function renderPage(type,newusermobile ){

    if(type == "otppage"){
        document.getElementById('modalToverifyUser').innerHTML = `
                <div class="modal-header d-flex justify-content-center" style="background-color: #111340;">
            <h5 class="modal-title text-white" id="exampleModalLongTitle">Verify OTP</h5>
                 <div class="d-flex justify-content-end" style="background-color: #111340;">
                      <button type="button" onclick="closeModalbutton()" class="close text-white border-0" data-dismiss="modal" aria-label="Close" >
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    </div>
              <div class="modal-body pt-5" style="padding-left:3rem;padding-right:3rem;padding-bottom:3rem;background-color: #c2c2c26e;">
              <form id="verifyOTP">
          <!-- Email input -->
              <div class="form-outline mb-2">
                <h6  class="form-label pt-2 pb-1" for="form2Example1" style="font-size: 1.5rem !important;">Enter OTP</h6>
                <input type="number" id="form2Example1" class="form-control"  name="enteredotp" placeholder="Enter OTP"/> 
                <h5 class="form-label text-danger pt-2" for="form2Example1" id="validationOTP">&nbsp;&nbsp;&nbsp;</h5>
              </div>
              <div class=" d-flex justify-content-center text-danger" id="otptimer">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </div>
              <div class="form-group mt-4 mb-2" id="buttonOTP">
                   <button onclick="OTPverification()" type="button" class="btn btn-block text-white mt-2 mb-4" style="border-radius:2rem ;font-weight: 700;letter-spacing:3px;line-height: 2rem;background-color: #111340; ">  Submit  </button>
              </div> 
              <div class="form-group d-flex justify-content-center">
                <button type="button" id="buttonresend" class="btn text-white mt-2 mb-4" onclick="resendOTP(${newusermobile})" style="border-radius:2rem ;font-weight: 400;letter-spacing:3px;line-height: 2rem;background-color: #be0020; " >  Resend OTP  </button>
              </div>

          <!-- Register buttons -->
            </form>
              </div>`
              const resendButton = document.getElementById('buttonresend')
              resendButton.disabled = true;
              timer('start');

    }else if(type == "signuppage"){

        document.getElementById('modalToverifyUser').innerHTML =`<div class="modal-header d-flex justify-content-center" style="background-color: #111340;">
                                <h5 class="modal-title text-white" id="exampleModalLongTitle">Signup</h5>
                                <div class="d-flex justify-content-end" style="background-color: #111340;">
                                <button type="button" onclick="closeModalbutton()" class="close text-white" data-dismiss="modal" aria-label="Close" >
                                  <span aria-hidden="true">&times;</span>
                                </button>
                              </div>
                              <div class=" d-flex justify-content-center text-danger" id="otptimer" style="display:none !important;">
                                 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                              </div>
                              </div>
                              <div class="modal-body" style="padding-left:3rem;padding-right:3rem;padding-bottom:3rem;background-color: #c2c2c26e;">
                                <div class="d-flex justify-content-start">
                                  <h5 class="form-label text-danger mt-2 mb-3" for="form2Example1" id="validationsignup">&nbsp;&nbsp;&nbsp;</h5>
                                </div>
                               <div class="row mt-2">
                                      <div class="col-12">
                                        <form id="signupconfirm" class="tm-login-form" >
                                          <div class="form-group">
                                            <label for="username" class="">Enter name</label>
                                            <input
                                              name="username"
                                              type="text"
                                              class="form-control"
                                              placeholder="Enter name"
                                              id="username"
                                            
                                            />
                                          </div>
                                          <div class="form-group mt-3">
                                            <label for="password">Enter email</label>
                                            <input
                                              name="useremail"
                                              type="email"
                                              class="form-control"
                                              placeholder="Enter email"
                                            />
                                          </div>
                                          <div class="form-group mt-3">
                                            <label for="password">Password</label>
                                            <input
                                              name="userpassword"
                                              type="password"
                                              class="form-control"
                                              placeholder="Password"
                                            />
                                          </div>
                                          <div class="form-group mt-3">
                                            <label for="password">Confirm password</label>
                                            <input
                                              name="userconfirmpassword"
                                              type="password"
                                              class="form-control"
                                              placeholder="Confirm password"
                                            />
                                          </div>
                                          <div class="form-group mt-4 mb-2">
                                            <button
                                              type="button"
                                              onclick="signupVerification('create')"
                                              class="btn btn-block text-white mt-2 mb-4"
                                              style="border-radius:2rem ;font-weight: 700;letter-spacing:3px;line-height: 2rem;background-color: #111340; "
                                              
                                            >
                                              Signup
                                            </button>
                                          </div>   
                                        </form>
                                      </div>
                                    </div>`

    }else if (type == "forgotPassword"){

      document.getElementById('modalToverifyUser').innerHTML =`
      
      <div class="modal-header d-flex justify-content-center" style="background-color: #111340;">
            <h5 class="modal-title text-white" id="exampleModalLongTitle"> Forgot Password ?</h5>
                 <div class="d-flex justify-content-end" style="background-color: #111340;">
                      <button type="button" onclick="closeModalbutton()" class="close text-white" data-dismiss="modal" aria-label="Close" >
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    </div>
              <div class="modal-body pt-5" style="padding-left:3rem;padding-right:3rem;padding-bottom:3rem;background-color: #c2c2c26e;">
              <form id="mobileform">
          <!-- Email input -->
              <div class="form-outline mb-2">
                <h6  class="form-label pt-2 pb-1" for="form2Example1" style="font-size: 1.5rem !important;">Enter mobile</h6>
                <input type="number" id="form2Example1" class="form-control"  name="newusermobile" placeholder="Enter mobile number"/> 
                <h5 class="form-label text-danger pt-2" style="font-size: 1.5rem !important;" for="form2Example1" id="validationmobile">&nbsp;&nbsp;&nbsp;</h5>
              </div>
              <div class="form-group mt-4 mb-2">
                   <button id="mobilebutton" onclick="mobileVerification('reset')" type="button" class="btn btn-block text-white mt-2 mb-4" style="border-radius:2rem ;font-weight: 700;letter-spacing:3px;line-height: 2rem;background-color: #111340; ">  Send OTP  </button>
              </div> 
          <!-- Register buttons -->
            </form>
              </div>`

    }else if(type == "resetPassword"){

      document.getElementById('modalToverifyUser').innerHTML =`<div class="modal-header d-flex justify-content-center" style="background-color: #111340;">
                                <h5 class="modal-title text-white" id="exampleModalLongTitle">Reset Password</h5>
                                <div class="d-flex justify-content-end" style="background-color: #111340;">
                                <button type="button" onclick="closeModalbutton()" class="close text-white" data-dismiss="modal" aria-label="Close" >
                                  <span aria-hidden="true">&times;</span>
                                </button>
                              </div>
                              <div class=" d-flex justify-content-center text-danger" id="otptimer" style="display:none !important;">
                                 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                             </div>
                              </div>
                              <div class="modal-body" style="padding-left:3rem;padding-right:3rem;padding-bottom:3rem;background-color: #c2c2c26e;">
                                <div class="d-flex justify-content-start">
                                  <h5 class="form-label text-danger mt-2 mb-3" for="form2Example1" id="validationsignup">&nbsp;&nbsp;&nbsp;</h5>
                                </div>
                               <div class="row mt-2">
                                      <div class="col-12">
                                        <form id="signupconfirm" class="tm-login-form" >
                                          <div class="form-group mt-3">
                                            <label for="password">Password</label>
                                            <input
                                              name="userpassword"
                                              type="password"
                                              class="form-control"
                                              placeholder="Password"
                                            />
                                          </div>
                                          <div class="form-group mt-3">
                                            <label for="password">Confirm password</label>
                                            <input
                                              name="userconfirmpassword"
                                              type="password"
                                              class="form-control"
                                              placeholder="Confirm password"
                                            />
                                          </div>
                                          <div class="form-group mt-4 mb-2">
                                            <button
                                              type="button"
                                              onclick="signupVerification('reset')"
                                              class="btn btn-block text-white mt-2 mb-4"
                                              style="border-radius:2rem ;font-weight: 700;letter-spacing:3px;line-height: 2rem;background-color: #111340; "
                                              
                                            >
                                              Signup
                                            </button>
                                          </div>   
                                        </form>
                                      </div>
                                    </div>`

    }
}

function closeModal(){
  console.log('close modal is calling......')
    document.getElementById('modalToverifyUser').innerHTML = `<div class="modal-header d-flex justify-content-center" style="background-color: #111340;">
    <h5 class="modal-title text-white" id="exampleModalLongTitle">Verify mobile</h5>
         <div class="d-flex justify-content-end" style="background-color: #111340;">
              <button type="button" onclick="closeModalbutton()" class="close text-white" data-dismiss="modal" aria-label="Close" >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            </div>
      <div class="modal-body pt-5" style="padding-left:3rem;padding-right:3rem;padding-bottom:3rem;background-color: #c2c2c26e;">
      <form id="mobileform">
  <!-- Email input -->
      <div class="form-outline mb-2">
        <h6  class="form-label pt-2 pb-1" for="form2Example1" style="font-size: 1.5rem !important;">Enter mobile</h6>
        <input type="number" id="form2Example1" class="form-control"  name="newusermobile" placeholder="Enter mobile number"/> 
        <h5 class="form-label text-danger pt-2" style="font-size: 1.5rem !important;" for="form2Example1" id="validationmobile">&nbsp;&nbsp;&nbsp;</h5>
      </div>
      <div class="form-group mt-4 mb-2">
           <button id="mobilebutton" onclick="mobileVerification()" type="button" class="btn btn-block text-white mt-2 mb-4" style="border-radius:2rem ;font-weight: 700;letter-spacing:3px;line-height: 2rem;background-color: #111340; ">  Send OTP  </button>
      </div> 
  <!-- Register buttons -->
    </form>
      </div>`
   
  }
  
  
  function closeModalbutton(){

    closeModal()
    $('.fade').modal('hide');
    console.log('close modal function is calling......')
   
  }
  
  function closeForgotModal() {

    event.preventDefault();
    console.log('forgot password.........')
    $('#exampleModalCenterforgotpassword').modal('hide');

    
  }