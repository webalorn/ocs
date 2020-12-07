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
		players: [],
		reroll_comp: {
			'dice': null
		},
		newPlayerId: "",
	},
	methods: {
		open_sheet: function () {
			let url = "/web/sheet.html?id=" + this.identity.id;
			window.open(url, '_blank');
		},
		loadPlayers(idList) {
			for (let i in idList) {
				let url = "/api/sheet/" + idList[i];
				fetch(url)
					.then(answer => answer.json())
					.then(data => {
						this.players.push(data);
					});
			}
		},
		addPlayer: function () {
			if (this.newPlayerId) {
				for (let i in this.players) {
					if (this.players[i].id == this.newPlayerId) {
						alert("Déjà à cette table !");
						return;
					}
				}
				let urlFiche = "/api/sheet/" + this.newPlayerId;
				fetch(urlFiche)
					.then(answer => {
						if (!answer.ok) {
							alert("Ce joueur n'existe pas !");
						} else {
							let urlPost = "/api/table/" + this.tableId + "/player/" + this.newPlayerId;
							fetch(urlPost, {
								method: 'POST',
								cache: 'no-cache',
							}).then(ans => {
								if (ans.ok) { location.reload(); }
							});
						}
					})
			}
		}
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
					this.loadPlayers(data['characters']);
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
