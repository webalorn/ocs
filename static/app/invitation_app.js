const MAX_RECENT = 5;

var app = new Vue({
	el: '#app',
	data: {
		tableId: null,
		connected: false,
		urlParams: (new URL(window.location.href)).searchParams,
		characters: [],
		tableName: null,
	},
	methods: {
	},
	mounted: function () {
		this.tableId = this.urlParams.get("table");
		console.log('table', this);

		let tableUrl = "/api/table/" + this.tableId;
		fetch(tableUrl).then((answer) => {
			if (answer.ok) {
				answer.json().then(data => {
					this.tableName = data['name'];
					this.connected = true;
					this.characters = data['characters'];
					this.characters.sort(this.compCharacters);
				});
			}
		});
		document.getElementById("app").setAttribute("style", "");
	},
});

Vue.component('select-character', {
	props: ['id', 'table'],
	data: function () {
		console.log(this);
		return {
			sheet: {
				head: {
					nom: "Chargement...",
					peuple: "",
					culture: "",
					profession: "",
				},
				owner: "",
			},
		};
	},
	mounted: function () {
		let url = "/api/sheet/" + this.id;
		fetch(url)
			.then(answer => answer.json())
			.then(data => {
				let sheet = data.content;
				updateSheetVersion(sheet);
				this.sheet = sheet;
			});
	},
	methods: {
		select: function () {
			if (confirm(`Jouer avec le personage ${this.sheet.head.nom} ?`)) {
				window.location.href = `/web/table.html?table=${this.table}&id=${this.id}`;
			}
		},
	},
	computed: {
		avatarStyle: function () {
			if (this.sheet.image) {
				return "background-image: url('" + this.sheet.image + "'); background-size: cover;"
			}
			return "";
		},
	},
	template: `
	<div v-on:click="select" class="select_char">
		<div class="char_avatar" v-bind:style="avatarStyle"></div>
		<div>
			<span class="char_name">{{sheet.head.nom}}</span>
			<br>
			<template v-if="sheet.owner">
				<strong>Joueur :</strong>
				<span>{{sheet.owner}}</span>
				<br>
			</template>
		</div>
		<div>
			<strong>Peuple :</strong>
			<span>{{sheet.head.peuple}}</span>
			<br>
			<strong>Culture :</strong>
			<span>{{sheet.head.culture}}</span>
			<br>
			<strong>Profession :</strong>
			<span>{{sheet.head.profession}}</span>
		</div>
	</div>
	`,
});
