import mongoose, { Schema, Document } from "mongoose";

export interface IComment {
    user_id: mongoose.Types.ObjectId;
    content: string;
}

export interface IVote {
    user_id: mongoose.Types.ObjectId;
    voteType: "up" | "down";
}

export interface IIdea extends Document {
    title: string;
    description: string;
    votes: IVote[]; // Array of vote objects
    comments: IComment[];
    user_id: mongoose.Types.ObjectId;
    status: "pending" | "approved" | "rejected";
}

const IdeaSchema = new Schema<IIdea>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        votes: [
            {
                user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
                voteType: { type: String, enum: ["up", "down"], required: true }
            }
        ],
        comments: [
            {
                user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
                content: { type: String, required: true }
            }
        ],
        user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    },
    { timestamps: true }
);

export default mongoose.model<IIdea>("Idea", IdeaSchema);
