const dotenv=require('dotenv')
dotenv.config({path:'.env'})
const mongoose=require('mongoose')
const app=require('./App')

// process.on('uncaughtException',err=>{
//     console.log(`UNHANDLE EXCEPTION 🔥 ${err.message}`);
//     process.exit(1)
// })

console.log(process.env.DATABASE_PASSWORD)
const db=process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD)
mongoose.connect(db,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false
}).then(()=>console.log(`Database Connected`))


const PORT=process.env.PORT ||4000
const server= app.listen(PORT,()=>console.log(`server running on port: http://localhost:${PORT}`))

process.on('unhandledRejection',err=>{
    console.log(err.name,err.message);
    console.log(`UNHANDLE REJECTION 🔥`);
    server.close(()=>process.exit(1))
})