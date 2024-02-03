import {asyncHandler} from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary , deleteFromCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Something went Wrong while generating refresh and access token");
    }
}

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

const loginUser = asyncHandler(async (req,res) => {
    console.log(req.body);
    const {username , password} = req.body;

    if(!username && !password) throw new ApiError(400 , "Username or password is not there in the request");

    const user = await User.find({
        username : username
    });

    if(!user) throw new ApiError(404 , "User does not exist");

    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid) throw new ApiError(400 , "username or Password is incorrect");

    const options = {
        httpOnly: true,
        secure: true
    }

    const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id);

    return res
    .status(200)
    .cookie("accessToken",accessToken , options)
    .cookie("refreshToken",refreshToken , options)
    .json(new ApiResponse(200 , {} , "Logged in successfully"));
});

const logOutUser = asyncHandler(async (req,res) =>{
    await User.findByIdAndUpdate(
        req.user?._id, {
        $set: {
            refreshToken: undefined
        }
    },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    }
    
    return res
    .status(200)
    .clearcookie("accessToken",options)
    .clearcookie("refreshToken",options)
    .json(new ApiResponse(200 , {} , "logged out successfully"));
})

const updateAvatar = asyncHandler(async(req , res) =>{
    const avatarLocalPath = req.file?.path;
    if(!avatarLocalPath) throw new ApiError(400 , "Failed to get the avatar local path from file in req");

    const uploadCloudinary = await uploadOnCloudinary(avatarLocalPath);

    //delete previous avatar from cloudinary
    const deleteCloudinary = await deleteFromCloudinary(req.user.avatar_public_id);
    
    const updateDatabase = await User.findByIdAndUpdate(req.user?._id , {
        $set : {
            avatar : uploadCloudinary.url,
            avatar_public_id : uploadCloudinary.public_id
        }
    });

    if(!updateDatabase) throw new ApiError(500 , "Failed to upload the database");

    if(!uploadCloudinary) throw new ApiError(500 , "Failed to upload the avatar image in cloudinary");

    return res
    .status(200)
    .json(new ApiResponse(200 , deleteCloudinary , "Avatar updated sucessfully"))
})

export {
    registerUser,
    loginUser,
    logOutUser,
    updateAvatar
}