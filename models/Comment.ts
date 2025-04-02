import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
    ideaId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    content: string;
}

const CommentSchema = new Schema<IComment>(
    {
        ideaId: { type: Schema.Types.ObjectId, ref: "Idea", required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true },
    },
    { timestamps: true }
);

export default mongoose.model<IComment>("Comment", CommentSchema);
