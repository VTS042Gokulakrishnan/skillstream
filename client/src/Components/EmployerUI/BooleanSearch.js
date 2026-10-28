import React, { useState } from "react";
import { Input, Select } from "antd";

export default function BooleanSearch({ value, onChange, options = [] }) {
  const [groups, setGroups] = useState({ all: [], any: [], none: [] });
  const [built, setBuilt] = useState("");
  const changeGroup = (key, values) => {
    const next = { ...groups, [key]: values };
    setGroups(next);
    const quote = word => `"${word.replace(/"/g, "").trim()}"`;
    const parts = [...next.all.map(quote)];
    if (next.any.length) parts.push(`(${next.any.map(quote).join(" OR ")})`);
    next.none.forEach(word => parts.push(`NOT ${quote(word)}`));
    const expression = parts.join(" AND ");
    setBuilt(expression);
    onChange(expression);
  };
  const custom = value !== built && value.trim();
  return <section className="em-card" aria-label="Boolean skill search"><h2>Boolean skill search</h2>
    <div className="em-boolean-grid">{[["all", "All these skills (AND)"], ["any", "Any of these skills (OR)"], ["none", "Exclude skills (NOT)"]].map(([key, label]) => <div key={key}><label htmlFor={`boolean-${key}`}>{label}</label><Select id={`boolean-${key}`} mode="tags" value={custom ? [] : groups[key]} onChange={v => changeGroup(key, v)} options={options} tokenSeparators={[","]} placeholder="Type or select skills" aria-label={label} /></div>)}</div>
    <label htmlFor="boolean-query">Boolean query</label><Input id="boolean-query" value={value} onChange={e => onChange(e.target.value)} placeholder={'React AND (TypeScript OR "JavaScript") NOT PHP'} maxLength={2000} />
    <p style={{ margin: "10px 0 0", fontSize:12, color:"#71819b" }}>{custom ? "Custom query · Editing a skill group will build a new expression." : "Use AND, OR, NOT, parentheses and quoted phrases to refine your results."}</p>
  </section>;
}
