const fs=require('fs');let s=fs.readFileSync('.ui-test-cache/employer/check-review-fixes.cjs','utf8');const start=s.indexOf('  for(const width of [1440,390]) {');s=s.slice(0,start)+`
  await setRole('Candidate');
  for(const width of [1440,1100,390]){await page.setViewport({width,height:1000});await go('/my-profile');await page.waitForSelector('.ss-profile-editor');await page.addStyleTag({content:fs.readFileSync('client/src/Components/Sidebar/CandidatesSidebar.css','utf8')});await new Promise(r=>setTimeout(r,400));const layout=await page.evaluate(()=>{const logo=document.querySelector('.ss-candidate-brand img').getBoundingClientRect();const header=document.querySelector('.main-header').getBoundingClientRect();return {logoTop:logo.top,headerLeft:header.left,headerWidth:header.width,overflow:document.documentElement.scrollWidth>innerWidth+1}});console.log(width,layout);assert(!layout.overflow);if(width>1024){assert(layout.logoTop<25);assert.equal(layout.headerLeft,240);assert.equal(Math.round(layout.headerWidth),width-240);}await shot('candidate-aligned-'+width);}
  assert.equal(errors.length,0,errors.join('\\n'));console.log('Candidate header/sidebar alignment passed');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
`;fs.writeFileSync('.ui-test-cache/employer/check-candidate-alignment.cjs',s);
