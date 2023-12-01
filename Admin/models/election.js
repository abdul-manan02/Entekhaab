import mongoose from 'mongoose';

const electionSchema = new mongoose.Schema({
    
    electionType: {
        type: String,
        enum: {
            values: ['General Elections', 'By Elections'],
            message: '${VALUE} must be provided'
        },
        required: [true, 'Election type must be provided']
    },
    electionTime: {
        type: Date,
        default: Date.now
    },

    constituencies: [{
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Constituency must be provided']
    }],
    voter_bank: [{
        voterId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Voter ID must be provided']
        },
        hasVoted: {
            type:Boolean,
            default: false
        }
    }],

    // get partyId from candidateId
    candidates: [{
        candidateId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },
        partyId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },
        constituencyId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },
        votesReceived: {
            type: Number,
            default: 0
        }
    }],
    // search through candidates arrow by using constituencyId, find greatest votesReceived value
    // then, store info here
    winners: [{
        constituencyId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },
        candidateId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },
        partyId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },
        votesReceived: {
            type: Number,
            default: 0
        }
    }],

    // same scheme as winners
    totalSeatsByParty: [{
        partyId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },
        seatsWon: {
            type: Number,
            default: 0
        }
    }],
    // there are 2 majority parties, one for the national assembly and one for the provincial assembly
    // for provinicial, there can be four majority parties, respective for each province
    majorityPartyId: {
        nationalAssembly: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
            seatsWon: {
                type: Number,
                default: 0
            }
        },
        provincialAssembly: {
            punjab: {
                type: mongoose.Schema.Types.ObjectId,
                default: null,
                seatsWon: {
                    type: Number,
                    default: 0
                }
            },
            sindh: {
                type: mongoose.Schema.Types.ObjectId,
                default: null,
                seatsWon: {
                    type: Number,
                    default: 0
                }
            },
            khyber_pakhtunkhwa: {
                type: mongoose.Schema.Types.ObjectId,
                default: null,
                seatsWon: {
                    type: Number,
                    default: 0
                }
            },
            balochistan: {
                type: mongoose.Schema.Types.ObjectId,
                default: null,
                seatsWon: {
                    type: Number,
                    default: 0
                }
            },
        },
    },

    voterTurnoutPercentage: Number,
    postElectionReactions: [String]
});

const Election = mongoose.model('Election', electionSchema);