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

function isSorted(sortkey, isAscending, isSortedFunc, isNotSortedFunc) {
    chrome.windows.getCurrent(function (window) {
	chrome.tabs.getAllInWindow(window.id, function(tabs) {
	    var sorted = true;
	    for (var i = countPinnedTab(tabs), n = tabs.length - 1; i < n && sorted; i++) {
		if (isAscending)
		    sorted = tabs[i][sortkey] <= tabs[i + 1][sortkey];
		else
		    sorted = tabs[i][sortkey] >= tabs[i + 1][sortkey];
	    }

	    if (sorted)
		isSortedFunc();
	    else
		isNotSortedFunc();
	});
    });
}

var key = "url";
var isAscending = true;

chrome.browserAction.onClicked.addListener(function (tab) {
    isSorted(
	key,
	isAscending,
	function () {
	    isAscending = !isAscending;
	    sort(key, isAscending);
	},
	function () {
	    sort(key, isAscending);
	}
    );
});
    
chrome.tabs.onUpdated.addListener(function (tabid, selectinfo, tab) {
    isSorted(
	key,
	isAscending,
	function () { },
	function () {
	    sort(key, isAscending);
	}
    );
});
