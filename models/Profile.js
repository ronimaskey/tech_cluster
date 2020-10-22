const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    profession: {
        type: String
    },
    currentcity: {
        type: String,
        required: true
    },
    homecity: {
        type: String,
        required: true
    },
    education: {
        type: String,
        required: true
    },
    collegeuniversity: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    hobby: {
        type: [String],
        required: true
    },
    workexperience: [
        {
            title: {
                type: String
            },
            company: {
                type: String
            },
            location: {
                type: String
            },
            from: {
                type: Date
            },
            to: {
                type: Date
            },
            current: {
                type: Boolean,
                default: false
            },
            description: {
                type: String,
            }
        }
    ]

});

module.exports = Profile = mongoose.model('profile', ProfileSchema);