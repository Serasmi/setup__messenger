import React from 'react';
import { Session } from 'meteor/session';
import autobind from "autobind-decorator";
import { withTracker } from "meteor/react-meteor-data";
import Deers from "../api/deers";

import Grid from '@material-ui/core/Grid';


@withTracker(() => {
    const deer = Session.get('deer');
    const deers = Deers.find({}).fetch();

    return {
        deer,
        deers,
    };
})

class App extends React.PureComponent {

    state = {
        username: '',
    };

    @autobind
    handleInputChange(event) {
        this.setState({
            username: event.target.value,
        })
    }

    @autobind
    login() {
        const {username} = this.state;

        if (username) {
            Meteor.call('deer.insert', {username}, (err, res)=>{
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
        const {deer, deers} = this.props;

        return (
            <div>
                {
                    !deer
                    ? <React.Fragment>
                        <input
                            type="text"
                            onChange={this.handleInputChange}
                        />
                        <button onClick={this.login}>Sing in</button>
                    </React.Fragment>
                    : <React.Fragment>
                        <div>
                            {
                                Array.isArray(deers)
                                && deers.map(deer =>
                                    <div key={deer._id}>
                                        {deer._id}: {deer.username}
                                    </div>)
                            }
                        </div>
                        <div>
                            <input
                                type="text"
                                onChange={()=>{}}
                            />
                            <button onClick={()=>{}}>Send</button>
                        </div>
                    </React.Fragment>
                }
            </div>
        )
    }
}

export default App;
