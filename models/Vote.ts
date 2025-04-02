import mongoose, { Schema, Document } from "mongoose";

export interface IVote extends Document {
    ideaId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    voteType: "up" | "down";
}

const VoteSchema = new Schema<IVote>(
    {
        ideaId: { type: Schema.Types.ObjectId, ref: "Idea", required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        voteType: { type: String, enum: ["up", "down"], required: true },
    },
    { timestamps: true }
);

export default mongoose.model<IVote>("Vote", VoteSchema);
