let global_elements = {};

const sum2 = (a, b) => a + b;


function newReSocket(url_path, connnectCallback) {
	let socketProtol = location.protocol == 'http:' ? 'ws://' : 'wss://'
	let url = socketProtol + window.location.host + url_path;
	let s = {
		callOnMessage: [],
		lastOpen: 0,
		connected: false,
		register: function (f) {
			this.callOnMessage.push(f);
		},
		initSocket: function () {
			if (Date.now() - this.lastOpen < 1000) {
				setTimeout(() => this.initSocket(), 1000);
				return;
			}
			this.lastOpen = Date.now();

			this.socket = new WebSocket(url);
			this.socket.onopen = () => {
				if (!this.connected) {
					this.connected = true;
					connnectCallback(true);
				}
			}
			this.socket.onerror = () => {
				if (!this.connected) {
					connnectCallback(false);
				}
			}
			this.socket.onclose = () => {
				if (this.connected) {
					this.initSocket();
				}
			}
			this.socket.onmessage = event => this.callOnMessage.forEach(
				f => f(event, event.data ? JSON.parse(event.data) : {})
			);
		},
		send: function (data) {
			return this.socket.send(data);
		},
		send_json: function (data) {
			return this.send(JSON.stringify(data));
		},
	};
	s.initSocket();
	return s;
}

String.prototype.hashCode = function () {
	var hash = 0;
	if (this.length == 0) {
		return hash;
	}
	for (var i = 0; i < this.length; i++) {
		var char = this.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
}

function miniHash(str) {
	return '' + Math.abs(('' + str).hashCode()) % 99679
}

function miniHashStep(str, steps) {
	if (steps <= 1) {
		return miniHash(str);
	} else {
		return miniHashStep('' + ('' + str).hashCode(), steps - 1);
	}
}

function roundDecimal(n, d) {
	let m = Math.pow(10, d);
	return Math.round((n + Number.EPSILON) * m) / m;
}

/*
	Datas
*/
function getType(v) {
	if (Array.isArray(v)) {
		return "Array";
	}
	return typeof v;
}
function mergeDatas(cur, add) {
	if (add === undefined || add === null) {
		return cur;
	}
	let typeCur = getType(cur);
	let typeAdd = getType(add);
	if (typeAdd != typeCur) {
		console.error(typeof add, "should be of type", typeof cur, "to merge");
		console.log("Got", add);
		return cur;
	}
	if (typeCur == "Array") {
		while (add.length < cur.length) {
			cur.pop();
		}
		while (add.length > cur.length && add[cur.length] !== null) {
			cur.push(add[cur.length]);
		}
		for (let i in cur) {
			cur[i] = mergeDatas(cur[i], add[i]);
		}
		return cur;
	} else if (typeCur == "object") {
		for (let prop in cur) {
			if (prop in add) {
				cur[prop] = mergeDatas(cur[prop], add[prop]);
			}
		}
		return cur;
	} else if (typeCur == "number" || typeCur == "string") {
		return add;
	} else {
		console.warn("Can't merge types", typeCur);
		return cur;
	}
}
function cloneData(cur) {
	if (cur === undefined || cur === null) {
		return cur;
	}
	let typeCur = getType(cur);
	if (typeCur == "Array") {
		let newData = [];
		for (let i in cur) {
			newData.push(cloneData(cur[i]));
		}
		return newData;
	} else if (typeCur == "object") {
		let newData = {};
		for (let prop in cur) {
			newData[prop] = cloneData(cur[prop]);
		}
		return newData;
	} else if (typeCur == "number" || typeCur == "string") {
		return cur;
	} else {
		console.warn("Can't clone type", typeCur);
		return cur;
	}
}
function areEqual(cur, add) {
	if (add === undefined || add === null) {
		return cur === add;
	}
	let typeCur = getType(cur);
	let typeAdd = getType(add);
	if (typeAdd != typeCur) {
		return false;
	}
	if (typeCur == "Array") {
		if (cur.length != add.length) {
			return false;
		}
		for (let i in cur) {
			if (!areEqual(cur[i], add[i])) {
				return false;
			}
		}
		return true;
	} else if (typeCur == "object") {
		for (let prop in cur) {
			if (prop in add) {
				if (!areEqual(cur[prop], add[prop])) {
					return false;
				}
			} else {
				return false;
			}
		}
		for (let prop in add) {
			if (!(prop in cur)) {
				return false;
			}
		}
		return true;
	} else {
		return cur === add;
	}
}

function updateSavedData(local, lastSave, remote) {
	if (remote === undefined || remote === null) {
		return local;
	}
	let typeLocal = getType(local);
	let typeSaved = getType(lastSave);
	let typeRemote = getType(remote);

	if (typeSaved != typeLocal || typeSaved != typeRemote) {
		console.error("Can't merge types", typeLocal, typeSaved, typeRemote);
		return local;
	}
	if (typeLocal == "Array") {
		// remove : currently, no (todo ?)
		for (let i in local) {
			if (i < lastSave.length && i < remote.length) {
				local[i] = updateSavedData(local[i], lastSave[i], remote[i]);
				lastSave[i] = local[i];
			}
		}
		for (let i = Math.max(local.length, lastSave.length); i < remote.length; i++) {
			local.push(remote[i]);
			lastSave.push(remote[i]);
		}
	} else if (typeLocal == "object") {
		for (let prop in remote) {
			if (prop in local && prop in lastSave) {
				local[prop] = updateSavedData(local[prop], lastSave[prop], remote[prop]);
				lastSave[prop] = local[prop];
			} else if (!(prop in local || prop in lastSave)) {
				local[prop] = remote[prop];
				lastSave[prop] = remote[prop];
			}
		}
	} else if (typeLocal == "number" || typeLocal == "string") {
		if (local === lastSave) {
			local = remote;
		}
	} else {
		console.warn("Can't update types", typeLocal);
	}
	return local;
}

function storage_get(key, defaultVal = []) {
	let storedValue = localStorage.getItem(key);
	if (storedValue === null) {
		return defaultVal;
	} else {
		return JSON.parse(storedValue);
	}
}
function storage_get_in_dict(key, field) {
	return storage_get(key, {})[field];
}

function storage_add(key, value) {
	let allValues = storage_get(key);
	allValues.push(value);
	localStorage.setItem(key, JSON.stringify(allValues));
}

function storage_replace(key, value) {
	localStorage.setItem(key, JSON.stringify(value));
}
function storage_set_in_dict(key, field, value) {
	let curDict = storage_get(key, {});
	curDict[field] = value;
	localStorage.setItem(key, JSON.stringify(curDict));
}

/*
	Vue tools
*/

Vue.component('int-input', {
	props: ['value'],
	template: `
	<input
		type="text" 
		v-bind:value="value"
		v-on:input="$emit('input', String(parseFloat($event.target.value) || 0))"
		class="input_text_int"
    >
  `
});

Vue.component('intnum-input', {
	props: ['value', 'min', 'max'],
	computed: {
		'intmin': function () { return parseInt(this.min) },
		'intmax': function () { return parseInt(this.max) },
	},
	methods: {
		getValue: function (val) {
			val = parseFloat(val) || 0;
			val = Math.min(this.intmax, val);
			val = Math.max(this.intmin, val);
			return String(val);
		}
	},
	template: `
	<input
		type="number"
		v-bind:min="min"
		v-bind:max="max"
		v-bind:value="value"
    	v-on:input="$emit('input', getValue($event.target.value))"
    >
  `
});


/*
	Links and images
*/

const LINK_REG = /^https?:\/\/\S+\.\S+$/i;
const IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg'];
const IMAGE_CONTENT_TYPE = {
	'png': 'image/png',
	'jpg': 'image/jpeg',
	'jpeg': 'image/jpeg',
	'gif': 'image/gif',
	'bmp': 'image/bmp',
	'svg': 'image/svg',
};

function isLink(string) {
	return string.match(LINK_REG) !== null;
}

function isImageName(name) {
	let string = name.toLowerCase();
	return IMAGE_EXTS.some(ext => string.endsWith(ext));
}

function isImage(string) {
	return isLink(string) && isImageName(string);
}

function imageContentType(name) {
	for (let ext in IMAGE_CONTENT_TYPE) {
		if (name.endsWith(ext)) {
			return IMAGE_CONTENT_TYPE[ext];
		}
	}
	return 'image/*';
}
