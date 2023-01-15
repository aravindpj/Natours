const fs=require('fs')
const dotenv=require('dotenv')
const mongoose=require('mongoose')
const Tour=require('./../../Models/tourModel')
const User=require('./../../Models/userModel')
const Review=require('./../../Models/reviewModel')

const tours=JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'))
const users=JSON.parse(fs.readFileSync(`${__dirname}/users.json`,'utf-8'))
const reviews=JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,'utf-8'))

dotenv.config({path: './config.env'})
//connect db
const db=process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD)
mongoose.connect(db,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false
}).then(()=>console.log(`DB CONNECTED`))

//import all data
const importData=async ()=>{
    try {
        await Tour.create(tours)
        await User.create(users,{validateBeforeSave: false })
        await Review.create(reviews)
        console.log('data added to the data base ');
        process.exit()
    } catch (error) {
        console.log(error.message);
    }
}

//delete all data
const deleteData=async ()=>{
    try {
        await Tour.deleteMany()
        await User.deleteMany()
        await Review.deleteMany()
        console.log('all data deleted from the data base');
        process.exit()
    } catch (error) {
        console.log(error.message);
    }
}
console.log(process.argv);
if(process.argv[2]==='--import') importData()
if(process.argv[2]==='--delete') deleteData()