var app = new Vue({
	el: '#app',
	data: {
		characters: [],
		tables: [],
		recentTables: [],
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
		toogleImportExport: function () {
			this.importExShown = !this.importExShown;
		},
		importTables: function () {
			let lines = this.tableImportList.split('\n');
			let errors = [];
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
		delCharacter: function (id) {
			let name = this.idToName[id] || id;
			if (confirm("Voulez vous vraiment supprimer le personnage '" + name + '" de cette liste?')) {
				this.characters = this.characters.filter(el => el !== id)
				storage_replace('characters', this.characters);
			}
		},
		delTable: function (id) {
			let name = this.idToName[id] || id;
			if (confirm("Voulez vous vraiment supprimer la table '" + name + '" de cette liste?')) {
				this.tables = this.tables.filter(el => el !== id)
				storage_replace('tables', this.tables);
			}
		},
		startDrag: function (event, id, type) {
			event.dataTransfer.dropEffect = 'move';
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData('itemId', id);
			event.dataTransfer.setData('itemType', type);
		},
		onDrop: function (event, type, dropId, list) {
			const dragId = event.dataTransfer.getData('itemId');
			const itemType = event.dataTransfer.getData('itemType');
			if (itemType == type) {
				const posDrag = list.findIndex(el => el == dragId);
				const posDrop = list.findIndex(el => el == dropId);
				list.splice(posDrag, 1);
				list.splice(posDrop, 0, dragId);

				storage_replace(type, list);
			}
			Array.prototype.forEach.call(document.getElementsByClassName('itemOver'), el => {
				el.classList.remove('itemOver');
			});
		},
		onDragEnter: function (event, type, id) {
			let el = document.getElementById(type + '_' + id);
			el.classList.add('itemOver');
		},
		onDragLeave: function (event, type, id) {
			let el = document.getElementById(type + '_' + id);
			el.classList.remove('itemOver');
		},
	},
	mounted: function () {
		this.characters = storage_get('characters');
		this.tables = storage_get('tables');
		this.recentTables = storage_get('recentTables');
		this.idToName = storage_get('idToName', {});
	},
	computed: {
	}
});
