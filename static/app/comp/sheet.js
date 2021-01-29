/*
	Sheet tools
*/
let sum2 = (a, b) => a + b;
const qualNames = ["co", "in", "iu", "ch", "de", "ag", "cn", "fo"];

function newDefaultSheet() {
	return {
		"owner": "",
		"image": "",
		"head": {
			"nom": "",
			"sexe": "",
			"peuple": "",
			"date_naissance": "",
			"age": "",
			"cheveux": "",
			"yeux": "",
			"taille_masse": "",
			"profession": "",
			"culture": "",
			"niveau_social": "",
			"lieu_naissance": "",
			"famille": "",
			"traits": "",
			"description_phy": "",
		},
		"qualites": {
			"co": 8,
			"in": 8,
			"iu": 8,
			"ch": 8,
			"de": 8,
			"ag": 8,
			"cn": 8,
			"fo": 8,
		},
		"stats": {
			"ev": [0, 0, 0],
			"ea": [0, 0, 0],
			"ek": [0, 0, 0],
			"tm": [0, 0],
			"tp": [0, 0],
			"esq": [0, 0],
			"ini": [0, 0],
			"vi": [0, 0],
		},
		"cur_stats": {
			"ev": 0,
			"ea": 0,
			"ek": 0,
		},
		"des": {
			"valeur": 3,
			"modif": 0,
			"actuels": 3,
		},
		"xp": { "total": 0, "spent": 0 },
		"avantages": "",
		"desavantages": "",
		"cs": {
			"generales": "",
			"combat": "",
			"magiques": "",
			"divines": "",
		},
		"langues": "",
		"ecriture": "",
		"modifs_qualites": "",
		"talents": {
			"phy": {
				"acuite": { "vc": 0, "remark": "" },
				"alcool": { "vc": 0, "remark": "" },
				"batellerie": { "vc": 0, "remark": "" },
				"chant": { "vc": 0, "remark": "" },
				"danse": { "vc": 0, "remark": "" },
				"equitation": { "vc": 0, "remark": "" },
				"escalade": { "vc": 0, "remark": "" },
				"furtivite": { "vc": 0, "remark": "" },
				"maitrise_corps": { "vc": 0, "remark": "" },
				"maitrise_soi": { "vc": 0, "remark": "" },
				"natation": { "vc": 0, "remark": "" },
				"tour_force": { "vc": 0, "remark": "" },
				"vol": { "vc": 0, "remark": "" },
				"vol_tire": { "vc": 0, "remark": "" },
			},
			"soc": {
				"rue": { "vc": 0, "remark": "" },
				"convertir": { "vc": 0, "remark": "" },
				"deguisement": { "vc": 0, "remark": "" },
				"etiquette": { "vc": 0, "remark": "" },
				"intimidation": { "vc": 0, "remark": "" },
				"nature_humaine": { "vc": 0, "remark": "" },
				"persutaation": { "vc": 0, "remark": "" },
				"seduction": { "vc": 0, "remark": "" },
				"volonte": { "vc": 0, "remark": "" },
			},
			"nat": {
				"botanique": { "vc": 0, "remark": "" },
				"orientation": { "vc": 0, "remark": "" },
				"peche": { "vc": 0, "remark": "" },
				"pistage": { "vc": 0, "remark": "" },
				"noeuds": { "vc": 0, "remark": "" },
				"survie": { "vc": 0, "remark": "" },
				"zoologie": { "vc": 0, "remark": "" },
			},
			"connaissance": {
				"art_guerre": { "vc": 0, "remark": "" },
				"astonomie": { "vc": 0, "remark": "" },
				"calcul": { "vc": 0, "remark": "" },
				"contes_legendes": { "vc": 0, "remark": "" },
				"dieux_cultes": { "vc": 0, "remark": "" },
				"droit": { "vc": 0, "remark": "" },
				"geographie": { "vc": 0, "remark": "" },
				"histoire": { "vc": 0, "remark": "" },
				"jeux": { "vc": 0, "remark": "" },
				"magicologie": { "vc": 0, "remark": "" },
				"mecanique": { "vc": 0, "remark": "" },
				"spherologie": { "vc": 0, "remark": "" },
			},
			"savoir": {
				"alchimie": { "vc": 0, "remark": "" },
				"navires": { "vc": 0, "remark": "" },
				"commerce": { "vc": 0, "remark": "" },
				"conduite": { "vc": 0, "remark": "" },
				"crochetage": { "vc": 0, "remark": "" },
				"cuisine": { "vc": 0, "remark": "" },
				"musique": { "vc": 0, "remark": "" },
				"peinture_dessin": { "vc": 0, "remark": "" },
				"soin_esprit": { "vc": 0, "remark": "" },
				"soin_blessures": { "vc": 0, "remark": "" },
				"soin_maladies": { "vc": 0, "remark": "" },
				"soin_poisons": { "vc": 0, "remark": "" },
				"pierre": { "vc": 0, "remark": "" },
				"bois": { "vc": 0, "remark": "" },
				"cuir": { "vc": 0, "remark": "" },
				"métal": { "vc": 0, "remark": "" },
				"tissu": { "vc": 0, "remark": "" },
			},
		},
		"etats": {
			"confusion": 0,
			"douleur": 0,
			"encombrement": 0,
			"etourdissement": 0,
			"extase": 0,
			"paralysie": 0,
			"terreur": 0,
			"ebriete": 0,
		},
		"status": "",
		"techniques": {
			"arbaletes": { "vtc": 6, "atcd": 6 },
			"arcs": { "vtc": 6, "atcd": 6 },
			"chaines": { "vtc": 6, "atcd": 6 },
			"hast": { "vtc": 6, "atcd": 6, "prd": 3 },
			"duel": { "vtc": 6, "atcd": 6, "prd": 3 },
			"jet": { "vtc": 6, "atcd": 6 },
			"bagarre": { "vtc": 6, "atcd": 6, "prd": 3 },
			"boucliers": { "vtc": 6, "atcd": 6, "prd": 3 },
			"dagues": { "vtc": 6, "atcd": 6, "prd": 3 },
			"epees": { "vtc": 6, "atcd": 6, "prd": 3 },
			"epees2mains": { "vtc": 6, "atcd": 6, "prd": 3 },
			"haches_masses": { "vtc": 6, "atcd": 6, "prd": 3 },
			"haches_masses_2m": { "vtc": 6, "atcd": 6, "prd": 3 },
			"lances": { "vtc": 6, "atcd": 6, "prd": 3 },
			"frondes": { "vtc": 6, "atcd": 6 },
			"fouets": { "vtc": 6, "atcd": 6 },
		},
		"argent": [0, 0, 0, 0],
		"other_stuff": "",
		"animal": {
			"nom": "",
			"type": "",
			"pv": 0,
			"pa": 0,
			"qualites": {
				"co": 8,
				"in": 8,
				"iu": 8,
				"ch": 8,
				"de": 8,
				"ag": 8,
				"cn": 8,
				"fo": 8,
			},
			"tm": 0,
			"tp": 0,
			"pr": 0,
			"ini": 0,
			"vi": 0,
			"attaque": "",
			"atcd": "",
			"defense": "",
			"pi": "",
			"alpo": "",
			"action": "",
			"cs": "",
			"notes": "",
			"image": "",
		},
		"divin": {
			"perma_pk": 0,
			"tradition": "",
			"qualite_principale": "",
			"aspect": "",
			"cs": "",
			"benedictions": "",
		},
		"magic": {
			"perma_pa": 0,
			"tradition": "",
			"qualite_principale": "",
			"domaine": "",
			"cs": "",
			"tours": "",
		},
		"notes": {
			"background": "",
			"relations": "",
			"notes": "",
			"ideaux_objectifs": "",
			"qualites_defauts_rp": "",
		},
		"stuff": [],
		"sorts": [],
		"liturgies": [],
		"armes": {
			"melee": [],
			"distance": [],
			"armures": [],
			"parade": [],
		},
	}
}

const talentInfos = {
	"phy": {
		"acuite": { "name": "Acuité sensorielle", "roll": "IN/IU/IU", "enc": "EVTL", "am": "D" },
		"alcool": { "name": "Alcools & drogues", "roll": "IN/CN/FO", "enc": "NON", "am": "A" },
		"batellerie": { "name": "Batellerie", "roll": "CO/CH/DE", "enc": "OUI", "am": "A" },
		"chant": { "name": "Chant", "roll": "IN/CH/CN", "enc": "EVTL", "am": "A" },
		"danse": { "name": "Danse", "roll": "IN/CH/AG", "enc": "OUI", "am": "A" },
		"equitation": { "name": "Équitation", "roll": "CH/AG/FO", "enc": "OUI", "am": "B" },
		"escalade": { "name": "Escalade", "roll": "CO/AG/FO", "enc": "OUI", "am": "B" },
		"furtivite": { "name": "Furtivité", "roll": "CO/IU/AG", "enc": "OUI", "am": "C" },
		"maitrise_corps": { "name": "Maîtrise corporelle", "roll": "AG/AG/CN", "enc": "OUI", "am": "D" },
		"maitrise_soi": { "name": "Maîtrise de soi", "roll": "CO/CO/CN", "enc": "NON", "am": "D" },
		"natation": { "name": "Natation", "roll": "AG/CN/FO", "enc": "OUI", "am": "B" },
		"tour_force": { "name": "Tour de force", "roll": "CN/FO/FO", "enc": "OUI", "am": "B" },
		"vol": { "name": "Vol", "roll": "CO/IU/AG", "enc": "OUI", "am": "B" },
		"vol_tire": { "name": "Vol à la tire", "roll": "CO/DE/AG", "enc": "OUI", "am": "B" },
	},
	"soc": {
		"rue": { "name": "Connaissance de la rue", "roll": "IN/IU/CH", "enc": "EVTL", "am": "C" },
		"convertir": { "name": "Convertir & convaincre", "roll": "CO/IN/CH", "enc": "NON", "am": "B" },
		"deguisement": { "name": "Déguisement", "roll": "IU/CH/AG", "enc": "OUI", "am": "B" },
		"etiquette": { "name": "Étiquette", "roll": "IN/IU/CH", "enc": "EVTL", "am": "B" },
		"intimidation": { "name": "Intimidation", "roll": "CO/IU/CH", "enc": "NON", "am": "B" },
		"nature_humaine": { "name": "Nature humaine", "roll": "IN/IU/CH", "enc": "NON", "am": "C" },
		"persutaation": { "name": "Persutation", "roll": "CO/IU/CH", "enc": "NON", "am": "C" },
		"seduction": { "name": "Séduction", "roll": "CO/CH/CH", "enc": "EVTL", "am": "B" },
		"volonte": { "name": "Volonté", "roll": "CO/IU/CH", "enc": "NON", "am": "D" },
	},
	"nat": {
		"botanique": { "name": "Botanique", "roll": "IN/DE/CN", "enc": "EVTL", "am": "C" },
		"orientation": { "name": "Orientation", "roll": "IN/IU/IU", "enc": "NON", "am": "B" },
		"peche": { "name": "Pêche", "roll": "DE/AG/CN", "enc": "EVTL", "am": "A" },
		"pistage": { "name": "Pistage", "roll": "CO/IU/AG", "enc": "OUI", "am": "C" },
		"noeuds": { "name": "Pratique des noeuds", "roll": "IN/DE/FO", "enc": "EVTL", "am": "A" },
		"survie": { "name": "Survie", "roll": "CO/AG/CN", "enc": "OUI", "am": "C" },
		"zoologie": { "name": "Zoologie", "roll": "CO/CO/CH", "enc": "OUI", "am": "C" },
	},
	"connaissance": {
		"art_guerre": { "name": "Art de la guerre", "roll": "CO/IN/IU", "enc": "NON", "am": "B" },
		"astonomie": { "name": "Astronomie", "roll": "IN/IN/IU", "enc": "NON", "am": "A" },
		"calcul": { "name": "Calcul", "roll": "IN/IN/IU", "enc": "NON", "am": "A" },
		"contes_legendes": { "name": "Contes & légendes", "roll": "IN/IN/IU", "enc": "NON", "am": "B" },
		"dieux_cultes": { "name": "Dieux & cultes", "roll": "IN/IN/IU", "enc": "NON", "am": "B" },
		"droit": { "name": "Droit", "roll": "IN/IN/IU", "enc": "NON", "am": "A" },
		"geographie": { "name": "Géographie", "roll": "IN/IN/IU", "enc": "NON", "am": "B" },
		"histoire": { "name": "Histoire", "roll": "IN/IN/IU", "enc": "NON", "am": "B" },
		"jeux": { "name": "Jeux", "roll": "IN/IN/IU", "enc": "NON", "am": "A" },
		"magicologie": { "name": "Magicologie", "roll": "IN/IN/IU", "enc": "NON", "am": "C" },
		"mecanique": { "name": "Mécanique", "roll": "IN/IN/DE", "enc": "NON", "am": "B" },
		"spherologie": { "name": "Sphérologie", "roll": "IN/IN/IU", "enc": "NON", "am": "B" },
	},
	"savoir": {
		"alchimie": { "name": "Alchimie", "roll": "CO/IN/DE", "enc": "OUI", "am": "C" },
		"navires": { "name": "Bateaux & navires", "roll": "DE/AG/FO", "enc": "OUI", "am": "C" },
		"commerce": { "name": "Commerce", "roll": "IN/IU/CH", "enc": "NON", "am": "B" },
		"conduite": { "name": "Conduite", "roll": "CH/DE/CN", "enc": "OUI", "am": "A" },
		"crochetage": { "name": "Crochetage", "roll": "IU/DE/DE", "enc": "OUI", "am": "C" },
		"cuisine": { "name": "Cuisine", "roll": "IU/DE/DE", "enc": "OUI", "am": "A" },
		"musique": { "name": "Musique", "roll": "CH/DE/CN", "enc": "OUI", "am": "A" },
		"peinture_dessin": { "name": "Peinture & dessin", "roll": "IN/DE/DE", "enc": "OUI", "am": "A" },
		"soin_esprit": { "name": "Soin de l'esprit", "roll": "IU/CH/CN", "enc": "NON", "am": "B" },
		"soin_blessures": { "name": "Soin des blessures", "roll": "IU/DE/DE", "enc": "OUI", "am": "D" },
		"soin_maladies": { "name": "Soin des maladies", "roll": "CO/IU/CN", "enc": "OUI", "am": "B" },
		"soin_poisons": { "name": "Soin des poisons", "roll": "CO/IN/IU", "enc": "OUI", "am": "B" },
		"pierre": { "name": "Travail de la pierre", "roll": "DE/DE/FO", "enc": "OUI", "am": "A" },
		"bois": { "name": "Travail du bois", "roll": "DE/AG/FO", "enc": "OUI", "am": "B" },
		"cuir": { "name": "Travail du cuir", "roll": "DE/AG/CN", "enc": "OUI", "am": "B" },
		"métal": { "name": "Travail du métal", "roll": "DE/CN/FO", "enc": "OUI", "am": "C" },
		"tissu": { "name": "Travail du tissu", "roll": "IN/DE/DE", "enc": "OUI", "am": "A" },
	},
}
const talentLists = {
	"phy": [
		"acuite", "alcool", "batellerie", "chant", "danse", "equitation", "escalade", "furtivite", "maitrise_corps", "maitrise_soi", "natation", "tour_force", "vol", "vol_tire",],
	"soc": [
		"rue", "convertir", "deguisement", "etiquette", "intimidation", "nature_humaine", "persutaation", "seduction", "volonte",],
	"nat": [
		"botanique", "orientation", "peche", "pistage", "noeuds", "survie", "zoologie",],
	"connaissance": [
		"art_guerre", "astonomie", "calcul", "contes_legendes", "dieux_cultes", "droit", "geographie", "histoire", "jeux", "magicologie", "mecanique", "spherologie",],
	"savoir": [
		"alchimie", "navires", "commerce", "conduite", "crochetage", "cuisine", "musique", "peinture_dessin", "soin_esprit", "soin_blessures", "soin_maladies", "soin_poisons", "pierre", "bois", "cuir", "métal", "tissu",],
};

const fightingInfos = {
	"arbaletes": { "name": "Arbalètes", "qual": "DE", "am": "A", "contact": false, },
	"arcs": { "name": "Arcs", "qual": "DE", "am": "C", "contact": false, },
	"chaines": { "name": "Armes à chaîne", "qual": "FO", "am": "C", "contact": true, },
	"hast": { "name": "Armes d'hast", "qual": "AG/FO", "am": "C", "contact": true, },
	"duel": { "name": "Armes de duel", "qual": "AG", "am": "C", "contact": true, },
	"jet": { "name": "Armes de jet", "qual": "DE", "am": "C", "contact": false, },
	"bagarre": { "name": "Bagarre", "qual": "AG/FO", "am": "B", "contact": true, },
	"boucliers": { "name": "Boucliers", "qual": "FO", "am": "C", "contact": true, },
	"dagues": { "name": "Dagues", "qual": "AG", "am": "B", "contact": true, },
	"epees": { "name": "Épées", "qual": "AG/FO", "am": "C", "contact": true, },
	"epees2mains": { "name": "Épées à 2 mains", "qual": "FO", "am": "C", "contact": true, },
	"haches_masses": { "name": "Haches & masses", "qual": "FO", "am": "C", "contact": true, },
	"haches_masses_2m": { "name": "Haches & masses à 2 mains", "qual": "FO", "am": "C", "contact": true, },
	"lances": { "name": "Lances", "qual": "FO", "am": "B", "contact": true, },
	"frondes": { "name": "Frondes", "qual": "DE", "am": "B", "contact": false, },
	"fouets": { "name": "Fouets", "qual": "DE", "am": "B", "contact": true, },
};
const fightingList = [
	"arbaletes",
	"arcs",
	"chaines",
	"hast",
	"duel",
	"jet",
	"bagarre",
	"boucliers",
	"dagues",
	"epees",
	"epees2mains",
	"haches_masses",
	"haches_masses_2m",
	"lances",
	"frondes",
	"fouets",
];

function compute_derived(sheet) {
	// Etat des PV
	let total_ev = sheet.stats.ev.reduce(sum2);
	let cur_ev = sheet.cur_stats.ev;
	let ev_etats = 0;
	if (cur_ev <= 3 * total_ev / 4) { ev_etats++; }
	if (cur_ev <= total_ev / 4) { ev_etats++; }
	if (cur_ev <= total_ev / 2) { ev_etats++; }
	if (cur_ev <= 5) { ev_etats++; }
	if (cur_ev <= 0) { ev_etats = 5; }

	// Calcul de la masse
	let masse_stuff = 0, masse_weapons = 0, masse_armor = 0;
	sheet.stuff.forEach(el => { masse_stuff += el[1] });
	sheet.armes['melee'].forEach(el => { masse_weapons += el[8] });
	sheet.armes['distance'].forEach(el => { masse_weapons += el[7] });
	sheet.armes['armures'].forEach(el => { masse_armor += el[5] });
	sheet.armes['parade'].forEach(el => { masse_weapons += el[3] });

	// Calcul de valeurs dérivées
	let magicQual = sheet.magic.qualite_principale.toLowerCase();
	let magicAstralQual = magicQual in sheet.qualites ? sheet.qualites[magicQual] : 0;
	let diviQual = sheet.divin.qualite_principale.toLowerCase();
	let diviKarmaQual = diviQual in sheet.qualites ? sheet.qualites[diviQual] : 0;

	let bonusTM = Math.round((sheet.qualites.co + sheet.qualites.in + sheet.qualites.iu) / 6);
	let bonusTP = Math.round((sheet.qualites.cn + sheet.qualites.cn + sheet.qualites.fo) / 6);

	return {
		"xp": {
			"restant": sheet.xp.total - sheet.xp.spent,
			"degree": (
				sheet.xp.total >= 2100 ? "Légendaire" :
					sheet.xp.total >= 1770 ? "Brillant" :
						sheet.xp.total >= 1400 ? "Magistral" :
							sheet.xp.total >= 1200 ? "Compétent" :
								sheet.xp.total >= 1100 ? "Expérimenté" :
									sheet.xp.total >= 1000 ? "Moyen" : "Inexpérimenté"
			),
		},
		"deriv": {
			"tmBonus": bonusTM,
			"tpBonus": bonusTP,
		},
		"stats": {
			"ev": sheet.stats.ev.reduce(sum2) + sheet.qualites.cn * 2,
			"ea": sheet.stats.ea.reduce(sum2) + magicAstralQual,
			"ek": sheet.stats.ek.reduce(sum2) + diviKarmaQual,
			"tm": sheet.stats.tm.reduce(sum2) + bonusTM,
			"tp": sheet.stats.tp.reduce(sum2) + bonusTP,
			"esq": sheet.stats.esq[1] + Math.round(sheet.qualites.ag / 2),
			"ini": sheet.stats.ini[1] + Math.round((sheet.qualites.co + sheet.qualites.ag) / 2),
			"vi": sheet.stats.vi.reduce(sum2),
		},
		"des": { "max": sheet.des.valeur + sheet.des.modif },
		"ev_etats": ev_etats,
		"masse": {
			"stuff": masse_stuff,
			"weaponsOnly": masse_weapons,
			"weapons": masse_weapons + masse_armor,
			"total": masse_stuff + masse_weapons + masse_armor,
			"total_enc": masse_stuff + masse_weapons,
			"max": sheet.qualites.fo * 2,
		}
	}
}

function getQualMax(qualites, qualstr) {
	let qual = qualstr.toLowerCase().split('/');
	if (qual.length == 1) {
		return qualites[qual[0]];
	} else if (qual.length == 2) {
		return Math.max(qualites[qual[0]], qualites[qual[1]]);
	} else {
		return Math.max(qualites[qual[0]], Math.max(qualites[qual[1]], qualites[qual[2]]));
	}
}

function compute_vtc(qualites, name, vtc) {
	let infos = fightingInfos[name];
	let at = vtc + Math.max(0, Math.floor((qualites.co - 8) / 3));
	let cd = vtc + Math.max(0, Math.floor((qualites.co - qualites.de) / 3));
	let qual = getQualMax(qualites, infos.qual);
	let prd = Math.ceil(vtc / 2) + Math.max(0, Math.floor((qualites.co - 8) / 3));
	return { at: at, cd: cd, prd: prd, atcd: infos.contact ? at : cd };
}

const tab_am_a = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
const tab_am_b = [4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28];
const tab_am_c = [6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42];
const tab_am_d = [8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56];
const tab_am_e = [15, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180];

function pav_cost_for(val, am) { // should use val+1 when calling
	am = am.toUpperCase();
	if (am != 'A' && am != 'B' && am != 'C' && am != 'D' && am != 'E') {
		return null;
	}
	if (val < 0) { return null; }
	if (val <= 12) {
		if (am == 'A') { return 1; }
		if (am == 'B') { return 2; }
		if (am == 'C') { return 3; }
		if (am == 'D') { return 4; }
		if (val >= 1) {
			return 15;
		}
		return null;
	}
	if (val > 25) {
		return null;
	}
	if (am == 'A') { return tab_am_a[val - 13]; }
	if (am == 'B') { return tab_am_b[val - 13]; }
	if (am == 'C') { return tab_am_c[val - 13]; }
	if (am == 'D') { return tab_am_d[val - 13]; }
	return tab_am_e[val - 13];
}

function pav_cost_am(val, am) {
	return pav_cost_for(val + 1, am);
}

function compute_pav_cost(sheet) {
	let pav = {
		stats: {
			ev: pav_cost_am(sheet.stats.ev[2], 'D'),
			ea: sheet.stats.ea[0] ? pav_cost_am(sheet.stats.ea[2], 'D') : null,
			ek: sheet.stats.ek[0] ? pav_cost_am(sheet.stats.ek[2], 'D') : null,
		}
	};
	if (sheet.stats.ev[2] >= sheet.qualites.cn) {
		pav.stats.ev = "Limite: CN = " + sheet.qualites.cn;
	}
	if (sheet.magic.perma_pa > 0) {
		pav.stats.ea = "Rachat (2PA)";
	}
	if (sheet.divin.perma_pk > 0) {
		pav.stats.ea = "Rachat (2PA)";
	}

	return pav;
}

function getQuals(qualites, roll) {
	let arr = roll.toLowerCase().split("/");
	return [qualites[arr[0]], qualites[arr[1]], qualites[arr[2]]]
}

function getRoutine(qualites, roll, baseVc) {
	let quals = getQuals(qualites, roll);
	let vc = baseVc
		- 3 * Math.max(0, 13 - quals[0])
		- 3 * Math.max(0, 13 - quals[1])
		- 3 * Math.max(0, 13 - quals[2]);
	let r = 3 - Math.floor((vc - 1) / 3);
	if (r > 3) {
		r = null;
	}
	return r;
}

function computeRoutine(sheet) {
	let talents = sheet.talents;
	let routines = {};
	for (const cat in talents) {
		routines[cat] = {};
		for (const stat in talents[cat]) {
			routines[cat][stat] = getRoutine(sheet.qualites,
				talentInfos[cat][stat].roll, talents[cat][stat].vc);
		}
	}
	return routines;
}

const saveIntervalMax = 60 * 1000;
const saveInactiveDelay = 4 * 1000;

function newSaveManager(dataInit, prepareData, interval = 200) {
	let data = dataInit;
	let lastSavedData = cloneData(data);
	let lastModif = Date.now();
	let lastTrySave = Date.now();
	let ignoreNextChange = false;

	let manager = {
		lastSavedAt: lastModif,
		unsaved: false,
		saving: false,
		saveError: false,
		changed: function (dataNew) {
			if (ignoreNextChange) {
				ignoreNextChange = false;
				return false;
			}
			data = dataNew;
			if (!this.unsaved && areEqual(data, lastSavedData)) {
				return true;
			}
			this.unsaved = true;
			lastModif = Date.now();
		},
		pushSave: function () {
			if ((this.unsaved || this.saveError)
				&& (!this.saving || Date.now() - lastTrySave > 6 * 1000)) {
				lastSavedData = cloneData(data);
				lastTrySave = Date.now();
				this.saving = true;
				this.saveError = false;
				this.unsaved = false;

				let [url, sentData] = prepareData(data);
				fetch(url, {
					method: 'PUT',
					cache: 'no-cache',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(sentData)
				}).then((answer) => {
					this.saving = false;
					if (!answer.ok) {
						console.error("Error during saving");
						console.log(answer);
						this.saveError = true;
					} else {
						this.lastSavedAt = Date.now();
					}
				}).catch((error) => {
					console.error("Error during saving", error);
					this.saving = false;
					this.saveError = true;
				});
			}
		},
		autoSave: function () {
			if (!this.saving && this.unsaved && (Date.now() - this.lastSavedAt > saveIntervalMax) ||
				(Date.now() - lastModif > saveInactiveDelay)) {
				this.pushSave();
			}
		},
		remoteUpdate: function (newData) {
			ignoreNextChange = true;
			updateSavedData(data, lastSavedData, newData);
			lastSavedData = cloneData(data);
		},
	};
	setInterval(() => manager.autoSave(), interval);

	return manager;
};

/*
	Vue tools
*/

function pavTxt(pavCost) {
	if (pavCost === null) {
		return 'Non améliorable';
	}
	if (Number.isInteger(pavCost)) {
		return '+1: ' + pavCost + ' PAV';
	}
	return pavCost;
}

function tooltipForSpell(spell) {
	let vc = spell[2];
	let am = spell[8];
	let pav = pav_cost_am(vc, am);
	if (pav) {
		let text = pavTxt(pav);
		if (vc >= 14) {
			text += " (maîtrise)";
		}
		return { 0: text };
	}
	return {};
}

Vue.component('data-saver', {
	props: ['data', 'manager'],
	watch: {
		data: {
			handler(val) {
				this.manager.changed(this.data);
			},
			deep: true
		},
	},
	methods: {
		save: function () {
			this.manager.pushSave();
		},
	},
	template: `
	<div class='save_state'>
		<button v-on:click="save">Sauvegarder</button>
		<br>
		<span v-if="manager.saving" class='save_saving'>Sauvegarde....</span>
		<span v-if="!manager.saving && manager.saveError" class='save_error'>Erreur de sauvegarde</span>
		<span v-if="!manager.saving && !manager.saveError">
			<span v-if="manager.unsaved" class='save_no'>Non enregistré</span>
			<span v-if="!manager.unsaved" class='save_yes'>Enregistré</span>
		</span>
	</div>
  `
});

/*
	Sheet subviews
*/
Vue.component('sheet-talent', {
	props: ['talents', 'cat', 'stat', 'qualites'],
	data: function () {
		return {
			talent: this.talents[this.cat][this.stat],
			infos: talentInfos[this.cat][this.stat],
		}
	},
	computed: {
		routine: function () {
			return getRoutine(this.qualites, this.infos.roll, this.talent.vc);
		},
		improv_cost: function () {
			let pav = pavTxt(pav_cost_am(this.talent.vc, this.infos.am));
			let qual = getQualMax(this.qualites, this.infos.roll);
			if (this.talent.vc >= qual + 2) {
				return "Max: Q+2 = " + (qual + 2);
			}
			return pav;
		},
	},
	template: `
	<tr>
		<td :data-tooltip="improv_cost">{{ infos.name }}</td>
		<td>{{ infos.roll }}</td>
		<td>{{ infos.enc }}</td>
		<td>{{ infos.am }}</td>
		<td>
			<int-input v-model.number="talent.vc"></int-input>
		</td>
		<td v-if="routine !== null">{{ routine }}</td>
		<td v-if="routine === null">—</td>
		<td>
			<input type="text" v-model.trim="talent.remark" />
		</td>
	</tr>
	`,
});


Vue.component('sheet-technique', {
	// props: ['name', 'q', 'am', 'stats'],
	props: ['techniques', 'tech', 'qualites'],
	data: function () {
		return {
			infos: fightingInfos[this.tech],
			stats: this.techniques[this.tech],
		};
	},
	computed: {
		improv_cost: function () {
			let qual = getQualMax(this.qualites, this.infos.qual);
			if (qual + 2 <= this.stats.vtc) {
				return "Max: Q+2 = " + (qual + 2);
			}
			return pavTxt(pav_cost_am(this.stats.vtc, this.infos.am));
		},
		fight: function () {
			return compute_vtc(this.qualites, this.tech, this.stats.vtc);
		},
	},
	template: `
	<tr>
		<td :data-tooltip="improv_cost">{{ infos.name }}</td>
		<td>{{ infos.qual }}</td>
		<td>{{ infos.am }}</td>
		<td>
			<int-input v-model.number="stats.vtc"></int-input>
		</td>
		<td>{{ fight.atcd }}</td>
		<td v-if="'prd' in stats">{{ fight.prd }}</td>
		<td v-if="!('prd' in stats)" class="ts_cell_cross"></td>
	</tr>
	`,
});


Vue.component('sheet-etats-display', {
	props: ["etats"],
	data: function () {
		return {
			"texts": {
				"niveaux": ["", "I", "II", "III", "IV"],
				"confusion": ["Confusion", ["",
					"Légèrement confus, toutes les épreuves –1",
					"Confus, toutes les épreuves –2",
					"Très confus, toutes les épreuves –3, les activités com- plexes comme lancer des sorts ou accomplir des liturgies et lʼutilisation des connaissances sont impossibles",
					"Incapable dʼagir",
				]],
				"douleur": ["Douleur", ["",
					"Douleurs légères, toutes les épreuves –1, VI –1",
					"Douleurs lancinantes, toutes les épreuves –2, VI – 2",
					"Douleurs fortes, toutes les épreuves –3, VI – 3",
					"Incapable dʼagir, autrement toutes les épreuves –4",
				]],
				"encombrement": ["Encombrement", ["",
					"Légèrement encombré, épreuves pour les talents influencés par lʼencombrement à –1, AT –1, défense –1, INI – 1, VI – 1",
					"Encombré, épreuves pour les talents influencés par lʼencombrement à –2, AT –2, défense –2, INI – 2, VI – 2",
					"Très encombré, épreuves pour les talents influencés par lʼencombrement à –3, AT –3, défense –3, INI – 3, VI – 3",
					"Incapable dʼagir",
				]],
				"etourdissement": ["Étourdissement", ["",
					"Légèrement étourdi, toutes les épreuves –1",
					"Étourdi, toutes les épreuves –2",
					"Très étourdi, toutes les épreuves –3",
					"Incapable dʼagir",
				]],
				"extase": ["Extase", ["",
					"Légère extase, toutes les épreuves de talents et de sorts –1 si elles ne sont pas agréables au dieu",
					"Extase, toutes les épreuves de talents et de sorts agréables au dieu +1, toutes les autres –2",
					"Touché par la grâce du dieu, toutes les épreuves de talents et de sorts agréables au dieu +2, toutes les autres –3",
					"Instrument de dieu, toutes les épreuves de talents et de sorts agréables au dieu +3, toutes les autres –4",
				]],
				"terreur": ["Terreur", ["",
					"Inquiet, toutes les épreuves –1",
					"Apeuré, toutes les épreuves –2",
					"En panique, toutes les épreuves –3",
					"Catalepsie, incapable dʼagir",
				]],
				"paralysie": ["Paraysie", ["",
					"Légèrement raidi, toutes les épreuves exigeant de bouger ou de parler –1, VI à seulement 75 %",
					"Raidi, toutes les épreuves exigeant de bouger ou de parler –2, VI à seulement 50 %",
					"À peine mobile, toutes les épreuves exigeant de bouger ou de parler –3, VI à seulement 25 %",
					"Immobilisé",
				]],
				"ebriete": ["Ébriété", ["",
					"Les épreuves d'alcools & drogues subissent un malus de -1",
					"Les épreuves d'alcools & drogues subissent un malus de -2",
					"Les épreuves d'alcools & drogues subissent un malus de -3",
					"Le héros subit un niveau d'étourdissement, supprime 4 niveaux d'ébriété, les niveaux restants continuent à être des niveaux d'ébriété",
				]],
			}
		}
	},
	computed: {
		'list': function () {
			let r = [];
			for (let name in this.etats) {
				if (this.etats[name] != 0) {
					r.push({
						'title': this.texts[name][0] + " niveau " + this.texts["niveaux"][this.etats[name]],
						'text': this.texts[name][1][this.etats[name]],
					});
				}
			}
			return r;
		}
	},
	template: `
	<div class="s_etats_display">
		<div class="etat_display_line" v-for="l in list">
			<label>{{ l.title }} :</label> <span>{{ l.text }}</span>
		</div>
	</div>
	`,
});

Vue.component('sheet-table', {
	props: ["schema", "data", "titles", "tooltipsFct"],
	// schema : ['int', 'str', 'str', ...]
	// data : [ [1, 'a', 'b', ...], ...]
	// titles : ["title 1", ....]
	data: function () {
		return {};
	},
	computed: {
		tooltips: function () {
			let arr = [];
			if (this.tooltipsFct) {
				this.data.forEach(line => arr.push(this.tooltipsFct(line)));
			} else {
				this.data.forEach(line => arr.push([]));
			}
			return arr;
		},
	},
	methods: {
		isLineEmpty: function (line) {
			for (let i in line) {
				if (line[i]) {
					return false;
				}
			}
			return true;
		},
		getNewLine: function (line) {
			let l = [];
			for (let i in this.schema) {
				if (this.schema[i] == 'int') {
					l.push(0);
				} else {
					l.push("");
				}
			}
			return l;
		},
		refreshData: function () {
			while (this.data.length < 3 || !this.isLineEmpty(this.data[this.data.length - 1])) {
				this.data.push(this.getNewLine());
			}

			while (this.data.length > 3 && this.isLineEmpty(this.data[this.data.length - 1])
				&& this.isLineEmpty(this.data[this.data.length - 2])) {
				this.data.pop();
			}
		},
	},
	beforeUpdate: function () {
		this.refreshData();
	},
	beforeMount: function () {
		this.refreshData();
	},
	template: `
	<table class="s_table expand_table">
		<tr>
			<th v-for="title in titles">{{ title }}</th>
		</tr>
		<tr v-for="(line, iline) in data">
			<td v-for="(val, ival) in line" v-bind:data-tooltip="[ival in tooltips[iline] ? tooltips[iline][ival] : '']">
				<input type="text" v-model.trim="line[ival]" v-if="schema[ival] == 'str'" />
				<int-input v-model.number="line[ival]" v-if="schema[ival] == 'int'" />
			</td>
		</tr>
	</table>
	`,
});

/*
	Sheet main view
*/
function create_sheet_component(sheet_template) {
	Vue.component('sheet-compo', {
		props: ['socket', 'id'],
		data: function () {
			return {
				loaded: false,
				sheet: newDefaultSheet(),
				active_view: "character",
				saveManager: null,
				order: {
					'techniques': fightingList,
					'talents': talentLists,
				}
			}
		},
		mounted: function () {
			fetch('/api/sheet/' + this.id, { cache: 'no-cache' })
				.then(response => {
					if (response.ok) {
						response.json().then((data) => {
							this.sheet = mergeDatas(this.sheet, data["content"]);
							this.saveManager = newSaveManager(this.sheet, sheet => {
								let url = "/api/sheet/" + this.id;
								let data = {
									"id": this.id,
									"content": sheet
								};
								return [url, data];
							});
							this.loaded = true;

							this.socket.register(this.socketListener);
						});
					}
				});
		},
		computed: {
			avatarStyle: function () {
				if (this.sheet.image) {
					return "background: url('" + this.sheet.image + "'); background-size: cover;"
				}
				return "";
			},
			avatarAnimalStyle: function () {
				if (this.sheet.animal.image) {
					return "background: url('" + this.sheet.animal.image + "'); background-size: cover;"
				}
				return "";
			},
			deriv: function () {
				return compute_derived(this.sheet);
			},
			pav: function () {
				return compute_pav_cost(this.sheet);
			},
			autoText: function () {
				let divinQual = this.sheet.divin.qualite_principale.toLowerCase();
				let magicQual = this.sheet.magic.qualite_principale.toLowerCase();

				return {
					magicQual: magicQual ?
						(magicQual in this.sheet.qualites ?
							magicQual.toUpperCase() + ' = ' + this.sheet.qualites[magicQual]
							: magicQual + ' inconnue'
						) : '',
					divinQual: divinQual ?
						(divinQual in this.sheet.qualites ?
							divinQual.toUpperCase() + ' = ' + this.sheet.qualites[divinQual]
							: divinQual + ' inconnue'
						) : '',
					bonusEv: '+2*CN (' + (2 * this.sheet.qualites.cn) + ')',
					bonusEa: (magicQual || this.sheet.stats.ea[0]) ?
						(magicQual in this.sheet.qualites ?
							'+' + magicQual.toUpperCase() + ' (' + this.sheet.qualites[magicQual] + ')'
							: '+0'
						) : '',
					bonusEk: (divinQual || this.sheet.stats.ek[0]) ?
						(divinQual in this.sheet.qualites ?
							'+' + divinQual.toUpperCase() + ' (' + this.sheet.qualites[divinQual] + ')'
							: '+0'
						) : '',
				};
			},
		},
		methods: {
			updateAvatar: function () {
				let nouv = prompt("Nouvelle url de l'image du personnage :", this.sheet.image);
				if (nouv !== null) {
					this.sheet.image = nouv;
				}
			},
			updateAvatarAnimal: function () {
				let nouv = prompt("Nouvelle url de l'image de l'animal :", this.sheet.animal.image);
				if (nouv !== null) {
					this.sheet.animal.image = nouv;
				}
			},
			export_sheet: function () {
				let content = JSON.stringify(this.sheet);
				let file = new Blob([content], { type: 'json' });
				let url = URL.createObjectURL(file);
				let a = document.createElement("a");
				a.style.display = 'none';
				a.href = url;
				a.download = this.id + '.json';
				document.body.appendChild(a);
				a.click();
				setTimeout(function () {
					document.body.removeChild(a);
					window.URL.revokeObjectURL(url);
				}, 0);
			},
			import_sheet: function () {
				let doit = confirm("Voulez vous vraiment importer une ancienne fiche ? Cela effacera toutes les données de celle-ci");
				if (doit) {
					let fileInput = document.createElement("input");
					fileInput.type = 'file';
					fileInput.style.display = 'none';
					document.body.appendChild(fileInput);

					fileInput.onchange = e => {
						let file = e.target.files[0];
						if (!file) {
							return;
						}
						let reader = new FileReader();
						reader.onload = function (e) {
							fileInput.func(e.target.result);
							document.body.removeChild(fileInput);
						}
						reader.readAsText(file);
					};
					fileInput.func = txt => {
						let json = JSON.parse(txt);
						this.sheet = json;
					};
					fileInput.click();
				}
			},
			socketListener: function (event, data) {
				if (data.type == 'notification' && data.on == 'sheet' && data.sheet_id == this.id) {
					this.saveManager.remoteUpdate(data.new_data.content)
				}
			},
			tooltipForSpell: tooltipForSpell,
			pavTxt: pavTxt,
		},
		template: sheet_template,
	});
	window.dispatchEvent(event_sheet_loaded);
}
if (event_sheet_loaded !== null) {
	fetch('/web/app/comp/sheet_template.html')
		.then(response => response.text())
		.then(sheet_template => create_sheet_component(sheet_template));
}


/*
	Sheet short view
*/
Vue.component('sheet-short-view', {
	props: ['identity', 'table', 'id', 'socket', 'isgm'],
	data: function () {
		return {
			detailOpen: false,
			sheet: null,
		}
	},
	mounted: function () {
		let url = "/api/sheet/" + this.id;
		fetch(url)
			.then(answer => answer.json())
			.then(data => {
				this.setSheet(data.content);
			});
		this.socket.register((event, data) => {
			if (data.type == 'notification' && data.on == 'sheet' && data.sheet_id == this.id) {
				this.setSheet(data.new_data.content);
			}
		});
	},
	computed: {
		avatarStyle: function () {
			if (this.sheet.image) {
				return "background-image: url('" + this.sheet.image + "'); background-size: cover;"
			}
			return "";
		},
		avatarAnimalStyle: function () {
			if (this.sheet.animal.image) {
				return "background-image: url('" + this.sheet.animal.image + "'); background-size: cover;"
			}
			return "";
		},
		deriv: function () {
			return compute_derived(this.sheet);
		},
		invite_url: function () {
			if (this.isgm) {
				return window.location.protocol + '//' + window.location.host + '/web/table.html?table=' + this.table + '&id=' + this.id;
			}
			return null;
		},
	},
	methods: {
		edit: function () {
			let url = "/web/sheet.html?id=" + this.id;
			window.open(url, '_blank');
		},
		deleteFromTable: function () {
			if (confirm("Supprimer de la campagne ?")) {
				let url = "/api/table/" + this.table + "/player/" + this.id;
				fetch(url, {
					method: 'DELETE',
					cache: 'no-cache',
				}).then(ans => {
					if (ans.ok) { location.reload(); }
				});
			}
		},
		toggleDetails: function () {
			this.detailOpen = !this.detailOpen;
		},
		setSheet: function (sheet) {
			this.sheet = sheet;
			if (this.id === this.identity.id) {
				this.identity.sheet = sheet;
				this.identity.deriv = compute_derived(sheet);
			}
		},
	},
	template: `
	<div class="sheet_short_view">
	<template v-if="sheet">
		<div class="ssv_head">
			<div class="ssv_avatar" v-bind:style="avatarStyle" v-on:click="toggleDetails"></div>
			<div class="header_infos">
				<label>Nom :</label>
				<span>{{sheet.head.nom}}</span>
				<br>
				<label>Joueur :</label>
				<span>{{sheet.owner}}</span>
				<br>
				<label>Âge :</label>
				<span>{{sheet.head.age}}</span>
			</div>
			<div class="header_infos">
				<label>Peuple :</label>
				<span>{{sheet.head.peuple}}</span>
				<br>
				<label>Culture :</label>
				<span>{{sheet.head.culture}}</span>
				<br>
				<label>Profession :</label>
				<span>{{sheet.head.profession}}</span>
			</div>
			<div class="header_infos">
				<label>PV :</label>
				<span>{{sheet.cur_stats.ev}} / {{ deriv.stats.ev }}</span>
				<span v-if="deriv.ev_etats == 1" class="ev_niv_1">Touché (1)</span>
				<span v-if="deriv.ev_etats == 2" class="ev_niv_2">Touché (2)</span>
				<span v-if="deriv.ev_etats == 3" class="ev_niv_3">Touché (3)</span>
				<span v-if="deriv.ev_etats == 4" class="ev_niv_4">Touché (4)</span>
				<span v-if="deriv.ev_etats == 5" class="ev_niv_5">Mourant</span>
				<br>
				<template v-if="deriv.stats.ea != 0">
					<label>PA :</label>
					<span>{{sheet.cur_stats.ea}} / {{ deriv.stats.ea }}</span>
					<br>
				</template>
				<template v-if="deriv.stats.ek != 0">
					<label>PK :</label>
					<span>{{sheet.cur_stats.ek}} / {{ deriv.stats.ek }}</span>
					<br>
				</template>
				<label>PAV :</label>
				<span>{{sheet.xp.total}} ({{ deriv.xp.degree }})</span>
			</div>

			<div class="header_infos" v-if="identity.gm">
				<button v-on:click="edit">Modifier</button>
				<br>
				<br>
				<button v-on:click="deleteFromTable">Retirer</button>
				<br>
			</div>
		</div>
		<div class='ssv_body'>
			<div class="champ_in">
				<label>Status & États</label>
			</div>
			<div class="ssv_status">{{ sheet.status }}</div>
			<sheet-etats-display v-bind:etats="sheet.etats"></sheet-etats-display>
			<div class="ssv_status">{{ sheet.modifs_qualites }}</div>
		</div>
		<template v-if="detailOpen">
			<div class="winBack" v-on:click="toggleDetails"></div>
			<div class="ssv_details scrollable">
				<div class="champ_in">
					<label>Nom</label>
					<span>{{sheet.head.nom}}</span>
				</div>
				<div class="champ_in">
					<label>Âge</label>
					<span>{{ sheet.head.age}}</span>
				</div>
				<div class="champ_in">
					<label>Sexe</label>
					<span>{{ sheet.head.sexe}}</span>
				</div>
				<div class="champ_in">
					<label>Peuple</label>
					<span>{{ sheet.head.peuple}}</span>
				</div>
				<div class="champ_in">
					<label>Culture</label>
					<span>{{ sheet.head.culture}}</span>
				</div>
				<div class="champ_in">
					<label>Couleur de cheveux</label>
					<span>{{ sheet.head.cheveux}}</span>
				</div>
				<div class="champ_in">
					<label>Couleur des yeux</label>
					<span>{{ sheet.head.yeux}}</span>
				</div>
				<div class="champ_in">
					<label>Taille / Masse</label>
					<span>{{ sheet.head.taille_masse}}</span>
				</div>

				<div class="champ_in">
					<label>Traits caractéristiques</label>
				</div>
				<p>{{ sheet.head.traits }}</p>

				<div class="champ_in">
					<label>Description physique complète</label>
				</div>
				<p>{{ sheet.head.description_phy }}</p>

				<div class="ssv_invit" v-if="isgm">
					<span>Lien d'invitation :</span><br />
					<a v-bind:href="invite_url" target="_blank">{{ invite_url }}</a>
				</div>

				<div class="ssv_details_close">
					<button v-on:click="toggleDetails">Fermer</button>
				</div>
			</div>
		</template>
	</template>
	</div>`,
});
