import PropTypes from 'prop-types';
import React, { Component } from 'react';
import calculateScrollbarWidth from 'scrollbar-width';

import TasksHeader from 'modules/TasksHeader';
import Loader from 'modules/Loader';
import lazyDog from 'assets/lazy-dog.png';
import TasksInLimbo from 'modules/TasksInLimbo';
import RealTasks from './RealTasks';
import DraggableTasks from './DraggableTasks';

import './Tasks.scss';

let scrollbarWidth;

export default class Tasks extends Component {
    static propTypes = {
        profile: PropTypes.object.isRequired,
        tasks: PropTypes.array.isRequired,
        tasksSearch: PropTypes.string,
        setManualSortOrder: PropTypes.func.isRequired,
        setTaskMoving: PropTypes.func.isRequired,
        unfilteredTasks: PropTypes.array.isRequired
    };

    constructor(props) {
        super(props);

        this.onScroll = this.onScroll.bind(this);

        this.state = {
            scrollTop: 0
        };
        scrollbarWidth = calculateScrollbarWidth();
    }

    componentDidMount() {
        this.mountTimeout = setTimeout(() => {
            this.setState({
                delayedMount: true
            });
        }, 25);
    }

    componentWillUnmount() {
        clearTimeout(this.mountTimeout);
    }

    onScroll(event) {
        this.setState({
            scrollTop: event.target.scrollTop
        });
    }

    render() {
        const { profile, tasks, tasksSearch, setManualSortOrder, setTaskMoving, unfilteredTasks } = this.props;
        const { enableAnimations, verticalLimboSplit } = profile.preferences;
        const { delayedMount, scrollTop } = this.state;

        // Show loading spinner when mounted the first time and there are a lot of items
        if (!delayedMount && tasks.length > 10) {
            return (
                <div className="tasks-outer tasks-outer--loading">
                    <Loader />
                </div>
            );
        }

        let tasksListOutput;

        if (tasks.length === 0) {
            if (unfilteredTasks.length > 0) {
                tasksListOutput = (
                    <div className="tasks-list-wrap tasks-list-wrap--center">
                        <div>{`Dude, there is no such thing as "${tasksSearch}"`}</div>
                    </div>
                );
            } else {
                // Tell the user to start working
                tasksListOutput = (
                    <div className="tasks-list-wrap tasks-list-wrap--center">
                        <img className="tasks__lazy-dog" src={lazyDog} alt="Lazy dog" />
                        <div>You have not added any tasks, you lazy dog!</div>
                        <div className="tasks-add-instructions">Add new tasks by pressing "a"</div>
                    </div>
                );
            }
        } else {
            tasksListOutput = (
                <div
                    className={`tasks-list-wrap ${verticalLimboSplit ? 'tasks-list-wrap--vertical' : ''}`}
                    onScroll={this.onScroll}
                >
                    <RealTasks tasks={tasks} enableAnimations={enableAnimations} />
                    {enableAnimations && (
                        <DraggableTasks
                            tasks={tasks}
                            unfilteredTasks={unfilteredTasks}
                            setTaskMoving={setTaskMoving}
                            setManualSortOrder={setManualSortOrder}
                            parentScrollTop={scrollTop}
                        />
                    )}
                </div>
            );
        }

        // Output the list of tasks
        return (
            <div className="tasks-outer">
                <div className="tasks">
                    <div className="tasks-header-container" style={{ marginRight: `${scrollbarWidth}px` }}>
                        <TasksHeader />
                    </div>
                    <div className="tasks-container" style={verticalLimboSplit ? { flexDirection: 'row' } : null}>
                        <TasksInLimbo />
                        {tasksListOutput}
                    </div>
                </div>
            </div>
        );
    }
}
