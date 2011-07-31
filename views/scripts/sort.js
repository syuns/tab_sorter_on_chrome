function countPinnedTab(tabs) {
    var count = 0;

    for (var i = 0, n = tabs.length; i < n; i++) {
	if (tabs[i].pinned)
	    count++;
    }

    return count;
}

function sort(sortkey, isAscending) {
    chrome.windows.getCurrent(function (window) {
	chrome.tabs.getAllInWindow(window.id, function(tabs) {
	    tabs.sort(function (a, b) {
		if (isAscending)
		    return a[sortkey] > b[sortkey] ? 1 : -1;
		else
		    return a[sortkey] < b[sortkey] ? 1 : -1;
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

function isSorted(sortkey, isAscending, func) {
    chrome.windows.getCurrent(function (window) {
	chrome.tabs.getAllInWindow(window.id, function(tabs) {
	    var sorted = true;
	    for (var i = countPinnedTab(tabs), n = tabs.length - 1; i < n && sorted; i++) {
		if (isAscending)
		    sorted = tabs[i][sortkey] <= tabs[i + 1][sortkey];
		else
		    sorted = tabs[i][sortkey] >= tabs[i + 1][sortkey];
	    }
	    func(sorted, tabs);
	});
    });
}

var isAscending = true;

chrome.browserAction.onClicked.addListener(function (tab) {  
    var key = localStorage["sortKey"] || "url";
    isSorted(
	key,
	isAscending,
	function (sorted, tabs) {
	    if (sorted) {
		var count = 0;
		if ((localStorage["removeSameTabs"] || "") == "true") {
		    var object = new Object();
		    for (var i = 0, n = tabs.length; i < n; i++) {
			var value = tabs[i][key];
			if (!object[value])
			    object[value] = 0;

			if (++object[value] >= 2) {
			    chrome.tabs.remove(tabs[i].id);
			    count++;
			}
		    }
		}
		if (count > 0)
		    return;

		isAscending = !isAscending;
	    }

	    sort(key, isAscending);
	}
    );
});
    
chrome.tabs.onUpdated.addListener(function (tabid, selectinfo, tab) {
    var key = localStorage["sortKey"] || "url";
    isSorted(
	key,
	isAscending,
	function (sorted) {
	    console.log(sorted);
	    if (!sorted && ((localStorage["isAlways"] || "") == "true"))
		sort(key, isAscending);
	}
    );
});
