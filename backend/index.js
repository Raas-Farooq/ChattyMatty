import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
// import MONGODB_URI from './db/config.js';
import {postsModel, User} from './models/models.js';
import jwt from 'jsonwebtoken';
import { authMiddleware } from './authMiddle/authenMiddleWare.js';


const port = process.env.PORT || 3800;

const app = express();

app.use(express.json());

// dotenv;
dotenv.config();



const createdIndex = async () => {
    try{
        await postsModel.collection.createIndex({createdAt: -1, user_id:1});
        console.log("index has been Created")
    }   
    catch(err){
        console.log("err while creating INdex ", err)
    }
     
}

createdIndex();

app.post('/socialBee/registerUser', async(req,res) => {

    console.log("register User process has been started")
    try{
        const {username, email, password} = req.body;

        const saltRound = 10;
        const securePassword = await bcrypt.hash(password, saltRound);
        console.log('securePassword: ', securePassword);
        const newUser = new User({
            username,
            email,
            password:securePassword
        })

        await newUser.save();

        if(!newUser){
            return res.status(401).json({
                success:false,
                message:"Information Should be Unique",
                
            })
        }


        return res.status(201).json({
            success:true,
            message:"Your Account Created Successfully",
            newUser
        })
    }
    catch(err){

        
        if(err.code === 11000){
            const field = Object.keys(err.keyValue)[0];
        const message = `${field} has already Taken, Should Try another one`;
            return res.status(404).json({
                success:false,
                message
            })
        }
        
        else if(err.name === 'ValidationError'){
            return res.status(404).json({
                success:false,
                message:err.message
            })


        }else {
            return res.status(500).json({
                success:false,
                message:"Some Error has come along the Way. Plz Try Again Some Time",
                error:err.message
            })
        }
        
    }
})


/**
 * Register a new user
 * @route POST /socialBee/registerUser
 * @param {string} req.body.username - The user's username
 * @param {string} req.body.email - The user's email
 * @param {string} req.body.password - The user's password
 * @returns {Object} 201 - New user object
 * @returns {Object} 400 - Validation errors
 * @returns {Object} 500 - Server error
 */

app.get('/socialBee/login',async(req,res) => {
    try{
        const {username, email, password} = req.body;

        const user = await User.findOne({email});

        if(!user)
            {
                return res.status(401).json({
                            success:false,
                            message:"Email Not Found. Create New Account"
                        })
            }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if(!isPasswordCorrect){
            return res.status(401).json({
                success:false,
                message:'Password didn \'t match' 
            })
        }

        const payload = {
            user:{
                id:user._id
            }
        }

        jwt.sign(payload, process.env.JWT_SECRET, {expiresIn:'1h'}, (err, token) => {
            if (err){
                throw err
            }
            res.json({success:true,message:"Login Successful", token})
        })

    }
    catch(err)
    {
        return res.status(500).json({
            success:false,
            message:"Error from Server",
            err:err.message
        })
    }
})


app.post('/socialBee/posting/',authMiddleware, async(req,res) => {

    try{
        const {content} = req.body;
        const user_id = req.user.id;
        console.log("content.imgUrl Posting: ", content.imageUrl);
        console.log("so called auth posting",user_id);   
        const post = new postsModel({
            user_id:user_id,
            textMessage:content.message || '',
            images: content.imageUrl && content.imageUrl.length ? [...content.imageUrl] : [],
            videos:content.videoUrl && content.videoUrl.length ? [...content.videoUrl] : []
        })

        await post.save();

        // if(post){
            return res.status(201).json({
                success:true,
                message:'Successfully Posted',
                post
            })
    }
    catch(err){
        res.status(500).json({
            success:false,
            error:err.message
        })
    }
  
})

app.post('/socialBee/like/:id', authMiddleware, async(req,res) => {
    const postId = req.params.id;
    const userId = req.user.id;
    console.log("postId after recieving: ", postId);
    // console.log("like Routes is On Its Way")
    try{
        const post = await postsModel.findById(postId);
       
        if(!post) return res.status(404).json({success:false, message:'This post doesnt Exist'})

        const alreadyLiked = post.likeUsers.includes(userId);
        const disliked = post.dislikeUsers.includes(userId);

        if(alreadyLiked){
            post.likeUsers.pull(userId);

            post.likesCounter = (post.likesCounter || 0) - 1;
        }
        else{
            post.likeUsers.push(userId);
            if(disliked){
                post.dislikeUsers.pull(userId);

            }
            
            post.likesCounter = (post.likesCounter || 0) + 1
        }
        
        try{
            await post.save();

            return res.status(200).json({
                success:false,
                message:alreadyLiked ? 'Post Disliked': 'Post Liked',
                likesCounter:post.likesCounter
            })

        }catch(err){
            res.status(500).json({
                success:false,
                message: "Server responding with Err when try to Like",
                error:err.message
            })
        }
        
    }catch(error){

        res.status(500).json({
            success:false,
            message:"Server error while liking the post",
            error:error.message
        })
    }
})

app.post('/socialBee/dislike/:id', authMiddleware, async(req,res) => {
    
    const userId= req.user.id;
    const postId = req.params.id;
    try{
        const post = await postsModel.findById(postId);
        if(!post) return res.status(404).json({success:false,message:"unable to find this Post"});

        const liked = post.likeUsers.includes(userId);
        const disliked = post.dislikeUsers.includes(userId);

        console.log("liked Check before like: ", liked);
        console.log("dislike: ", disliked);
        let handleDislike;

        if(disliked){
            handleDislike = {
                
                $pull:{dislikeUsers:userId},
                $inc: {dislikeCounter:-1},
             
                }
            
        }
        else{
            handleDislike=
                {
                $addToSet: {dislikeUsers:userId},
                $pull:{likeUsers:userId},
                $inc :{
                    dislikeCounter:1,
                    likesCounter : liked ? -1: 0
                }
            }
        }

        await postsModel.updateOne({_id:postId}, handleDislike);

        res.status(200).json({
            success:true,
            message:!disliked ? 'Post Disliked' : 'Dislike Removed'
        })

    }
    catch(err){
        res.status(500).json({
            success:false,
            message:"Server Issue while disliking the Post",
            error:err.message
        })
    }
})

app.post('/socialBee/followUnfollow/:followedId', authMiddleware, async(req,res) => {
    console.log("follow Unfoilo is Shinning")
    const followerId = req.user.id;
    const {followedId} = req.params;
    console.log("followed Id from req Params: ", followedId);
    console.log("followerId: ", followerId);
    try{
        const [follower, followed] = await Promise.all(
            [
                User.findById(followerId),
                User.findById(followedId)
            ]
        )
        console.log("follower User: ", follower);
        console.log("followed User: ", followed)
        if(!follower || !followed){
            return res.status(404).json({ success: false, message: "One or both users not found" });
        }
        
        // const user = await User.findById(followerId);
        // if(!user) return res.status(404).json({success:false,message:"Unable to find user while processing following"});

        const alreadyFollowed = follower.following.includes(followedId);
         
        let handleFollowProcess;

        if(alreadyFollowed){
            handleFollowProcess = {
                follower: {$pull: {following: followedId}},
                followed: {$pull : {followers: followerId}}
            }
        }else{
            handleFollowProcess = {
                follower: {$addToSet: {following: followedId}},
                followed: {$addToSet: {followers: followerId}}
            }
        }

        await Promise.all([
            User.updateOne({_id: followerId}, handleFollowProcess.follower),
            User.updateOne({_id: followedId}, handleFollowProcess.followed)
        ])
        res.status(200).json({
            success: true,
            message: alreadyFollowed ? "Unfollowed successfully" : "Followed successfully"
        });

    }
    catch(err){
        res.status(500).json({
            success:false,
            message:"Operation didn't Work while processing inside Server"
        })
    }

})


app.get('/socialBee/allData', async(request, response) => {
   try{
        const userPosts = await postsModel.find({}).populate('user_id');
        if(userPosts.length){
            return response.status(201).json({
                success:true,
                message:'successfully Loaded the Posts',
                userPosts
            })
        }else
        {
            return response.status(200).json({
                success:false,
                message:'Posts Not found',
            })
        }
   }catch(err){
    console.log("check your err: ",err);
    res.status(500).json({
        success:false,
        error:err.message
    })
   }
    
})



app.delete('/socialBee/deleting/:id', async (req, res) => {
    // const {type, url, message} = req.body;
    const {id} = req.params;
    console.log("Deleting Runs");
    try{
        
            const removePost = await postsModel.findByIdAndDelete(   id   );
            if(removePost){
                return res.status(201).json({
                success:true,
                message:"Post is successfully removed", 
                removePost
                })
            }
            else{
                return res.status(401).json({
                    success:false,
                    message:"Post Not Found "
                })
            }
        
    }
        
    catch(err)
    {
        console.log("Some Error happend ", err);
        return res.status(500).json({
            success:false,
            message:"Error Occured",
            error:err.message
        })
    }
})   


app.put('/socialBee/updatingPost/:id', async(req,res) => {

    const {id} = req.params;
    console.log("Updating Post Run: ", id);
    const {content} = req.body;  
    try{
        const getPost = await postsModel.findById(id);
        // getPost.videos.push(content.videoUrl);
        // console.log("getPost videos: ",getPost.videos)
        console.log(" Video Url inside : ", ...content.videoUrl)
        const updatedPost=await postsModel.findByIdAndUpdate(id, 
        {
            textMessage:content.message,
            images:content.imgUrl.length ? [...content.imgUrl]: [],
            videos:content.videoUrl.length ? [...content.videoUrl] : []

        },
        {new:true})

        if(updatedPost){
            return res.status(201).json({
                success:true,
                message:'Post has been Updated',
                updatedPost
            })
        }else{
            return res.status(401).json({
                success:false,
                message:"Updation Failed"
            })

        }

    }catch(err){
        console.log("Error: ", err);
        return res.status(500).json({
            success:false,
            message:'Error Arised',
            Error:err.message
        })
    }
})


app.get('/socialBee/getAllUsers', async(req, res) => {

    console.log("All Users Run")
    try{
        const users = await User.find({});

        if(!users.length){
            return res.status(404).json({
                success:false,
                message:"No Users Exist"
            })
        }

        res.status(200).json({
            success:true,
            message:"Successfully Got the Users",
            users
        })
    }
    catch(err){
        res.status(500).json({
            success:false,
            message:"server err while fetching users", 
            error:err.message
        })
    }
})


const startingServer = async() => {
    console.log("URI Attack: ", process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI).then(() => {
        // console.log("Connection Name: ", mongoose.connection.name)
        app.listen(port, () => {
            console.log("Your app is Shinning: ", port );
        })
    }).catch(err => console.log("Unable to Connect Mongoose ", err))
    
}

startingServer();
// EQQk2aFjGh2RtCNE




