var app = new Vue({
	el: '#app',
	data: {
		characters: [],
		tables: [],
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
							let url = '/web/table.html?table=' + id + '&gm=1';
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
					})
			}
		}
	},
	mounted: function () {
		this.characters = storage_get('characters');
		this.tables = storage_get('tables');
	},
	computed: {
	}
});
