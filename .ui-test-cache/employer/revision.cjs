const fs=require('fs');
function edit(path,fn){const s=fs.readFileSync(path,'utf8').replace(/\r\n/g,'\n');fs.writeFileSync(path,fn(s));}
const root='client/src/';
edit(root+'Components/PublicSite/PublicHeader.js',s=>s.replace('<a href="/employers#hiring-tools">Hiring tools</a><a href="/employers#how-it-works">How it works</a>',''));
edit(root+'App.js',s=>s.replace('<JobSingle />\n              <Footer />','<JobSingle />'));
edit(root+'Pages/Auth/Auth.css',s=>'.ss-auth-modal.ant-modal { top:16px; padding-bottom:16px; }\n'+s);
edit(root+'Pages/Candidates/CandidatesList.js',s=>{
 s='import BrandLoader from "../../Components/Loader/BrandLoader";\n'+s;
 s=s.replace('const navigate = useNavigate();',`const navigate = useNavigate();
  const searchRequest = useRef(null);
  const [selectedSkills, setSelectedSkills] = useState([]);
  useEffect(() => () => searchRequest.current?.abort(), []);
  const stopSearch = () => { searchRequest.current?.abort(); searchRequest.current = null; setStatus("Stopped"); };`);
 s=s.replace('keyword.trim() !== "" || (Array.isArray(skills) && skills.some((s) => s.skill.trim() !== ""))','keyword.trim() !== "" || selectedSkills.length > 0');
 const start=s.indexOf('                    <div className="filter-block">\n                      <h4>Skills</h4>');
 const end=s.indexOf('                    <div className="filter-block">\n                      <h4>Job Title</h4>',start);
 if(start<0||end<0)throw Error('skills boundary');
 s=s.slice(0,start)+`                    <div className="filter-block">
                      <h4>Skills</h4>
                      <Select mode="tags" aria-label="Skills" allowClear showSearch style={{width:"100%"}} placeholder="Select skills" options={skillOptions} value={selectedSkills} onChange={setSelectedSkills} optionFilterProp="label" />
                      <p style={{fontSize:12,marginTop:8,color:"#60718b"}}>Match all selected skills. Use Boolean search above for advanced combinations.</p>
                    </div>
`+s.slice(end);
 s=s.replace('const keywordSearch = async (e) => {','const keywordSearch = async (e) => {\n    searchRequest.current?.abort();\n    const request = new AbortController();\n    searchRequest.current = request;');
 s=s.replace('if (keyword.length != 0) keywordData.keyword = keyword;',`const skillQuery = selectedSkills.map(skill => '"' + skill.replace(/["\\\\]/g, " ").trim() + '"').join(" AND ");
      keywordData.keyword = [keyword.trim(), skillQuery].filter(Boolean).map(part => "(" + part + ")").join(" AND ");`);
 const pos=s.indexOf('const keywordSearch =');let before=s.slice(0,pos),after=s.slice(pos);
 after=after.replace('headers: {','signal: request.signal,\n          headers: {');
 after=after.replace('setStatus("Completed");','if (request.signal.aborted || searchRequest.current !== request) return;\n      setStatus("Completed");');
 after=after.replace('} catch (error) {','} catch (error) {\n      if (request.signal.aborted || axios.isCancel(error) || searchRequest.current !== request) return;');s=before+after;
 s=s.replace('setSkills([{ skill: "", operator: "AND" }]);','setSelectedSkills([]);\n    setSkills([{ skill: "", operator: "AND" }]);');
 s=s.replace('loading={status === "Loading"}','disabled={status === "Loading" || isSearchDisabled}');
 // Existing disabled prop is retained; avoid a duplicate JSX attribute.
 s=s.replace('disabled={isSearchDisabled}','');
 s=s.replace('{status === "Loading" && <ProgressLoader />}','{status === "Loading" && <div><BrandLoader label="Searching resumes…" /><Button danger onClick={stopSearch}>Stop search</Button></div>}\n                {status === "Stopped" && <p role="status">Search stopped. You can change filters and search again.</p>}');
 return s;
});
edit(root+'Pages/Employers/AiResumeSearch.js',s=>{
 s='import BrandLoader from "../../Components/Loader/BrandLoader";\n'+s;
 s=s.replace('const [loading, setLoading] = useState(false);',`const [loading, setLoading] = useState(false);
  const searchRequest = useRef(null);
  useEffect(() => () => searchRequest.current?.abort(), []);
  const stopSearch = () => { searchRequest.current?.abort(); searchRequest.current = null; setLoading(false); setStatus("Stopped"); };`);
 s=s.replace('const SearchWithAI = async (tokenFromCaptcha) => {','const SearchWithAI = async (tokenFromCaptcha) => {\n    searchRequest.current?.abort();\n    const request = new AbortController();\n    searchRequest.current = request;');
 let pos=s.indexOf('const SearchWithAI =');let a=s.slice(0,pos),b=s.slice(pos);
 b=b.replace('headers: {','signal: request.signal,\n            headers: {');
 b=b.replace('// console.log(data.candidates);','if (request.signal.aborted || searchRequest.current !== request) return;');
 b=b.replace('} catch (error) {','} catch (error) {\n      if (request.signal.aborted || axios.isCancel(error) || searchRequest.current !== request) return;');
 b=b.replace('error.response.data.message === "No results Found"','error.response?.data?.message === "No results Found"');s=a+b;
 const start=s.indexOf('              <Button onClick={() => handleModalOk(record)}');const end=s.indexOf('\n            )}',start);
 s=s.slice(0,start)+`              <Tooltip title={record.isAnalysing === "Analysing" ? "Analysing" : "Analyse"}>
                <Button aria-label="Analyse" onClick={() => handleModalOk(record)} disabled={loader} icon={record.isAnalysing === "Analysing" ? <BrandLoader size="button" label="" /> : <SearchOutlined />} />
              </Tooltip>`+s.slice(end);
 s=s.replace('className="loader-one"','className="ss-search-control"');
 s=s.replace(/<div>\s*<span className="loader__inner1"><\/span>\s*<span className="loader__inner1"><\/span>\s*<span className="loader__text1">AI<\/span>\s*<\/div>/, '<Space><BrandLoader size="compact" label="Searching…" /><Button danger onClick={stopSearch}>Stop search</Button></Space>');
 s=s.replace('<Spin spinning={loading}>','<Spin spinning={loading} indicator={<BrandLoader size="compact" label="" />}>');
 return s;
});
edit(root+'Pages/Employers/SavedResumes.js',s=>{
 s='import ResumePreviewDrawer from "../../Components/ReaderDrawer/ResumePreviewDrawer";\n'+s;
 s=s.replace('const [data, setData] = useState([]);','const [data, setData] = useState([]);\n  const [previewUrl, setPreviewUrl] = useState(null);');
 s=s.replace('href={record.resume}\n                target="_blank"','onClick={() => setPreviewUrl(record.resume)}');
 s=s.replace('href={resume.resume} target="_blank" rel="noreferrer"','onClick={() => setPreviewUrl(resume.resume)}');
 s=s.replace('return <><Toaster','return <><ResumePreviewDrawer open={!!previewUrl} fileUrl={previewUrl} onClose={() => setPreviewUrl(null)} /><Toaster');return s;
});
edit(root+'Pages/Employers/Employers-Dashboard/InterviewedCandidates.js',s=>s.replace('<Toaster position="top-center" reverseOrder={false} />','<Toaster position="top-center" reverseOrder={false} /><ResumePreviewDrawer open={resumeDrawerOpen} onClose={closeResumeDrawer} fileUrl={resumeUrl} highlightArray={highlightArray} />'));
