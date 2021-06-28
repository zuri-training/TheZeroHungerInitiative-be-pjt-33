const { Schema, model } = require('mongoose');


const monetaryDonationSchema = new Schema({
  email: {
    type: String,
    required: [true, 'Please provide your email address']
  },
  amount: {
    type: Number,
    required: true
  },
  donorName: {
    type: String,
    required: true
  },
  referenceId: {
    type: String,
  },
  transactionStatus: {
    type: String,
    enum: ['unknown', 'abandoned', 'successful'],
    default: 'unknown'
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });


module.exports = model('MonetaryDonation', monetaryDonationSchema);