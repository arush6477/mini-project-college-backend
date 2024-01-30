import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    fullName : {
        type : String,
        required : true,
        trim : true,
        index : true
    },
    email : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
        index : true
    },
    username : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
        index : true
    },
    password : {
        type : String,
        required : true
    },
    avatar : {
        type : String,
        required : true,
        default : "https://www.google.com/imgres?imgurl=https%3A%2F%2Fwallpapers-clan.com%2Fwp-content%2Fuploads%2F2022%2F08%2Fdefault-pfp-15.jpg&tbnid=j3rIjVLiH1YLQM&vet=12ahUKEwicm5T764KEAxWnm2MGHcCnAAMQMygpegUIARCuAQ..i&imgrefurl=https%3A%2F%2Fwww.industrialvacuumsystems.com.au%2FDefault-user-profile-picture-aesthetic-3044366.html&docid=YfrRB7052hPW1M&w=512&h=512&q=default%20user%20image%20instagram&ved=2ahUKEwicm5T764KEAxWnm2MGHcCnAAMQMygpegUIARCuAQ"//default profile image 
    },
    avatar_public_id : {
        type : String,
        required : true,
        default : "none"
    } 
},{timestamps : true});

// hashing the password just before saving it (pre is a hook by mongoose) 
userSchema.pre("save" , async function (next) {
    if(!this.isModified("password")){
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = async function(){
    return jwt.sign(
        {
            _id : this._id,
            email : this.email,
            username : this.username,
            fullName : this.fullName            
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
} 

userSchema.methods.generateRefreshToken = async function(){
    return jwt.sign(
        {
            _id : this._id,          
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
} 


export const User = mongoose.model("User" , userSchema);