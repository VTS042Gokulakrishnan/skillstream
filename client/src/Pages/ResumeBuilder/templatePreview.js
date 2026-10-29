import { blankContent, defaults } from './resumeTemplate';
import portrait from './templatePreviewPhoto.json';

// Gallery-only content: never copied into a new draft or an existing resume.
export function templatePreview(template, order) {
  const column = ['atlantic-blue', 'accentuated-red'].includes(template);
  const content = {
    ...blankContent(),
    personal: { name: 'Alex Morgan', headline: 'Senior Business Consultant', email: 'alex.morgan@example.com', phone: '+1 312 555 0148', location: 'Chicago, Illinois', linkedin: 'linkedin.com/in/alex-morgan', website: '', photo: portrait },
    summary: 'Business consultant with 8 years of experience helping organizations improve operations, grow customer relationships and deliver lasting results. Combines analytical thinking with a collaborative leadership style to turn complex challenges into practical plans. Experienced in guiding cross-functional teams from discovery through successful delivery.',
    experience: [
      { id: 'preview-1', title: 'Senior Business Consultant', organization: 'Northstar Advisory', location: 'Chicago, IL', start: '2022', end: 'Present', description: '- Led transformation projects for retail and technology clients, improving operational efficiency by 24%.\n- Partnered with executive teams to define strategy, performance measures and quarterly delivery plans.\n- Managed a team of six consultants and presented actionable recommendations to senior stakeholders.' },
      { id: 'preview-2', title: 'Business Consultant', organization: 'BrightPath Partners', location: 'Boston, MA', start: '2019', end: '2022', description: '- Analyzed customer journeys and redesigned processes to reduce service response times by 30%.\n- Facilitated workshops across sales, finance and operations to align priorities and resolve delivery risks.\n- Built reporting dashboards that supported investment decisions and tracked program outcomes.' },
      { id: 'preview-3', title: 'Business Analyst', organization: 'Horizon Solutions', location: 'Austin, TX', start: '2017', end: '2019', description: '- Researched market opportunities and prepared business cases for new service offerings.\n- Translated stakeholder requirements into clear project plans and process documentation.\n- Supported implementation teams through testing, training and post-launch improvement.' },
    ],
    education: [
      { id: 'preview-4', title: 'Master of Business Administration', organization: 'Lakeview University', start: '2015', end: '2017', description: 'Concentration in strategy and organizational leadership.' },
      { id: 'preview-5', title: 'B.S. in Business Administration', organization: 'University of Illinois', start: '2011', end: '2015', description: 'Graduated with honors.' },
    ],
    skills: '- Strategic planning\n- Stakeholder management\n- Business analysis\n- Process improvement\n- Project leadership\n- Financial modeling',
    languages: 'English — Native\nSpanish — Professional proficiency\nFrench — Conversational',
    certifications: [{ id: 'preview-6', title: 'Project Management Professional (PMP)', organization: 'Project Management Institute', description: '' }, { id: 'preview-7', title: 'Lean Six Sigma Green Belt', organization: 'Professional certification', description: '' }],
    awards: [{ id: 'preview-8', title: 'Excellence in Client Delivery', organization: 'Northstar Advisory', description: 'Recognized for exceptional client outcomes and collaborative team leadership.' }],
  };
  if (column) content.experience = content.experience.slice(0, 2);
  else {
    content.awards = [];
    content.education.forEach(entry => { entry.description = ''; });
    content.skills = 'Strategic planning • Stakeholder management • Business analysis\nProcess improvement • Project leadership • Financial modeling';
    content.languages = 'English — Native · Spanish — Professional · French — Conversational';
  }
  return { title: 'Template preview', template, content, settings: { ...defaults, order, fontSize: 10, spacing: 1.2, margin: 14, hidden: [], headings: {} } };
}
