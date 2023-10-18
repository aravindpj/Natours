import '@babel/polyfill';
import { login, logout } from './login';
import { signup } from './signup';
import { displayMap } from './mapbox';
import { updateSetting } from './updateSettings';
import { booking } from './stripe';
//DOM Element
const mapBox = document.querySelector('#map');
const loginForm = document.querySelector('.form--login');
const SignUpForm = document.querySelector('.form--signup');
const logoutButton=document.querySelector('.nav__el--logout')
const updateUserData=document.querySelector('.form-user-data')
const userPasswordUpdate=document.querySelector('.form-user-settings')
const bookNow=document.getElementById('book-now')

function scrollToTop(){
  const tourSection=document.getElementsByTagName("BODY")[0]
  tourSection.scrollIntoView()
}
//Dellegation
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
  scrollToTop()
}

if (loginForm) {
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if(SignUpForm){
  SignUpForm.addEventListener("submit",function(e){
    e.preventDefault();
    const form=new FormData()
    form.append('name', document.getElementById('name').value)
    form.append('email', document.getElementById('email').value)
    form.append('password', document.getElementById('password').value)
    form.append('confirmpassword', document.getElementById('confirmpassword').value)
    const formData=Object.fromEntries(form)
    // console.log(formData)
    signup(formData)
  })
}

if(logoutButton){
    logoutButton.addEventListener('click',logout)
}

if(updateUserData){
   updateUserData.addEventListener('submit',async function(e){
    e.preventDefault()
    const form=new FormData()
    form.append('name', document.getElementById('name').value)
    form.append('email', document.getElementById('email').value)
    form.append('photo', document.getElementById('photo').files[0])
    await updateSetting(form,'data')
    setTimeout(()=>{
      location.reload()
    },2000)
   })
}
if(userPasswordUpdate){
   userPasswordUpdate.addEventListener('submit',async function(e){
     e.preventDefault()
    document.querySelector('.btn--save--password').textContent='Updating...'
    
    const formInputs= [...new FormData(this)]
    const data=Object.fromEntries(formInputs)
    await updateSetting(data,'password')
    document.querySelector('.btn--save--password').textContent='Save password'

    this.reset()// form inputs reset after upfdation end
   })
}

if(bookNow){
  bookNow.addEventListener('click',async function(e){
    const {tourId}=e.target.dataset
    e.target.textContent='Processing...'
    console.log(tourId);
    await booking(tourId)
    e.target.textContent='BOOK TOUR NOW'
  })
}