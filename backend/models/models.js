import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    textMessage:{
        type:String
    },
    images:{
        type:[String]
    },
    videos:{
        type:[String]
    },
    likesCounter:{
        type:Number
    },
    dislikeCounter:{
        type:Number
    },
    likeUsers:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    dislikeUsers:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }]
}, 

{
    timestamps:true,
    collection:'user-posts'
}
)


postSchema.index({ userId: 1, createdAt: -1 });

export const postsModel = mongoose.model('postsModel', postSchema);


const usersSchema = new mongoose.Schema({
    username : {
        type:String,
        required:true,
        unique:true
    },
    email : {
        type: String,
        unique:true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address'],
        required:true
    },
    password: {
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    updatedAt:{
        type:Date,
        default:Date.now
    },
    followers:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    following:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        }]
}, {
    collection: "users",
    timestamps:true
})

const User = mongoose.model('User', usersSchema);

export {User}
// video link: "https://youtu.be/2mkPHCpqjBE"4r