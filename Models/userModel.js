const mongoose = require('mongoose');
const crypto =require('crypto')
const validator = require('validator');
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name'],
  },
  email: {
    type: String,
    require: [true, 'Enter email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide valid email'],
  },
  photo:{
    type:String,
    default:'default.jpg'
  },
  role:{
    type:String,
    enum:['user','guide','lead-guide','admin'],
    default:'user'
  },
  password: {
    type: String,
    require: [true, 'Enter password is required'],
    minlength: 8,
    select: false,
  },
  activate:{
    type:Boolean,
    default:true,
    select:false
  },
  confirmPassword: {
    type: String,
    require: true,
    validate: {
      //this only works on SAVE
      validator: function (val) {
        return val === this.password;
      },
      message: 'Password does not match.. check again !',
    },
  },
  passwordChangedAt:{
    type:Date
  },
  passwordResetToken:String,
  passwordResetExpires:Date
});

userSchema.pre('save', async function (next) {
  //this condition only works if password actually modified
  if (!this.isModified('password')) return next();

  //Hash the password is cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //delete confirm pasword
  this.confirmPassword = undefined;
});

userSchema.pre('save',async function(next){
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt=Date.now()-1000 // subtract One sec means jwt token some time take time to generate 

  next()
})

// this middleware only find current activate user only 
userSchema.pre(/^find/,function(next){
   this.find({activate:{$ne:false}})
   next()
})

//instanse method : is this avail on all doc of a certain collection
userSchema.methods.correctPassword = async function (
  currentPassword,
  userPassword
) {
  return await bcrypt.compare(currentPassword, userPassword);
};

//Check if the user changes the password after issuing the token
userSchema.methods.changePasswordAfter=function(JWTtimestamp){
    if(this.passwordChangedAt){
        const passwordCreatedAt=parseInt(this.passwordChangedAt.getTime()/1000)
        // check the jwt timestamp created time  less than user password created time
        
        //THIS RETURN TRUE IT MEANS PASSWORD WAS CHANGED
        return JWTtimestamp < passwordCreatedAt
    }
    
    // Fasle means not change
    return false
}

userSchema.methods.createPasswordResetToken=function(){
  const resetToken=crypto.randomBytes(32).toString('hex')
  //encrypted data saving to the database
  this.passwordResetToken=crypto.createHash('sha256').update(resetToken).digest('hex')
  this.passwordResetExpires=Date.now()+10*60*1000

  return resetToken
}

const User = mongoose.model('User', userSchema);

module.exports = User;
