var app = new Vue({
	el: '#app',
	data: {
		tableId: null,
		socket: null,
		connected: false,
		cantConnect: false,
		errorMessage: null,
		urlParams: (new URL(window.location.href)).searchParams,
		identity: {},
		reroll_comp: {
			'dice': null
		},
	},
	methods: {
		open_sheet: function () {
			let url = "/web/sheet.html?id=" + this.identity.id;
			window.open(url, '_blank');
		},
	},
	mounted: function () {
		this.tableId = this.urlParams.get("table");

		let tableUrl = "/api/table/" + this.tableId;
		fetch(tableUrl).then((answer) => {
			if (!answer.ok) {
				this.cantConnect = true;
			} else {
				answer.json().then(data => {
					if (this.urlParams.get("gm")) {
						this.identity = {
							'id': '0',
							'name': 'MJ',
							'gm': true,
						};
					} else {
						if (this.urlParams.get("id") === null) {
							this.errorMessage = "Il faut un personage pour rejoindre";
							return;
						}
						this.identity = {
							'id': this.urlParams.get("id"),
							'name': 'Guest',
							'gm': false,
						};
						if (!data['characters'].includes(this.identity.id)) {
							this.errorMessage = "Le personage " + this.identity.id + " n'appartient pas à cette table de jeu";
							return;
						}
						let tableUrl = "/api/sheet/" + this.identity.id;
						fetch(tableUrl)
							.then(answer => answer.json())
							.then(data => { this.identity.name = data.content.owner })
					}
					this.connected = true;
				})
			}
		}).catch((error) => {
			this.cantConnect = true;
		});

		let urlSocket = "ws://" + window.location.host + "/ws/table/" + this.tableId;
		this.socket = newReSocket(urlSocket, socketOk => {
			if (!socketOk) {
				this.connected = false;
				this.cantConnect = true;
			}
		});
	},
});
