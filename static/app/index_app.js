var app = new Vue({
	el: '#app',
	data: {
		characters: [],
		tables: [],
		importExShown: false,
		tableImportList: "",
		charImportList: "",
	},
	methods: {
		new_character: function () {
			if (confirm("Créer un nouveau personnage ?")) {
				let urlPost = "/api/sheet/";
				fetch(urlPost, {
					method: 'POST',
					cache: 'no-cache',
				}).then(ans => {
					if (ans.ok) {
						ans.json().then(data => {
							let id = data['id'];
							this.characters.push(id);
							storage_add('characters', id);
							let url = '/web/sheet.html?id=' + id;
							window.open(url, '_blank');
						});
					} else {
						alert("Erreur lors de la création du personnage");
					}
				});
			}
		},
		new_table: function () {
			var table_name = prompt("Nom de la table :");
			if (table_name !== null) {
				let urlPost = "/api/table/";
				let data = {
					'name': table_name,
				};
				fetch(urlPost, {
					method: 'POST',
					cache: 'no-cache',
					body: JSON.stringify(data),
				}).then(ans => {
					if (ans.ok) {
						ans.json().then(data => {
							let id = data['id'];
							this.tables.push(id);
							storage_add('tables', id);
							let url = '/web/table.html?table=' + id + '&gm=' + miniHash(id);
							window.open(url, '_blank');
						});
					} else {
						alert("Erreur lors de la création de la table");
					}
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
					});
			}
		},
		toogleImportExport: function () {
			this.importExShown = !this.importExShown;
		},
		importTables: function () {
			let lines = this.tableImportList.split('\n');
			let errors = [];
			console.log(lines);
			lines.forEach(l => {
				let parts = l.trim().split(';');
				if (parts.length == 2 && !this.tables.includes(parts[0])) {
					if (miniHash(parts[0]) == parts[1]) {
						this.tables.push(parts[0]);
						storage_add('tables', parts[0]);
					} else {
						errors.push(l);
					}
				}
			});
			if (errors.length) {
				alert("Erreur lors de l'import de certaines tables")
			}
			this.tableImportList = errors.join('\n');
		},
		importCharacters: function () {
			let lines = this.charImportList.split('\n');
			let errors = [];
			console.log(lines);
			lines.forEach(l => {
				let parts = l.trim().split(';');
				if (parts.length == 2 && !this.characters.includes(parts[0])) {
					if (miniHashStep(parts[0], 2) == parts[1]) {
						this.characters.push(parts[0]);
						storage_add('characters', parts[0]);
					} else {
						errors.push(l);
					}
				}
			});
			if (errors.length) {
				alert("Erreur lors de l'import de certains personnages")
			}
			this.charImportList = errors.join('\n');
		},
	},
	mounted: function () {
		this.characters = storage_get('characters');
		this.idToName = storage_get('idToName', {});
		this.tables = storage_get('tables');
	},
	computed: {
	}
});
