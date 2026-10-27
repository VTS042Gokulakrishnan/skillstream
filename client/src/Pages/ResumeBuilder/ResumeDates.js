import React, { useId, useState } from 'react';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { parseResumeDate, dateRangeError } from './resumeTemplate';

function DateField({ label, value, disabled, onChange }) {
  const parsed = parseResumeDate(value);
  const [precision, setPrecision] = useState(parsed?.precision || 'day');
  const id = useId();
  const matching = parsed && parsed.precision === precision;
  const date = matching ? dayjs(`${parsed.year}-${String(parsed.month).padStart(2,'0')}-${String(parsed.day).padStart(2,'0')}`) : null;
  const formats = { day: ['DD/MM/YY', 'YYYY-MM-DD'], month: ['MM/YY', 'YYYY-MM'], year: ['YYYY', 'YYYY'] };
  return <div className="rb-date-field"><div className="rb-date-label"><label htmlFor={id}>{label}</label><select aria-label={`${label} precision`} value={precision} disabled={disabled} onChange={e => setPrecision(e.target.value)}><option value="day">Exact date</option><option value="month">Month only</option><option value="year">Year only</option></select></div>
    <DatePicker id={id} aria-label={label} value={disabled ? null : date} disabled={disabled} picker={precision === 'day' ? 'date' : precision} format={formats[precision][0]} placeholder={disabled ? 'Present' : formats[precision][0]} inputReadOnly allowClear onChange={next => onChange(next ? next.format(formats[precision][1]) : '')} />
    {!disabled && value && !parsed && <small className="rb-date-warning">Saved value: {value}. Choose a date to replace this older format; it will be kept until then.</small>}
    {!disabled && parsed && !matching && <small>Saved value: {value}. Select a new date to change its precision.</small>}
  </div>;
}
export default function ResumeDates({ entry, section, onChange }) {
  const current = entry.current === true || /^present$/i.test(entry.end || '');
  const issue = dateRangeError(entry);
  return <div className="rb-dates"><div className="rb-grid"><DateField label="Start date" value={entry.start} onChange={start => onChange({ start })} /><DateField label="End date" value={entry.end} disabled={current} onChange={end => onChange({ end })} /></div>
    <label className="rb-present"><input type="checkbox" checked={current} onChange={e => onChange({ current: e.target.checked, end: /^present$/i.test(entry.end || '') ? '' : entry.end })} />{section === 'projects' ? 'Ongoing project (Present)' : 'Currently working here (Present)'}</label>
    {issue && <p role="alert" className="rb-date-warning">{issue}</p>}
    <small>Choose DD/MM/YY dates. The resume displays MM/YY. Older month/year dates keep their original precision.</small>
  </div>;
}
