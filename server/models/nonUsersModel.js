const mongoose = require("mongoose");
const schema = mongoose.Schema;
const userSchema = new schema(
  {
    name: String,
    email: String,
    phone_number: String,
    country: String,
    city: String,
    state: String,
    resume: String,
    experience: String,
    jobTitle: String,
    state: String,
    linkedin_url: String,
    technical_expertise_in_skills: Array,
    Experience_level: String,
    skills: Array,
    Education: Array,
    work_experience: Array,
    image: String,
    workAuthorization: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("NonUsers_Resumes", userSchema);
