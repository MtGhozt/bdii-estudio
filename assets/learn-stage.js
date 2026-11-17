/* Figuras de Aprende. Sin pestaÃ±a de Animaciones.
   Estudio-desk: tablas reales, cubo CSS 3D, flujos con pasos.
   GSAP solo para translate/scale/opacity y el trazo de las FK. */
(function () {
  if (!document.getElementById('moduleContent') && typeof MODULES === 'undefined') return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  try {
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', function (e) { reduced = e.matches; });
  } catch (err) { /* Safari viejo */ }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c];
    });
  }

  function studyOf() {
    var p = location.pathname;
    if (p.indexOf('/dwh/') >= 0) return 'dwh';
    if (p.indexOf('/spark/') >= 0) return 'spark';
    if (p.indexOf('/mongo/') >= 0) return 'mongo';
    if (p.indexOf('/redis/') >= 0) return 'redis';
    if (p.indexOf('/gfs/') >= 0) return 'gfs';
    if (p.indexOf('/bigtable/') >= 0) return 'bigtable';
    if (p.indexOf('/aurora/') >= 0) return 'aurora';
    if (p.indexOf('/zanzibar/') >= 0) return 'zanzibar';
    return '';
  }

  /* ---------- pasos ---------- */
  function mountFrames(host, cfg) {
    host.innerHTML =
      '<p class="lv-kicker">' + esc(cfg.kicker) + '</p>' +
      '<p class="lv-title">' + esc(cfg.title) + '</p>' +
      (cfg.help ? '<p class="lv-help">' + cfg.help + '</p>' : '') +
      '<div class="lv-tabs" role="tablist"></div>' +
      '<div class="lv-panel"></div>' +
      '<p class="lv-narr" aria-live="polite"></p>';
    var tabs = host.querySelector('.lv-tabs');
    var panel = host.querySelector('.lv-panel');
    var narr = host.querySelector('.lv-narr');
    var i = 0, timer = null, held = false;
    cfg.frames.forEach(function (f, n) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn small';
      b.textContent = f.name;
      b.setAttribute('role', 'tab');
      b.addEventListener('click', function () { held = true; stop(); show(n); });
      tabs.appendChild(b);
    });
    function show(n) {
      i = n;
      tabs.querySelectorAll('button').forEach(function (b, k) {
        b.classList.toggle('is-on', k === n);
        b.setAttribute('aria-selected', k === n ? 'true' : 'false');
      });
      var html = cfg.frames[n].html;
      var text = cfg.frames[n].text;
      if (reduced) {
        panel.innerHTML = html;
        narr.innerHTML = text;
        return;
      }
      panel.style.opacity = '0';
      window.setTimeout(function () {
        panel.innerHTML = html;
        narr.innerHTML = text;
        panel.style.opacity = '1';
      }, 140);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function play() {
      if (reduced || held || timer) return;
      timer = setInterval(function () {
        if (held) return stop();
        if (i >= cfg.frames.length - 1) return stop();
        show(i + 1);
      }, 1700);
    }
    show(0);
    host._lvPlay = play;
    host.addEventListener('pointerenter', function () { held = true; stop(); });
  }

  /* ---------- esquema estrella / copo / galaxia ---------- */
  var Q = {
    star: {
      narr: 'Estrella. <b>dim_producto</b> guarda categorÃ­a y marca en la misma fila. El hecho solo hace un join por dimensiÃ³n. ArrastrÃ¡ una tabla: la lÃ­nea FKâ†’PK la sigue.',
      tables: ['fact_ventas', 'dim_fecha', 'dim_producto', 'dim_tienda', 'dim_cliente']
    },
    snow: {
      narr: 'Copo. CategorÃ­a y marca <b>salen</b> de dim_producto y quedan en tablas hijas. La dimensiÃ³n se normaliza y la consulta de â€œventas por categorÃ­aâ€ suma joins.',
      tables: ['fact_ventas', 'dim_fecha', 'dim_producto', 'dim_categoria', 'dim_marca', 'dim_tienda', 'dim_cliente']
    },
    galaxy: {
      narr: 'ConstelaciÃ³n. <b>fact_inventario</b> comparte fecha, producto y tienda con las ventas. El cliente solo existe en el hecho de ventas: es el bus de Kimball.',
      tables: ['fact_ventas', 'fact_inventario', 'dim_fecha', 'dim_producto', 'dim_tienda', 'dim_cliente']
    }
  };

  function col(name, kind, type) { return { name: name, kind: kind, type: type }; }
  function schemaTables(mode) {
    var producto = mode === 'snow'
      ? {
          id: 'dim_producto', kind: 'dim', title: 'dim_producto',
          cols: [col('producto_key', 'pk', 'int'), col('sku', 'attr', 'text'), col('producto', 'attr', 'text'), col('categoria_key', 'fk', 'int'), col('marca_key', 'fk', 'int')],
          rows: [['17', 'SKU-17', 'Camisa lino', '3', '8'], ['22', 'SKU-22', 'PantalÃ³n', '3', '8']],
          fks: { categoria_key: ['dim_categoria', 'categoria_key'], marca_key: ['dim_marca', 'marca_key'] }
        }
      : {
          id: 'dim_producto', kind: 'dim', title: 'dim_producto',
          cols: [col('producto_key', 'pk', 'int'), col('sku', 'attr', 'text'), col('producto', 'attr', 'text'), col('categoria', 'attr', 'text'), col('marca', 'attr', 'text')],
          rows: [['17', 'SKU-17', 'Camisa lino', 'Ropa', 'NorteTextil'], ['22', 'SKU-22', 'PantalÃ³n', 'Ropa', 'NorteTextil']],
          fks: {}
        };
    var all = {
      fact_ventas: {
        id: 'fact_ventas', kind: 'fact', title: 'fact_ventas',
        cols: [col('venta_id', 'pk', 'int'), col('fecha_key', 'fk', 'int'), col('producto_key', 'fk', 'int'), col('tienda_key', 'fk', 'int'), col('cliente_key', 'fk', 'int'), col('ticket_id', 'degen', 'text'), col('cantidad', 'meas', 'int'), col('venta_bruta', 'meas', 'â‚¡')],
        rows: [['9001', '20250714', '17', '4', '501', 'T-88421', '1', '12000'], ['9002', '20250714', '17', '4', '501', 'T-88421', '1', '12000'], ['9003', '20250714', '22', '4', '501', 'T-88421', '1', '18000']],
        samples: ['9001 Â· prod 17 Â· tienda 4 Â· Ana 501 Â· T-88421 Â· â‚¡12000', '9002 Â· otra camisa Â· mismo ticket', '9003 Â· prod 22 pantalÃ³n Â· â‚¡18000'],
        fks: { fecha_key: ['dim_fecha', 'fecha_key'], producto_key: ['dim_producto', 'producto_key'], tienda_key: ['dim_tienda', 'tienda_key'], cliente_key: ['dim_cliente', 'cliente_key'] }
      },
      fact_inventario: {
        id: 'fact_inventario', kind: 'fact', title: 'fact_inventario',
        cols: [col('inv_id', 'pk', 'int'), col('fecha_key', 'fk', 'int'), col('producto_key', 'fk', 'int'), col('tienda_key', 'fk', 'int'), col('unidades', 'meas', 'int')],
        rows: [['441', '20250714', '17', '4', '40']],
        fks: { fecha_key: ['dim_fecha', 'fecha_key'], producto_key: ['dim_producto', 'producto_key'], tienda_key: ['dim_tienda', 'tienda_key'] }
      },
      dim_fecha: {
        id: 'dim_fecha', kind: 'dim', title: 'dim_fecha',
        cols: [col('fecha_key', 'pk', 'int'), col('fecha', 'attr', 'date'), col('mes', 'attr', 'text'), col('trimestre', 'attr', 'text')],
        rows: [['20250714', '2025-07-14', '2025-07', 'Q3']], fks: {}
      },
      dim_producto: producto,
      dim_categoria: {
        id: 'dim_categoria', kind: 'dim', title: 'dim_categoria',
        cols: [col('categoria_key', 'pk', 'int'), col('categoria', 'attr', 'text')],
        rows: [['3', 'Ropa']], fks: {}
      },
      dim_marca: {
        id: 'dim_marca', kind: 'dim', title: 'dim_marca',
        cols: [col('marca_key', 'pk', 'int'), col('marca', 'attr', 'text')],
        rows: [['8', 'NorteTextil']], fks: {}
      },
      dim_tienda: {
        id: 'dim_tienda', kind: 'dim', title: 'dim_tienda',
        cols: [col('tienda_key', 'pk', 'int'), col('tienda', 'attr', 'text'), col('region', 'attr', 'text')],
        rows: [['4', 'Central', 'Norte']], fks: {}
      },
      dim_cliente: {
        id: 'dim_cliente', kind: 'dim', title: 'dim_cliente',
        cols: [col('cliente_key', 'pk', 'int'), col('natural', 'attr', 'text'), col('nombre', 'attr', 'text'), col('segmento', 'attr', 'text')],
        rows: [['501', 'C-1001', 'Ana LÃ³pez', 'Standard']], fks: {}
      }
    };
    return Q[mode].tables.map(function (id) { return all[id]; });
  }

  var LAYOUT = {
    star: { dim_fecha: [380, 16], dim_producto: [16, 250], fact_ventas: [370, 260], dim_tienda: [748, 16], dim_cliente: [748, 400] },
    snow: { dim_categoria: [16, 12], dim_marca: [16, 500], dim_producto: [16, 200], dim_fecha: [390, 12], fact_ventas: [390, 230], dim_tienda: [748, 12], dim_cliente: [748, 420] },
    galaxy: { dim_fecha: [380, 8], dim_producto: [12, 160], dim_tienda: [748, 8], dim_cliente: [12, 470], fact_ventas: [250, 200], fact_inventario: [540, 400] }
  };

  function mountSchema(host) {
    host.innerHTML =
      '<p class="lv-kicker">Esquema del caso retail</p>' +
      '<p class="lv-title">Estrella, copo de nieve y constelaciÃ³n</p>' +
      '<p class="lv-help">Cada caja es una tabla: clave, columnas y filas del ticket T-88421 (2 camisas + 1 pantalÃ³n). Las lÃ­neas van de la FK a la PK. ArrastrÃ¡ el nombre o usÃ¡ las flechas con el encabezado enfocado.</p>' +
      '<div class="lv-tabs" role="tablist" aria-label="Tipo de esquema">' +
        '<button type="button" class="btn small" data-mode="star">Estrella</button>' +
        '<button type="button" class="btn small" data-mode="snow">Copo de nieve</button>' +
        '<button type="button" class="btn small" data-mode="galaxy">ConstelaciÃ³n</button>' +
      '</div>' +
      '<div class="db-clip"><div class="schema-board" id="schemaBoard"><svg class="schema-wires" aria-hidden="true"></svg></div></div>' +
      '<p class="lv-legend"><span><i class="pk">PK</i> clave primaria</span><span><i class="fk">FK</i> clave forÃ¡nea â€” pasÃ¡ el mouse para ver la relaciÃ³n</span><span>degen = dimensiÃ³n degenerada</span></p>' +
      '<p class="lv-narr" aria-live="polite"></p>';
    var board = host.querySelector('.schema-board');
    var svg = host.querySelector('.schema-wires');
    var narr = host.querySelector('.lv-narr');
    var mode = 'star';
    var pos = {};
    var drag = null;
    var lineRaf = 0;
    var hot = '';

    function requestLines() {
      if (lineRaf) return;
      lineRaf = requestAnimationFrame(function () {
        lineRaf = 0;
        if (svg.querySelector('path')) drawLines(false);
      });
    }

    function mark(kind) {
      if (kind === 'pk') return 'PK';
      if (kind === 'fk') return 'FK';
      if (kind === 'degen') return 'deg';
      if (kind === 'meas') return 'med';
      return '';
    }

    function paintTable(def) {
      var wrap = board.querySelector('.db-wrap[data-id="' + def.id + '"]');
      if (!wrap) {
        wrap = document.createElement('div');
        wrap.className = 'db-wrap';
        wrap.dataset.id = def.id;
        wrap.style.opacity = '0';
        board.appendChild(wrap);
      }
      var headBtn = '<button type="button" class="dbtbl-drag" aria-label="Mover ' + esc(def.title) + '">' + esc(def.title) + '</button>';
      var cols = def.cols.map(function (c) {
        var rel = def.fks[c.name] ? def.id + '.' + c.name : '';
        var cls = c.kind === 'pk' ? 'is-pk' : (c.kind === 'fk' ? 'is-fk' : '');
        return '<tr class="' + cls + '" data-col="' + esc(c.name) + '"' + (rel ? ' data-rel="' + esc(rel) + '" tabindex="0"' : '') + '>' +
          '<td class="mark">' + mark(c.kind) + '</td><td>' + esc(c.name) + '</td><td>' + esc(c.type) + '</td></tr>';
      }).join('');
      var samples = (def.samples || def.rows.map(function (r) {
        return def.cols.map(function (c, i) { return c.name + ' ' + r[i]; }).slice(0, 4).join(' Â· ');
      })).map(function (line) { return '<li>' + esc(line).replace(/ Â· /g, ' Â· ') + '</li>'; }).join('');
      wrap.innerHTML =
        '<article class="dbtbl ' + def.kind + '">' +
          '<header class="dbtbl-head">' + headBtn + '<span class="dbtbl-kind">' + (def.kind === 'fact' ? 'hecho' : 'dim') + '</span></header>' +
          '<table><tbody>' + cols + '</tbody></table>' +
          '<div class="dbtbl-rows"><p>filas de ejemplo</p><ul class="db-sample">' + samples + '</ul></div>' +
        '</article>';
      var btn = wrap.querySelector('.dbtbl-drag');
      btn.addEventListener('pointerdown', function (e) {
        if (e.button != null && e.button !== 0) return;
        drag = { id: def.id, x0: e.clientX, y0: e.clientY, px: pos[def.id].x, py: pos[def.id].y };
        wrap.classList.add('is-dragging');
        btn.setPointerCapture(e.pointerId);
        e.preventDefault();
      });
      btn.addEventListener('pointermove', function (e) {
        if (!drag || drag.id !== def.id) return;
        var nx = drag.px + (e.clientX - drag.x0);
        var ny = drag.py + (e.clientY - drag.y0);
        nx = Math.max(-30, Math.min(820, nx));
        ny = Math.max(-10, Math.min(560, ny));
        pos[def.id] = { x: nx, y: ny };
        if (window.gsap) gsap.set(wrap, { x: nx, y: ny });
        else wrap.style.transform = 'translate(' + nx + 'px,' + ny + 'px)';
        requestLines();
      });
      function endDrag(e) {
        if (!drag || drag.id !== def.id) return;
        drag = null;
        wrap.classList.remove('is-dragging');
      }
      btn.addEventListener('pointerup', endDrag);
      btn.addEventListener('pointercancel', endDrag);
      btn.addEventListener('keydown', function (e) {
        var step = { ArrowLeft: [-18, 0], ArrowRight: [18, 0], ArrowUp: [0, -18], ArrowDown: [0, 18] }[e.key];
        if (!step) return;
        e.preventDefault();
        pos[def.id].x = Math.max(-30, Math.min(820, pos[def.id].x + step[0]));
        pos[def.id].y = Math.max(-10, Math.min(560, pos[def.id].y + step[1]));
        if (window.gsap) gsap.set(wrap, { x: pos[def.id].x, y: pos[def.id].y });
        requestLines();
      });
      wrap.querySelectorAll('tr.is-fk').forEach(function (tr) {
        tr.addEventListener('pointerenter', function () { hot = tr.dataset.rel; drawLines(false); });
        tr.addEventListener('pointerleave', function () { if (hot === tr.dataset.rel) { hot = ''; drawLines(false); } });
        tr.addEventListener('focusin', function () { hot = tr.dataset.rel; drawLines(false); });
      });
      return wrap;
    }

    function place(id, x, y, animate, fresh) {
      pos[id] = { x: x, y: y };
      var wrap = board.querySelector('.db-wrap[data-id="' + id + '"]');
      if (!wrap) return;
      wrap.hidden = false;
      wrap.style.visibility = 'visible';
      wrap.style.pointerEvents = 'auto';
      if (!window.gsap || reduced || !animate) {
        if (window.gsap) gsap.set(wrap, { x: x, y: y, opacity: 1, scale: 1 });
        else { wrap.style.transform = 'translate(' + x + 'px,' + y + 'px)'; wrap.style.opacity = '1'; }
        return;
      }
      if (fresh) {
        gsap.fromTo(wrap, { x: x, y: y + 10, opacity: 0, scale: 0.96 }, {
          x: x, y: y, opacity: 1, scale: 1, duration: 0.48, ease: 'back.out(1.5)', overwrite: 'auto', onUpdate: requestLines
        });
      } else {
        gsap.to(wrap, { x: x, y: y, opacity: 1, scale: 1, duration: 0.5, ease: 'power2.inOut', overwrite: 'auto', onUpdate: requestLines });
      }
    }

    function hideRest(ids) {
      board.querySelectorAll('.db-wrap').forEach(function (wrap) {
        if (ids.indexOf(wrap.dataset.id) >= 0) return;
        wrap.style.pointerEvents = 'none';
        if (window.gsap && !reduced) {
          gsap.to(wrap, { opacity: 0, duration: 0.22, overwrite: 'auto', onComplete: function () { wrap.hidden = true; } });
        } else wrap.hidden = true;
      });
    }

    function drawLines(animate) {
      var defs = schemaTables(mode);
      var want = [];
      defs.forEach(function (def) {
        Object.keys(def.fks).forEach(function (fk) {
          var to = def.fks[fk];
          if (Q[mode].tables.indexOf(to[0]) < 0) return;
          want.push({ rel: def.id + '.' + fk, from: def.id, col: fk, to: to[0], pk: to[1] });
        });
      });
      var br = board.getBoundingClientRect();
      svg.setAttribute('viewBox', '0 0 ' + board.clientWidth + ' ' + board.clientHeight);
      svg.classList.toggle('is-dim', !!hot);
      board.querySelectorAll('tr.is-rel').forEach(function (tr) { tr.classList.remove('is-rel'); });
      var keep = {};
      want.forEach(function (w) {
        keep[w.rel] = true;
        var fromEl = board.querySelector('.db-wrap[data-id="' + w.from + '"] tr[data-col="' + w.col + '"]');
        var toEl = board.querySelector('.db-wrap[data-id="' + w.to + '"] tr[data-col="' + w.pk + '"]');
        if (!fromEl || !toEl) return;
        var a = fromEl.getBoundingClientRect();
        var b = toEl.getBoundingClientRect();
        var ax = (a.left + a.right) / 2 - br.left;
        var ay = (a.top + a.bottom) / 2 - br.top;
        var bx = (b.left + b.right) / 2 - br.left;
        var by = (b.top + b.bottom) / 2 - br.top;
        var x1 = bx < ax ? a.left - br.left : a.right - br.left;
        var x2 = bx < ax ? b.right - br.left : b.left - br.left;
        var y1 = ay, y2 = by;
        var d = 'M ' + x1 + ' ' + y1 + ' C ' + ((x1 + x2) / 2) + ' ' + y1 + ', ' + ((x1 + x2) / 2) + ' ' + y2 + ', ' + x2 + ' ' + y2;
        var path = svg.querySelector('path[data-rel="' + w.rel + '"]');
        var created = !path;
        if (!path) {
          path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.dataset.rel = w.rel;
          svg.appendChild(path);
        }
        path.setAttribute('d', d);
        path.classList.toggle('is-hot', hot === w.rel);
        fromEl.classList.toggle('is-rel', hot === w.rel);
        toEl.classList.toggle('is-rel', hot === w.rel);
        if (created && animate && !reduced && path.getTotalLength) {
          var len = path.getTotalLength();
          if (len) {
            path.style.strokeDasharray = String(len);
            path.style.strokeDashoffset = String(len);
            if (window.gsap) gsap.to(path, { strokeDashoffset: 0, duration: 0.55, ease: 'power2.out', delay: 0.12 });
            else path.style.strokeDashoffset = '0';
          }
        }
      });
      svg.querySelectorAll('path').forEach(function (p) { if (!keep[p.dataset.rel]) p.remove(); });
      if (!hot) narr.innerHTML = Q[mode].narr;
      else {
        var bits = hot.split('.');
        narr.innerHTML = '<b>' + esc(bits[0] + '.' + bits[1]) + '</b> apunta a la PK de la dimensiÃ³n. La lÃ­nea es esa FK.';
      }
    }

    function apply(next, animate) {
      var prevIds = Q[mode].tables.slice();
      mode = next;
      var defs = schemaTables(mode);
      var ids = defs.map(function (d) { return d.id; });
      defs.forEach(function (d) { paintTable(d); });
      hideRest(ids);
      var lay = LAYOUT[mode];
      defs.forEach(function (d) {
        var xy = lay[d.id];
        var wrapNow = board.querySelector('.db-wrap[data-id="' + d.id + '"]');
        var fresh = prevIds.indexOf(d.id) < 0 || !!(wrapNow && wrapNow.style.opacity === '0');
        place(d.id, xy[0], xy[1], animate, fresh);
      });
      host.querySelectorAll('.lv-tabs button').forEach(function (b) {
        var on = b.dataset.mode === mode;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      narr.innerHTML = Q[mode].narr;
      window.setTimeout(function () { drawLines(animate); }, animate && !reduced ? 60 : 0);
    }

    host.querySelectorAll('.lv-tabs button').forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.dataset.mode === mode) return;
        if (!reduced && mode === 'star' && b.dataset.mode === 'snow') {
          board.querySelectorAll('[data-col="categoria"], [data-col="marca"]').forEach(function (tr) { tr.classList.add('is-leaving'); });
          window.setTimeout(function () { apply('snow', true); }, 260);
          return;
        }
        apply(b.dataset.mode, true);
      });
    });
    apply('star', true);
    window.addEventListener('resize', requestLines);
  }

  /* ---------- cubo OLAP ---------- */
  var SALES = {
    Q1: { Norte: { Laptops: 4.2, Ropa: 3.1, Hogar: 2.0 }, Centro: { Laptops: 6.4, Ropa: 4.8, Hogar: 3.3 }, Sur: { Laptops: 3.5, Ropa: 5.1, Hogar: 1.8 } },
    Q2: { Norte: { Laptops: 4.8, Ropa: 2.9, Hogar: 2.2 }, Centro: { Laptops: 7.1, Ropa: 5.0, Hogar: 3.6 }, Sur: { Laptops: 3.9, Ropa: 4.7, Hogar: 2.0 } },
    Q3: { Norte: { Laptops: 8.6, Ropa: 4.2, Hogar: 2.6 }, Centro: { Laptops: 9.4, Ropa: 6.1, Hogar: 4.0 }, Sur: { Laptops: 5.2, Ropa: 6.8, Hogar: 2.4 } },
    Q4: { Norte: { Laptops: 7.2, Ropa: 5.5, Hogar: 3.1 }, Centro: { Laptops: 8.8, Ropa: 7.4, Hogar: 4.4 }, Sur: { Laptops: 4.6, Ropa: 8.1, Hogar: 2.9 } }
  };
  var MONTHS = { Q1: ['Ene', 'Feb', 'Mar'], Q2: ['Abr', 'May', 'Jun'], Q3: ['Jul', 'Ago', 'Sep'], Q4: ['Oct', 'Nov', 'Dic'] };
  var WEIGHT = [0.30, 0.34, 0.36];
  var FACE = { time: '#c2a05e', region: '#6fae9d', product: '#8ba3c7' };
  var DNAME = { time: 'Tiempo', region: 'RegiÃ³n', product: 'Producto' };

  function money(m) {
    var n = Math.round(m * 1000000);
    try { return 'â‚¡' + n.toLocaleString('es-CR'); } catch (e) { return 'â‚¡' + n; }
  }

  function mountCube(host) {
    var grain = 'quarter';
    var focusQ = 'Q3';
    var order = ['time', 'region', 'product'];
    var sliceOn = false, diceOn = false;
    var sliceDim = 'region', sliceMember = 'Norte';
    var rx = -20, ry = 32;
    var selected = null;
    var CELL = 48, GAP = 8, STEP = CELL + GAP;

    host.innerHTML =
      '<p class="lv-kicker">Cubo del caso retail Â· ejemplo</p>' +
      '<p class="lv-title">OLAP en tres ejes</p>' +
      '<p class="lv-help">Cada cubito es una celda: tiempo Ã— regiÃ³n Ã— producto = ventas. ArrastrÃ¡ para rotar. Slice deja una capa, dice un subcubo, roll-up y drill cambian el grano del tiempo, pivot cambia quÃ© eje es cuÃ¡l.</p>' +
      '<div class="lv-tabs">' +
        '<button type="button" class="btn small" data-op="slice">Slice</button>' +
        '<button type="button" class="btn small" data-op="dice">Dice</button>' +
        '<button type="button" class="btn small" data-op="rollup">Roll-up</button>' +
        '<button type="button" class="btn small" data-op="drill">Drill-down</button>' +
        '<button type="button" class="btn small" data-op="pivot">Pivot</button>' +
        '<button type="button" class="btn small ghost" data-op="reset">Reiniciar</button>' +
      '</div>' +
      '<div class="olap-layout">' +
        '<div class="olap-scene" tabindex="0" role="application" aria-describedby="olapHelp">' +
          '<div class="olap-world" style="--cell:' + CELL + 'px"></div>' +
        '</div>' +
        '<div class="olap-side">' +
          '<p class="lv-read" id="olapRead" aria-live="polite">PasÃ¡ el mouse o hacÃ© clic en un cubito.</p>' +
          '<p class="lv-help" id="olapHelp">Flechas mueven la selecciÃ³n. Shift+flechas rotan la vista.</p>' +
          '<label class="lv-help">DimensiÃ³n del slice<select id="olapSliceDim"><option value="region">RegiÃ³n</option><option value="time">Tiempo</option><option value="product">Producto</option></select></label>' +
          '<label class="lv-help">Miembro<select id="olapSliceMem"></select></label>' +
          '<div class="olap-legend">' +
            '<span style="--sw:#c2a05e">Tiempo</span>' +
            '<span style="--sw:#6fae9d">RegiÃ³n</span>' +
            '<span style="--sw:#8ba3c7">Producto</span>' +
          '</div>' +
          '<p class="lv-narr" id="olapNarr"></p>' +
        '</div>' +
      '</div>' +
      '<details><summary>Ver las celdas en tabla</summary><div id="olapTable"></div></details>';

    var scene = host.querySelector('.olap-scene');
    var world = host.querySelector('.olap-world');
    var read = host.querySelector('#olapRead');
    var narr = host.querySelector('#olapNarr');
    var dimSel = host.querySelector('#olapSliceDim');
    var memSel = host.querySelector('#olapSliceMem');
    var cubies = [];
    var dragging = false, lx = 0, ly = 0, moved = 0;

    function timeLabels() {
      if (grain === 'semester') return ['S1', 'S2'];
      if (grain === 'month') return MONTHS[focusQ];
      return ['Q1', 'Q2', 'Q3', 'Q4'];
    }
    function dims() {
      return { time: timeLabels(), region: ['Norte', 'Centro', 'Sur'], product: ['Hogar', 'Ropa', 'Laptops'] };
    }
    function value(time, region, product) {
      if (grain === 'quarter') return SALES[time][region][product];
      if (grain === 'semester') {
        var qs = time === 'S1' ? ['Q1', 'Q2'] : ['Q3', 'Q4'];
        return qs.reduce(function (s, q) { return s + SALES[q][region][product]; }, 0);
      }
      var idx = MONTHS[focusQ].indexOf(time);
      return SALES[focusQ][region][product] * WEIGHT[idx];
    }
    function logicalOf(i, j, k) {
      var d = dims();
      var o = {};
      o[order[0]] = d[order[0]][i];
      o[order[1]] = d[order[1]][j];
      o[order[2]] = d[order[2]][k];
      return o;
    }
    function visible(o) {
      if (sliceOn && o[sliceDim] !== sliceMember) return false;
      if (diceOn) {
        var times = timeLabels();
        var keepT = times.slice(-2);
        if (keepT.indexOf(o.time) < 0) return false;
        if (o.region !== 'Norte') return false;
        if (o.product !== 'Laptops') return false;
      }
      return true;
    }
    function say(o) {
      var v = value(o.time, o.region, o.product);
      read.textContent = o.time + ' Â· ' + o.region + ' Â· ' + o.product + ' = ' + money(v);
    }
    function fillMembers() {
      var list = dims()[sliceDim];
      memSel.innerHTML = list.map(function (m) { return '<option>' + esc(m) + '</option>'; }).join('');
      if (list.indexOf(sliceMember) < 0) sliceMember = list[0];
      memSel.value = sliceMember;
    }
    function applyFilter() {
      cubies.forEach(function (c) {
        var on = visible(c._o);
        var lift = on && (sliceOn || diceOn) ? 14 : 0;
        var y = c._y + (on ? 0 : (c._j - 1) * 18);
        c.style.transform = 'translate3d(' + c._x + 'px,' + y + 'px,' + (c._z + lift) + 'px)';
        c.style.opacity = on ? '1' : '0';
        c.style.pointerEvents = on ? 'auto' : 'none';
        c.classList.toggle('is-hot', selected && selected.time === c._o.time && selected.region === c._o.region && selected.product === c._o.product);
      });
    }
    function rebuild(entrance) {
      var d = dims();
      var nx = d[order[0]], ny = d[order[1]], nz = d[order[2]];
      world.innerHTML = '';
      cubies = [];
      var n = 0;
      for (var i = 0; i < nx.length; i++) {
        for (var j = 0; j < ny.length; j++) {
          for (var k = 0; k < nz.length; k++) {
            var o = logicalOf(i, j, k);
            var x = (i - (nx.length - 1) / 2) * STEP;
            var y = (j - (ny.length - 1) / 2) * STEP;
            var z = (k - (nz.length - 1) / 2) * STEP;
            var el = document.createElement('button');
            el.type = 'button';
            el.className = 'cubie';
            el.style.setProperty('--cell', CELL + 'px');
            el._x = x; el._y = y; el._z = z; el._j = j; el._o = o;
            var v = value(o.time, o.region, o.product);
            el.setAttribute('aria-label', o.time + ', ' + o.region + ', ' + o.product + ', ' + money(v));
            el.innerHTML =
              '<span class="face f-front" style="--face:' + FACE[order[2]] + '">' + esc(o[order[2]]) + '<b>' + v.toFixed(1) + '</b></span>' +
              '<span class="face f-back" style="--face:' + FACE[order[2]] + '"></span>' +
              '<span class="face f-right" style="--face:' + FACE[order[0]] + '">' + (i === nx.length - 1 ? esc(o[order[0]]) : '') + '</span>' +
              '<span class="face f-left" style="--face:' + FACE[order[0]] + '">' + (i === 0 ? esc(o[order[0]]) : '') + '</span>' +
              '<span class="face f-top" style="--face:' + FACE[order[1]] + '">' + (j === 0 ? esc(o[order[1]]) : '') + '</span>' +
              '<span class="face f-bot" style="--face:' + FACE[order[1]] + '"></span>';
            el.addEventListener('pointerenter', function (ev) { if (!dragging) say(ev.currentTarget._o); });
            el.addEventListener('click', function (ev) {
              if (moved > 6) return;
              selected = ev.currentTarget._o;
              if (selected.time && MONTHS[selected.time]) focusQ = selected.time;
              say(selected);
              applyFilter();
            });
            world.appendChild(el);
            cubies.push(el);
            n++;
          }
        }
      }
      ['time', 'region', 'product'].forEach(function () {});
      var halfX = (nx.length * STEP) / 2, halfY = (ny.length * STEP) / 2, halfZ = (nz.length * STEP) / 2;
      var tags = [
        { name: DNAME[order[0]], color: FACE[order[0]], tf: 'translate3d(' + (halfX + 36) + 'px,8px,0)' },
        { name: DNAME[order[1]], color: FACE[order[1]], tf: 'translate3d(' + (-halfX - 8) + 'px,' + (-halfY - 34) + 'px,0)' },
        { name: DNAME[order[2]], color: FACE[order[2]], tf: 'translate3d(0,' + (halfY + 28) + 'px,' + (halfZ + 8) + 'px)' }
      ];
      tags.forEach(function (t) {
        var s = document.createElement('div');
        s.className = 'axis-tag';
        s.style.color = t.color;
        s.style.setProperty('--tag', t.color);
        s.style.transform = t.tf;
        s.textContent = t.name;
        world.appendChild(s);
      });
      world.style.transform = 'rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
      applyFilter();
      if (entrance && window.gsap && !reduced) {
        cubies.forEach(function (c, idx) {
          var target = c.style.opacity;
          c.style.opacity = '0';
          gsap.to(c, { opacity: target === '0' ? 0 : 1, duration: 0.35, delay: idx * 0.015, ease: 'power2.out' });
        });
      }
      var grainName = grain === 'quarter' ? 'trimestre' : (grain === 'month' ? 'mes (' + focusQ + ')' : 'semestre');
      narr.innerHTML = 'Grano de tiempo: <b>' + grainName + '</b>. Ejes X ' + DNAME[order[0]] + ' Â· Y ' + DNAME[order[1]] + ' Â· Z ' + DNAME[order[2]] + '.' +
        (sliceOn ? ' Slice: ' + DNAME[sliceDim] + ' = ' + sliceMember + '.' : '') +
        (diceOn ? ' Dice: Ãºltimos tiempos Ã— Norte Ã— Laptops.' : '');
      var rows = [];
      cubies.forEach(function (c) {
        if (!visible(c._o)) return;
        rows.push('<tr><td>' + esc(c._o.time) + '</td><td>' + esc(c._o.region) + '</td><td>' + esc(c._o.product) + '</td><td>' + money(value(c._o.time, c._o.region, c._o.product)) + '</td></tr>');
      });
      host.querySelector('#olapTable').innerHTML = '<table class="olap-table"><thead><tr><th>Tiempo</th><th>RegiÃ³n</th><th>Producto</th><th>Ventas</th></tr></thead><tbody>' + rows.join('') + '</tbody></table>';
      host.querySelector('[data-op="slice"]').classList.toggle('is-on', sliceOn);
      host.querySelector('[data-op="dice"]').classList.toggle('is-on', diceOn);
      host.querySelector('[data-op="slice"]').setAttribute('aria-pressed', sliceOn ? 'true' : 'false');
      host.querySelector('[data-op="dice"]').setAttribute('aria-pressed', diceOn ? 'true' : 'false');
    }

    dimSel.addEventListener('change', function () { sliceDim = dimSel.value; fillMembers(); if (sliceOn) { rebuild(false); } });
    memSel.addEventListener('change', function () { sliceMember = memSel.value; if (sliceOn) rebuild(false); });
    fillMembers();

    host.querySelector('[data-op="slice"]').addEventListener('click', function () {
      sliceOn = !sliceOn; if (sliceOn) diceOn = false; rebuild(false);
    });
    host.querySelector('[data-op="dice"]').addEventListener('click', function () {
      diceOn = !diceOn; if (diceOn) sliceOn = false; rebuild(false);
    });
    host.querySelector('[data-op="rollup"]').addEventListener('click', function () {
      if (grain === 'month') grain = 'quarter';
      else if (grain === 'quarter') grain = 'semester';
      else { narr.innerHTML = 'Ya estÃ¡ en el grano mÃ¡s alto (semestre = Q1+Q2 y Q3+Q4).'; return; }
      diceOn = false; rebuild(false);
    });
    host.querySelector('[data-op="drill"]').addEventListener('click', function () {
      if (grain === 'semester') grain = 'quarter';
      else if (grain === 'quarter') {
        if (selected && MONTHS[selected.time]) focusQ = selected.time;
        grain = 'month';
      } else { narr.innerHTML = 'Ya estÃ¡ en meses de ' + focusQ + '. Roll-up vuelve al trimestre.'; return; }
      diceOn = false; rebuild(false);
    });
    host.querySelector('[data-op="pivot"]').addEventListener('click', function () {
      order = [order[1], order[2], order[0]];
      if (!reduced) ry += 90;
      rebuild(false);
    });
    host.querySelector('[data-op="reset"]').addEventListener('click', function () {
      grain = 'quarter'; focusQ = 'Q3'; order = ['time', 'region', 'product'];
      sliceOn = false; diceOn = false; sliceDim = 'region'; sliceMember = 'Norte';
      rx = -20; ry = 32; selected = null; dimSel.value = 'region'; fillMembers();
      read.textContent = 'PasÃ¡ el mouse o hacÃ© clic en un cubito.';
      rebuild(false);
    });

    scene.addEventListener('pointerdown', function (e) {
      dragging = true; moved = 0; lx = e.clientX; ly = e.clientY;
      scene.classList.add('is-dragging');
      scene.setPointerCapture(e.pointerId);
    });
    scene.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - lx, dy = e.clientY - ly;
      moved += Math.abs(dx) + Math.abs(dy);
      lx = e.clientX; ly = e.clientY;
      ry += dx * 0.45; rx -= dy * 0.35;
      rx = Math.max(-75, Math.min(75, rx));
      world.style.transform = 'rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
    });
    function up() { dragging = false; scene.classList.remove('is-dragging'); }
    scene.addEventListener('pointerup', up);
    scene.addEventListener('pointercancel', up);
    scene.addEventListener('keydown', function (e) {
      if (e.shiftKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        if (e.key === 'ArrowLeft') ry -= 12;
        if (e.key === 'ArrowRight') ry += 12;
        if (e.key === 'ArrowUp') rx -= 8;
        if (e.key === 'ArrowDown') rx += 8;
        world.style.transform = 'rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
        return;
      }
      if (!cubies.length) return;
      var vis = cubies.filter(function (c) { return c.style.opacity !== '0'; });
      if (!vis.length) return;
      var idx = 0;
      if (selected) {
        idx = vis.findIndex(function (c) { return c._o.time === selected.time && c._o.region === selected.region && c._o.product === selected.product; });
        if (idx < 0) idx = 0;
      }
      if (e.key === 'ArrowRight') idx = Math.min(vis.length - 1, idx + 1);
      else if (e.key === 'ArrowLeft') idx = Math.max(0, idx - 1);
      else if (e.key === 'ArrowDown') idx = Math.min(vis.length - 1, idx + 3);
      else if (e.key === 'ArrowUp') idx = Math.max(0, idx - 3);
      else return;
      e.preventDefault();
      selected = vis[idx]._o;
      say(selected);
      applyFilter();
    });
    rebuild(true);
  }

  /* ---------- marcos por curso ---------- */
  function F(name, text, html) { return { name: name, text: text, html: html }; }

  var FRAMES = {
    'dwh-why': {
      kicker: 'Por quÃ© no es la caja', title: 'Dos preguntas, dos bases',
      help: 'La de la izquierda toca una fila. La de la derecha barre el trimestre.',
      frames: [
        F('1 Â· Caja', 'â€œÂ¿Hay stock del SKU 8842 en Central?â€ es una clave. Milisegundos. Eso se queda en el OLTP.',
          '<div class="lv-row"><div class="lv-col"><h4>OLTP Â· stock</h4><table><tr><th>tienda</th><th>sku</th><th>stock</th></tr><tr><td>Central</td><td>8842</td><td><b>7</b></td></tr></table></div><div class="lv-col" style="opacity:.4"><h4>OLAP Â· ventas</h4><p class="lv-help">todavÃ­a no</p></div></div>'),
        F('2 Â· Trimestre', 'â€œÂ¿QuÃ© categorÃ­a creciÃ³ en Q3 en el Norte?â€ suma historia. Si corre en la caja, le quita aire al cobro.',
          '<div class="lv-row"><div class="lv-col" style="opacity:.4"><h4>OLTP Â· stock</h4><p class="lv-help">una fila</p></div><div class="lv-col"><h4>OLAP Â· Q3 Norte</h4><table><tr><th>categorÃ­a</th><th>venta</th></tr><tr><td>Ropa</td><td>â‚¡12.8 M</td></tr><tr><td>Laptops</td><td>â‚¡8.6 M</td></tr></table></div></div>')
      ]
    },
    'dwh-flow': {
      kicker: 'Arquitectura', title: 'De la caja al tablero',
      frames: [
        F('Fuentes', 'El POS sigue anotando el ticket. El almacÃ©n no reemplaza esa escritura.',
          '<div class="lv-col"><h4>POS Â· lÃ­nea cruda</h4><p class="tweet">T-88421 Â· SKU-17 Â· â‚¡12000 Â· 14/07/2025 18:04</p></div>'),
        F('Staging', 'El lote aterriza con batch_id. TodavÃ­a no hay margen ni SCD.',
          '<div class="lv-col"><h4>staging_ventas</h4><table><tr><th>batch_id</th><th>archivo</th><th>filas</th></tr><tr><td>B-0714</td><td>pos_norte.csv</td><td>18420</td></tr></table></div>'),
        F('DWH', 'AcÃ¡ se integra: misma moneda, misma fecha de negocio, surrogate keys.',
          '<div class="lv-col"><h4>fact_ventas</h4><table><tr><th>fecha_key</th><th>producto_key</th><th>venta_bruta</th></tr><tr><td>20250714</td><td>17</td><td>12000</td></tr></table></div>'),
        F('Mart / BI', 'El tablero lee el mart, no la caja. Todos ven la misma suma.',
          '<div class="lv-col"><h4>mart_ventas_norte Â· Q3</h4><p class="tweet">Ropa Â· â‚¡12.8 M</p></div>')
      ]
    },
    'dwh-etl': {
      kicker: 'Carga', title: 'DÃ³nde se limpia la fila',
      frames: [
        F('Crudo', 'Los dos patrones extraen lo mismo. Cambia el lugar de la transformaciÃ³n.',
          '<p class="tweet">sku="8842 " Â· moneda=CRC Â· fecha=14/07/2025 Â· importe=12.000,00</p>'),
        F('ETL', 'Un motor externo limpia y reciÃ©n entonces carga el hecho.',
          '<div class="lv-row"><div class="lv-col"><h4>motor ETL</h4><p class="tweet">sku 8842 Â· 2025-07-14 Â· 12000 CRC</p></div><div class="lv-col"><h4>DWH</h4><p class="lv-help">recibe la fila ya conforme</p></div></div>'),
        F('ELT', 'El crudo entra al landing. El SQL del destino (Snowflake, BigQuery, dbt) lo conforma.',
          '<div class="lv-row"><div class="lv-col"><h4>landing</h4><p class="tweet">fila cruda, sin tocar</p></div><div class="lv-col"><h4>SQL en el DWH</h4><p class="tweet">CAST, trim, surrogate</p></div></div>')
      ]
    },
    'dwh-grain': {
      kicker: 'Grano', title: 'Un ticket, tres filas',
      help: '2 camisas + 1 pantalÃ³n. El grano del curso es la lÃ­nea, no el encabezado.',
      frames: [
        F('Ticket', 'El POS guarda un encabezado y tres lÃ­neas. Eso todavÃ­a no es el hecho.',
          '<div class="lv-col"><h4>T-88421 Â· Ana Â· Central</h4><table><tr><th>#</th><th>Ã­tem</th><th>â‚¡</th></tr><tr><td>1</td><td>Camisa</td><td>12000</td></tr><tr><td>2</td><td>Camisa</td><td>12000</td></tr><tr><td>3</td><td>PantalÃ³n</td><td>18000</td></tr></table></div>'),
        F('Hecho', 'fact_ventas tiene 3 filas, la misma fecha de negocio y el mismo ticket_id degenerado.',
          '<div class="lv-col"><h4>fact_ventas</h4><table><tr><th>id</th><th>producto_key</th><th>ticket_id</th><th>â‚¡</th></tr><tr><td>9001</td><td>17</td><td>T-88421</td><td>12000</td></tr><tr><td>9002</td><td>17</td><td>T-88421</td><td>12000</td></tr><tr><td>9003</td><td>22</td><td>T-88421</td><td>18000</td></tr></table></div>')
      ]
    },
    'dwh-meas': {
      kicker: 'Medidas', title: 'QuÃ© se puede sumar',
      frames: [
        F('Aditiva', 'cantidad y venta_bruta se suman en todas las dimensiones, tiempo incluido.',
          '<p class="tweet">SUM(venta_bruta) del ticket = 42000. Es un importe, se acumula.</p>'),
        F('Semi-aditiva', 'El saldo de inventario del lunes + el del martes no es â€œel inventarioâ€. Se toma el cierre.',
          '<table><tr><th>dÃ­a</th><th>sku 17 Â· Central</th></tr><tr><td>lun</td><td>10</td></tr><tr><td>mar</td><td>12</td></tr><tr><td>miÃ©</td><td class="now"><b>9 â† cierre</b></td></tr><tr><td>suma</td><td>31 Â· no es el stock</td></tr></table>')
      ]
    },
    'dwh-scd': {
      kicker: 'SCD Type 2', title: 'Ana pasa a VIP',
      frames: [
        F('501 vigente', 'C-1001 entra Standard. El hecho de enero apuntarÃ¡ a 501.',
          '<table><tr><th>key</th><th>segmento</th><th>desde</th><th>hasta</th><th>actual</th></tr><tr><td>501</td><td>Standard</td><td>2024-01-01</td><td>9999-12-31</td><td>Y</td></tr></table>'),
        F('Type 1', 'Pisar el segmento reescribe la historia: las ventas viejas â€œpasanâ€ a VIP.',
          '<table><tr><th>key</th><th>segmento</th><th>actual</th></tr><tr><td>501</td><td><b>VIP</b></td><td>Y</td></tr></table><p class="lv-help">El hecho no cambiÃ³ de clave, pero el significado sÃ­. Eso es lo que el curso quiere evitar.</p>'),
        F('Type 2', 'Se cierra 501 el 2025-06-30 y se abre 502. Enero sigue en 501.',
          '<table><tr><th>key</th><th>segmento</th><th>desde</th><th>hasta</th><th>actual</th></tr><tr><td>501</td><td>Standard</td><td>2024-01-01</td><td>2025-06-30</td><td>N</td></tr><tr><td>502</td><td>VIP</td><td>2025-07-01</td><td>9999-12-31</td><td>Y</td></tr></table>')
      ]
    },
    'spark-cpu': {
      kicker: 'Recursos', title: 'Un nÃºcleo, despuÃ©s la RAM',
      frames: [
        F('1 CPU', 'pandas y numpy, por defecto, ocupan un nÃºcleo aunque la mÃ¡quina tenga cuatro.',
          '<div class="lv-col"><h4>nÃºcleos</h4><span class="core on">0</span><span class="core">1</span><span class="core">2</span><span class="core">3</span></div>'),
        F('RAM', 'La memoria guarda el dato y los intermedios. Si no entra, el cÃ³mputo se frena o se va a disco.',
          '<div class="lv-col"><h4>RAM</h4><span class="core ram">llena</span><span class="core">disco</span></div>'),
        F('Spark', 'local[*] enciende un hilo por nÃºcleo. El clÃºster reparte lo mismo entre mÃ¡quinas.',
          '<div class="lv-col"><h4>local[*]</h4><span class="core on">0</span><span class="core on">1</span><span class="core on">2</span><span class="core on">3</span></div>')
      ]
    },
    'spark-dist': {
      kicker: 'Paralelo y distribuido', title: 'Una JVM o varias mÃ¡quinas',
      frames: [
        F('Paralelo', 'local[*] son varios hilos en una sola JVM. Sirve para el taller, no es un clÃºster.',
          '<div class="lv-col"><h4>una mÃ¡quina</h4><span class="chip">hilo</span><span class="chip">hilo</span><span class="chip">hilo</span></div>'),
        F('Distribuido', 'YARN, Kubernetes o Standalone asignan executors en otras mÃ¡quinas.',
          '<div class="lv-row"><div class="lv-col"><h4>nodo A</h4><span class="chip">exec</span></div><div class="lv-col"><h4>nodo B</h4><span class="chip">exec</span></div></div>')
      ]
    },
    'spark-arch': {
      kicker: 'Arquitectura', title: 'QuiÃ©n arma el DAG y quiÃ©n lo corre',
      frames: [
        F('Driver', 'El driver crea la SparkSession, parte el trabajo en stages y tasks.',
          '<div class="lv-col"><h4>driver</h4><p class="tweet">DAG â†’ stages â†’ tasks</p></div>'),
        F('Cluster mgr', 'Standalone, YARN o Kubernetes asigna recursos. Mesos estÃ¡ deprecado.',
          '<div class="lv-col"><h4>cluster manager</h4><p class="tweet">pide executors</p></div>'),
        F('Executors', 'Corren las tasks, guardan la cachÃ© y le responden al driver.',
          '<div class="lv-row"><div class="lv-col"><h4>exec 1</h4><span class="chip go">task</span></div><div class="lv-col"><h4>exec 2</h4><span class="chip go">task</span></div><div class="lv-col"><h4>exec 3</h4><span class="chip">cache</span></div></div>')
      ]
    },
    'spark-lazy': {
      kicker: 'Lazy', title: 'El plan espera a la acciÃ³n',
      frames: [
        F('select', 'select no lee el archivo. Agrega un nodo al plan.',
          '<pre class="plan"><span class="now">Project [median_house_value]</span>\n  FileScan housing.parquet</pre>'),
        F('filter', 'El filtro se anota encima. Sigue sin haber job.',
          '<pre class="plan"><span class="now">Filter total_rooms > 1000</span>\n  Project\n  FileScan</pre>'),
        F('explain', 'explain muestra el plan. explain(True) agrega el lÃ³gico. TodavÃ­a no es el resultado.',
          '<pre class="plan">== Physical Plan ==\nFilter â†’ Project â†’ Scan</pre>'),
        F('acciÃ³n', 'count, show, collect o write disparan un job. ReciÃ©n ahÃ­ se mueven las particiones.',
          '<pre class="plan"><span class="now">JOB</span> count()\n  Filter â†’ Project â†’ Scan</pre>')
      ]
    },
    'spark-shuffle': {
      kicker: 'Shuffle', title: 'Narrow se queda, wide cruza',
      help: 'Dos particiones. El color es la clave del groupBy.',
      frames: [
        F('Narrow', 'filter no mezcla particiones. Lo que no pasa el filtro se apaga en su sitio.',
          '<div class="lv-row"><div class="lv-col"><h4>P0</h4><span class="chip">N</span><span class="chip dim">S</span><span class="chip">N</span></div><div class="lv-col"><h4>P1</h4><span class="chip dim">S</span><span class="chip">N</span><span class="chip">S</span></div></div>'),
        F('Wide', 'groupBy por regiÃ³n manda cada clave a una particiÃ³n. Eso es el shuffle, por red o disco.',
          '<div class="lv-row"><div class="lv-col"><h4>sale</h4><span class="chip go">N</span><span class="chip go">S</span></div><div class="lv-col"><h4>Norte</h4><span class="chip">N</span><span class="chip">N</span><span class="chip">N</span></div><div class="lv-col"><h4>Sur</h4><span class="chip">S</span><span class="chip">S</span><span class="chip">S</span></div></div>'),
        F('Stages', '1 acciÃ³n = 1 job. El scheduler corta un stage en cada frontera de shuffle.',
          '<p class="tweet">job â†’ stage A (narrow) â€– stage B (despuÃ©s del shuffle) â†’ tasks, una por particiÃ³n</p>'),
        F('repartition', 'repartition(n) sube o baja con shuffle. coalesce(n) solo baja, sin ese intercambio completo.',
          '<div class="lv-row"><div class="lv-col"><h4>repartition</h4><span class="chip go">fila</span></div><div class="lv-col"><h4>coalesce</h4><span class="chip">junta sin cruzar</span></div></div>'),
        F('cache', 'Si el mismo DataFrame alimenta varias acciones, persist evita recomputar el linaje.',
          '<p class="tweet">limpieza.persist() â†’ count() y write() leen la misma copia</p>')
      ]
    },
    'spark-cat': {
      kicker: 'Catalyst', title: 'El SQL se reescribe antes de correr',
      frames: [
        F('LÃ³gico', 'El DataFrame entra como plan. El RDD no pasa por Catalyst.',
          '<pre class="plan">SELECT * FROM housing WHERE ocean = \'INLAND\'</pre>'),
        F('Pushdown', 'El filtro baja al scan y se podan columnas que nadie pidiÃ³.',
          '<pre class="plan"><span class="now">Scan housing [median_house_value]</span>\n  PushedFilters: ocean = INLAND</pre>'),
        F('AQE', 'DespuÃ©s del shuffle, AQE vuelve a mirar tamaÃ±os reales y puede cambiar el join.',
          '<p class="tweet">stage boundary â†’ estadÃ­sticas â†’ el join chico pasa a broadcast</p>'),
        F('Parquet', 'El formato columnar deja leer solo esas columnas. Si la dimensiÃ³n entra en memoria, broadcast evita shufflear el hecho.',
          '<p class="tweet">fact_ventas â‹ˆ broadcast(dim_tienda)</p>')
      ]
    },
    'spark-tok': {
      kicker: 'Texto', title: 'Del CSV al conteo',
      frames: [
        F('Crudo', 'inferSchema se rompe si hay comas dentro del texto. El esquema se declara.',
          '<p class="tweet">RT @ana mirÃ¡ https://x.test/a el lago, de verdad!</p>'),
        F('Limpio', 'Se van URL y menciÃ³n, baja a minÃºsculas y se recortan espacios.',
          '<p class="tweet">mirÃ¡ el lago de verdad</p>'),
        F('Tokens', 'Tokenizer parte text_clean, no la columna cruda.',
          '<div><span class="chip">mirÃ¡</span><span class="chip">el</span><span class="chip">lago</span><span class="chip">de</span><span class="chip">verdad</span></div>'),
        F('Stops', 'StopWordsRemover tira artÃ­culos. Sin eso el conteo lo ganan â€œelâ€ y â€œdeâ€.',
          '<div><span class="chip">mirÃ¡</span><span class="chip dim">el</span><span class="chip">lago</span><span class="chip dim">de</span><span class="chip">verdad</span></div>'),
        F('Conteo', 'explode deja una fila por token y groupBy("token").count() arma la frecuencia. ReciÃ©n ahÃ­ LDA tiene una bolsa.',
          '<table><tr><th>token</th><th>n</th></tr><tr><td>lago</td><td>42</td></tr><tr><td>verdad</td><td>11</td></tr></table>')
      ]
    },
    'redis-single': {
      kicker: 'Instancia Ãºnica', title: 'El comando entra a memoria',
      frames: [
        F('SET', 'SET usuario:7 Ana escribe el dict en RAM. La respuesta no espera al disco.',
          '<table><tr><th>key</th><th>valor</th></tr><tr><td>usuario:7</td><td>Ana</td></tr></table>'),
        F('GET', 'GET lee esa entrada. Un solo hilo atiende el comando.',
          '<p class="tweet">GET usuario:7 â†’ Ana</p>'),
        F('BGSAVE', 'El fork comparte las pÃ¡ginas. El padre sigue sirviendo; el hijo escribe el RDB.',
          '<div class="lv-row"><div class="lv-col"><h4>padre</h4><span class="chip">sirve</span></div><div class="lv-col"><h4>hijo</h4><span class="chip">dump.rdb</span></div></div>')
      ]
    },
    'redis-ha': {
      kicker: 'ReplicaciÃ³n', title: 'El offset tiene que alcanzar',
      frames: [
        F('Primario', 'El primario anota cada escritura en el backlog y avanza el offset.',
          '<p class="tweet">primario offset 1042</p>'),
        F('RÃ©plica', 'La rÃ©plica pide desde su offset. Si el backlog todavÃ­a lo tiene, es un partial sync.',
          '<p class="tweet">rÃ©plica 1030 â†’ 1042 Â· partial</p>'),
        F('Full', 'Si el offset ya no estÃ¡ en el backlog, la rÃ©plica hace un sync completo.',
          '<p class="tweet">PSYNC ? -1 Â· RDB + buffer</p>')
      ]
    },
    'redis-sent': {
      kicker: 'Sentinel', title: 'QuÃ³rum antes del failover',
      frames: [
        F('Vivo', 'Tres sentinels observan al primario. Nadie promueve a nadie.',
          '<div><span class="chip">S1</span><span class="chip">S2</span><span class="chip">S3</span><span class="chip">primario</span></div>'),
        F('SDOWN', 'Un sentinel deja de oÃ­r al primario. Eso es subjetivo: todavÃ­a no hay voto.',
          '<p class="tweet">S1: SDOWN</p>'),
        F('ODOWN', 'Con quÃ³rum 2, el acuerdo es objetivo y se elige rÃ©plica.',
          '<p class="tweet">S1+S2 ODOWN â†’ rÃ©plica promovida</p>')
      ]
    },
    'redis-slot': {
      kicker: 'Cluster', title: 'La clave cae en un slot',
      help: '16384 hash slots. La clave se queda con el nodo dueÃ±o de ese rango.',
      frames: [
        F('Hash', 'CRC16(clave) mod 16384. usuario:7 cae, en este ejemplo, en el slot 12182.',
          '<p class="tweet">slot 12182 Â· nodo B (11000â€“16383)</p>'),
        F('Reshard', 'Mover un rango no mueve â€œla baseâ€: mueve slots, y las claves que viven ahÃ­.',
          '<p class="tweet">12182 sale del nodo B y entra al nodo C</p>')
      ]
    },
    'redis-cow': {
      kicker: 'Fork', title: 'Copy-on-write de una pÃ¡gina',
      frames: [
        F('Compartido', 'DespuÃ©s del fork, padre e hijo apuntan a las mismas pÃ¡ginas.',
          '<p class="tweet">pÃ¡gina 0xA compartida</p>'),
        F('Escritura', 'El padre modifica una clave. Solo esa pÃ¡gina se copia. El resto sigue compartido.',
          '<div class="lv-row"><div class="lv-col"><h4>padre</h4><span class="chip">0xAâ€²</span></div><div class="lv-col"><h4>hijo</h4><span class="chip">0xA</span></div></div>')
      ]
    },
    'mongo-cap': {
      kicker: 'CAP', title: 'ElegÃ­s dos, y en la red se cae la tercera',
      frames: [
        F('CP', 'Consistencia y particiÃ³n: el sistema espera, no responde con un dato viejo.',
          '<p class="tweet">escritura bloqueada hasta quÃ³rum</p>'),
        F('AP', 'Disponibilidad y particiÃ³n: responde ya, y reconcilia despuÃ©s.',
          '<p class="tweet">las dos rÃ©plicas aceptan y divergen</p>'),
        F('CA', 'Consistencia y disponibilidad piden que la red no se parta. En un clÃºster real esa letra no se promete.',
          '<p class="tweet">sin particiÃ³n no hay que elegir</p>')
      ]
    },
    'mongo-doc': {
      kicker: 'Documento', title: 'De la base al BSON',
      frames: [
        F('JerarquÃ­a', 'Base â†’ colecciÃ³n â†’ documento. No hay joins obligatorios: el embebido viaja junto.',
          '<p class="tweet">tienda.ventas { _id, cliente: { nombre }, items: [...] }</p>'),
        F('BSON', 'El tipo viaja con el valor. Una fecha no es un string que cada cliente interpreta distinto.',
          '<p class="tweet">{ fecha: ISODate("2025-07-14") }</p>')
      ]
    },
    'mongo-crud': {
      kicker: 'CRUD', title: 'Un update no reescribe el documento a ciegas',
      frames: [
        F('Antes', 'El documento tiene el segmento que vino del alta.',
          '<p class="tweet">{ _id: 501, segmento: "Standard" }</p>'),
        F('$set', '$set toca un campo. El resto del documento queda.',
          '<p class="tweet">updateOne({_id:501}, {$set:{segmento:"VIP"}})</p>'),
        F('DespuÃ©s', 'Si reemplazÃ¡s el documento entero, perdÃ©s los campos que no mandaste.',
          '<p class="tweet">{ _id: 501, segmento: "VIP" }</p>')
      ]
    },
    'mongo-rs': {
      kicker: 'Replica set', title: 'El oplog y la elecciÃ³n',
      frames: [
        F('Primario', 'Las escrituras entran al primario y se anotan en el oplog.',
          '<p class="tweet">primary Â· oplog ts 14</p>'),
        F('Secundarios', 'Los secundarios replican el oplog en orden.',
          '<div class="lv-row"><div class="lv-col"><h4>s1</h4><span class="chip">ts 14</span></div><div class="lv-col"><h4>s2</h4><span class="chip">ts 13</span></div></div>'),
        F('ElecciÃ³n', 'Si el primario no responde, los que tienen el oplog mÃ¡s nuevo votan.',
          '<p class="tweet">s1 (ts 14) queda primario</p>')
      ]
    },
    'mongo-shard': {
      kicker: 'Sharding', title: 'mongos no guarda el dato',
      frames: [
        F('Chunk', 'El shard key parte la colecciÃ³n en rangos. Cada chunk vive en un shard.',
          '<p class="tweet">cliente_id 0â€“1000 â†’ shard A Â· 1001â€“2000 â†’ shard B</p>'),
        F('mongos', 'El router mira la config y manda la consulta al shard que tiene ese rango.',
          '<p class="tweet">find({cliente_id:501}) â†’ solo shard A</p>'),
        F('Scatter', 'Sin el shard key en el filtro, mongos pregunta a todos. Eso es el scatter-gather.',
          '<p class="tweet">find({ciudad:"San JosÃ©"}) â†’ A y B</p>')
      ]
    },
    'gfs-arch': {
      kicker: 'Arquitectura', title: 'El master no ve los bytes',
      frames: [
        F('Meta', 'El cliente le pregunta al master dÃ³nde estÃ¡ el chunk. El master responde rÃ©plicas, no el archivo.',
          '<p class="tweet">chunk 64MB Â· rÃ©plicas en A, B, C</p>'),
        F('Datos', 'Los bytes viajan entre el cliente y los chunkservers. El master se queda fuera de esa ruta.',
          '<div class="lv-row"><div class="lv-col"><h4>cliente</h4><span class="chip go">datos</span></div><div class="lv-col"><h4>chunkserver</h4><span class="chip">chunk</span></div></div>')
      ]
    },
    'gfs-write': {
      kicker: 'Write', title: 'Los siete pasos, en orden',
      help: 'El control vuelve al primario. Los datos ya circularon por el pipeline.',
      frames: [
        F('1â€“2', 'El cliente pide el lease. El master nombra primario y secundarios.', '<p class="tweet">primario = A Â· secundarios = B, C</p>'),
        F('3', 'El cliente empuja los datos a todas las rÃ©plicas, en pipeline. TodavÃ­a no es una escritura.', '<p class="tweet">datos en cachÃ© de A, B y C</p>'),
        F('4â€“5', 'El cliente le pide la escritura al primario. El primario elige el orden y aplica.', '<p class="tweet">A aplica en el orden que fija</p>'),
        F('6â€“7', 'El primario reenvÃ­a la escritura. Cuando los secundarios confirman, el primario le responde al cliente.', '<p class="tweet">B y C ack â†’ cliente ack</p>')
      ]
    },
    'gfs-append': {
      kicker: 'Record append', title: 'El registro entra atÃ³mico o se reintenta',
      frames: [
        F('Cabe', 'Si el registro entra en el chunk, el primario lo escribe en el mismo offset en todas las rÃ©plicas.',
          '<p class="tweet">offset 1200 Â· 64 KB Â· ok</p>'),
        F('Padding', 'Si no entra, el primario rellena el resto del chunk y el cliente reintenta en el siguiente.',
          '<p class="tweet">padding hasta 64 MB Â· retry chunk+1</p>')
      ]
    },
    'gfs-snap': {
      kicker: 'Snapshot', title: 'Se copia la metadata, no los bytes',
      frames: [
        F('COW', 'El snapshot duplica la metadata del chunk. Las rÃ©plicas se copian solo cuando alguien escribe.',
          '<p class="tweet">chunk handle nuevo Â· mismos bloques</p>'),
        F('GC', 'Un chunk sin metadata que lo nombre se borra en la recolecciÃ³n, no en el instante del delete.',
          '<p class="tweet">sin referencia â†’ el chunkserver lo suelta</p>')
      ]
    },
    'gfs-bridge': {
      kicker: 'Puente', title: 'Bigtable se sienta encima de GFS',
      frames: [
        F('GFS', 'GFS guarda chunks de los SSTable y del commit log. No sabe quÃ© es una fila.',
          '<p class="tweet">archivo SSTable Â· chunks de 64 MB</p>'),
        F('Bigtable', 'Bigtable parte la tabla en tablets y usa a GFS como disco. El master de GFS no es el master de Bigtable.',
          '<p class="tweet">tablet â†’ SSTable en GFS</p>')
      ]
    },
    'bt-web': {
      kicker: 'Webtable', title: 'Fila, columna y tiempo',
      frames: [
        F('Fila', 'com.cnn.www es la fila. Las columnas son familias:anchor y contents.',
          '<table><tr><th>fila</th><th>anchor:cnnsi.com</th><th>contents:</th></tr><tr><td>com.cnn.www</td><td>CNN</td><td>&lt;html&gt;â€¦</td></tr></table>'),
        F('Tiempo', 'Cada celda guarda varias versiones. La lectura pide las mÃ¡s recientes, no â€œlaâ€ celda.',
          '<p class="tweet">anchor:cnnsi.com @ t3 = CNN Â· @ t5 = CNN.com</p>')
      ]
    },
    'bt-loc': {
      kicker: 'Localizar', title: 'Tres saltos hasta la tablet',
      frames: [
        F('Chubby', 'El cliente lee en Chubby dÃ³nde estÃ¡ la tablet raÃ­z.', '<p class="tweet">root tablet location</p>'),
        F('METADATA', 'La raÃ­z apunta a las tablets de METADATA. METADATA dice quÃ© tablet de usuario tiene la fila.', '<p class="tweet">com.cnn.www â†’ tablet 42 Â· server X</p>'),
        F('Usuario', 'El cliente habla con ese tablet server. El master no estÃ¡ en la ruta de lectura.', '<p class="tweet">server X sirve la fila</p>')
      ]
    },
    'bt-serve': {
      kicker: 'Serving', title: 'Memtable, log y SSTable',
      frames: [
        F('Write', 'La escritura entra a la memtable y al commit log. La memtable estÃ¡ en RAM.',
          '<p class="tweet">memtable + commit log</p>'),
        F('Minor', 'Cuando la memtable se llena, se congela y se escribe un SSTable. Eso es una minor compaction.',
          '<p class="tweet">memtable â†’ SSTable nuevo</p>'),
        F('Major', 'La major compaction junta SSTables y tira las versiones que ya no se leen.',
          '<p class="tweet">SSTable a + b â†’ uno solo</p>')
      ]
    },
    'bt-rec': {
      kicker: 'Recovery', title: 'El log se ordena para rehacerse',
      frames: [
        F('Log', 'Si el tablet server muere, el commit log tiene las escrituras que no llegaron a un SSTable.',
          '<p class="tweet">(tabla, fila, seq) desordenado</p>'),
        F('Sort', 'Se ordena por tabla, fila y secuencia para reaplicar sin volver a mezclar tablets.',
          '<p class="tweet">sort â†’ replay por tablet</p>')
      ]
    },
    'bt-read': {
      kicker: 'Lectura', title: 'El Bloom evita un seek',
      frames: [
        F('Sin Bloom', 'Hay que abrir cada SSTable por si la fila estÃ¡.', '<p class="tweet">SSTable 1, 2 y 3 Â· tres seeks</p>'),
        F('Con Bloom', 'Si el filtro dice que no estÃ¡, ese SSTable no se toca. Un falso positivo abre de mÃ¡s; un negativo no se pierde.',
          '<p class="tweet">SSTable 2: no Â· se salta</p>')
      ]
    },
    'au-quorum': {
      kicker: 'QuÃ³rum', title: 'Seis copias, cuatro para escribir',
      frames: [
        F('6/4/3', 'Seis copias en tres AZ. La escritura espera 4. La lectura espera 3. 4+3 &gt; 6, asÃ­ que se cruzan.',
          '<p class="tweet">AZ1 â—â— Â· AZ2 â—â— Â· AZ3 â—â—</p>'),
        F('Una AZ', 'Perder una AZ entera deja cuatro copias. La escritura sigue teniendo quÃ³rum.',
          '<p class="tweet">AZ caÃ­da Â· quedan 4 Â· write ok</p>')
      ]
    },
    'au-io': {
      kicker: 'Redo', title: 'No se reescriben las pÃ¡ginas',
      frames: [
        F('MySQL', 'El espejo clÃ¡sico manda pÃ¡ginas de datos. El mismo cambio lÃ³gico se amplifica en I/O.',
          '<p class="tweet">pÃ¡gina de 16 KB por un redo chico</p>'),
        F('Aurora', 'Solo viaja el redo. El storage reconstruye la pÃ¡gina. El paper mide ese ahorro de I/O.',
          '<p class="tweet">log record â†’ storage</p>')
      ]
    },
    'au-pipe': {
      kicker: 'Storage', title: 'El nodo de storage no solo guarda',
      frames: [
        F('Recibe', 'El nodo recibe el redo y lo escribe en el segmento.', '<p class="tweet">paso 1â€“2 Â· persistir el log</p>'),
        F('Fondo', 'En background ordena, garbage-collect y genera pÃ¡ginas. Eso no bloquea el ack.', '<p class="tweet">backpressure aparte del foreground</p>'),
        F('Ack', 'El quÃ³rum de acks vuelve al motor. La pÃ¡gina se materializa despuÃ©s.', '<p class="tweet">4 acks â†’ commit</p>')
      ]
    },
    'au-vcl': {
      kicker: 'VCL / VDL', title: 'Hasta dÃ³nde se puede leer',
      frames: [
        F('VCL', 'El volume complete LSN es lo que ya estÃ¡ en quÃ³rum. MÃ¡s allÃ¡ no se lee como durable.',
          '<p class="tweet">VCL = 100</p>'),
        F('VDL', 'El volume durable LSN es el punto de truncado consistente. Recovery no pasa de ahÃ­.',
          '<p class="tweet">VDL = 100 Â· se trunca lo de arriba</p>')
      ]
    },
    'au-write': {
      kicker: 'Escritura', title: 'El motor manda redo y espera quÃ³rum',
      frames: [
        F('Motor', 'La instancia de base genera el redo. No escribe pÃ¡ginas de datos al storage.',
          '<p class="tweet">InnoDB â†’ redo records</p>'),
        F('QuÃ³rum', 'El storage confirma cuando cuatro copias persistieron el registro.',
          '<p class="tweet">4/6 ack</p>'),
        F('RÃ©plica', 'Una rÃ©plica lectora pide pÃ¡ginas al storage a partir del LSN que ya puede ver.',
          '<p class="tweet">reader â†’ pÃ¡gina servida por el storage</p>')
      ]
    },
    'zz-tuple': {
      kicker: 'Tupla', title: 'object#relation@user',
      frames: [
        F('Tupla', 'Una fila del papel: el objeto, la relaciÃ³n y el usuario o el userset.',
          '<p class="tweet">doc:readme#viewer@user:ana</p>'),
        F('Userset', 'La relaciÃ³n puede apuntar a otro conjunto: los viewers de la carpeta padre.',
          '<p class="tweet">doc:readme#viewer@folder:raiz#viewer</p>')
      ]
    },
    'zz-check': {
      kicker: 'Check', title: 'Se reescribe hasta usuarios',
      frames: [
        F('Pregunta', 'Check(doc:readme#viewer, user:ana) no mira una sola fila si hay rewrites.',
          '<p class="tweet">Â¿ana puede ver readme?</p>'),
        F('Rewrite', 'viewer incluye a los viewers de la carpeta. Hay que evaluar ese userset.',
          '<p class="tweet">folder:raiz#viewer â†’ user:ana</p>'),
        F('SÃ­', 'Cuando una rama llega a la usuaria, el check es verdadero.',
          '<p class="tweet">true</p>')
      ]
    },
    'zz-enemy': {
      kicker: 'New enemy', title: 'El contenido nuevo no se lee con un ACL viejo',
      frames: [
        F('zookie viejo', 'El cliente tiene un token de antes de que le quitaran el permiso.',
          '<p class="tweet">zookie t1 Â· ana era viewer</p>'),
        F('Cambio', 'Se borra la tupla. Un read con el zookie viejo no debe ver el documento nuevo.',
          '<p class="tweet">contenido t2 &gt; zookie t1 â†’ no</p>')
      ]
    },
    'zz-zookie': {
      kicker: 'Zookie', title: 'El token fija el instante',
      frames: [
        F('Emitir', 'Una lectura devuelve un zookie: â€œesto es verdad al menos hasta aquÃ­â€.',
          '<p class="tweet">zookie = t7</p>'),
        F('Reusar', 'La siguiente llamada manda ese zookie y Zanzibar no responde con un snapshot anterior.',
          '<p class="tweet">Check at zookie t7</p>')
      ]
    },
    'zz-arch': {
      kicker: 'Arquitectura', title: 'Watch no es el check',
      frames: [
        F('ACL', 'Los servidores de ACL guardan las tuplas y responden checks.',
          '<p class="tweet">Spanner Â· tuplas</p>'),
        F('Leopard', 'El Ã­ndice de conjuntos (Leopard) acelera â€œquiÃ©nes estÃ¡n en este usersetâ€.',
          '<p class="tweet">reverse index</p>'),
        F('Watch', 'Watch avisa cambios. No reemplaza al check en el camino de la request.',
          '<p class="tweet">changelog â†’ clientes</p>')
      ]
    }
  };

  var PLANS = {
    dwh: [
      { id: 'm0', h3: 'Las cuatro ideas', visual: 'dwh-why' },
      { id: 'm1', h3: 'OLTP frente a OLAP', visual: 'dwh-why' },
      { id: 'm2', h3: 'El flujo', visual: 'dwh-flow' },
      { id: 'm3', h3: 'ETL y ELT', visual: 'dwh-etl' },
      { id: 'm4', h3: 'Dos granos', visual: 'dwh-grain' },
      { id: 'm5', h3: 'Tres esquemas', visual: 'schema' },
      { id: 'm6', h3: 'Tres medidas', visual: 'dwh-meas' },
      { id: 'm7', h3: 'Type 2 en dim_cliente', visual: 'dwh-scd' },
      { id: 'm8', h3: 'Cinco operaciones', visual: 'cube' }
    ],
    spark: [
      { id: 'm0', lede: true, visual: 'spark-cpu' },
      { id: 'm1', lede: true, visual: 'spark-dist' },
      { id: 'm3', lede: true, visual: 'spark-arch' },
      { id: 'm6', h3: 'Map y reduce', visual: 'spark-lazy' },
      { id: 'm7', lede: true, visual: 'spark-shuffle' },
      { id: 'm8', lede: true, visual: 'spark-cat' },
      { id: 'm9', h3: 'Limpieza', visual: 'spark-tok' }
    ],
    redis: [
      { id: 'm2', lede: true, visual: 'redis-single' },
      { id: 'm3', lede: true, visual: 'redis-ha' },
      { id: 'm4', lede: true, visual: 'redis-sent' },
      { id: 'm5', lede: true, visual: 'redis-slot' },
      { id: 'm6', lede: true, visual: 'redis-cow' }
    ],
    mongo: [
      { id: 'm1', lede: true, visual: 'mongo-cap' },
      { id: 'm3', lede: true, visual: 'mongo-doc' },
      { id: 'm4', lede: true, visual: 'mongo-crud' },
      { id: 'm6', lede: true, visual: 'mongo-rs' },
      { id: 'm7', lede: true, visual: 'mongo-shard' }
    ],
    gfs: [
      { id: 'm1', lede: true, visual: 'gfs-arch' },
      { id: 'm4', lede: true, visual: 'gfs-write' },
      { id: 'm5', lede: true, visual: 'gfs-append' },
      { module: 'm5', second: true, visual: 'gfs-snap' },
      { id: 'm7', lede: true, visual: 'gfs-bridge' }
    ],
    bigtable: [
      { id: 'm1', lede: true, visual: 'bt-web' },
      { id: 'm4', lede: true, visual: 'bt-loc' },
      { id: 'm5', lede: true, visual: 'bt-serve' },
      { module: 'm5', second: true, visual: 'bt-rec' },
      { module: 'm5', third: true, visual: 'bt-read' }
    ],
    aurora: [
      { id: 'm1', h3: 'QuÃ³rum', visual: 'au-quorum' },
      { id: 'm2', h3: 'CÃ³mo escribe MySQL', visual: 'au-io' },
      { id: 'm3', h3: 'Los 8 pasos', visual: 'au-pipe' },
      { id: 'm4', h3: 'Vocabulario', visual: 'au-vcl' },
      { id: 'm5', lede: true, visual: 'au-write' }
    ],
    zanzibar: [
      { id: 'm1', lede: true, visual: 'zz-tuple' },
      { id: 'm2', lede: true, visual: 'zz-check' },
      { id: 'm3', lede: true, visual: 'zz-enemy' },
      { module: 'm3', second: true, visual: 'zz-zookie' },
      { id: 'm5', lede: true, visual: 'zz-arch' }
    ]
  };

  var DEEP = {
    dwh: { 'anim-oltp-olap': 'm1', 'anim-pipeline': 'm2', 'anim-etl-elt': 'm3', 'anim-star': 'm5', 'anim-scd2': 'm7', 'anim-cube': 'm8' },
    spark: { 'anim-cpu': 'm0', 'anim-arch': 'm3', 'anim-lazy': 'm6', 'anim-shuffle': 'm7', 'anim-pipeline': 'm8', 'anim-tokens': 'm9' },
    redis: { 'anim-single': 'm2', 'anim-ha': 'm3', 'anim-sentinel': 'm4', 'anim-cluster': 'm5', 'anim-fork': 'm6' },
    mongo: { 'anim-cap': 'm1', 'anim-doc': 'm3', 'anim-crud': 'm4', 'anim-replica': 'm6', 'anim-shard': 'm7' },
    gfs: { 'anim-arch': 'm1', 'anim-write': 'm4', 'anim-append': 'm5', 'anim-snap': 'm5', 'anim-bridge': 'm7' },
    bigtable: { 'anim-webtable': 'm1', 'anim-locate': 'm4', 'anim-serve': 'm5', 'anim-recovery': 'm5', 'anim-read': 'm5' }
  };

  function findAnchor(content, spec) {
    if (spec.h3) {
      var hs = content.querySelectorAll('h3');
      for (var i = 0; i < hs.length; i++) {
        if (hs[i].textContent.indexOf(spec.h3) >= 0) {
          var n = hs[i].nextElementSibling;
          if (n && !/^H[23]$/.test(n.tagName)) return n;
          return hs[i];
        }
      }
    }
    return content.querySelector('.lede');
  }

  function buildVisual(host, key) {
    if (key === 'schema') return mountSchema(host);
    if (key === 'cube') return mountCube(host);
    var cfg = FRAMES[key];
    if (cfg) mountFrames(host, cfg);
  }

  var study = studyOf();

  function mountCurrent() {
    var content = document.getElementById('moduleContent');
    if (!content || typeof MODULES === 'undefined' || typeof currentModule === 'undefined') return;
    var m = MODULES[currentModule];
    if (!m) return;
    content.querySelectorAll('.learn-fig').forEach(function (n) { n.remove(); });
    var plan = PLANS[study] || [];
    var usedSecond = {};
    plan.forEach(function (spec) {
      var mod = spec.module || spec.id;
      if (mod !== m.id) return;
      if (spec.second || spec.third) {
        usedSecond[m.id] = (usedSecond[m.id] || 0) + 1;
      }
      var host = document.createElement('div');
      host.className = 'learn-fig';
      host.dataset.visual = spec.visual;
      var anchor = findAnchor(content, spec.second || spec.third ? { lede: true } : spec);
      if (!anchor && spec.h3) anchor = findAnchor(content, { lede: true });
      if (anchor && anchor.parentNode) {
        if (spec.second || spec.third) {
          var figs = content.querySelectorAll('.learn-fig');
          var last = figs[figs.length - 1];
          if (last) last.insertAdjacentElement('afterend', host);
          else anchor.insertAdjacentElement('afterend', host);
        } else anchor.insertAdjacentElement('afterend', host);
      } else content.insertBefore(host, content.firstChild);
      buildVisual(host, spec.visual);
    });
    observe(content);
  }

  var io;
  function observe(root) {
    var figs = root.querySelectorAll('.learn-fig');
    if (reduced || !('IntersectionObserver' in window)) {
      figs.forEach(function (f) { f.classList.add('is-awake'); if (f._lvPlay) f._lvPlay(); });
      return;
    }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.classList.remove('will-wake');
          en.target.classList.add('is-awake');
          if (en.target._lvPlay) en.target._lvPlay();
          io.unobserve(en.target);
        });
      }, { threshold: 0.2 });
    }
    figs.forEach(function (f) {
      var r = f.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92 && r.bottom > 0) {
        f.classList.add('is-awake');
        if (f._lvPlay) f._lvPlay();
      } else {
        f.classList.add('will-wake');
        io.observe(f);
      }
    });
  }

  function boot() {
    if (typeof renderModule === 'function') {
      var orig = renderModule;
      window.renderModule = function () {
        var out = orig.apply(this, arguments);
        mountCurrent();
        return out;
      };
    }
    var hash = (location.hash || '').replace(/^#/, '');
    var jumped = false;
    if (hash.indexOf('animaciones') === 0) {
      var id = hash.split('/')[1];
      var mod = (DEEP[study] || {})[id];
      if (mod && typeof MODULES !== 'undefined') {
        jumped = true;
        if (typeof goModule === 'function') goModule(mod, { instant: true });
        else {
          var idx = -1;
          for (var i = 0; i < MODULES.length; i++) if (MODULES[i].id === mod) idx = i;
          if (idx >= 0) { currentModule = idx; if (typeof renderModuleNav === 'function') renderModuleNav(); renderModule(); }
        }
      }
    }
    if (!jumped) mountCurrent();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
