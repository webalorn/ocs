var app = null;

function build_app() {
	document.getElementById("app").setAttribute("style", "");
	app = new Vue({
		el: '#app',
		data: {
			sheetId: null,
			sheet: {},
			socket: null,
			connected: false,
			cantConnect: false,
			urlParams: (new URL(window.location.href)).searchParams
		},
		mounted: function () {
			this.sheetId = this.urlParams.get("id");
			fetch('/api/sheet/' + this.sheetId)
				.then(response => {
					if (!response.ok) {
						this.cantConnect = true;
					} else {
						response.json().then(sheet => {
							this.connected = true;
							this.sheet = sheet;
							if (!updateSheetVersion(this.sheet.content)) {
								this.connected = false;
								this.cantConnect = true;
								return;
							}

							let urlSocket = "/ws/sheet/" + this.sheetId;
							this.socket = newReSocket(urlSocket, socketOk => {
								if (!socketOk) {
									this.connected = false;
									this.cantConnect = true;
								}
							});
						});
					}
				})
		},
	});
}

window.addEventListener('sheet_loaded', e => build_app());
