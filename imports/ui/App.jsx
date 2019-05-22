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
    main: {
        height: 300, // TODO: temp hack
    },
    sidebar: {
        borderRight: '1px solid rgba(0, 0, 0, 0.12)',
        height: '100vh',
    },
});

const generateDeerId = () => Math.floor(Math.random() * 10000).toString().padStart(5, '0');

@withStyles(styles)

@withTracker(() => {
    const deer = Session.get('deer');
    const deers = Deers.find({}).fetch();
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
    handleDeerSelection(deer) {
        Session.set('selected-deer', deer);
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
                <Grid container>
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
                                    <List>
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
                                <Grid item xs={9} className={classes.content}>
                                    <Grid container>
                                        <Grid item xs={12} className={classes.main}>
                                            {/*  TODO: add main frame component  */}
                                        </Grid>
                                        <Grid item xs={12}>
                                            <input
                                                type="text"
                                                onChange={this.handleInputMessageChange}
                                                value={this.state.message}
                                            />
                                            <button onClick={this.handleMessageSending}>Send</button>
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
