import {Router} from "express";
import {
    registerUser,
    loginUser,
    logOutUser
} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//currently not uploading the avatar image
router.route("/register").post(upload("avatar"),registerUser);
router.route("/login").post(loginUser);

//secured routes
router.route("/logout").get(verifyJWT,logOutUser);
  
export default router;
