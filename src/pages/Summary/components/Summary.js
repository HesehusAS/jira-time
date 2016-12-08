import moment from 'moment';
import React, { Component, PropTypes } from 'react';

import { getWorkLogs } from 'shared/jiraClient';
import HistoryRecordItem from 'modules/HistoryRecordItem';
import HistorySpaceItem from 'modules/HistorySpaceItem';
import { getElapsedTime } from 'store/reducers/recorder';

import LoadingIcon from 'assets/loading.svg';

import './Summary.scss';

export default class Summary extends Component {

  static get propTypes () {
    return {
      profile: PropTypes.object.isRequired,
      notSyncedRecords: PropTypes.array.isRequired,
      activeRecord: PropTypes.object
    }
  }

  constructor (props) {
    super(props);

    this.state = {
      loading: true
    };
  }

  componentDidMount () {

    const startDate = moment().second(0).minute(0).hour(0);
    const endDate = moment().second(0).minute(0).hour(0).add(1, 'days');

    getWorkLogs({
      startDate,
      endDate,
      username: this.props.profile.username
    })
    .then(records => this.setState({ loading: false, records }))
    .catch(() => this.setState({ loading: false, error: 'Could not get worklogs' }));
  }

  render () {

    const { loading, records } = this.state;
    let { notSyncedRecords, activeRecord } = this.props;

    if (!records || loading) {
      return (
        <div className='summary summary--loading'>
          <img src={LoadingIcon} alt='Loading' />
        </div>
      );
    }

    if (records && records.length === 0 && notSyncedRecords.length === 0) {
      return (
        <div className='summary summary--no-found'>
          No worklogs found today
        </div>
      );
    }

    // Filter out active record
    if (activeRecord) {
      notSyncedRecords = notSyncedRecords.filter(r => r.cuid !== activeRecord.cuid);
    }

    // Combine the synced and not synced records
    let outputRecords = [...notSyncedRecords, ...records];
    if (activeRecord) {
      outputRecords.push(Object.assign({}, activeRecord));
    }

    // Momentify
    outputRecords.forEach((r) => {
      r.startTime = moment(r.startTime);
      r.endTime = moment(r.endTime);
    });

    // Sort by time started
    outputRecords = outputRecords.sort((a, b) => a.startTime.unix() - b.startTime.unix());

    // Calculate duration
    let duration = moment.duration();
    outputRecords.forEach((r) => {
      duration.add(r.endTime.unix() - r.startTime.unix(), 'seconds');
    });

    // Compose list with empty spaces within
    let outputItems = [];
    outputRecords.forEach((record, index) => {
      const prev = outputRecords[index - 1];
      if (prev) {

        // Consider everything over 1s as a space
        const duration = record.startTime.unix() - prev.endTime.unix();
        if (duration > 1) {
          const elapsedTime = getElapsedTime({
            startTime: prev.endTime,
            endTime: record.startTime
          });
          outputItems.push(<HistorySpaceItem elapsedTime={elapsedTime} />);
        }
      }

      outputItems.push(<HistoryRecordItem record={record} />);
    });

    return (
      <div className='summary'>
        <table className='summary-table'>
          {outputItems}
        </table>
        <div>Total: {duration.hours()}h {duration.minutes()}m {duration.seconds()}s</div>
      </div>
    );
  }
}