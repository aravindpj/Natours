const express = require('express');

const path=require('path')

const app = express();
const fs = require('fs');

const rateLimit=require('express-rate-limit')
const helmet=require('helmet')
const mongoSantize=require('express-mongo-sanitize')
const xss=require('xss-clean')
const hpp=require('hpp')
const cookieParser = require('cookie-parser')

const moragn=require('morgan')
const tourRouter=require('./Router/toursRouter')
const userRouter=require('./Router/usersRouter');
const reviewRouter=require('./Router/reviewRouter');
const viewsRouter=require('./Router/viewsRouter')
const bookingRouter=require('./Router/bookingRouter')
const AppError = require('./utils/appError');

//global error handler
const globalErrorHandling=require('./Controller/errorController')

//serving static file
app.use(express.static(path.join(__dirname,'public')))

//SETTING UP PUG TEMPLATE (SERVER SIDE RENDERING THE HTML AND CSS)
app.set('view engine','pug')
app.set('views',path.join(__dirname,'views'))

//set securiy HTTP header
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}))

//1) MIDDLEWARE for body parser
app.use(express.json({limit:'10kb'}));
app.use(express.urlencoded({extended:true,limit:'10kb'}))// when form send data to the server we need to parse the data
app.use(cookieParser())

//Data sanitization against noSQL query injection
app.use(mongoSantize())

//Data sanitization against XSS
app.use(xss())

// prevent parameter polution
app.use(hpp())

// Development logging
if(process.env.NODE_ENV==='development'){
    app.use(moragn('dev'))
}

// The rate limiter is used restrict so many request on the server
const limiter=rateLimit({
  max:100, // max means number of request
  windowMs:60*60*1000 // windowMs means num of request accepts in tmie
})

// using exprss-rate-limit middleware
app.use('/api',limiter) // mention (/api) means it is applying starting with this url



app.use((req, res, next) => {
  req.requestedTime = new Date().toISOString(); 
  next();
});

//ROUTERS
// view 
app.use('/',viewsRouter)
//for  enpoints 
app.use('/api/v1/tours',tourRouter)
app.use('/api/v1/users',userRouter)
app.use('/api/v1/reviews',reviewRouter)
app.use('/api/v1/bookings',bookingRouter)


//its take every type of req
app.all('*',(req,res,next)=>{
  // const err=new Error(`doesn't match this URL ${req.originalUrl} in this server`)
  // err.statusCode=404
  // err.status='Fail'

  //we pasing arg in the next function its point to error handling miidlware  (globalErrorHandling)
  next(new AppError(`doesn't match this URL ${req.originalUrl} in this server`,404))
})

app.use(globalErrorHandling)

//SERVER  
module.exports=app
