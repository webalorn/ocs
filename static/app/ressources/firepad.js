function initFirepad(firepadId) {
	var firebaseConfig = {
		apiKey: "AIzaSyCibCO2xNNUIbdsMnIzSb_-TjJ-0pVoblo",
		authDomain: "ocs-tde.firebaseapp.com",
		databaseURL: "https://ocs-tde-default-rtdb.europe-west1.firebasedatabase.app/"
	};
	firebase.initializeApp(firebaseConfig);

	var firepadRef = firebase.database().ref();
	firepadRef = firepadRef.child('pad-' + firepadId);
	console.log('Firebase data: ', firepadRef.toString());

	var codeMirror = CodeMirror(document.getElementById('firepad-container'), {
		lineWrapping: true
	});
	var firepad = Firepad.fromCodeMirror(firepadRef, codeMirror, {
		richTextToolbar: true,
		richTextShortcuts: true
	});
	firepad.on('ready', function () {
		if (firepad.isHistoryEmpty()) {
			firepad.setHtml('<span>Zone de notes collaborative</span>');
		}
	});
}
function showFirepad() {
	document.getElementById("firepad-back").classList.add("display-block");
	document.getElementById("firepad-window").classList.add("display-block");
}
function hideFirepad() {
	document.getElementById("firepad-back").classList.remove("display-block");
	document.getElementById("firepad-window").classList.remove("display-block");
}
