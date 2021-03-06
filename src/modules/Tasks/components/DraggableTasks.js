import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Motion, spring } from 'react-motion';
import { connect } from 'react-redux';

import events from 'shared/events';
import Task from 'modules/Task';

import { getClosestTaskFromPosition } from 'modules/DragAndDropHandler';

const springConfig = { stiffness: 300, damping: 50 };

class DraggablaTasks extends Component {
    static propTypes = {
        tasks: PropTypes.array.isRequired,
        unfilteredTasks: PropTypes.array.isRequired,
        setManualSortOrder: PropTypes.func.isRequired,
        setTaskMoving: PropTypes.func.isRequired,
        parentScrollTop: PropTypes.number.isRequired
    };

    constructor(props) {
        super(props);

        this.onPanStart = this.onPanStart.bind(this);
        this.onPanMove = this.onPanMove.bind(this);
        this.onPanEnd = this.onPanEnd.bind(this);
        this.onPanCancel = this.onPanCancel.bind(this);
        this.onTasksPositionsCalculated = this.onTasksPositionsCalculated.bind(this);

        this.state = {
            y: 0,
            initialYPosition: 0,
            initialTasks: [],
            isPressed: false,
            tasksPositions: [],
            parentScrollTopAtPanStart: 0
        };

        events.on('tasksPositionsCalculated', this.onTasksPositionsCalculated);
    }

    componentDidMount() {
        events.on('panstart:task', this.onPanStart);
        events.on('panmove:task', this.onPanMove);
        events.on('panend:task', this.onPanEnd);
        events.on('pancancel:task', this.onPanCancel);
    }

    componentWillUnmount() {
        events.off('tasksPositionsCalculated', this.onTasksPositionsCalculated);
        events.off('panstart:task', this.onPanStart);
        events.off('panmove:task', this.onPanMove);
        events.off('panend:task', this.onPanEnd);
        events.off('pancancel:task', this.onPanCancel);
    }

    onTasksPositionsCalculated({ tasksPositions }) {
        this.setState({
            tasksPositions
        });
    }

    onPanStart({ element }) {
        if (element) {
            const { tasksPositions } = this.state;
            const { tasks, parentScrollTop, setTaskMoving } = this.props;
            const { cuid } = element.dataset;
            const clientRectEl = tasksPositions.find(c => c.cuid === cuid);
            const top = clientRectEl ? clientRectEl.top : 0;

            this.setState({
                y: top,
                initialYPosition: top,
                isPressed: cuid,
                initialTasks: [...tasks],
                parentScrollTopAtPanStart: parentScrollTop
            });

            setTaskMoving({
                cuid,
                moving: true
            });
        }
    }

    onPanMove({ event, element }) {
        if (element) {
            const { tasks, unfilteredTasks, setManualSortOrder, parentScrollTop } = this.props;
            const { tasksPositions, initialYPosition, parentScrollTopAtPanStart } = this.state;
            const { cuid } = element.dataset;
            const clientRectEl = tasksPositions.find(c => c.cuid === cuid);
            const currentArrayPosition = tasks.findIndex(t => t.cuid === cuid);

            if (clientRectEl) {
                const y = initialYPosition + event.deltaY + (parentScrollTop - parentScrollTopAtPanStart);

                const closestTask = getClosestTaskFromPosition({
                    y: y + clientRectEl.clientRect.height / 2
                });
                const currentRow = closestTask.index;

                if (currentRow !== currentArrayPosition) {
                    let newTasks = [...tasks];
                    let switchWith = newTasks[currentRow];

                    if (switchWith) {
                        newTasks[currentRow] = newTasks[currentArrayPosition];
                        newTasks[currentArrayPosition] = switchWith;

                        // Get the unfiltered tasks (excluding the current filtered tasks)
                        const unfilteredTasksToAdd = unfilteredTasks.filter(task => {
                            return !newTasks.find(t => task.cuid === t.cuid);
                        });

                        setManualSortOrder({
                            tasks: [...newTasks, ...unfilteredTasksToAdd]
                        });
                    }
                }

                this.setState({
                    y
                });
            }
        }
    }

    onPanEnd() {
        this.props.setTaskMoving({
            cuid: this.state.isPressed,
            moving: false
        });

        this.setState({
            isPressed: false,
            y: 0,
            initialYPosition: 0
        });
    }

    onPanCancel() {
        this.props.setTaskMoving({
            cuid: this.state.isPressed,
            moving: false
        });

        this.props.setManualSortOrder({
            tasks: this.state.initialTasks
        });

        this.setState({
            isPressed: false,
            y: 0,
            initialYPosition: 0,
            initialTasks: []
        });
    }

    render() {
        const { y, isPressed, tasksPositions } = this.state;
        const { tasks } = this.props;

        if (!tasksPositions) {
            return null;
        }

        return (
            <div className="tasks tasks--draggable" ref={el => (this.refOuter = el)}>
                {tasks.map((task, i) => {
                    const rect = tasksPositions.find(c => c.cuid === task.cuid);
                    if (!rect) {
                        return null;
                    }

                    let style;
                    if (task.cuid === isPressed) {
                        style = {
                            scale: spring(1.05, springConfig),
                            shadow: spring(16, springConfig),
                            y
                        };
                    } else {
                        style = {
                            scale: spring(1, springConfig),
                            shadow: spring(0, springConfig),
                            y: spring(rect.top, springConfig)
                        };
                    }

                    return (
                        <Motion style={style} key={task.cuid}>
                            {({ scale, shadow, y }) => (
                                <div
                                    className="tasks--draggable_item"
                                    style={{
                                        height: `${rect.clientRect.height}px`,
                                        boxShadow: `rgba(0, 0, 0, 0.2) 0px ${shadow}px ${2 * shadow}px 0px`,
                                        transform: `translate3d(0, ${y}px, 0) scale(${scale})`,
                                        WebkitTransform: `translate3d(0, ${y}px, 0) scale(${scale})`,
                                        zIndex: task.cuid === isPressed ? 99 : i
                                    }}
                                >
                                    <Task task={task} />
                                </div>
                            )}
                        </Motion>
                    );
                })}
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        tasksPositions: state.tasks.tasksPositions
    };
};

export default connect(mapStateToProps)(DraggablaTasks);
