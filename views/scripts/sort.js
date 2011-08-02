function countPinnedTab(tabs) {
    var counter = 0;

    for (var i = 0, n = tabs.length; i < n; i++) {
	if (tabs[i].pinned)
	    counter++;
    }

    return counter;
}

function sort(sortKey, isAscending) {
    chrome.windows.getCurrent(function (window) {
	chrome.tabs.getAllInWindow(window.id, function(tabs) {
	    tabs.sort(function (a, b) {
		if (isAscending)
		    return a[sortKey] > b[sortKey] ? 1 : -1;
		else
		    return a[sortKey] > b[sortKey] ? -1 : 1;
	    });

	    var origin = countPinnedTab(tabs);
	    for (var i = 0, n = tabs.length; i < n; i++) {
		chrome.tabs.move(
		    tabs[i].id,
		    { windowId: window.id, index: origin + i }
		);
	    }
	});
    });
}

function isSorted(sortKey, isAscending, func) {
    chrome.windows.getCurrent(function (window) {
	chrome.tabs.getAllInWindow(window.id, function(tabs) {
	    var sorted = true;
	    for (var i = countPinnedTab(tabs), n = tabs.length - 1; i < n && sorted; i++) {
		if (isAscending)
		    sorted = tabs[i][sortKey] <= tabs[i + 1][sortKey];
		else
		    sorted = tabs[i][sortKey] >= tabs[i + 1][sortKey];
	    }
	    func(sorted, tabs);
	});
    });
}

chrome.browserAction.onClicked.addListener(function (tab) {  
    isSorted(
	settings.sortKey,
	settings.isAscending,
	function (sorted, tabs) {
	    if (sorted) {
		var counter = 0;
		if (settings.removeSameTabs) {
		    var object = new Object();
		    for (var i = 0, n = tabs.length; i < n; i++) {
			var value = tabs[i][settings.sortKey];
			if (!object[value])
			    object[value] = 0;

			if (++object[value] >= 2) {
			    chrome.tabs.remove(tabs[i].id);
			    counter++;
			}
		    }
		}
		if (counter > 0)
		    return;

		settings.isAscending = !settings.isAscending;
	    }

	    console.log(settings.isAscending);
	    sort(settings.sortKey, settings.isAscending);
	}
    );
});
    
chrome.tabs.onUpdated.addListener(function (tabid, selectinfo, tab) {
    isSorted(
	settings.sortKey,
	settings.isAscending,
	function (sorted) {
	    if (!sorted && settings.isAlways)
		sort(settings.sortKey, settings.isAscending);
	}
    );
});
