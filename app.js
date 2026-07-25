const groups = {
  distance: { defaults: ['m', 'ft'], metric: ['m', 'cm', 'km'], american: ['in', 'ft', 'mi'], units: { m: ['Metros', 'm', 1], cm: ['Centímetros', 'cm', .01], km: ['Quilômetros', 'km', 1000], in: ['Inches', 'Inches (in / ")', .0254], ft: ['Feet', "Feet (ft / ')", .3048], mi: ['Miles', 'Miles (mi)', 1609.344] } },
  weight: { defaults: ['kg', 'lb'], metric: ['g', 'kg'], american: ['oz', 'lb'], units: { g: ['Gramas', 'g', .001], kg: ['Quilos', 'kg', 1], oz: ['Ounces', 'Ounces (oz)', .028349523125], lb: ['Pounds', 'Pounds (lb)', .45359237] } },
  volume: { defaults: ['l', 'floz'], metric: ['ml', 'l'], american: ['floz', 'cup'], units: { ml: ['Mililitros', 'mL', .001], l: ['Litros', 'L', 1], floz: ['Fluid ounces', 'Fluid ounces (fl oz)', .0295735295625], cup: ['Cups', 'Cups (cup)', .2365882365] } },
  temperature: { defaults: ['c', 'f'], metric: ['c'], american: ['f'], units: { c: ['Celsius', '°C', 1], f: ['Fahrenheit', 'Fahrenheit (°F)', 1] } }
};
let category = 'distance', topUnit = 'm', bottomUnit = 'ft', activeField = 'top', baseValue = null;
const topInput = document.querySelector('#top-value'), bottomInput = document.querySelector('#bottom-value');
const fmt = n => Number.isFinite(n) ? Number(n.toFixed(6)).toLocaleString('pt-BR', { maximumFractionDigits: 4 }) : '';
const num = value => {
  const raw = String(value).trim().replace(/\s/g, '');
  if (!raw) return NaN;
  const comma = raw.includes(','), dot = raw.includes('.');
  if (comma && dot) {
    const decimal = raw.lastIndexOf(',') > raw.lastIndexOf('.') ? ',' : '.';
    return Number(raw.replace(decimal === ',' ? /\./g : /,/g, '').replace(decimal, '.'));
  }
  return Number(raw.replace(',', '.'));
};
function toBase(value, unit) { const g = groups[category]; return category === 'temperature' ? (unit === 'c' ? value : (value - 32) * 5 / 9) : value * g.units[unit][2]; }
function fromBase(value, unit) { const g = groups[category]; return category === 'temperature' ? (unit === 'c' ? value : value * 9 / 5 + 32) : value / g.units[unit][2]; }
function refreshValues() { if (!Number.isFinite(baseValue)) return; topInput.value = fmt(fromBase(baseValue, topUnit)); bottomInput.value = fmt(fromBase(baseValue, bottomUnit)); }
function renderUnits() { const g = groups[category]; document.querySelector('#top-unit').textContent = g.units[topUnit][0]; document.querySelector('#bottom-unit').textContent = g.units[bottomUnit][0]; const list = document.querySelector('#unit-list'); list.innerHTML = ''; [['Métricas', g.metric, 'top'], ['Americanas', g.american, 'bottom']].forEach(([title, keys, side]) => { const section = document.createElement('section'); section.className = 'unit-group'; const h = document.createElement('h2'); h.textContent = title; section.append(h); keys.forEach(key => { const b = document.createElement('button'); b.className = 'unit' + ((side === 'top' ? topUnit : bottomUnit) === key ? ' selected' : ''); b.textContent = g.units[key][side === 'top' ? 0 : 1]; b.onclick = () => { if (side === 'top') topUnit = key; else bottomUnit = key; refreshValues(); renderUnits(); }; section.append(b); }); list.append(section); }); }
function update(from) { const source = from === 'top' ? topInput : bottomInput, target = from === 'top' ? bottomInput : topInput; const v = num(source.value); if (!Number.isFinite(v)) { baseValue = null; target.value = ''; return; } baseValue = toBase(v, from === 'top' ? topUnit : bottomUnit); target.value = fmt(fromBase(baseValue, from === 'top' ? bottomUnit : topUnit)); }
function chooseField(field) { activeField = field; document.querySelectorAll('.readout').forEach(x => x.classList.toggle('active', x.dataset.field === field)); }
topInput.addEventListener('input', () => { chooseField('top'); update('top'); }); bottomInput.addEventListener('input', () => { chooseField('bottom'); update('bottom'); }); document.querySelectorAll('.readout').forEach(x => x.addEventListener('click', () => chooseField(x.dataset.field)));
document.querySelectorAll('.category').forEach(b => b.onclick = () => { category = b.dataset.category; [topUnit, bottomUnit] = groups[category].defaults; document.querySelectorAll('.category').forEach(x => x.classList.toggle('active', x === b)); topInput.value = '1'; update('top'); renderUnits(); });
document.querySelector('#clear').onclick = () => { baseValue = null; topInput.value = ''; bottomInput.value = ''; chooseField('top'); topInput.focus(); };
document.querySelectorAll('[data-key]').forEach(b => b.onclick = () => { const input = activeField === 'top' ? topInput : bottomInput, key = b.dataset.key; if (key === 'delete') input.value = input.value.slice(0, -1); else if (key === '.' && input.value.includes(',')) return; else input.value += key === '.' ? ',' : key; update(activeField); });
update('top'); renderUnits();
if ('serviceWorker' in navigator && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') navigator.serviceWorker.register('sw.js');
document.addEventListener('dblclick', event => event.preventDefault(), { passive: false });
