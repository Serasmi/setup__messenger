import React from 'react';
import {Session} from 'meteor/session';
import autobind from "autobind-decorator";
import {withTracker} from "meteor/react-meteor-data";
import Deers from "../api/deers";
import Messages from "../api/messages";

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import {withStyles} from '@material-ui/core/styles';

const styles = theme => ({
    content: {
        height: '100vh',
        alignContent: 'stretch',
        flexDirection: 'column',
    },
    contentHeader: {
        padding: '8px 16px',
        flexBasis: 50,
        display: 'flex',
    },
    contentHeaderInput: {
    },
    contentBody: {
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        paddingBottom: 16,
        height: 'calc(100vh - 270px)',
        overflowY: 'auto',
    },
    contentBodyMessageWrap: {

    },
    contentBodyMessage: {
        margin: 16,
        marginBottom: 0,
        marginRight: 64,
        padding: 8,
    },
    contentBodyMessageSelf: {
        margin: 16,
        marginBottom: 0,
        marginLeft: 64,
        padding: 8,
        alignSelf: 'flex-end',
        backgroundColor: 'rgba(0, 128, 255, 0.2)',
    },
    contentFooter: {
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        borderTop: '1px solid rgba(0, 0, 0, 0.12)',
        alignItems: 'flex-end',
        flexBasis: 200,
    },
    deerList: {
        paddingTop: 0,
    },
    iconWrap: {
        display: 'flex',
        justifyContent: 'center',
        padding: 8,
    },
    loginButton: {
        marginTop: 16,
    },
    loginWrap: {
        margin: 'auto',
        padding: 16,
        width: 400,
    },
    profile: {
        backgroundColor: 'rgba(0, 114, 255, 0.61)',
        color: 'white',
        padding: 8,
    },
    profileText: {
        marginLeft: 8,
        color: 'white',
    },
    rootContainer: {
        height: '100vh',
    },
    sidebar: {
        borderRight: '1px solid rgba(0, 0, 0, 0.12)',
        height: '100vh',
        overflowY: 'auto',
    },
});

const generateDeerId = () => Math.floor(Math.random() * 10000).toString().padStart(5, '0');

@withStyles(styles)

@withTracker(() => {
    const deer = Session.get('deer');
    const deers = Deers.find({}, {
        sort: {
            username: 1,
        }
    }).fetch();
    const selectedDeer = Session.get('selected-deer');
    let messages;

    if (deer && selectedDeer) {
        messages = Messages.find({
            $or: [
                {
                    senderId: deer._id,
                    receiverId: selectedDeer._id,
                },
                {
                    senderId: selectedDeer._id,
                    receiverId: deer._id,
                },
            ],
        }, {
            sort: {
                createdAt: -1,
            },
        }).fetch();
    }

    return {
        deer,
        deers,
        messages,
        selectedDeer,
    };
})

class App extends React.PureComponent {
    state = {
        message: '',
        username: 'Deer#00001' || `Deer#${generateDeerId()}`, // TODO: temp hack
    };

    @autobind
    handleInputChange(event) {
        this.setState({
            username: event.target.value,
        })
    }

    @autobind
    handleInputMessageChange(event) {
        this.setState({
            message: event.target.value,
        })
    }

    @autobind
    handleInputMessageKeyUp(event) {
        if(event.ctrlKey && (event.keyCode === 13 || event.keyCode === 10) ) {
            this.handleMessageSending();
        }
    }

    @autobind
    handleDeerSelection(deer) {
        Session.set('selected-deer', deer);
        setTimeout(() => {
            const messagesWrapper = document.getElementById('messagesWrapper');
            messagesWrapper.scrollTop = messagesWrapper.scrollHeight;
        }, 100);
    }

    @autobind
    handleMessageSending() {
        const {message} = this.state;
        const {deer, selectedDeer} = this.props;

        if (message && deer && selectedDeer) {
            Meteor.call('message.insert', {
                text: message,
                senderId: deer._id,
                receiverId: selectedDeer._id,
                // forwardedIds: [],
            }, (err, res) => {
                if (!err && res) {
                    // clear message in local state
                    this.setState({
                        message: '',
                    });
                } else {
                    console.log(err);
                }
            });
        }
    }

    @autobind
    login() {
        const {username} = this.state;

        if (username) {
            Meteor.call('deer.insert', {username}, (err, res) => {
                if (!err && res) {
                    Session.set('deer', res.deer);

                    // clear username in local state
                    this.setState({
                        username: '',
                    })
                }
            });
        }
    }

    render() {
        const {classes, deer, deers, messages, selectedDeer} = this.props;

        return (
            <div>
                <Grid container alignItems="center" className={classes.rootContainer}>
                    {
                        !deer
                            ? <Grid item xs={12}>
                                <Paper className={classes.loginWrap}>
                                    <div className={classes.iconWrap}>
                                        <Icon color="secondary" fontSize="large">lock</Icon>
                                    </div>
                                    <Typography variant="title" color="inherit" align="center">
                                        Sign in
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        label="Deer name*"
                                        margin="normal"
                                        onChange={this.handleInputChange}
                                        value={this.state.username}
                                    />
                                    <Button
                                        color="primary"
                                        className={classes.loginButton}
                                        fullWidth
                                        variant="contained"
                                        onClick={this.login}
                                        size="large"
                                    >
                                        Sign in
                                    </Button>
                                </Paper>
                            </Grid>
                            : <React.Fragment>
                                <Grid item xs={3} className={classes.sidebar}>
                                    <List className={classes.deerList}>
                                        <ListItem divider className={classes.profile}>
                                            <Icon fontSize="large">face</Icon>
                                            <Typography variant="h6" className={classes.profileText} inline>
                                                {deer.username}
                                            </Typography>
                                        </ListItem>
                                        {
                                            Array.isArray(deers)
                                            && deers.map(deer =>
                                                <ListItem
                                                    button
                                                    divider
                                                    key={deer._id}
                                                    onClick={() => this.handleDeerSelection(deer)}
                                                    selected={selectedDeer && selectedDeer._id === deer._id}
                                                >
                                                    {deer.username}
                                                </ListItem>)
                                        }
                                    </List>
                                </Grid>
                                <Grid item xs={9}>
                                    <Grid container className={classes.content}>
                                        <Grid item xs={12} className={classes.contentHeader}>
                                            {
                                                selectedDeer
                                                    ? <Typography variant="h6" color="inherit">
                                                        Chat with {selectedDeer.username}
                                                    </Typography>
                                                    : <React.Fragment>
                                                        <Icon color="secondary" fontSize="large">transit_enterexit</Icon>
                                                        <Typography variant="h6" color="secondary" inline>
                                                            Select some deer to chat
                                                        </Typography>
                                                    </React.Fragment>
                                            }
                                        </Grid>
                                        <Grid item xs={12} className={classes.contentBody} id="messagesWrapper">
                                            {
                                                Array.isArray(messages)
                                                && messages.map(message =>
                                                    <Paper
                                                        className={
                                                            message.senderId === deer._id
                                                            ? classes.contentBodyMessageSelf
                                                            : classes.contentBodyMessage
                                                        }
                                                        key={message._id}
                                                    >
                                                        <Typography variant="body1">
                                                            {message.text}
                                                        </Typography>
                                                    </Paper>)
                                            }
                                        </Grid>
                                        <Grid item xs={12} className={classes.contentFooter}>
                                            <TextField
                                                fullWidth
                                                label="Enter message*"
                                                margin="normal"
                                                multiline
                                                rows={3}
                                                rowsMax={3}
                                                className={classes.contentHeaderInput}
                                                onChange={this.handleInputMessageChange}
                                                onKeyUp={this.handleInputMessageKeyUp}
                                                value={this.state.message}
                                            />
                                            <Button
                                                color="primary"
                                                variant="contained"
                                                onClick={this.handleMessageSending}
                                                size="large"
                                            >
                                                Send
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </React.Fragment>
                    }
                </Grid>
            </div>
        )
    }
}

export default App;
