// ─── State ───
let allQuestions = [];
let solvedSet = new Set();
let selectedTopic = null;
let currentFilter = 'all';
let searchQuery = '';
let apiKey = '';

const TOPIC_COLORS = [
  '#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6',
  '#06b6d4','#ec4899','#84cc16','#f97316','#14b8a6'
];

const DEMO_TEXT = `COMPUTER SCIENCE — PREVIOUS YEAR PAPER 2023

Section A

1. Define an array. How is it different from a linked list? Explain with examples. [5 marks]
2. Write a function to reverse a linked list. Analyze its time complexity. [8 marks]
3. What is a stack? Explain push and pop operations with algorithm. [5 marks]
4. Explain the concept of recursion with a factorial example. [5 marks]

Section B

5. What is binary search? Write its algorithm and find worst case complexity. [8 marks]
6. Explain bubble sort and selection sort. Compare their time complexities. [10 marks]
7. Write the merge sort algorithm. What is its time and space complexity? [10 marks]
8. Explain quick sort with an example. Discuss its best and worst case. [8 marks]

Section C

9. What is a binary tree? Define height, depth, and leaf nodes. [5 marks]
10. Explain BFS and DFS traversal with examples and algorithms. [10 marks]
11. What is a binary search tree? Write insertion and deletion operations. [10 marks]
12. Define a graph. Explain adjacency matrix and adjacency list representation. [8 marks]

Section D

13. What is dynamic programming? Explain with the 0/1 Knapsack problem. [10 marks]
14. Solve the longest common subsequence problem using DP. [10 marks]
15. What is memoization? How does it differ from tabulation? [5 marks]

Section E

16. What is an operating system? Explain its main functions. [5 marks]
17. Explain CPU scheduling algorithms: FCFS, SJF, and Round Robin. [10 marks]
18. What is deadlock? State the necessary conditions for deadlock. [8 marks]
19. Explain paging and segmentation in memory management. [10 marks]

Section F

20. What is normalization in DBMS? Explain 1NF, 2NF, and 3NF with examples. [10 marks]
21. Write SQL queries: a) JOIN b) GROUP BY c) HAVING d) Subquery. [8 marks]
22. What are ACID properties? Explain each with examples. [8 marks]`;

// ─── Upload tabs ───
function switchUploadTab(tab, el) {
  document.querySelectorAll('.utab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('paste-tab').style.display = tab === 'paste' ? 'block' : 'none';
  document.getElementById('file-tab').style.display = tab === 'file' ? 'block' : 'none';
}

function handleFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    document.getElementById('paste-area').value = ev.target.result;
    switchUploadTab('paste', document.querySelectorAll('.utab')[0]);
    document.getElementById('file-name').style.display = 'flex';
    document.getElementById('file-name').innerHTML = `<i class="ti ti-check"></i> ${file.name} loaded`;
  };
  reader.readAsText(file);
}

function dragOver(e) { e.preventDefault(); }
function dropFile(e) {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) {
    document.getElementById('file-input').files = e.dataTransfer.files;
    handleFile({ target: { files: [file] } });
  }
}

function scrollToUpload() {
  setTimeout(() => document.getElementById('upload-section').scrollIntoView({ behavior: 'smooth' }), 50);
}

function loadDemo() {
  document.getElementById('paste-area').value = DEMO_TEXT;
  scrollToUpload();
}

function backToHome() {
  document.getElementById('app').style.display = 'none';
  document.getElementById('landing').style.display = 'block';
  allQuestions = [];
  solvedSet = new Set();
  selectedTopic = null;
  document.getElementById('paste-area').value = '';
  document.getElementById('api-key').value = '';
}

// ─── Process ───
async function processQuestions() {
  const text = document.getElementById('paste-area').value.trim();
  apiKey = document.getElementById('api-key').value.trim();

  if (!text) { alert('Please paste or upload your question paper first.'); return; }
  if (!apiKey) { alert('Please enter your Anthropic API key. Get a free one at console.anthropic.com'); return; }

  showLoader();

  const loaderMsgs = ['Reading question paper...', 'Extracting questions...', 'Detecting topics...', 'Grouping by subject...', 'Almost done...'];
  let msgIdx = 0;
  let progress = 0;
  const msgInterval = setInterval(() => {
    if (msgIdx < loaderMsgs.length) {
      document.getElementById('loader-msg').textContent = loaderMsgs[msgIdx++];
      progress = Math.min(progress + 18, 90);
      document.getElementById('loader-fill').style.width = progress + '%';
    }
  }, 900);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        system: `You are an expert academic assistant. Extract ALL questions from the given exam paper and classify each by topic.

Return ONLY valid JSON with no markdown, no explanation, no backticks. The format must be exactly:
{"questions":[{"id":1,"text":"full question text here","topic":"Topic Name","year":"2023","marks":5}]}

Rules:
- Extract EVERY question, including sub-questions (label as a, b, c)
- Topic should be a clear subject area: Arrays, Linked Lists, Stacks, Queues, Trees, Graphs, Sorting Algorithms, Searching Algorithms, Dynamic Programming, Recursion, Operating Systems, CPU Scheduling, Memory Management, Deadlock, DBMS, SQL, Normalization, Computer Networks, OOP, etc.
- If year is visible in the paper, use it; else use "N/A"
- If marks are visible, use the number; else use 0
- Keep the full question text intact
- Group similar topics under the same name`,
        messages: [{ role: 'user', content: `Extract and classify all questions from this exam paper:\n\n${text}` }]
      })
    });

    clearInterval(msgInterval);
    document.getElementById('loader-fill').style.width = '95%';

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'API error ' + response.status);
    }

    const data = await response.json();
    const raw = data.content.filter(b => b.type === 'text').map(b => b.text).join('');
    const clean = raw.replace(/```json|```/g, '').trim();

    let parsed;
    try { parsed = JSON.parse(clean); } catch (e) {
      const match = clean.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
      else throw new Error('Could not parse AI response. Try again.');
    }

    allQuestions = (parsed.questions || []).map((q, i) => ({ ...q, id: i + 1 }));

    if (allQuestions.length === 0) throw new Error('No questions found. Make sure your paper has numbered questions.');

    document.getElementById('loader-fill').style.width = '100%';
    setTimeout(() => {
      hideLoader();
      showApp();
    }, 400);

  } catch (err) {
    clearInterval(msgInterval);
    hideLoader();
    alert('Error: ' + err.message + '\n\nMake sure your API key is correct and has credits.');
  }
}

function showLoader() {
  document.getElementById('loading-overlay').style.display = 'flex';
  document.getElementById('process-btn').disabled = true;
  document.getElementById('loader-fill').style.width = '0%';
  document.getElementById('loader-msg').textContent = 'Reading question paper...';
}
function hideLoader() {
  document.getElementById('loading-overlay').style.display = 'none';
  document.getElementById('process-btn').disabled = false;
}

// ─── App rendering ───
function showApp() {
  document.getElementById('landing').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  document.getElementById('app-paper-name').textContent = `${allQuestions.length} questions extracted`;
  selectedTopic = null;
  currentFilter = 'all';
  searchQuery = '';
  renderSidebar();
  renderQuestions();
}

function getTopics() {
  const map = {};
  allQuestions.forEach(q => {
    if (!map[q.topic]) map[q.topic] = 0;
    map[q.topic]++;
  });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

function renderSidebar() {
  const total = allQuestions.length;
  const solved = solvedSet.size;
  const pct = total ? Math.round((solved / total) * 100) : 0;
  const circ = 2 * Math.PI * 32;
  const fill = circ - (circ * pct / 100);

  document.getElementById('ring-fill').style.strokeDashoffset = fill;
  document.getElementById('ring-pct').textContent = pct + '%';
  document.getElementById('ss-total').textContent = total;
  document.getElementById('ss-solved').textContent = solved;
  const topics = getTopics();
  document.getElementById('ss-topics').textContent = topics.length;

  const list = document.getElementById('topic-list');
  list.innerHTML = '';

  const allItem = document.createElement('div');
  allItem.className = 'all-topic-item' + (!selectedTopic ? ' active' : '');
  allItem.innerHTML = `<i class="ti ti-layout-grid"></i> All questions <span style="margin-left:auto;font-size:11px">${total}</span>`;
  allItem.onclick = () => selectTopic(null);
  list.appendChild(allItem);

  topics.forEach(([topic, count], idx) => {
    const color = TOPIC_COLORS[idx % TOPIC_COLORS.length];
    const solved = allQuestions.filter(q => q.topic === topic && solvedSet.has(q.id)).length;
    const pct = count ? Math.round((solved / count) * 100) : 0;
    const item = document.createElement('div');
    item.className = 'topic-item' + (selectedTopic === topic ? ' active' : '');
    item.innerHTML = `
      <div style="width:100%">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:6px">
          <div class="topic-item-left">
            <div class="topic-dot" style="background:${color}"></div>
            <span class="topic-name">${topic}</span>
          </div>
          <span class="topic-count">${count}</span>
        </div>
        <div class="topic-progress" style="margin-top:6px">
          <div class="topic-progress-fill" style="width:${pct}%;background:${color}"></div>
        </div>
      </div>`;
    item.onclick = () => selectTopic(topic);
    list.appendChild(item);
  });
}

function selectTopic(topic) {
  selectedTopic = topic;
  currentFilter = 'all';
  searchQuery = '';
  document.getElementById('sidebar-search').value = '';
  document.querySelectorAll('.filter-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
  renderSidebar();
  renderQuestions();
}

function renderQuestions() {
  let qs = allQuestions;
  if (selectedTopic) qs = qs.filter(q => q.topic === selectedTopic);
  if (searchQuery) {
    const s = searchQuery.toLowerCase();
    qs = qs.filter(q => q.text.toLowerCase().includes(s) || q.topic.toLowerCase().includes(s));
  }
  if (currentFilter === 'solved') qs = qs.filter(q => solvedSet.has(q.id));
  if (currentFilter === 'unsolved') qs = qs.filter(q => !solvedSet.has(q.id));

  const title = selectedTopic || 'All questions';
  document.getElementById('content-title').textContent = title;
  document.getElementById('content-sub').textContent = `${qs.length} question${qs.length !== 1 ? 's' : ''}${selectedTopic ? '' : ' across all topics'}`;

  const container = document.getElementById('questions-list');
  container.innerHTML = '';

  if (!qs.length) {
    container.innerHTML = `<div class="empty-state"><i class="ti ti-mood-empty"></i><h3>No questions here</h3><p>Try a different filter or topic</p></div>`;
    return;
  }

  qs.forEach((q, idx) => container.appendChild(makeCard(q, idx + 1)));
}

function makeCard(q, num) {
  const div = document.createElement('div');
  div.className = 'q-card' + (solvedSet.has(q.id) ? ' solved' : '');
  div.id = 'qcard-' + q.id;
  div.innerHTML = `
    <div class="q-badges">
      <span class="badge badge-topic">${q.topic}</span>
      ${q.year && q.year !== 'N/A' ? `<span class="badge badge-year">${q.year}</span>` : ''}
      ${q.marks ? `<span class="badge badge-marks">${q.marks} marks</span>` : ''}
      ${solvedSet.has(q.id) ? `<span class="badge badge-solved"><i class="ti ti-check"></i> Solved</span>` : ''}
      <span class="q-num">Q${num}</span>
    </div>
    <div class="q-text">${q.text}</div>
    <div class="q-actions">
      <button class="q-btn btn-mark ${solvedSet.has(q.id) ? 'marked' : ''}" onclick="toggleSolve(${q.id})">
        <i class="ti ti-${solvedSet.has(q.id) ? 'circle-check' : 'circle'}"></i>
        ${solvedSet.has(q.id) ? 'Mark unsolved' : 'Mark solved'}
      </button>
      <button class="q-btn btn-exp" onclick="toggleExplain(${q.id}, this)">
        <i class="ti ti-bulb"></i> Explain this question
      </button>
    </div>
    <div id="explain-${q.id}" style="display:none"></div>`;
  return div;
}

function toggleSolve(id) {
  if (solvedSet.has(id)) solvedSet.delete(id);
  else solvedSet.add(id);
  renderSidebar();
  renderQuestions();
}

async function toggleExplain(id, btn) {
  const panel = document.getElementById('explain-' + id);
  if (panel.style.display === 'block') {
    panel.style.display = 'none';
    btn.innerHTML = '<i class="ti ti-bulb"></i> Explain this question';
    return;
  }
  panel.style.display = 'block';
  btn.innerHTML = '<i class="ti ti-x"></i> Hide explanation';
  panel.innerHTML = `<div class="explain-panel"><div class="explain-loading"><i class="ti ti-loader-2"></i> Loading explanation...</div></div>`;

  const q = allQuestions.find(x => x.id === id);
  if (!q) return;

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Explain how to solve this exam question clearly for a student. Include: key concept, approach/algorithm, example if needed, and final answer outline. Be concise but complete.\n\nQuestion: ${q.text}`
        }]
      })
    });
    const data = await resp.json();
    const text = data.content.filter(b => b.type === 'text').map(b => b.text).join('');
    panel.innerHTML = `<div class="explain-panel">${text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>`;
  } catch (e) {
    panel.innerHTML = `<div class="explain-panel" style="color:var(--red)">Could not load explanation. Check your API key has credits.</div>`;
  }
}

function filterQuestions(val) {
  searchQuery = val;
  renderQuestions();
}

function setFilter(filter, el) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderQuestions();
}
