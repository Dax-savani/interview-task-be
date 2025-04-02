import mongoose, { Schema, Document } from "mongoose";

export interface IIdea extends Document {
    title: string;
    description: string;
    votes: number;
    comments: mongoose.Types.ObjectId[];
    user_id: mongoose.Types.ObjectId;
}

const IdeaSchema = new Schema<IIdea>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        votes: { type: Number, default: 0 },
        comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
        user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

export default mongoose.model<IIdea>("Idea", IdeaSchema);
