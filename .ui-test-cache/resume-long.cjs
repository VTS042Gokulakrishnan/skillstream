const {generatePdf}=require('../server/services/resumeBuilder/pdf');
const {defaults,sampleContent}=require('../server/services/resumeBuilder/template');
const fs=require('fs');
(async()=>{const content=sampleContent();content.experience=Array.from({length:18},(_,i)=>({...content.experience[0],id:String(i),title:'Senior Frontend Developer '+i,description:Array.from({length:8},(_,j)=>'- Delivered accessible features and improved application performance for customers. Achievement '+i+'-'+j).join('\n')}));const pdf=await generatePdf({title:'Long resume',content,template:'modern',settings:defaults});fs.writeFileSync('.ui-test-cache/resume/long.pdf',pdf);console.log('Long PDF generated')})().catch(e=>{console.error(e);process.exit(1)});

