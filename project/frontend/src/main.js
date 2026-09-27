/* ===================== CONFIG ===================== */
const API_BASE_URL = "";

/* ===================== DATA ===================== */
const COURSE_BRANCHES = {
  "B.Tech": ["Computer Science Engineering (CSE)","Information Technology (IT)","AI & Data Science","Electronics & Communication (ECE)","Electrical & Electronics (EEE)","Mechanical Engineering","Civil Engineering","Biotechnology","Chemical Engineering"],
  "M.Tech": ["Computer Science Engineering (CSE)","Information Technology (IT)","AI & Data Science","Electronics & Communication (ECE)","VLSI Design","Structural Engineering","Power Systems"],
  "BCA": ["Computer Applications"],
  "MCA": ["Computer Applications"],
  "B.Sc": ["Computer Science","Data Science","Physics","Chemistry","Mathematics","Biotechnology","Statistics"],
  "M.Sc": ["Computer Science","Data Science","Physics","Chemistry","Mathematics","Biotechnology"],
  "BBA": ["General Management","Marketing","Finance","Business Analytics"],
  "MBA": ["Marketing","Finance","Human Resources","Business Analytics","Operations Management","International Business"]
};

const BRANCH_SKILLS = {
  "Computer Science Engineering (CSE)": ["Python","Java","C++","Data Structures & Algorithms","DBMS / SQL","HTML/CSS/JavaScript","React / Angular / Vue","Node.js","Machine Learning","Operating Systems","Git / GitHub","Cloud (AWS/Azure/GCP)","Docker / Kubernetes","REST APIs","System Design","Computer Networks"],
  "Information Technology (IT)": ["Python","Java","DBMS / SQL","Web Development","Networking","Cybersecurity Basics","Cloud Computing","Linux Administration","Git / GitHub","REST APIs","IT Service Management","Docker"],
  "AI & Data Science": ["Python","Machine Learning","Deep Learning","NLP","Computer Vision","Data Visualization","SQL","TensorFlow / PyTorch","Statistics & Probability","Data Wrangling (Pandas/NumPy)","MLOps"],
  "Electronics & Communication (ECE)": ["Embedded C","Microcontrollers (Arduino/STM32)","VLSI Design","Signal Processing","IoT Protocols (MQTT/Zigbee)","PCB Design","MATLAB","Communication Systems","FPGA / Verilog"],
  "Electrical & Electronics (EEE)": ["Circuit Design","Power Systems","MATLAB / Simulink","PLC Programming","Control Systems","Renewable Energy Systems","Embedded Systems","Electrical Machines"],
  "Mechanical Engineering": ["AutoCAD","SolidWorks / CATIA","Thermodynamics","CNC / Manufacturing","Robotics","3D Printing","MATLAB","FEA / Ansys","Mechatronics"],
  "Civil Engineering": ["AutoCAD","STAAD Pro","Structural Analysis","Surveying","GIS","Construction Management","Project Scheduling (MS Project)","Environmental Engineering"],
  "Biotechnology": ["Bioinformatics","Molecular Biology Techniques","Genetic Engineering","Lab Data Analysis","R Programming","Biostatistics","Cell Culture Techniques"],
  "Chemical Engineering": ["Process Simulation (Aspen)","Mass & Heat Transfer","Reaction Engineering","MATLAB","Plant Design","Process Safety"],
  "VLSI Design": ["Verilog / VHDL","Digital IC Design","Analog IC Design","Cadence / Synopsys Tools","FPGA Prototyping","Physical Design"],
  "Structural Engineering": ["STAAD Pro / ETABS","Structural Analysis","AutoCAD","Earthquake Engineering","Construction Materials"],
  "Power Systems": ["Power System Analysis","MATLAB / Simulink","SCADA","Renewable Integration","Smart Grid Technologies"],
  "Computer Applications": ["Python","Java","DBMS / SQL","Web Development","Software Engineering","Data Structures","Mobile App Development","Git / GitHub"],
  "Computer Science": ["Python","Java","DBMS / SQL","Data Structures & Algorithms","Web Development","Operating Systems","Git / GitHub"],
  "Data Science": ["Python","R","Statistics","Machine Learning","Data Visualization","SQL","Big Data Tools (Spark/Hadoop)","Pandas / NumPy"],
  "Physics": ["MATLAB","Python for Scientific Computing","Data Analysis","Simulation Tools","Statistics"],
  "Chemistry": ["Lab Techniques","Data Analysis","Spectroscopy","Python for Data Analysis","Chemical Safety"],
  "Mathematics": ["Python","R","Statistics & Probability","Mathematical Modeling","MATLAB","Optimization"],
  "Statistics": ["R","Python","SQL","Statistical Modeling","Data Visualization","Excel / Advanced Analytics"],
  "General Management": ["MS Excel","Business Communication","Project Management","Market Research","Presentation Skills"],
  "Marketing": ["Digital Marketing","SEO / SEM","Content Strategy","Market Research","Social Media Analytics","CRM Tools"],
  "Finance": ["Financial Modeling","Excel / Advanced Analytics","Valuation","Accounting Principles","Financial Analysis Tools"],
  "Business Analytics": ["SQL","Python / R","Data Visualization (Tableau/Power BI)","Statistics","Excel","A/B Testing"],
  "Human Resources": ["HRIS Tools","Talent Analytics","Recruitment Strategy","Employee Engagement Design","MS Excel"],
  "Operations Management": ["Supply Chain Analysis","Process Optimization","MS Excel","ERP Systems","Six Sigma Basics"],
  "International Business": ["Market Research","Trade Compliance","Cross-Cultural Communication","Business Communication","Excel"]
};
const DEFAULT_SKILLS = ["Python","MS Excel","Data Analysis","Project Management","Communication","Research Methods","Presentation Skills"];

const INTERESTS = [
  "Artificial Intelligence & ML","Healthcare & MedTech","Renewable Energy & Sustainability",
  "FinTech","E-commerce & Online Business","Cybersecurity","EdTech",
  "Internet of Things (IoT)","AR / VR & Gaming","Blockchain & Web3",
  "Agriculture Technology","Smart Cities & Urban Tech","Social Good & Non-Profit Tech",
  "Robotics & Automation","Supply Chain & Logistics"
];
const ALL_INTERESTS = [...INTERESTS, "Other"];

const LEVELS = [
  {key:"Beginner", label:"Easy", desc:"Great for a first build — guided scope, familiar tools."},
  {key:"Intermediate", label:"Medium", desc:"Some independent problem-solving, a few new tools to pick up."},
  {key:"Advanced", label:"Hard", desc:"Open-ended and research-like, closer to production complexity."}
];

/* ===================== STATE ===================== */
const state = {
  name:"", course:"", branch:"", skills:new Set(), interest:"", level:""
};

/* ===================== PROGRESS GRAPH ===================== */
const STEPS = ["Profile","Skills","Level","Matches"];
function renderProgress(activeIdx){
  const el = document.getElementById('progressGraph');
  el.innerHTML = "";
  STEPS.forEach((label,i)=>{
    const node = document.createElement('div');
    node.className = 'pg-node' + (i===activeIdx?' active':'') + (i<activeIdx?' done':'');
    node.innerHTML = `<div class="pg-circle">${i<activeIdx?'✓':i+1}</div><div class="pg-label">${label}</div>`;
    el.appendChild(node);
    if(i < STEPS.length-1){
      const line = document.createElement('div');
      line.className = 'pg-line' + (i<activeIdx?' done':'');
      el.appendChild(line);
    }
  });
}
renderProgress(0);

/* ===================== STEP 1 LOGIC ===================== */
const inpName = document.getElementById('inpName');
const inpCourse = document.getElementById('inpCourse');
const inpBranch = document.getElementById('inpBranch');
const toStep2Btn = document.getElementById('toStep2');

Object.keys(COURSE_BRANCHES).forEach(c=>{
  const opt = document.createElement('option');
  opt.value = c; opt.textContent = c;
  inpCourse.appendChild(opt);
});
const otherCourseOpt = document.createElement('option');
otherCourseOpt.value = "Other"; otherCourseOpt.textContent = "Other (not listed)";
inpCourse.appendChild(otherCourseOpt);

const courseOtherWrap = document.getElementById('courseOtherWrap');
const branchOtherWrap = document.getElementById('branchOtherWrap');
const inpCourseOther = document.getElementById('inpCourseOther');
const inpBranchOther = document.getElementById('inpBranchOther');

inpCourse.addEventListener('change', ()=>{
  const course = inpCourse.value;

  if(course === "Other"){
    courseOtherWrap.style.display = 'block';
    inpBranch.style.display = 'none';
    inpBranch.disabled = true;
    branchOtherWrap.style.display = 'block';
    state.course = inpCourseOther.value.trim();
    state.branch = inpBranchOther.value.trim();
  } else {
    courseOtherWrap.style.display = 'none';
    inpBranch.style.display = '';
    inpBranch.disabled = false;
    state.course = course;
    inpBranch.innerHTML = '<option value="" disabled selected>Select branch</option>';
    (COURSE_BRANCHES[course]||[]).forEach(b=>{
      const opt = document.createElement('option');
      opt.value = b; opt.textContent = b;
      inpBranch.appendChild(opt);
    });
    const otherBranchOpt = document.createElement('option');
    otherBranchOpt.value = "Other"; otherBranchOpt.textContent = "Other (not listed)";
    inpBranch.appendChild(otherBranchOpt);
    branchOtherWrap.style.display = 'none';
    state.branch = "";
  }
  validateStep1();
});

inpBranch.addEventListener('change', ()=>{
  if(inpBranch.value === "Other"){
    branchOtherWrap.style.display = 'block';
    state.branch = inpBranchOther.value.trim();
  } else {
    branchOtherWrap.style.display = 'none';
    state.branch = inpBranch.value;
  }
  validateStep1();
});

inpCourseOther.addEventListener('input', ()=>{
  state.course = inpCourseOther.value.trim();
  validateStep1();
});
inpBranchOther.addEventListener('input', ()=>{
  state.branch = inpBranchOther.value.trim();
  validateStep1();
});

inpName.addEventListener('input', ()=>{ state.name = inpName.value.trim(); validateStep1(); });

function validateStep1(){
  toStep2Btn.disabled = !(state.name && state.course && state.branch);
}

toStep2Btn.addEventListener('click', ()=>{
  buildStep2();
  showStep(2);
});

/* ===================== STEP 2 LOGIC ===================== */
const skillChips = document.getElementById('skillChips');
const interestGrid = document.getElementById('interestGrid');
const toStep3Btn = document.getElementById('toStep3');
const skillCountEl = document.getElementById('skillCount');
const branchNameEcho = document.getElementById('branchNameEcho');

function buildStep2(){
  state.skills = new Set();
  branchNameEcho.textContent = state.branch;
  const list = BRANCH_SKILLS[state.branch] || DEFAULT_SKILLS;
  skillChips.innerHTML = "";
  list.forEach(skill=>{
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.textContent = skill;
    chip.addEventListener('click', ()=>toggleSkill(skill, chip));
    skillChips.appendChild(chip);
  });
  interestGrid.innerHTML = "";
  state.interest = "";
  document.getElementById('interestOtherWrap').style.display = 'none';
  document.getElementById('inpInterestOther').value = "";
  ALL_INTERESTS.forEach(interest=>{
    const card = document.createElement('div');
    card.className = 'interest-card';
    card.textContent = interest;
    card.addEventListener('click', ()=>{
      document.querySelectorAll('#interestGrid .interest-card').forEach(c=>c.classList.remove('sel'));
      card.classList.add('sel');
      const otherWrap = document.getElementById('interestOtherWrap');
      if(interest === "Other"){
        otherWrap.style.display = 'block';
        state.interest = document.getElementById('inpInterestOther').value.trim();
      } else {
        otherWrap.style.display = 'none';
        state.interest = interest;
      }
      validateStep2();
    });
    interestGrid.appendChild(card);
  });
  updateSkillCount();
  validateStep2();
}
document.getElementById('inpInterestOther').addEventListener('input', (e)=>{
  state.interest = e.target.value.trim();
  validateStep2();
});

function toggleSkill(skill, chipEl){
  if(state.skills.has(skill)){ state.skills.delete(skill); chipEl.classList.remove('sel'); }
  else { state.skills.add(skill); chipEl.classList.add('sel'); }
  updateSkillCount();
  validateStep2();
}
function updateSkillCount(){
  skillCountEl.textContent = state.skills.size + " selected";
}
function validateStep2(){
  toStep3Btn.disabled = !(state.skills.size > 0 && state.interest);
}

document.getElementById('addCustomSkill').addEventListener('click', addCustom);
document.getElementById('customSkillInput').addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); addCustom(); }});
function addCustom(){
  const inp = document.getElementById('customSkillInput');
  const val = inp.value.trim();
  if(!val) return;
  const chip = document.createElement('div');
  chip.className = 'chip sel';
  chip.textContent = val;
  chip.addEventListener('click', ()=>toggleSkill(val, chip));
  skillChips.appendChild(chip);
  state.skills.add(val);
  inp.value = "";
  updateSkillCount();
  validateStep2();
}

document.getElementById('backTo1').addEventListener('click', ()=>showStep(1));
document.getElementById('toStep3').addEventListener('click', ()=>{
  buildStep3();
  showStep(3);
});
document.getElementById('startOver').addEventListener('click', ()=>{
  location.reload();
});

/* ===================== STEP 3 LOGIC (project level) ===================== */
const levelGrid = document.getElementById('levelGrid');
const toStep4Btn = document.getElementById('toStep4');

function buildStep3(){
  levelGrid.innerHTML = "";
  state.level = "";
  toStep4Btn.disabled = true;
  LEVELS.forEach(lv=>{
    const card = document.createElement('div');
    card.className = 'interest-card';
    card.innerHTML = `<div style="font-weight:600;margin-bottom:4px;">${lv.label}</div><div style="font-size:12px;color:var(--text-faint);font-weight:400;">${lv.desc}</div>`;
    card.addEventListener('click', ()=>{
      document.querySelectorAll('#levelGrid .interest-card').forEach(c=>c.classList.remove('sel'));
      card.classList.add('sel');
      state.level = lv.key;
      toStep4Btn.disabled = false;
    });
    levelGrid.appendChild(card);
  });
}

document.getElementById('backTo2').addEventListener('click', ()=>showStep(2));
toStep4Btn.addEventListener('click', ()=>{
  showStep(4);
  runMatching();
});

/* ===================== STEP NAV ===================== */
function showStep(n){
  document.querySelectorAll('.step').forEach(s=>s.classList.remove('active'));
  document.getElementById('step'+n).classList.add('active');
  renderProgress(n-1);
  window.scrollTo({top:0, behavior:'smooth'});
}

/* ===================== MATCHING — calls the local backend ===================== */
const loadingMsgs = [
  "MATCHING SKILLS TO PROJECTS…",
  "SCANNING THE INTEREST AREA…",
  "RANKING BY FEASIBILITY…",
  "DRAFTING PREREQUISITES & BENEFITS…"
];
let loadingInterval;

async function runMatching(){
  document.getElementById('loadingView').style.display = 'flex';
  document.getElementById('resultsView').style.display = 'none';
  document.getElementById('errorSlot').innerHTML = '';
  let mi = 0;
  const loadingText = document.getElementById('loadingText');
  loadingInterval = setInterval(()=>{
    mi = (mi+1) % loadingMsgs.length;
    loadingText.textContent = loadingMsgs[mi];
  }, 1400);

  try{
    const ideas = await fetchProjectIdeas();
    renderResults(ideas);
  }catch(err){
    renderError(err);
  }finally{
    clearInterval(loadingInterval);
    document.getElementById('loadingView').style.display = 'none';
    document.getElementById('resultsView').style.display = 'block';
  }
}

async function fetchProjectIdeas(){
  const payload = {
    name: state.name,
    course: state.course,
    branch: state.branch,
    skills: Array.from(state.skills),
    interest: state.interest,
    level: state.level
  };

  let response;
  try{
    response = await fetch(`${API_BASE_URL}/api/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  }catch(networkErr){
    throw new Error(
      `Could not reach the backend at ${API_BASE_URL}. Make sure it's running ("npm run dev" inside the backend folder).`
    );
  }

  let data;
  try{
    data = await response.json();
  }catch(e){
    throw new Error("The backend returned an unexpected (non-JSON) response.");
  }

  if(!response.ok){
    throw new Error(data.error || `Backend request failed with status ${response.status}.`);
  }
  if(!Array.isArray(data.ideas) || data.ideas.length===0){
    throw new Error("The backend did not return any project ideas.");
  }
  return data.ideas;
}

function renderError(err){
  document.getElementById('cardsContainer').innerHTML = '';
  document.getElementById('errorSlot').innerHTML = `
    <div class="error-box">
      <strong>Couldn't generate matches.</strong><br>
      ${escapeHtml(err.message || String(err))}<br><br>
      <button class="btn-ghost" id="retryBtn">↻ Try again</button>
    </div>`;
  document.getElementById('retryBtn').addEventListener('click', runMatching);
  document.getElementById('resultsHeading').textContent = "Something went wrong";
  document.getElementById('resultsSub').textContent = "";
  document.getElementById('profileStrip').innerHTML = "";
}

function renderResults(ideas){
  document.getElementById('resultsHeading').textContent = `${ideas.length} project matches for ${escapeHtml(state.name)}`;
  document.getElementById('resultsSub').textContent = `Based on ${state.branch} skills, focused on ${state.interest}, at ${state.level} level.`;
  const strip = document.getElementById('profileStrip');
  strip.innerHTML = "";
  [state.course, state.branch, state.interest, state.level, ...Array.from(state.skills)].forEach(t=>{
    const tag = document.createElement('span');
    tag.className = 'tag-mini';
    tag.textContent = t;
    strip.appendChild(tag);
  });

  const container = document.getElementById('cardsContainer');
  container.innerHTML = '';
  const studentSkillsLower = new Set(Array.from(state.skills).map(s=>s.toLowerCase()));

  ideas.forEach(idea=>{
    const card = document.createElement('div');
    card.className = 'card';

    const skillsNeeded = Array.isArray(idea.skillsNeeded) ? idea.skillsNeeded : [];
    const prerequisites = Array.isArray(idea.prerequisites) ? idea.prerequisites : [];
    const benefits = Array.isArray(idea.benefits) ? idea.benefits : [];
    const difficulty = ["Beginner","Intermediate","Advanced"].includes(idea.difficulty) ? idea.difficulty : "Intermediate";

    const skillTagsHtml = skillsNeeded.map(s=>{
      const matched = studentSkillsLower.has(String(s).toLowerCase());
      return `<span class="skill-tag${matched?' matched':''}">${escapeHtml(s)}</span>`;
    }).join('');

    card.innerHTML = `
      <div class="card-top">
        <div class="card-title">${escapeHtml(idea.title || 'Untitled project')}</div>
        <span class="badge ${difficulty}">${difficulty}</span>
      </div>
      ${idea.tagline ? `<div class="tagline">${escapeHtml(idea.tagline)}</div>` : ''}
      ${idea.explanation ? `<div class="explanation">${escapeHtml(idea.explanation)}</div>` : ''}

      <div class="section-label">Skills needed</div>
      <div class="skill-tags">${skillTagsHtml || '<span class="skill-tag">Not specified</span>'}</div>

      <div class="section-label">Prerequisites</div>
      <ul class="plain">${prerequisites.map(p=>`<li>${escapeHtml(p)}</li>`).join('') || '<li>None specified</li>'}</ul>

      <div class="section-label">Benefits</div>
      <ul class="plain benefits">${benefits.map(b=>`<li>${escapeHtml(b)}</li>`).join('') || '<li>None specified</li>'}</ul>

      <div class="section-label">Why it matters</div>
      <div class="importance-box">${escapeHtml(idea.importance || '')}</div>
    `;
    container.appendChild(card);
  });
}

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}
