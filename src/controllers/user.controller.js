import {asyncHandler} from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async (req,res) =>{
    const {fullName , username , email , password} = req.body;
    if(!username && !password && !email) throw new ApiError(400 , "username or password or email is not there in the req");
    if(!fullName) fullName = username; 

    const avatarLocalPath = req.file?.path;
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if(!avatar) throw new ApiError(500 , "Failed to upload the avatar on cloudinary");

    const createDatabase = await User.create({
        fullName : fullName,
        username : username,
        email : email,
        password : password,
        avatar : avatar.url,
        avatar_public_id : avatar.public_id
    });

    if(!createDatabase) throw new ApiError(500 , "Failed to create the user in the database");

    return res
    .status(200)
    .json(new ApiResponse(200 , createDatabase.select("-password") , "User created successfully"));
});

export {
    registerUser
}