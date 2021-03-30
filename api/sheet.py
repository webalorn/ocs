from pathlib import Path
import yaml
import copy
import aiohttp

from api.util import config

CONVERT_TARGET = "1.0.0"


class OptolithConversionError(Exception):
    pass


def as_int(n):
    try:
        return int(n)
    except:
        return 0


def as_float(n):
    try:
        return float(n)
    except:
        return 0


# ========== Optolith datas ==========

OPTO_SEXS = {'m': 'Masculin', 'f': 'Féminin'}
OPTO_AL = ['AL?', 'Courte', 'Moyenne', 'Longue', 'Très longue']
OPTO_DATA_V1 = None


def list_ids_to_dicts(data):
    if type(data) == list:
        if data == [] or (type(data[0]) == dict and 'id' in data[0]):
            new_data = {}
            for el in data:
                ids = [el['id']]
                if type(el['id']) == list:
                    ids = el['id']
                for i in ids:
                    new_data[i] = el
            data = new_data
    if type(data) == list:
        for i in range(len(data)):
            data[i] = list_ids_to_dicts(data[i])
    elif type(data) == dict:
        for key, val in data.items():
            data[key] = list_ids_to_dicts(val)
    return data


def load_opto_from(path):
    data = {}
    path = Path(path)
    for p_file in path.iterdir():
        if p_file.is_file() and p_file.suffix == '.yaml':
            name = p_file.name.split('.')[0]
            with open(str(p_file), 'r') as file_obj:
                file_data = yaml.load(file_obj, Loader=yaml.FullLoader)
            data[name] = list_ids_to_dicts(file_data)
    return data


def is_list_dict(data):
    if type(data) != list:
        return False
    for el in data:
        if type(el) != dict:
            return False
    return True


def list_dict_to_dict(data):
    d = {}
    for el in data:
        for key, val in el.items():
            d[key] = val
    return d


def merge_data(cur, add, overwrite=True):
    if add in [None, '', ' ', 'TODO']:
        return cur
    type_cur = type(cur)
    type_add = type(add)
    if type_cur == list and type_add == dict and is_list_dict(cur):
        cur = list_dict_to_dict(cur)
        type_cur = dict
    if type_add != type_cur:
        if overwrite:
            return add
        print('[ERROR]', type_add, "should be of type", type_cur, "to merge")
        print('Had', cur)
        print('Got', add)
        return cur
    if type_cur == list:
        for i in range(min(len(cur), len(add))):
            cur[i] = merge_data(cur[i], add[i], overwrite)
        while len(add) > len(cur) and add[len(cur)] is not None:
            cur.append(add[len(cur)])
        return cur
    elif type_cur == dict:
        for prop, val in add.items():
            if prop in cur:
                cur[prop] = merge_data(cur[prop], add[prop], overwrite)
            else:
                cur[prop] = add[prop]
        return cur
    elif type_cur == int or type_cur == str or type_cur == bool:
        return add
    else:
        print("[ERROR] Can't merge types", type_cur, "and", type_add)


def prepare_data(data):
    union = {}
    for section in data.values():
        if type(section) == dict:
            for key, val in section.items():
                if type(key) == str and '_' in key:
                    if key in union:
                        union[key] = merge_data(union[key], val)
                    else:
                        union[key] = copy.deepcopy(val)
    data['_'] = union
    return data


def load_optolith_data():
    global OPTO_DATA_V1
    if is_optolith_available():
        data_univ = load_opto_from("optolith-data/Data/univ")
        data_en = load_opto_from("optolith-data/Data/en-US")
        data_en = merge_data(data_univ, data_en, True)
        data_fr = load_opto_from("optolith-data/Data/fr-FR")
        OPTO_DATA_V1 = prepare_data(merge_data(data_en, data_fr, True))


async def upload_b64_image(img):
    if config['imgbb_token'] is None:
        return None
    if img.startswith('data:image/'):
        img = img[img.find(',') + 1:]
    payload = {
        "key": config['imgbb_token'],
        "image": img,
    }
    async with aiohttp.ClientSession() as session:
        async with session.post("https://api.imgbb.com/1/upload",
                                data=payload) as resp:
            answer = await resp.json()
            if answer.get('success', False):
                url = answer['data']['url']
                return url
            else:
                print('Upload error:', answer)


# ========== Conversion ==========


def to_roman(n):
    if n == 5:
        return 'V'
    if n == 4:
        return 'IV'
    return 'I' * n


S_FORMAT = ['SA_27', 'SA_29']


def opt_get(name, default=None):
    return OPTO_DATA_V1['_'].get(name, default)
    # if name.startswith('TAL_'):
    #     return OPTO_DATA_V1['Skills'][name]
    # if name.startswith('TAL_'):
    #     return OPTO_DATA_V1['Skills'][name]
    # if name.startswith('ADV_'):
    #     return OPTO_DATA_V1['Advantages'][name]
    # if name.startswith('DISADV_'):
    #     return OPTO_DATA_V1['Disadvantages'][name]
    # if name.startswith('SA_'):
    #     return OPTO_DATA_V1['SpecialAbilities'][name]
    # if name.startwith('SPELL_'):
    #     return OPTO_DATA_V1['Spells'][name]
    # print("[WARNING] : can't find type of", name)
    # return default


def qual_format(*quals):
    return '/'.join([opt_get(q)['short'] for q in quals])


def format_activables(name, data, source):
    custom = name.split('_')[-1] == '0'
    strings = []
    desc = source.get(name, {'name': 'NOT FOUND : ' + name})
    for conf in data:
        if custom:
            strings.append(conf['sid'])
        else:
            parts = [desc['name']]
            if name in source:
                if 'tier' in conf:
                    parts.append(to_roman(conf['tier']))
                if 'sid' in conf:
                    option = None
                    if type(conf['sid']) == int:
                        option = desc['selectOptions'][conf['sid']]['name']
                    elif conf['sid'].startswith('TAL_'):
                        tal = OPTO_DATA_V1['Skills'][conf['sid']]
                        option = tal['name']
                        if 'sid2' in conf:
                            option += ': ' + tal['applications'][
                                conf['sid2']]['name']
                    else:
                        option = opt_get(conf['sid'])
                        if type(option) == dict:
                            option = option['name']
                        elif option is None:
                            option = conf['sid']

                    if name in S_FORMAT:
                        parts.append(option.title())
                    else:
                        parts.append('(' + option + ')')

                if name in S_FORMAT:
                    parts = parts[1:][::-1]
            strings.append(' '.join(parts))
    return strings


def is_it_requirement(conf, name):
    requirements = conf.get('activatablePrerequisites', {})
    return name in requirements


async def convert_from_optolith_v1(data):
    opto = OPTO_DATA_V1
    personal = data.get("pers", {})

    quals = {}
    for q in data['attr']['values']:
        quals[q['id']] = q['value']

    taille_masse = personal.get("", "?") + "pieds / " + personal.get(
        "", "?") + " pierres"
    sexe = OPTO_SEXS.get(data.get("sex", ""), '')

    race = opt_get(data['r'])
    base_ev = race['lp']
    bonus_ev, bonus_ea, bonus_ek, bonus_tm, bonus_tp, bonus_esq, bonus_ini, bonus_vi = 0, 0, 0, 0, 0, 0, 0, 0
    ea_val, ek_val = 0, 0
    ea_qual, ek_qual = '', ''
    magic_trad, divin_trad = '', ''
    des_delta = 0

    # Infos
    # cultureAreaKnowledge
    haircolor = opto['HairColors'].get(personal.get("haircolor", ""),
                                       {}).get("name", "")
    eyecolor = opto['EyeColors'].get(personal.get("eyecolor", ""),
                                     {}).get("name", "")
    socialstatus = opto['SocialStatuses'].get(personal.get("socialstatus", ""),
                                              {}).get("name", "")
    peuple_from = opto['RaceVariants'].get(personal.get("rv", ""),
                                           {}).get("name", "")
    lieu_origine = personal.get("cultureAreaKnowledge", "Lieu d'origine")
    if peuple_from: peuple_from = ' (' + peuple_from + ')'

    avantages = []
    desavantages = []
    special_abilities = [f'connaissance locale ({lieu_origine})']
    cs_combat, cs_magie, cs_divin = [], [], []
    langues, ecritures = [], []
    for name, conf in data.get('activatable', {}).items():
        if len(conf) == 0:
            continue
        static_conf = opt_get(name)

        # Specific cases
        if name == 'ADV_12':
            ek_val += 20
        if name == 'ADV_50':
            ea_val += 20
        if name == 'ADV_14':
            des_delta += conf[0].get('tier', 1)
        if name == 'ADV_23':
            bonus_ea += conf[0].get('tier', 1)
        if name == 'ADV_24':
            bonus_ek += conf[0].get('tier', 1)
        if name == 'ADV_25':
            bonus_ev += conf[0].get('tier', 1)
        if name == 'ADV_26':
            bonus_tm += conf[0].get('tier', 1)
        if name == 'ADV_27':
            bonus_tp += conf[0].get('tier', 1)
        if name == 'ADV_9':
            bonus_vi += 1

        if name == 'DISADV_31':
            des_delta -= conf[0].get('tier', 1)
        if name == 'DISADV_4':
            bonus_vi -= 1
        if name == 'DISADV_26':
            bonus_ea -= conf[0].get('tier', 1)
        if name == 'DISADV_27':
            bonus_ek -= conf[0].get('tier', 1)
        if name == 'DISADV_28':
            bonus_ev -= conf[0].get('tier', 1)
        if name == 'DISADV_29':
            bonus_tm -= conf[0].get('tier', 1)
        if name == 'DISADV_30':
            bonus_tp -= conf[0].get('tier', 1)

        # Add text
        if name.startswith('ADV_'):
            avantages.extend(format_activables(name, conf, opto['Advantages']))
        elif name.startswith('DISADV_'):
            desavantages.extend(
                format_activables(name, conf, opto['Disadvantages']))
        elif name.startswith('SA_'):
            sa_list = format_activables(name, conf, opto['SpecialAbilities'])
            if name == 'SA_29':
                langues.extend(sa_list)
            elif name == 'SA_27':
                ecritures.extend(sa_list)
            elif 'combatTechniques' in static_conf:
                cs_combat.extend(sa_list)
            elif is_it_requirement(static_conf, 'ADV_12'):
                cs_divin.extend(sa_list)
            elif is_it_requirement(static_conf, 'ADV_50'):
                cs_magie.extend(sa_list)
            else:
                special_abilities.extend(sa_list)

            magic_sa = opto['MagicalTraditions'].get(name, None)
            karmic_sa = opto['BlessedTraditions'].get(name, None)
            if magic_sa and not magic_trad:
                if 'primary' in magic_sa:
                    ea_val += quals[magic_sa['primary']]
                    ea_qual = opt_get(magic_sa['primary'])['short']
                magic_trad = magic_sa['name']
            if karmic_sa and not divin_trad:
                if 'primary' in karmic_sa:
                    ek_val += quals[karmic_sa['primary']]
                    ek_qual = opt_get(karmic_sa['primary'])['short']
                divin_trad = karmic_sa['name']
        else:
            print("Unknown : ", name)

    if data['attr']['permanentLP']['lost']:
        perte = data['attr']['permanentLP']['lost']
        bonus_ev -= perte
        desavantages.append(f"Perte permanente d'énergie vitale : -{perte}PV")

    items = []
    items_melee = []
    items_distance = []
    items_armures = []
    items_parade = []
    for item in data['belongings'].get('items', {}).values():
        name = item['name']
        if item['amount'] != 1:
            name = str(item['amount']) + 'x ' + name
        weight = as_float(item.get('weight', 0)) * item['amount']
        if 'combatTechnique' in item:
            tech = opto['CombatTechniques'][item['combatTechnique']]
            pi_dice = item['damageDiceNumber']
            pi_flat = item['damageFlat']
            tech_quals = tech['primary']
            vtc = data['ct'].get(item['combatTechnique'], 6)
            at_val = vtc + max(0, (quals['ATTR_1'] - 8) // 3)
            prd_val = (vtc + 1) // 2 + max([0] + [(quals[q] - 8) // 3
                                                  for q in tech_quals])
            cd_val = vtc + max(0, (quals['ATTR_5'] - 8) // 3)

            if 'at' in item:
                damage_bonus_palier = item['primaryThreshold']['threshold']
                pi_bonus = max(
                    [0] + [quals[q] - damage_bonus_palier for q in tech_quals])
                pi_bonus_str = '' if pi_bonus <= 0 else ('+' + str(pi_bonus))

                items_melee.append([
                    name,
                    tech['name'],
                    f"{qual_format(*tech_quals)} {damage_bonus_palier}",
                    f'{pi_dice}d6+{pi_flat}{pi_bonus_str}',
                    f"{item['at']}/{item['pa']}",
                    OPTO_AL[item['reach']],
                    at_val + item['at'],
                    prd_val + item['pa'],
                    weight,
                ])
            elif 'range' in item:
                items_distance.append([
                    name, tech['name'], f'{item["reloadTime"]} assauts',
                    f'{pi_dice}d6+{pi_bonus}', '',
                    f'{item["range"][0]}/{item["range"][1]}/{item["range"][2]}',
                    cd_val, weight
                ])
        elif 'pro' in item and item['pro'] != 0:
            items_armures.append([
                name, item['pro'], item['enc'],
                '-1 VI, -1 INI' if item['pro'] % 2 == 1 else '', '', weight
            ])
        else:
            items.append([name, weight, item.get('where', '')])

    worn = [None, 0, 0, '', '', 0]
    if items_armures:
        for a in items_armures:
            if worn[0] is None or worn[1] < a[1]:
                worn = a
        worn[4] = "Actuellement porté"

    cantrips, blessings = [], []
    for can in data.get('cantrips', []):
        cantrips.append(opt_get(can)['name'])
    for bless in data.get('blessings', []):
        blessings.append(opt_get(bless)['name'])

    spells = []
    for name, vc in data.get('spells', {}).items():
        spell = opt_get(name)
        spells.append([
            spell['name'],
            qual_format(spell.get('check1', ''), spell.get('check2', ''), spell.get('check3', '')),
            str(vc), spell.get('aeCostShort', ''), spell.get('durationShort', ''),
            spell.get('rangeShort', ''), spell.get('castingTimeShort', ''), '', spell.get('ic', ''),
            spell.get('effect', ''), ''
        ])

    liturgies = []
    for name, vc in data.get('liturgies', {}).items():
        lit = opt_get(name)
        liturgies.append([
            lit['name'],
            qual_format(lit.get('check1', ''), lit.get('check2', ''), lit.get('check3', '')),
            str(vc), lit.get('kpCostShort', ''), lit.get('durationShort', ''),
            lit.get('rangeShort', ''), lit.get('castingTimeShort', ''), '', lit.get('ic', ''),
            lit.get('effect', ''), ''
        ])

    ea_achat = (data['attr'].get('ae', 0) -
                data['attr']['permanentAE']['lost'] +
                data['attr']['permanentAE']['redeemed'])
    ek_achat = (data['attr'].get('ae', 0) -
                data['attr']['permanentKP']['lost'] +
                data['attr']['permanentKP']['redeemed'])

    animal = {}
    if 'PET_1' in data.get('pets', {}):
        pet = data['pets']['PET_1']
        animal = { # TODO
            "nom": pet.get('name', ''),
            "type": pet.get('type', ''),
            "pv": pet.get('lp', '0'),
            "pa": pet.get('ae', '0'),
            "qualites": {
                "co": pet.get('cou', '0'),
                "in": pet.get('sgc', '0'),
                "iu": pet.get('int', '0'),
                "ch": pet.get('cha', '0'),
                "de": pet.get('dex', '0'),
                "ag": pet.get('agi', '0'),
                "cn": pet.get('con', '0'),
                "fo": pet.get('str', '0'),
            },
            "tm": pet.get('spi', '0'),
            "tp": pet.get('tou', '0'),
            "pr": pet.get('pro', '0'),
            "ini": pet.get('ini', '0'),
            "vi": pet.get('vi', '0'),
            "attaque": pet.get('attack', ''),
            "atcd": pet.get('at', ''),
            "defense": pet.get('pa', ''),
            "pi": pet.get('dp', ''),
            "alpo": pet.get('reach', ''),
            "actions": pet.get('actions', ''),
            "cs": f"Talents : {pet.get('talents', '')}\nCapacités spéciales : {pet.get('skills', '')}",
            "notes": f"Taille : {pet.get('size', '-')}\nPAV dépensés : {pet.get('spentAp', '0')}/{pet.get('totalAp', '0')}\n\nNotes : {pet.get('notes', '-')}",
            "image": "",
        }

    avatar = ""
    if data.get('avatar', None):
        avatar = await upload_b64_image(data['avatar'])
        avatar = avatar or ""
    titre = personal.get('title', '')
    if titre:
        titre = ' (' + titre + ')'
    age = personal.get("age", "")
    if age:
        age = str(age) + ' ans'

    sheet = {
        "owner":
        "-Importé d'Optolith-",
        "sheetType":
        "ocs-tde",
        "image":
        avatar,
        "version":
        CONVERT_TARGET,
        "head": {
            "nom": data.get("name", "") + titre,
            "sexe": sexe,
            "peuple": opto['Races'][data['r']]['name'] + peuple_from,
            "date_naissance": personal.get("dateofbirth", ""),
            "age": age,
            "cheveux": haircolor,
            "yeux": eyecolor,
            "taille_masse": taille_masse,
            "profession": opto['Professions'][data['p']]['name'],
            "culture": opto['Cultures'][data['c']]['name'],
            "niveau_social": socialstatus,
            "lieu_naissance": personal.get("placeofbirth", ""),
            "famille": personal.get("family", ""),
        },
        "qualites": {
            "co": quals['ATTR_1'],
            "in": quals['ATTR_2'],
            "iu": quals['ATTR_3'],
            "ch": quals['ATTR_4'],
            "de": quals['ATTR_5'],
            "ag": quals['ATTR_6'],
            "cn": quals['ATTR_7'],
            "fo": quals['ATTR_8'],
        },
        "stats": {
            "ev": [base_ev, bonus_ev, data['attr'].get('lp', 0)],
            "ea": [ea_val and 20, bonus_ea, ea_achat],
            "ek": [ek_val and 20, bonus_ek, ek_achat],
            "tm": [race['spi'], bonus_tm],
            "tp": [race['tou'], bonus_tp],
            "esq": [0, bonus_esq],
            "ini": [0, bonus_ini],
            "vi": [race['mov'], bonus_vi],
        },
        "cur_stats": {
            "ev":
            base_ev + bonus_ev + data['attr'].get('lp', 0) +
            2 * quals['ATTR_7'],
            "ea":
            ea_val,
            "ek":
            ek_val,
        },
        "des": {
            "valeur": 3,
            "modif": des_delta,
            "actuels": 3 + des_delta,
        },
        "xp": {
            "total": data['ap']['total'],
        },
        "avantages":
        "\n".join(avantages),
        "desavantages":
        "\n".join(desavantages),
        "cs": {
            "generales": "\n".join(special_abilities),
            "combat": "\n".join(cs_combat),
        },
        "langues":
        "\n".join(langues),
        "ecriture":
        "\n".join(ecritures),
        "talents": {
            "phy": {
                "acuite": {
                    "vc": data['talents'].get('TAL_10', 0)
                },
                "alcool": {
                    "vc": data['talents'].get('TAL_14', 0)
                },
                "batellerie": {
                    "vc": data['talents'].get('TAL_2', 0)
                },
                "chant": {
                    "vc": data['talents'].get('TAL_9', 0)
                },
                "danse": {
                    "vc": data['talents'].get('TAL_11', 0)
                },
                "equitation": {
                    "vc": data['talents'].get('TAL_6', 0)
                },
                "escalade": {
                    "vc": data['talents'].get('TAL_3', 0)
                },
                "furtivite": {
                    "vc": data['talents'].get('TAL_13', 0)
                },
                "maitrise_corps": {
                    "vc": data['talents'].get('TAL_4', 0)
                },
                "maitrise_soi": {
                    "vc": data['talents'].get('TAL_8', 0)
                },
                "natation": {
                    "vc": data['talents'].get('TAL_7', 0)
                },
                "tour_force": {
                    "vc": data['talents'].get('TAL_5', 0)
                },
                "vol": {
                    "vc": data['talents'].get('TAL_1', 0)
                },
                "vol_tire": {
                    "vc": data['talents'].get('TAL_12', 0)
                },
            },
            "soc": {
                "rue": {
                    "vc": data['talents'].get('TAL_19', 0)
                },
                "convertir": {
                    "vc": data['talents'].get('TAL_15', 0)
                },
                "deguisement": {
                    "vc": data['talents'].get('TAL_22', 0)
                },
                "etiquette": {
                    "vc": data['talents'].get('TAL_18', 0)
                },
                "intimidation": {
                    "vc": data['talents'].get('TAL_17', 0)
                },
                "nature_humaine": {
                    "vc": data['talents'].get('TAL_20', 0)
                },
                "persuasion": {
                    "vc": data['talents'].get('TAL_21', 0)
                },
                "seduction": {
                    "vc": data['talents'].get('TAL_16', 0)
                },
                "volonte": {
                    "vc": data['talents'].get('TAL_23', 0)
                },
            },
            "nat": {
                "botanique": {
                    "vc": data['talents'].get('TAL_28', 0)
                },
                "orientation": {
                    "vc": data['talents'].get('TAL_27', 0)
                },
                "peche": {
                    "vc": data['talents'].get('TAL_26', 0)
                },
                "pistage": {
                    "vc": data['talents'].get('TAL_24', 0)
                },
                "noeuds": {
                    "vc": data['talents'].get('TAL_25', 0)
                },
                "survie": {
                    "vc": data['talents'].get('TAL_30', 0)
                },
                "zoologie": {
                    "vc": data['talents'].get('TAL_29', 0)
                },
            },
            "connaissance": {
                "art_guerre": {
                    "vc": data['talents'].get('TAL_35', 0)
                },
                "astonomie": {
                    "vc": data['talents'].get('TAL_42', 0)
                },
                "calcul": {
                    "vc": data['talents'].get('TAL_38', 0)
                },
                "contes_legendes": {
                    "vc": data['talents'].get('TAL_40', 0)
                },
                "dieux_cultes": {
                    "vc": data['talents'].get('TAL_34', 0)
                },
                "droit": {
                    "vc": data['talents'].get('TAL_39', 0)
                },
                "geographie": {
                    "vc": data['talents'].get('TAL_32', 0)
                },
                "histoire": {
                    "vc": data['talents'].get('TAL_33', 0)
                },
                "jeux": {
                    "vc": data['talents'].get('TAL_31', 0)
                },
                "magicologie": {
                    "vc": data['talents'].get('TAL_36', 0)
                },
                "mecanique": {
                    "vc": data['talents'].get('TAL_37', 0)
                },
                "spherologie": {
                    "vc": data['talents'].get('TAL_41', 0)
                },
            },
            "savoir": {
                "alchimie": {
                    "vc": data['talents'].get('TAL_43', 0)
                },
                "navires": {
                    "vc": data['talents'].get('TAL_44', 0)
                },
                "commerce": {
                    "vc": data['talents'].get('TAL_46', 0)
                },
                "conduite": {
                    "vc": data['talents'].get('TAL_45', 0)
                },
                "crochetage": {
                    "vc": data['talents'].get('TAL_57', 0)
                },
                "cuisine": {
                    "vc": data['talents'].get('TAL_52', 0)
                },
                "musique": {
                    "vc": data['talents'].get('TAL_56', 0)
                },
                "peinture_dessin": {
                    "vc": data['talents'].get('TAL_54', 0)
                },
                "soin_esprit": {
                    "vc": data['talents'].get('TAL_49', 0)
                },
                "soin_blessures": {
                    "vc": data['talents'].get('TAL_50', 0)
                },
                "soin_maladies": {
                    "vc": data['talents'].get('TAL_48', 0)
                },
                "soin_poisons": {
                    "vc": data['talents'].get('TAL_47', 0)
                },
                "pierre": {
                    "vc": data['talents'].get('TAL_58', 0)
                },
                "bois": {
                    "vc": data['talents'].get('TAL_51', 0)
                },
                "cuir": {
                    "vc": data['talents'].get('TAL_53', 0)
                },
                "métal": {
                    "vc": data['talents'].get('TAL_55', 0)
                },
                "tissu": {
                    "vc": data['talents'].get('TAL_59', 0)
                },
            },
        },
        "techniques": {
            "arbaletes": {
                "vtc": data['ct'].get('CT_1', 6),
            },
            "arcs": {
                "vtc": data['ct'].get('CT_2', 6),
            },
            "chaines": {
                "vtc": data['ct'].get('CT_6', 6),
            },
            "hast": {
                "vtc": data['ct'].get('CT_13', 6),
            },
            "duel": {
                "vtc": data['ct'].get('CT_4', 6),
            },
            "jet": {
                "vtc": data['ct'].get('CT_14', 6),
            },
            "bagarre": {
                "vtc": data['ct'].get('CT_9', 6),
            },
            "boucliers": {
                "vtc": data['ct'].get('CT_10', 6),
            },
            "dagues": {
                "vtc": data['ct'].get('CT_3', 6),
            },
            "epees": {
                "vtc": data['ct'].get('CT_12', 6),
            },
            "epees2mains": {
                "vtc": data['ct'].get('CT_16', 6),
            },
            "haches_masses": {
                "vtc": data['ct'].get('CT_5', 6),
            },
            "haches_masses_2m": {
                "vtc": data['ct'].get('CT_15', 6),
            },
            "lances": {
                "vtc": data['ct'].get('CT_7', 6),
            },
        },
        "argent": [
            as_int(data['belongings']['purse']['d']),
            as_int(data['belongings']['purse']['s']),
            as_int(data['belongings']['purse']['h']),
            as_int(data['belongings']['purse']['k']),
        ],
        "etats": {
            "encombrement": worn[2],
        },
        "modifs_qualites":
        (f'{worn[0].title()} : {worn[3]}' if worn[3] else ""),
        "animal":
        animal,
        "divin": {
            "perma_pk":
            data['attr']['permanentKP']['lost'] -
            data['attr']['permanentKP']['redeemed'],
            "tradition":
            divin_trad,
            "qualite_principale":
            ek_qual,
            "cs":
            "\n".join(cs_divin),
            "benedictions":
            "\n".join(blessings),
        },
        "magic": {
            "perma_pa":
            data['attr']['permanentAE']['lost'] -
            data['attr']['permanentAE']['redeemed'],
            "tradition":
            magic_trad,
            "qualite_principale":
            ea_qual,
            "cs":
            "\n".join(cs_magie),
            "tours":
            "\n".join(cantrips),
        },
        "notes": {
            "notes": personal.get("otherinfo", ""),
            "ideaux_objectifs": personal.get("characteristics", ""),
        },
        "stuff":
        items,
        "sorts":
        spells,
        "liturgies":
        liturgies,
        "armes": {
            "melee": items_melee,
            "distance": items_distance,
            "armures": items_armures,
            "parade": items_parade,
        },
    }
    return sheet


def is_optolith_available():
    return Path("optolith-data/bsconfig.json").is_file()


async def convert_from_optolith(data):
    if not is_optolith_available():
        raise OptolithConversionError("Optolith data not found")
    if not 'clientVersion' in data:
        raise OptolithConversionError("Wrong format")

    if data['clientVersion'].startswith("1."):
        return await convert_from_optolith_v1(data)
    else:
        raise OptolithConversionError(
            f"Can't convert from version {data['clientVersion']}")
