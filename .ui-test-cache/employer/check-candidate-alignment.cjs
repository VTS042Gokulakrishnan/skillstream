const http=require('http'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const puppeteer=require('D:/GitHub/skillStream-Backend/node_modules/puppeteer');
const root=path.resolve('.ui-test-cache/public-site/full-dist'),assets=path.resolve('client/public'),out=path.resolve('docs/ui-review-fixes-2026-10-28');
const server=http.createServer((req,res)=>{const rel=decodeURIComponent(req.url.split('?')[0]);let file=path.resolve(root,'.'+rel);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())file=path.resolve(assets,'.'+rel);if((!file.startsWith(assets+path.sep)&&!file.startsWith(root+path.sep))||!fs.existsSync(file)||!fs.statSync(file).isFile())file=path.join(root,'index.html');res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':file.endsWith('.png')?'image/png':file.endsWith('.svg')?'image/svg+xml':file.endsWith('.woff2')?'font/woff2':'application/octet-stream');fs.createReadStream(file).pipe(res);}).listen(3137,'127.0.0.1');
const enc=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
const token=enc({alg:'HS256',typ:'JWT'})+'.'+enc({role:'Employer',userId:'test-employer',email:'recruiter@example.test',access:'Admin',organisationId:'org-test',name:'Aarav Khanna',exp:Math.floor(Date.now()/1000)+86400})+'.test';
const now=new Date().toISOString();
const people=[{name:'Aisha Khan',userId:'candidate-1',_id:'1',jobTitle:'Frontend Developer',experience:'5 years',city:'West Orange',state:'New Jersey',country:'United States',email:'aisha@example.test',phone:'5551234567',resume:'https://example.test/resume.pdf',skills:['React','TypeScript','Next.js'],workAuthorization:'Green Card Holder',time:now,appliedTime:now,lastLoggedIn:now,applicationStatus:'pending',work_experience:[],education:[]},{name:'Rahul Sharma',userId:'candidate-2',_id:'2',jobTitle:'Software Engineer',experience:'7 years',city:'Austin',state:'Texas',country:'United States',email:'rahul@example.test',resume:'https://example.test/resume2.pdf',skills:['React','Node.js'],workAuthorization:'US Citizen',time:now,appliedTime:now,lastLoggedIn:now,applicationStatus:'Approved',interviewStatus:'Completed',interviewScore:'82',work_experience:[],education:[]}];
people.push({...people[0],name:'Priya Shah',userId:'candidate-3',_id:'3',id:'3',applicationStatus:'Approved'});
const jobs=[{jobId:'job-1',userId:'test-employer',JobTitle:'Senior React Developer',JobDescription:'Build thoughtful frontend experiences with React and TypeScript.',City:'San Francisco',Country:'United States',State:'California',Industry:'Technology',JobType:'Full Time',employmentType:'Hybrid',status:'Active',EmailAddress:'recruiter@example.test',companyName:'Acme Technologies',offeredSalary:'$120,000 – $150,000',time:now,postedTime:now,ApplicationDeadlineDate:'2026-12-31',jobSkills:['React','TypeScript'],Responsibilties:['Build accessible interfaces'],Experience:'5 years',applicants:people,savedResumes:people.map((p,i)=>({...p,id:String(i+1),shortlistedTime:'Oct 27, 2026',jobId:'job-1'}))},{jobId:'job-2',userId:'test-employer',JobTitle:'Product Designer',City:'New York',Country:'United States',State:'New York',JobType:'Full Time',status:'Hold',EmailAddress:'recruiter@example.test',time:now,postedTime:now,ApplicationDeadlineDate:'2026-12-31',applicants:[],savedResumes:[],jobSkills:['Figma'],Responsibilties:[]}];
const company={userId:'test-employer',role:'Employer',access:'Admin',name:'Aarav Khanna',companyName:'Acme Technologies',email:'recruiter@example.test',primaryIndustry:'Technology',phone:'5551234567',website:'https://example.test',teamSize:'51–200',description:'We build thoughtful digital products for teams around the world.',foundedIn:'2019',country:'United States',state:'California',city:'San Francisco',address:'100 Market Street, San Francisco',jobs,allApplicants:people,notifications:[{name:'Aisha Khan',JobTitle:'Senior React Developer',jobId:'job-1',type:'Applied Job',read:false,time:now}],messages:[],profileCompleted:true,subscribed:true,subscriptionStart:'2026-01-01',subscriptionEnds:'2027-01-01',plan:'Recommended',stripeCustomerId:'cus_fixture',social:[]};
let incomplete=false,requests=[],errors=[],lastSearch=null;
function api(url,req){const p=url.pathname;
 if(p.includes('/ai/search/candidate')) return {candidates:people.map((p,i)=>({...p,rank:i+1}))};
 if(p.includes('/candidate/')) return {Candidate:[{...people[0],isResumeUploaded:true,position:'Frontend Developer',language:['English'],education:[],work_experience:[],social:[],profileCompleted:true}]};
 if(p.includes('/data/languages'))return {languages:['English']};
 if(p.includes('/ai/analyse/fitemnt'))return {data:{fitment_score:86,candidate_name:'Aisha Khan',candidate_briefSummary:'Experienced React developer with strong frontend delivery experience.',mandatory_skills:[{skill:'React',present:true,evidence_location:'Frontend projects and five years of experience'},{skill:'TypeScript',present:true,evidence_location:'Typed application development'}],secondary_skills:[],key_strengths:['React development','TypeScript'],missing_skills:['Large-scale system design evidence'],screening_questions:['Describe a complex React project.'],gap_closure_suggestions:[]}};
 if(p.includes('/subscribe/get/plan'))return {plan:{name:'Recommended',subscriptionId:'sub_fixture'}};
 if(p.includes('/subscribe/get/transaction'))return {transactions:[{id:'invoice_fixture',created:1793059200,status:'paid',amount_due:24900,hosted_invoice_url:'https://example.test/invoice',invoice_pdf:'https://example.test/invoice.pdf',payment_method_details:{card:{brand:'Visa',last4:'4242',exp_month:8,exp_year:2028}}}]};
 if(p.endsWith('/profile-status'))return {...company,profileCompleted:!incomplete};
 if(p.includes('/employer/update/')){incomplete=false;return {status:true,profileCompleted:true};}
 if(p.includes('/allApplicants/'))return {allApplicants:{jobs,otherUserJobs:[]}};
 if(p.includes('/shortlistResume/view/'))return {jobs};
 if(p.includes('/jobs/get/'))return {jobs,otherUsersJobs:[]};
 if(p.includes('/superAdmin/get/users/'))return {users:[{email:'team@example.test',access:'User',jobs:2}]};
 if(p.includes('/search/keyword/candidate')){lastSearch=JSON.parse(req.postData()||'{}');return {results:people,status:true};}
 if(p.includes('/global/search'))return {success:true,results:{candidates:people,jobs,employers:[company]}};
 if(p.includes('/data/industries'))return {industries:['Technology','Financial Services']};
 if(p.includes('/data/states/'))return {states:['California','Texas']};
 if(p.includes('/data/cities/'))return {cities:['San Francisco','Austin']};
 if(p.includes('/data/countries'))return {countries:[{country:'United States'}]};
 if(p.includes('/data/skills'))return {skills:['React','TypeScript','Node.js','PHP']};
 if(p.includes('/maintenance/'))return {maintenanceMode:false,maintenance:false,status:false};
 if(p.includes('/employer/'))return {Employer:[company],jobs,status:true};
 return {status:true,success:true,data:[],results:[],users:[],transactions:[],invoices:[],jobs};
}
(async()=>{
 const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,userDataDir:path.join(__dirname,'revision-browser-profile'),args:['--no-sandbox','--disable-gpu']});
 let delaySearch=false, pending=[], previewFailure=true;
 const {PDFDocument,StandardFonts}=require('D:/GitHub/skillstream-jobs-us/node_modules/pdf-lib');
 const pdf=await PDFDocument.create();const pdfPage=pdf.addPage();pdfPage.drawText('Aisha Khan - React Developer',{x:50,y:700,size:20,font:await pdf.embedFont(StandardFonts.Helvetica)});const pdfBytes=Buffer.from(await pdf.save());
 const zip=new (require('D:/GitHub/skillstream-jobs-us/node_modules/jszip'))();
 zip.file('[Content_Types].xml','<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
 zip.file('_rels/.rels','<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
 zip.file('word/document.xml','<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Aisha Khan - React Developer</w:t></w:r></w:p></w:body></w:document>');const docxBytes=await zip.generateAsync({type:'nodebuffer'});
 try {
  const page=await browser.newPage();
  const setRole=async(role)=>{await page.evaluate((r,t)=>{localStorage.clear();if(r){localStorage.setItem('Role',r);localStorage.setItem('token',t);localStorage.setItem('UserId','test-employer');localStorage.setItem('ProfileCompleted','true');localStorage.setItem('Subscribed','true');localStorage.setItem('captchaVerifiedTime',Date.now());}},role,role==='Candidate'?enc({alg:'HS256'})+'.'+enc({role:'Candidate',userId:'test-employer',exp:Math.floor(Date.now()/1000)+86400})+'.test':token);};
  page.on('pageerror',e=>{errors.push(e.message);console.log('RUNTIME',e.message)});
  await page.setRequestInterception(true);
  page.on('request',async req=>{const u=new URL(req.url());
   if(u.pathname.includes('/api/')){const reply=()=>req.respond({contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,content-type','Access-Control-Allow-Methods':'GET,POST,PUT,OPTIONS'},body:JSON.stringify(api(u,req))}).catch(()=>{});if(delaySearch&&req.method()==='POST'&&u.pathname.includes('/search/keyword/'))pending.push(reply);else await reply();return;}
   if(u.hostname==='example.test'&&u.pathname.includes('resume')&&!previewFailure)return req.respond({contentType:u.pathname.endsWith('.docx')?'application/vnd.openxmlformats-officedocument.wordprocessingml.document':'application/pdf',headers:{'Access-Control-Allow-Origin':'*'},body:u.pathname.endsWith('.docx')?docxBytes:pdfBytes});
   if(u.pathname.endsWith('/pdf.worker.min.js'))return req.respond({contentType:'application/javascript',headers:{'Access-Control-Allow-Origin':'*'},body:fs.readFileSync('D:/GitHub/skillstream-jobs-us/node_modules/pdfjs-dist/build/pdf.worker.min.js')});
   if(u.hostname==='code.jquery.com')return req.respond({contentType:'application/javascript',body:fs.readFileSync('D:/GitHub/skillstream-jobs-us/node_modules/jquery/dist/jquery.min.js','utf8')});
   if(u.pathname.includes('jquery.appear'))return req.respond({contentType:'application/javascript',body:fs.readFileSync('client/public/js/appear.js','utf8')});
   if(u.hostname!=='127.0.0.1')return req.abort();return req.continue();
  });
  const go=async route=>{await page.goto('http://127.0.0.1:3137'+route,{waitUntil:'networkidle0'});};
  const button=async text=>{await page.waitForFunction(t=>[...document.querySelectorAll('button')].some(b=>b.textContent.trim()===t),{},text);await page.evaluate(t=>[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===t)?.click(),text);};
  const shot=async name=>{await new Promise(r=>setTimeout(r,350));if(!await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1))console.log('OVERFLOW',name,await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1&&getComputedStyle(e).position!=='fixed').slice(-25).map(e=>({tag:e.tagName,cls:e.className,width:e.getBoundingClientRect().width,right:e.getBoundingClientRect().right}))));await page.screenshot({path:path.join(out,name+'.png')});};
  await go('/employers');await setRole('Employer');


  await setRole('Candidate');
  for(const width of [1440,1100,390]){await page.setViewport({width,height:1000});await go('/my-profile');await page.waitForSelector('.ss-profile-editor');await page.addStyleTag({content:fs.readFileSync('client/src/Components/Sidebar/CandidatesSidebar.css','utf8')});await new Promise(r=>setTimeout(r,400));const layout=await page.evaluate(()=>{const logo=document.querySelector('.ss-candidate-brand img').getBoundingClientRect();const header=document.querySelector('.main-header').getBoundingClientRect();return {logoTop:logo.top,headerLeft:header.left,headerWidth:header.width,overflow:document.documentElement.scrollWidth>innerWidth+1}});console.log(width,layout);assert(!layout.overflow);if(width>1024){assert(layout.logoTop<25);assert.equal(layout.headerLeft,240);assert.equal(Math.round(layout.headerWidth),width-240);}await shot('candidate-aligned-'+width);}
  assert.equal(errors.length,0,errors.join('\n'));console.log('Candidate header/sidebar alignment passed');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
