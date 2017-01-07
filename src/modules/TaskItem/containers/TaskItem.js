import { connect } from 'react-redux';

import {
  removeTask,
  refreshIssue,
  setIssueRefreshing,
  setIssueRemainingEstimate,
  getMovingTask
} from 'store/reducers/tasks';

import {
  addRecord,
  startRecording,
  getMovingRecord
} from 'store/reducers/recorder';

import TaskItem from '../components/TaskItem';

const mapStateToProps = (state) => ({
    movingRecord: getMovingRecord({ state }),
    movingTask: getMovingTask({ state })
});

const mapDispatchToProps = {
    removeTask,
    refreshIssue,
    setIssueRefreshing,
    setIssueRemainingEstimate,
    startRecording,
    addRecord
};

export default connect(mapStateToProps, mapDispatchToProps)(TaskItem);
