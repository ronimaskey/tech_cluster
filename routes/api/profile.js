const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const {
    check,
    validationResult
} = require('express-validator/check');

const Profile = require('../../models/Profile');

// @route  GET api/profile/me
// @desc   Get current users profile
// @access Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        }).populate(
            'user',
            ['name', 'avatar']
        );
        if (!profile) {
            return res.status(400).json({
                msg: 'No profile picture'
            });
        }
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route  POST api/profile
// @desc   Create or update user profile
// @access Private
router.post('/', [auth, [
        check('status', 'Status is required')
        .not()
        .isEmpty(),
        check('hobby', 'hobby is required')
        .not()
        .isEmpty()
    ]],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const {
            profession,
            currentcity,
            homecity,
            education,
            collegeuniversity,
            gender,
            status,
            hobby,
        } = req.body;

        //Build profile object
        const profileFields = {};
        profileFields.user = req.user.id;
        if (profession) profileFields.profession = profession;
        if (currentcity) profileFields.currentcity = currentcity;
        if (homecity) profileFields.homecity = homecity;
        if (education) profileFields.education = education;
        if (collegeuniversity) profileFields.collegeuniversity = collegeuniversity;
        if (gender) profileFields.gender = gender;
        if (status) profileFields.status = status;
        if (hobby) {
            profileFields.hobby = hobby.split(',').map(hobby => hobby.trim());
        }

        
        try{
            let profile = await Profile.findOne({ user: req.user.id});

            if (profile) {
                // Update
                profile = await Profile.findOneAndUpdate({ user: req.user.id}, 
                    { $set: profileFields }, 
                    { new: true }
                );

                return res.json(profile);
            }

            // Create 
            profile = new Profile(profileFields);

            await profile.save();
            res.json(profile);

        } catch(err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

// @route  GET api/profile
// @desc   Get all profiles
// @access Public
router.get('/', async (req, res) => {
    try {
        const profile = await Profile.find().populate(
            'user',
            ['name', 'avatar']
        );
    
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route  GET api/profile/user/:user_id
// @desc   Get profile by user ID
// @access Public

router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne( {user:req.params.user_id} ).populate(
            'user',
            ['name', 'avatar']);
            if(!profile) 
                return res.status(400).json({msg: 'There is no profile for this user'});
            res.json(profile);
    } catch (err) {
        console.error(err.message);
        if(err.kind == 'ObjectId'){
            return res.status(400).json({msg: 'Profile not found'});
        }
        res.status(500).send('Server error');
    }
});

// @route  DELETE api/profile
// @desc   Delete profile, user & posts
// @access Private
router.delete('/', auth, async (req, res) => {
    try {
        // @todo - remove users posts

        // Remove profile
        await Profile.findOneAndRemove( {
            user: req.user.id
        });
        // Remove user
        await Profile.findOneAndRemove( {
            _id: req.user.id
        });
    
        res.json({ msg: 'User deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route  PUT api/profile/ workexperience
// @desc   Add profile  workexperience
// @access Private
router.put('/workexperience', [auth,
    [
        check('title', 'Title is empty')
        .not()
        .isEmpty(),
        check('company', 'Company Name is empty')
        .not()
        .isEmpty(),
        check('location', 'Location is empty')
        .not()
        .isEmpty(),
        check('from', 'Start date is empty')
        .not()
        .isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors:errors.array });
        }
        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } = req.body;

        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } 
        try{
            const profile = await Profile.findOne( {user:req.user.id} );

            profile.workexperience.unshift(newExp);

            await profile.save();

            res.json(profile);
        } catch (err){
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
], 
async (req, res) => {

});

// @route  DELETE api/profile/ workexperience/:exp_id
// @desc   Delete workexperience from profile
// @access Private
router.delete('/workexperience/:exp_id', auth, async (req, res) => {
    try{
        const profile = await Profile.findOne( {user:req.user.id} );

        // Get remove index
        const removeIndex = profile.workexperience.map(item => item.id).indexOf
        (req.params.exp_id);

        profile.workexperience.splice(removeIndex, 1);

        await profile.save();

        res.json(profile);

    } catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;