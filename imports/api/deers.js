import { Mongo } from 'meteor/mongo';

const Deers = new Mongo.Collection('deers');

Meteor.methods({
    'deer.insert': function({username}) {
        let deer = Deers.findOne({username});

        if (!deer){
            deer = {username};
            const _id = Deers.insert(deer);
            deer._id = _id;
        }

        return {
            deer,
        };
    }
});

export default Deers;
