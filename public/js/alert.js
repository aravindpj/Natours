
const hideForm=function(){
    const el=document.querySelector('.alert')
    if(el) el.parentElement.removeChild(el)
}

export const showAlert=function(type,message){
   const markup=`<div class="alert alert--${type}">${message}</div>`
   document.querySelector('body').insertAdjacentHTML('afterbegin',markup)
   window.setTimeout(hideForm,1500)
}