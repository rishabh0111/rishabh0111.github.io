/* Blog index: search and tag filter over the server-rendered timeline.

   The timeline is rendered in full by Liquid, in its final order: one
   <section> per year, each holding standalone posts and series cards
   (a <details> listing the parts) side by side, newest first. This
   script never re-orders or re-renders it. It hides rows that don't
   match, hides any series card and any year left empty, and opens the
   series that still have matches — then puts every card back the way
   the reader had it once the filter is cleared.
   Without JS the toolbar stays hidden and the <details> work on their own.

   State lives in the URL (?q=…&tag=…) so a filtered view can be linked
   and survives a reload. */
(function () {
  var wrap = document.getElementById('blog-listing');
  if (!wrap) return;
  var tools = wrap.querySelector('.listing-tools');
  if (!tools) return;

  var input   = tools.querySelector('#blog-q');
  var status  = tools.querySelector('.listing-status');
  var tagBtns = Array.prototype.slice.call(tools.querySelectorAll('.listing-tag'));
  var more    = tools.querySelector('.listing-tag-more');
  var jump    = tools.querySelector('.listing-jump');
  var none    = wrap.querySelector('.listing-none');
  var clear   = wrap.querySelector('.listing-clear');

  function all(root, sel) {
    return Array.prototype.slice.call(root.querySelectorAll(sel));
  }

  // year → items → rows. A standalone post is an item with one row
  // (itself); a series is an item whose rows are its parts.
  var years = all(wrap, '.bt-year').map(function (el) {
    return {
      el: el,
      items: all(el, '.bt-item').map(function (li) {
        return {
          el: li,
          card: li.querySelector('.series-card'),
          rows: all(li, '.post-row, .bt-card'),
          count: li.querySelector('.group-count')
        };
      })
    };
  });
  var total = years.reduce(function (n, y) {
    return y.items.reduce(function (m, it) { return m + it.rows.length; }, n);
  }, 0);

  var activeTag = '';
  var filtering = false;

  function terms(q) {
    return q.toLowerCase().split(/\s+/).filter(Boolean);
  }

  function matches(row, qs) {
    if (activeTag) {
      var tags = (row.getAttribute('data-tags') || '').split('|');
      if (tags.indexOf(activeTag) === -1) return false;
    }
    var hay = row.getAttribute('data-search') || '';
    for (var i = 0; i < qs.length; i++) {
      if (hay.indexOf(qs[i]) === -1) return false;
    }
    return true;
  }

  function label(n, unit) {
    return n + ' ' + unit + (n === 1 ? '' : 's');
  }

  function apply() {
    var qs = terms(input.value);
    var nowFiltering = qs.length > 0 || !!activeTag;

    // Entering a filter: remember which series the reader had open, so
    // clearing it restores their view rather than ours.
    if (nowFiltering && !filtering) {
      years.forEach(function (y) {
        y.items.forEach(function (it) { if (it.card) it.wasOpen = it.card.open; });
      });
    }

    var shown = 0;
    years.forEach(function (y) {
      var yearShown = 0;
      y.items.forEach(function (it) {
        var n = 0, last = null;
        it.rows.forEach(function (r) {
          var ok = !nowFiltering || matches(r, qs);
          r.hidden = !ok;
          r.classList.remove('is-last-shown');
          if (ok) { n++; last = r; }
        });
        if (last) last.classList.add('is-last-shown');
        shown += n;
        it.el.hidden = n === 0;
        if (n) yearShown++;

        if (!it.card) return;
        var tot = +it.count.getAttribute('data-total');
        var unit = it.count.getAttribute('data-unit');
        it.count.textContent = nowFiltering && n !== tot
          ? n + ' of ' + label(tot, unit)
          : label(tot, unit);

        if (nowFiltering) it.card.open = n > 0;
        else if (filtering) it.card.open = !!it.wasOpen;
      });
      y.el.hidden = yearShown === 0;
    });
    filtering = nowFiltering;

    none.hidden = shown > 0;
    if (jump) jump.hidden = filtering;
    status.textContent = filtering ? shown + ' of ' + label(total, 'post') : '';

    tagBtns.forEach(function (b) {
      var on = b.getAttribute('data-tag') === activeTag;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      // An active tag in the collapsed tail stays visible.
      b.classList.toggle('is-pinned', on);
    });

    syncUrl();
  }

  function syncUrl() {
    try {
      var url = new URL(window.location.href);
      var q = input.value.trim();
      if (q) url.searchParams.set('q', q); else url.searchParams.delete('q');
      if (activeTag) url.searchParams.set('tag', activeTag); else url.searchParams.delete('tag');
      history.replaceState(null, '', url.pathname + url.search + url.hash);
    } catch (e) {}
  }

  function readUrl() {
    try {
      var p = new URLSearchParams(window.location.search);
      input.value = p.get('q') || '';
      var t = p.get('tag') || '';
      activeTag = tagBtns.some(function (b) { return b.getAttribute('data-tag') === t; }) ? t : '';
    } catch (e) {}
  }

  function reset() {
    input.value = '';
    activeTag = '';
    apply();
    input.focus();
  }

  var timer;
  input.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(apply, 80);
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && (input.value || activeTag)) {
      e.preventDefault();
      reset();
    }
  });

  tagBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.getAttribute('data-tag');
      activeTag = activeTag === t ? '' : t;
      apply();
    });
  });

  if (more) {
    more.setAttribute('data-label', more.textContent);
    more.addEventListener('click', function () {
      var open = tools.classList.toggle('tags-open');
      more.setAttribute('aria-expanded', open ? 'true' : 'false');
      more.textContent = open ? 'fewer' : more.getAttribute('data-label');
    });
  }

  if (clear) clear.addEventListener('click', reset);

  // "/" jumps to the search box from anywhere on the page, unless the
  // reader is already typing somewhere.
  document.addEventListener('keydown', function (e) {
    if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
    var el = document.activeElement;
    var typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
    if (typing) return;
    e.preventDefault();
    input.focus();
    input.select();
  });

  tools.hidden = false;
  readUrl();
  apply();
})();
