import mongoose, { Schema } from "mongoose";
import type { IGrade, GradeDocument } from "../../types";

const gradeSchema = new Schema<IGrade>({
  name: { type: String, required: true },
  rank: { type: Number, required: true },
});

const Grade = mongoose.models.Grade
  ? (mongoose.models.Grade as mongoose.Model<IGrade>)
  : mongoose.model<IGrade>("Grade", gradeSchema);

export type { GradeDocument };
export default Grade;
