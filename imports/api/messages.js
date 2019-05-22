import {Mongo} from 'meteor/mongo';
import {check, Match} from 'meteor/check';

const Messages = new Mongo.Collection('messages');

Meteor.methods({
    'message.insert': function ({
                                    text,
                                    senderId,
                                    receiverId,
                                    forwardedIds = [],
                                }) {
        console.dir(arguments);

        check(text, String);
        check(senderId, String);
        check(receiverId, String);
        check(forwardedIds, [Match.Maybe(String)]);
        // check(forwardedIds, Match.OneOf([Match.Maybe(String)], []));

        const _id = Messages.insert({
            text,
            senderId,
            receiverId,
            forwardedIds,
        });

        return { _id };
    }
});

export default Messages;
