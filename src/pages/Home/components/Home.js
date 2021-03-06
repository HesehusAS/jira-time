import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Tasks from 'modules/Tasks';
import Login from 'modules/Login';

import './Home.scss';

export class Home extends Component {
    static get contextTypes() {
        return {};
    }

    static get propTypes() {
        return {
            loggedIn: PropTypes.bool.isRequired
        };
    }

    render() {
        return <div className="home">{this.props.loggedIn ? <Tasks /> : <Login />}</div>;
    }
}

export default Home;
