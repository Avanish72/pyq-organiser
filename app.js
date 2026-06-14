// DEMO MODE APP.JS
async function processQuestions() {
  const text = document.getElementById('paste-area').value.trim();
  if (!text) { alert('Please paste or upload your question paper first.'); return; }
  const questions=[]; let id=1;
  text.split('\n').forEach(line=>{
    const m=line.match(/^\s*(\d+)[.)]\s*(.+)$/);
    if(m) questions.push({id:id++,text:m[2],topic:'General',year:'N/A',marks:0});
  });
  if(!questions.length){alert('No numbered questions found.');return;}
  allQuestions=questions; showApp();
}
async function toggleExplain(id, btn){
 const panel=document.getElementById('explain-'+id);
 panel.style.display='block';
 panel.innerHTML='<div class="explain-panel">Demo mode explanation.</div>';
}
