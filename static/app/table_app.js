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
		characters: [],
		reroll_comp: {
			'dice': null
		},
		newPlayerId: "",
		tableName: "",
		newTableName: "",
	},
	methods: {
		open_sheet: function () {
			let url = "/web/sheet.html?id=" + this.identity.id;
			window.open(url, '_blank');
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
		},
		setTitle: function (title) {
			this.tableName = title;
			this.newTableName = title;
			document.title = this.tableName + ' | Table de jeu';
			storage_set_in_dict('idToName', this.tableId, title);
		},
		updateTableName: function () {
			let urlPost = "/api/table/" + this.tableId + "/update";
			let data = {
				'name': this.newTableName,
			};
			fetch(urlPost, {
				method: 'PUT',
				cache: 'no-cache',
				body: JSON.stringify(data),
			}).then(ans => {
				if (ans.ok) {
					this.setTitle(this.newTableName);
				}
			});
		},
		compCharacters: function (char1, char2) {
			if (char1 == this.identity.id) { return -1; }
			if (char2 == this.identity.id) { return 1; }
			if (char1 < char2) { return -1; }
			if (char1 > char2) { return 1; }
			return 0;
		},
		sendChatFile: function (file) {
			if (!isImageName(file.name)) {
				return false;
			}

			let formData = new FormData();
			formData.append('file', file, file.name);
			fetch("/api/upload", {
				method: 'POST',
				cache: 'no-cache',
				body: formData,
				// headers: {
				// 	"Content-Type": imageContentType(file.name),
				// },
			}).then(
				ans => ans.json()
			).then(data => {
				let url = document.location.origin + data['url'];
				this.socket.send_json({
					'type': 'message',
					'message': '/img ' + url,
					'from': this.identity.id,
					'from_name': this.identity.name,
				});
			});
		},
		dropHandler: function (ev) {
			ev.preventDefault();
			if (ev.dataTransfer.items) {
				// Use DataTransferItemList interface to access the file(s)
				for (var i = 0; i < ev.dataTransfer.items.length; i++) {
					// If dropped items aren't files, reject them
					if (ev.dataTransfer.items[i].kind === 'file') {
						this.sendChatFile(ev.dataTransfer.items[i].getAsFile());
					}
				}
			} else {
				// Use DataTransfer interface to access the file(s)
				for (var i = 0; i < ev.dataTransfer.files.length; i++) {
					this.sendChatFile(ev.dataTransfer.files[i]);
				}
			}
		},
		dragHandler: function (ev) {
			ev.preventDefault();
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
					this.setTitle(data['name']);
					if (this.urlParams.get("gm")) {
						this.identity = {
							'id': '0',
							'name': 'MJ',
							'gm': true,
							'sheet': newDefaultSheet(),
							'deriv': compute_derived(newDefaultSheet()),
						};
					} else {
						if (this.urlParams.get("id") === null) {
							this.errorMessage = "Il faut un personnage pour rejoindre";
							return;
						}
						this.identity = {
							'id': this.urlParams.get("id"),
							'name': '',
							'player_name': '',
							'gm': false,
							'sheet': newDefaultSheet(),
							'deriv': compute_derived(newDefaultSheet()),
						};
						if (!data['characters'].includes(this.identity.id)) {
							this.errorMessage = "Le personnage " + this.identity.id + " n'appartient pas à cette table de jeu";
							return;
						}
						let tableUrl = "/api/sheet/" + this.identity.id;
						fetch(tableUrl)
							.then(answer => answer.json())
							.then(data => {
								this.identity.name = data.content.head.nom;
								this.identity.player_name = data.content.owner;
							});
					}
					this.connected = true;
					this.characters = data['characters'];
					this.characters.sort(this.compCharacters);
				});
			}
		}).catch((error) => {
			this.cantConnect = true;
		});

		let urlSocket = "/ws/table/" + this.tableId;
		this.socket = newReSocket(urlSocket, socketOk => {
			if (!socketOk) {
				this.connected = false;
				this.cantConnect = true;
			}
		});

		document.getElementById("app").setAttribute("style", "");
	},
});
