document.addEventListener('DOMContentLoaded', function () {
  const tabs = document.querySelectorAll('.b-tab');
  const searchInput = document.querySelector('.input-3');
  const clearBtn = document.querySelector('.clear-btn');
  // Only the top-level blog list, not nested reference lists inside cards
  const itemLists = document.querySelectorAll('.blog-list.w-dyn-items');

  let activeType = 'all';
  let searchQuery = '';

  function getAllItems() {
    // Direct children only — excludes nested author/reference w-dyn-items
    return document.querySelectorAll('.blog-list.w-dyn-items > .w-dyn-item');
  }

  function applyFilters() {
    const items = getAllItems();

    items.forEach(function (item) {
      // Support both data-type attribute and hidden .item-type element
      const typeEl = item.querySelector('.item-type');
      const type = (item.getAttribute('data-type') || (typeEl ? typeEl.innerText : '') || '').toLowerCase().trim();
      const clone = item.cloneNode(true);
      clone.querySelectorAll('.w-dyn-list').forEach(function (el) { el.remove(); });
      const text = clone.innerText.toLowerCase();

      const typeMatch = activeType === 'all' || type === activeType;
      const searchMatch = searchQuery === '' || text.includes(searchQuery);

      item.style.display = typeMatch && searchMatch ? '' : 'none';
    });

    // Show/hide empty states per list
    itemLists.forEach(function (list) {
      const allItems = list.querySelectorAll('.w-dyn-item');
      const allHidden = Array.from(allItems).every(function (i) {
        return i.style.display === 'none';
      });

      let emptyState = list.querySelector('.w-dyn-empty');
      if (!emptyState) {
        emptyState = document.createElement('div');
        emptyState.className = 'w-dyn-empty';
        emptyState.innerHTML = '<div>No items found.</div>';
        list.appendChild(emptyState);
      }
      emptyState.style.display = allHidden ? '' : 'none';
    });
  }

  // Tab click
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');

      const label = tab.querySelector('div') ? tab.querySelector('div').innerText.toLowerCase() : '';
      if (label === 'all') {
        activeType = 'all';
      } else if (label === 'articles') {
        activeType = 'article';
      } else if (label === 'videos') {
        activeType = 'video';
      }

      applyFilters();
    });
  });

  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      searchQuery = searchInput.value.toLowerCase().trim();
      applyFilters();
    });
  }

  // Clear button
  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      searchQuery = '';
      if (searchInput) searchInput.value = '';

      activeType = 'all';
      tabs.forEach(function (t) { t.classList.remove('active'); });
      if (tabs[0]) tabs[0].classList.add('active');

      applyFilters();
    });
  }
});
