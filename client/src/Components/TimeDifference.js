import React, { useState, useEffect } from 'react';
import moment from 'moment';

const TimeDifference = ({ dbTime }) => {
  const [relativeTime, setRelativeTime] = useState('');

  useEffect(() => {
    const calculateRelativeTime = () => {
      const now = moment();
      const dbDateTime = moment(dbTime);
      const difference = now.diff(dbDateTime);

      // Display relative time difference
      const relativeTimeString = moment.duration(difference).humanize(true);

      setRelativeTime(relativeTimeString);
    };

    // Call the function initially
    calculateRelativeTime();

    // Update every minute to keep the relative time up to date
    const intervalId = setInterval(calculateRelativeTime, 60000);

    // Clear the interval on component unmount
    return () => clearInterval(intervalId);
  }, [dbTime]);

  return (
    <div>
      <p>{relativeTime}</p>
    </div>
  );
};

export default TimeDifference;
