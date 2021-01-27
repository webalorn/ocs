let global_elements = {};

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
		return cur;
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

function storage_get(key) {
	let storedValue = localStorage.getItem(key);
	if (storedValue === null) {
		return [];
	} else {
		return JSON.parse(storedValue);
	}
}

function storage_add(key, value) {
	let allValues = storage_get(key);
	allValues.push(value);
	localStorage.setItem(key, JSON.stringify(allValues));
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
