const dotenv=require('dotenv')
dotenv.config({path:'./config.env'})
const mongoose=require('mongoose')
const app=require('./App')

process.on('uncaughtException',err=>{
    console.log(`UNHANDLE EXCEPTION 🔥 ${err.message}`);
    process.exit(1)
})

const db=process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD)

mongoose.connect(db,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false
}).then(()=>console.log(`Database Connected`))


const PORT=process.env.PORT ||7000
const server= app.listen(7000,()=>console.log(`server running on port: http://localhost:${PORT}`))

process.on('unhandledRejection',err=>{
    console.log(err.name,err.message);
    console.log(`UNHANDLE REJECTION 🔥`);
    server.close(()=>process.exit(1))
})