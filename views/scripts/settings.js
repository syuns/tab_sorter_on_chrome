var settings = {
    get sortKey() {
	return localStorage["sortKey"] || "url";
    },
    set sortKey(value) {
	localStorage["sortKey"] = value;
    },
    get removeSameTabs() {
	return (localStorage["removeSameTabs"] || "") === "true";
    },
    set removeSameTabs(value) {
	localStorage["removeSameTabs"] = value;
    },
    get isAlways() {
	return (localStorage["isAlways"] || "") === "true";
    },
    set isAlways(value) {
	localStorage["isAlways"] = value;
    },
    get isAscending() {
	return (localStorage["isAscending"] || "") === "true";
    },
    set isAscending(value) {
	localStorage["isAscending"] = value;
    }
};

function load(value, id) {
    var options = document.getElementById(id);
    for (var i = 0; i < options.length; i++) {
	if (options.children[i].value == value) {
	    options.children[i].selected = "true";
	    break;
	}
    }
}

function loadOptions() {
    document.getElementById("isAlways").checked = settings.isAlways;
    document.getElementById("removeSameTabs").checked = settings.removeSameTabs;
    load(settings.sortKey, "sortKey");
}

function saveOptions() {
    settings.isAlways = document.getElementById("isAlways").checked;
    settings.removeSameTabs = document.getElementById("removeSameTabs").checked;

    var select = document.getElementById("sortKey");
    settings.sortKey = select.children[select.selectedIndex].value;
}
