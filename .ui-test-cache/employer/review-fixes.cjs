const fs=require('fs');function edit(p,f){fs.writeFileSync(p,f(fs.readFileSync(p,'utf8').replace(/\r\n/g,'\n')))}
edit('client/src/Components/PublicSite/PublicHeader.js',s=>s.replace('{employer && <Link to="/blog">Resources</Link>}','{employer && <Link to="/blog">Resources</Link>}\n          {!role && pathname === "/employers" && <Link to="/">Job seeker</Link>}\n          {!role && ["/", "/employers"].includes(pathname) && <Link to="/community">Community</Link>}'));
edit('client/src/Components/EmployerUI/EmployerWorkspace.js',s=>s.replace('    { key: "community", label: <Link to="/community">Community</Link> },\n',''));
edit('client/src/Pages/Employers/AiResumeSearch.js',s=>{
 const start=s.indexOf('  const columns = [');const end=s.indexOf('  const handleModalOk',start);let b=s.slice(start,end);
 const widths=[64,200,220,120,140,140,150,180,130];let n=0;
 b=b.replace(/width: "\d+%", \/\/ Adjusted width/g,()=>`width: ${widths[n++===6?8:n-1]},`);
 b=b.replace('key: "city",','key: "city",\n      width: 150,\n      className: "em-ai-location-cell",');
 b=b.replace('key: "workAuthorization",','key: "workAuthorization",\n      width: 180,\n      className: "em-ai-location-cell",\n      render: value => value || "Not provided",');
 b=b.replace('a.jobTitle.localeCompare(b.jobTitle)','String(a.position || "").localeCompare(String(b.position || ""))');
 s=s.slice(0,start)+b+s.slice(end);s=s.replace('scroll={{ x: 1250 }}','tableLayout="fixed"\n                  scroll={{ x: 1676 }}');return s;
});
edit('client/src/Components/CandidateUI/PortalTheme.css',s=>s+'\n/* Use the sidebar brand on desktop and the header brand on mobile. */\n@media(min-width:1025px){body.ss-workspace .main-header .logo-box{display:none}}\n');
edit('client/src/Components/EmployerUI/EmployerWorkspace.css',s=>s+`
/* Filled actions must remain readable in every interaction state. */
.em-workspace .ant-btn-primary,.em-workspace .ant-btn-primary:hover,.em-workspace .ant-btn-primary:focus,.em-workspace .ant-btn-primary:disabled{color:#fff!important}
.em-workspace .ant-btn-primary:disabled{background:#7895b5!important;border-color:#7895b5!important;cursor:not-allowed}
.em-workspace .ant-btn-primary span,.em-workspace .ant-btn-primary .anticon{color:inherit!important}
.em-workspace .em-primary,.em-workspace .em-primary:hover,.em-workspace .btn-style-one,.em-workspace .btn-style-one:hover{color:#fff!important}
.em-ai-search .aiResumeSearch-table .ant-table-cell{word-break:normal;overflow-wrap:normal;white-space:normal}
.em-ai-search .aiResumeSearch-table .em-ai-location-cell{white-space:normal;word-break:normal;line-height:1.5}
.em-ai-search .aiResumeSearch-table .ant-table-thead>tr>th{white-space:normal}
.em-ai-search .aiResumeSearch-table .ant-space{gap:8px!important}
.em-ai-search .aiResumeSearch-table .progress-container p{font-size:13px;line-height:1.5;margin:0}
`);
edit('client/src/Components/CandidateUI/PortalTheme.css',s=>s+'\n.ss-workspace .ant-btn-primary,.ss-workspace .ant-btn-primary:hover,.ss-workspace .ant-btn-primary:disabled,.ss-workspace .btn-style-one,.ss-workspace .btn-style-one:hover{color:#fff!important}\n.ss-workspace .ant-btn-primary:disabled{background:#7895b5!important;border-color:#7895b5!important}\n.ss-workspace .ant-btn-primary span{color:inherit!important}\n');
