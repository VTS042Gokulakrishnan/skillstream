const mongoose = require("mongoose");
const schema = mongoose.Schema;
const userSchema = new schema(
  {
    policyAcceptance: { termsVersion: String, privacyVersion: String, employerTerms: Boolean, role: String, acceptedAt: Date },
    googleId: String,
    userId: String,
    email: String,
    region: String,
    name: String,
    password: String,
    role: String,
    securityCode: String,
    isEmailVerified: Boolean,
    phone_number: String,
    website: String,
    currentSalary: String,
    expectedSalary: String,
    experience: String,
    work_experience: Array,
    Education: Array,
    awards: Array,
    age: String,
    educationLevels: String,
    language: Array,
    position: String,
    jobTitle: String,
    allowInSearch: String,
    description: String,
    image: String,
    social: {
      facebook: String,
      twitter: String,
      linkedIn: String,
      googlePlus: String,
    },
    country: String,
    state: String,
    city: String,
    address: String,
    skills: Array,
    gender: String,
    shortlistedJobs: Array,
    resume: String,
    jobAlerts: Array,
    appliedJobs: Array,
    notifications: Array,
    profileCompleted: Boolean,
    isResumeUploaded: Boolean,
    profileViews: [],
    messages: [],
    practiceInterview: Array,
    codingPracticeInterview: Array,
    codingPracticeInterviewCount: { type: Number, default: 0, min: 0 },
    practiceInterviewCount: { type: Number, default: 0, min: 0 },
    practiceDemoAccess: {
      enabled: { type: Boolean, default: false },
      grantId: String,
      grantedAt: Date,
      expiresAt: Date,
      allowedTypes: { type: [String], enum: ["video", "coding"], default: [] },
      remainingInterviews: { type: Number, default: 0, min: 0 },
    },
    practicePurchased: { type: Boolean, default: false },
    practiceUnlimitedUntil: Date,
    practicePayments: { type: [String], default: [] },
    practiceResetVersion: String,
    practiceSessions: [new schema({
      id: String,
      type: { type: String, enum: ["video", "coding"] },
      state: String,
      charged: Boolean,
        demoGrantId: String,
      expiresAt: Date,
      lockUntil: Date,
      lockId: String,
      questionsRemaining: Number,
      startResponse: mongoose.Schema.Types.Mixed,
    }, { _id: false })],
    lastLoggedIn: Date,
    preferred_locations: Array,
    workAuthorization: String,
    allResumes: [
      {
        type: {
          type: String,
          enum: ["Primary", "Secondary"],
          required: true,
        },
        resumeUrl: {
          type: String,
          required: true,
        },
        dateAdded: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    resumeSequence: Number,
  },
  { timestamps: true }
);

// Legacy records can contain negative balances from older deduction logic.
// Repair in MongoDB so a login cannot overwrite concurrently purchased credits.
userSchema.statics.recordLogin = function (candidateId) {
  return this.updateOne({ _id: candidateId }, {
    $set: { lastLoggedIn: new Date() },
    $max: { practiceInterviewCount: 0, codingPracticeInterviewCount: 0 },
  }, { runValidators: true });
};

module.exports = mongoose.model("Candidate", userSchema);
