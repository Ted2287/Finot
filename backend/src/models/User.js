const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  fatherName: {
    type: String,
    required: [true, "Father's name is required"],
    trim: true
  },
  grandfatherName: {
    type: String,
    required: [true, "Grandfather's name is required"],
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  emergencyContactName: {
    type: String,
    required: [true, 'Emergency contact name is required'],
    trim: true
  },
  emergencyContactPhone: {
    type: String,
    required: [true, 'Emergency contact phone number is required'],
    trim: true
  },
  usesTelegram: {
    type: String,
    enum: ['Yes', 'No', 'አዎ', 'አይ', 'አዎ እጠቀማለሁ', 'አይ አልጠቀምም'],
    default: 'Yes'
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'ወንድ', 'ሴት', 'Other', 'Prefer not to say'],
    required: [true, 'Gender is required']
  },
  maritalStatus: {
    type: String,
    enum: ['Single', 'Married', 'Divorced', 'Widowed', 'ያላገባ', 'ያገባ'],
    required: [true, 'Marital status is required']
  },
  spouseName: {
    type: String,
    trim: true,
    required: [
      function() { return this.maritalStatus === 'Married' || this.maritalStatus === 'ያገባ'; },
      'Spouse name is required if married'
    ]
  },
  educationLevel: {
    type: String,
    trim: true
  },
  graduationInstitution: {
    type: String,
    trim: true
  },
  fieldOfStudy: {
    type: String,
    trim: true
  },
  joinedYear: {
    type: String,
    trim: true
  },
  grewUpInChildrenClass: {
    type: String,
    enum: ['Yes', 'No', 'አዎ', 'አይ']
  },
  sundaySchoolGrade: {
    type: String,
    trim: true
  },
  notStudyingReason: {
    type: String,
    trim: true
  },
  serviceSubSection: {
    type: String,
    trim: true
  },
  servedInOtherParish: {
    type: String,
    enum: ['Yes', 'No', 'አዎ', 'አይ', 'አዎ አገልግያለሁ', 'አይ አላገለገልኩም']
  },
  previousServiceSubSection: {
    type: String,
    trim: true
  },
  hasFatherConfessor: {
    type: String,
    enum: ['Yes', 'No', 'አዎ', 'አይ', 'አዎ አለኝ', 'አይ የለኝም'],
    required: [true, 'Father confessor status is required']
  },
  fatherConfessorName: {
    type: String,
    trim: true
  },
  fatherConfessorParish: {
    type: String,
    trim: true
  },
  fatherConfessorPhone: {
    type: String,
    trim: true
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, trim: true }
  },
  occupation: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['ADMIN', 'USER'],
    default: 'USER'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Pre-validate hook to set fallback for lastName
UserSchema.pre('validate', function(next) {
  if (!this.lastName && this.fatherName) {
    this.lastName = this.fatherName;
  }
  next();
});

// Create indexes
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });

// Pre-save hook to hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
