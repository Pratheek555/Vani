// Plain HTML pages served by the gateway. No build step on purpose.

const shell = (title: string, body: string) => `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
*{box-sizing:border-box}
body{font:16px/1.5 system-ui,sans-serif;margin:0;background:#f6f3ee;color:#222;display:flex;justify-content:center;padding:3rem 1rem}
.card{background:#fff;border-radius:14px;box-shadow:0 2px 16px #0001;padding:2rem;width:100%;max-width:440px}
.wide{max-width:600px}
h1{margin:0 0 .25rem;font-size:1.6rem}
.sub{color:#666;margin:0 0 1.5rem}
label{display:block;font-size:.9rem;color:#444;margin:.75rem 0 .25rem}
input{font:inherit;width:100%;padding:.6rem .7rem;border:1px solid #ccc;border-radius:8px}
input:focus{outline:2px solid #e07a2f;border-color:transparent}
button{font:inherit;cursor:pointer;border:0;border-radius:8px;padding:.65rem 1rem}
.primary{background:#e07a2f;color:#fff;width:100%;margin-top:1.25rem;font-weight:600}
.primary:disabled{opacity:.6}
.ghost{background:none;color:#e07a2f;padding:.25rem}
.err{color:#b3261e;min-height:1.5em;margin:.75rem 0 0}
.top{display:flex;justify-content:space-between;align-items:baseline}
fieldset{border:1px solid #eee;border-radius:10px;margin:.75rem 0;padding:.25rem 1rem 1rem}
legend{font-weight:600;text-transform:capitalize;padding:0 .25rem}
.row{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}
ol{padding-left:1.25rem}li{margin:.75rem 0;word-break:break-all}
</style></head><body>${body}</body></html>`

const post = `const post = async (url, body) => {
  const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body ?? {}) })
  return { ok: res.ok, status: res.status, body: await res.json().catch(() => ({})) }
}`

export const loginPage = shell(
  'Vani: log in',
  `<div class="card">
<h1>Vani</h1>
<p class="sub" id="sub">Log in to manage your family.</p>
<form id="f">
  <label for="email">Email</label><input id="email" type="email" autocomplete="email" required>
  <label for="password">Password</label><input id="password" type="password" autocomplete="current-password" minlength="8" required>
  <button class="primary" id="go">Log in</button>
  <p class="err" id="err"></p>
</form>
<p>
  <span id="q">New here?</span> <button class="ghost" id="toggle" type="button">Create an account</button>
</p>
</div>
<script>
${post}
let mode = 'login'
const $ = (id) => document.getElementById(id)
$('toggle').onclick = () => {
  mode = mode === 'login' ? 'signup' : 'login'
  const s = mode === 'signup'
  $('go').textContent = s ? 'Create account' : 'Log in'
  $('sub').textContent = s ? 'Create an account to set up Vani for your family.' : 'Log in to manage your family.'
  $('q').textContent = s ? 'Already have an account?' : 'New here?'
  $('toggle').textContent = s ? 'Log in' : 'Create an account'
  $('password').autocomplete = s ? 'new-password' : 'current-password'
  $('err').textContent = ''
}
$('f').onsubmit = async (e) => {
  e.preventDefault()
  $('go').disabled = true
  const r = await post('/api/auth/' + mode, { email: $('email').value, password: $('password').value })
  $('go').disabled = false
  if (r.ok) location.href = '/'
  else $('err').textContent = r.body.error || 'Something went wrong. Try again.'
}
</script>`,
)

export const setupPage = (email: string) =>
  shell(
    'Vani: set up your family',
    `<div class="card wide">
<div class="top"><h1>Set up Vani</h1><button class="ghost" id="logout">Log out</button></div>
<p class="sub">Signed in as <span id="who"></span>. Add yourself and your parents. Each person gets their own Telegram link.</p>
<form id="f">
  <label for="familyName">Family name</label><input id="familyName" required placeholder="Sharma">
  <div id="rows"></div>
  <button class="ghost" type="button" id="add">+ Add a parent</button>
  <button class="primary" id="go">Create family</button>
  <p class="err" id="err"></p>
</form>
<ol id="out"></ol>
</div>
<script>
${post}
const $ = (id) => document.getElementById(id)
$('who').textContent = ${JSON.stringify(email)}
const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
const row = (role, zone) => {
  const f = document.createElement('fieldset')
  f.innerHTML = '<legend></legend><div class="row"><div><label>Name</label><input name="name" required></div>' +
    '<div><label>Timezone</label><input name="timezone" required></div></div>'
  f.querySelector('legend').textContent = role === 'owner' ? 'You' : 'Parent'
  f.querySelector('[name=timezone]').value = zone
  f.dataset.role = role
  $('rows').append(f)
}
row('owner', tz); row('parent', 'Asia/Kolkata')
$('add').onclick = () => row('parent', 'Asia/Kolkata')
$('logout').onclick = async () => { await post('/api/auth/logout'); location.href = '/login' }
$('f').onsubmit = async (e) => {
  e.preventDefault()
  const members = [...document.querySelectorAll('fieldset')].map((f) => ({
    name: f.querySelector('[name=name]').value, role: f.dataset.role,
    timezone: f.querySelector('[name=timezone]').value }))
  $('go').disabled = true
  const r = await post('/api/families', { familyName: $('familyName').value, members })
  $('go').disabled = false
  if (r.status === 401) { location.href = '/login'; return }
  $('err').textContent = r.ok ? '' : r.body.error
  $('out').replaceChildren()
  if (!r.ok) return
  for (const m of r.body.members) {
    const li = document.createElement('li')
    li.innerHTML = '<b></b> (' + m.role + ')<br><a target="_blank"></a>'
    li.querySelector('b').textContent = m.name
    li.querySelector('a').textContent = li.querySelector('a').href = m.telegramLink
    $('out').append(li)
  }
}
</script>`,
  )
