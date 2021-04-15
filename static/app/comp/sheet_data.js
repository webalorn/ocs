const CUR_VERSION = "1.0.0";
const qualNames = ["co", "in", "iu", "ch", "de", "ag", "cn", "fo"];
const DEFAULT_IMAGE = "/web/images/helmet.svg";
const qualPlainNameDict = {
	"co": "Courage",
	"in": "Intelligence",
	"iu": "Intuition",
	"ch": "Charisme",
	"de": "Dextérité",
	"ag": "Agilité",
	"cn": "Constituation",
	"fo": "Force",
};

function newDefaultSheet() {
	return {
		"owner": "",
		"image": "",
		"sheetType": "ocs-tde",
		"version": CUR_VERSION,
		"simplified": false,
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
				"persuasion": { "vc": 0, "remark": "" },
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
			"pv": "",
			"pa": "",
			"qualites": {
				"co": '8',
				"in": '8',
				"iu": '8',
				"ch": '8',
				"de": '8',
				"ag": '8',
				"cn": '8',
				"fo": '8',
			},
			"tm": "",
			"tp": "",
			"pr": "",
			"ini": "",
			"vi": "",
			"attaque": "",
			"atcd": "",
			"defense": "",
			"pi": "",
			"alpo": "",
			"actions": "",
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
		"persuasion": { "name": "Persuasion", "roll": "CO/IU/CH", "enc": "NON", "am": "C" },
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
		"acuite", "alcool", "batellerie", "chant", "danse", "equitation", "escalade", "furtivite", "maitrise_corps", "maitrise_soi", "natation", "tour_force", "vol", "vol_tire"],
	"soc": [
		"rue", "convertir", "deguisement", "etiquette", "intimidation", "nature_humaine", "persuasion", "seduction", "volonte"],
	"nat": [
		"botanique", "orientation", "peche", "pistage", "noeuds", "survie", "zoologie"],
	"connaissance": [
		"art_guerre", "astonomie", "calcul", "contes_legendes", "dieux_cultes", "droit", "geographie", "histoire", "jeux", "magicologie", "mecanique", "spherologie"],
	"savoir": [
		"alchimie", "navires", "commerce", "conduite", "crochetage", "cuisine", "musique", "peinture_dessin", "soin_esprit", "soin_blessures", "soin_maladies", "soin_poisons", "pierre", "bois", "cuir", "métal", "tissu"],
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
	let total_ev = sheet.stats.ev.reduce(sum2) + sheet.qualites.cn * 2;
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
			"ev": total_ev,
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
			"stuff": roundDecimal(masse_stuff, 4),
			"weaponsOnly": roundDecimal(masse_weapons, 4),
			"weapons": roundDecimal(masse_weapons + masse_armor, 4),
			"total": roundDecimal(masse_stuff + masse_weapons + masse_armor, 4),
			"total_enc": roundDecimal(masse_stuff + masse_weapons, 4),
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
	let cd = vtc + Math.max(0, Math.floor((qualites.de - 8) / 3));
	let qual = getQualMax(qualites, infos.qual);
	let prd = Math.ceil(vtc / 2) + Math.max(0, Math.floor((qual - 8) / 3));
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
		},
		qualites: {},
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
	for (let qual in sheet.qualites) {
		pav.qualites[qual] = pav_cost_am(sheet.qualites[qual], 'E');
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

/*
	Update and import
*/

function updateSheetVersion(sheet) {
	if (sheet.owner === undefined) {
		let new_sheet = newDefaultSheet();
		for (const prop in new_sheet) {
			sheet[prop] = new_sheet[prop];
		}
		return true; // Not created
	}
	if (sheet.version === CUR_VERSION) {
		// Ok
	} else if (sheet.version === undefined) {
		sheet.version = CUR_VERSION;
		sheet.talents.soc.persuasion = sheet.talents.soc.persutaation;
		delete sheet.talents.soc.persutaation;
	} else {
		console.error("Can't update from version", sheet.version);
		return false;
	}
	return true;
}
