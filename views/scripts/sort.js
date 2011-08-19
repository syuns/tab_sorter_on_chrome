/**
 * @param String separator 
 * @return String
 */
String.prototype.joinReversedText = function (separator) {
    var array = this.split(separator);
    array.reverse();
    return array.join(separator);
}

/**
 * Object : tabs
 * return Number
 */
Object.prototype.countPinnedTab = function() {
    var counter = 0;

    for (var i = 0, n = this.length; i < n; i++) {
	    if (this[i].pinned)
	        counter++;
    }

    return counter;
}

/**
 * Object : tabs
 */
Object.prototype.setHostAndPath = function () {
    if (settings.sortKey === "hostAndPath") {
        var endString = "zzz://";
	    for (var i = 0, n = this.length; i < n; i++) {
            // $1 = protocol, $2 = host, $3 = port, $4 = path
            var match = this[i].url.match("^(.+?)://(.+?):?(\d+)?(/.*)?$");
            if (match && match[1] && match[2] && match[4]) {
                if (match[1] == "chrome") {
                    this[i]["hostAndPath"] = endString + this[i].url;
                } else {
                    this[i]["hostAndPath"] = match[2].joinReversedText(".") + match[4];
                }
            } else {
                this[i]["hostAndPath"] = endString + this[i].url;
            }
	    }
    }
}

/**
 * Object : tabs
 * @param String sortKey
 * @param Boolean isAscending
 */
Object.prototype.sortTabs = function (sortKey, isAscending) {
    this.sort(function (a, b) {
        if (isAscending)
            return a[sortKey] > b[sortKey] ? 1 : -1;
        else
            return a[sortKey] > b[sortKey] ? -1 : 1;
    });

    var origin = this.countPinnedTab();
    for (var i = 0, n = this.length; i < n; i++) {
        chrome.tabs.move(
            this[i].id,
            { windowId: window.id, index: origin + i }
        );
    }
}

/**
 * @param String sortKey
 * @param Boolean isAscending
 * @param Function func(Boolean sorted, Object[] tabs)
 */
function isSorted(sortKey, isAscending, func) {
    chrome.windows.getCurrent(function (window) {
        chrome.tabs.getAllInWindow(window.id, function(tabs) {
            tabs.setHostAndPath();

            var sorted = true;
            for (var i = tabs.countPinnedTab(), n = tabs.length - 1; i < n && sorted; i++) {
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
                    var object = { };
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

            tabs.sortTabs(settings.sortKey, settings.isAscending);
        }
    );
});

chrome.tabs.onUpdated.addListener(function (tabid, selectinfo, tab) {
    isSorted(
        settings.sortKey,
        settings.isAscending,
        function (sorted, tabs) {
            if (!sorted && settings.isAlways)
                tabs.sortTabs(settings.sortKey, settings.isAscending);
        }
    );
});
