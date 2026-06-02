#!/usr/bin/env python3
"""
Busca fotos, peso, altura, número e clube dos convocados na api-football.com
e atualiza o JSON em public/data/convocados.json.

Execute com: python scripts/update-convocados-photos.py
"""
import json
import os
import sys
import time
import urllib.request
import urllib.error

API_KEY = "b256338c2985e8bca8149a3b05625bb2"
API_HOST = "v3.football.api-sports.io"
JSON_PATH = os.path.join(os.path.dirname(__file__), "..", "public", "data", "convocados.json")

local_to_api = {
    "bra": 6, "arg": 26, "eng": 10, "fra": 2, "ger": 25, "esp": 9,
    "por": 27, "ita": 768, "ned": 1118, "bel": 1, "cro": 44,
    "aus": 20, "irn": 22, "sau": 23, "tur": 777, "sui": 15, "aut": 775,
    "uru": 7, "col": 8, "egy": 32, "rsa": 1531, "cpv": 1533, "crc": 29,
    "hon": 4672, "par": 2380, "usa": 40, "mex": 34, "can": 41, "jpn": 12,
    "kor": 10177, "sen": 1173, "gha": 1182, "civ": 1170, "cam": 1180,
    "nga": 1183, "tun": 1169, "alg": 1168, "pan": 1187, "jam": 1186,
    "nzl": 1174, "mar": 1112, "ecu": 1731, "chi": 1171, "per": 1172,
    "bol": 1166, "czr": 1177, "sco": 1175, "nor": 1176, "swe": 1178,
    "bih": 1179, "qat": 1181,
}


def api_get(endpoint):
    url = f"https://{API_HOST}/{endpoint}"
    req = urllib.request.Request(url, headers={"x-apisports-key": API_KEY})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        print(f"  HTTP Error {e.code}: {e.reason}")
        return None
    except Exception as e:
        print(f"  Error: {e}")
        return None


def normalize(name):
    import unicodedata
    n = unicodedata.normalize("NFD", name.lower())
    n = "".join(c for c in n if unicodedata.category(c) != "Mn")
    return "".join(c for c in n if c.isalnum() or c.isspace()).strip()


def main():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    total_updated = 0
    total_photos = 0

    for team_id, team in data.items():
        api_team_id = local_to_api.get(team_id)
        if not api_team_id:
            print(f"[{team_id}] No api-football team ID, skipping")
            continue

        print(f"[{team_id}] Fetching squads for team {api_team_id}...")
        squad_data = api_get(f"players/squads?team={api_team_id}")
        if not squad_data or not squad_data.get("response"):
            print(f"  No data returned, skipping")
            continue

        if squad_data.get("errors", {}).get("requests"):
            print(f"  Rate limited! Stopping.")
            break

        api_players = {}
        for item in squad_data["response"]:
            for p in item.get("players", []):
                if p.get("name"):
                    api_players[normalize(p["name"])] = {
                        "apiId": p.get("id"),
                        "photo": p.get("photo"),
                        "shirtNumber": p.get("number"),
                        "currentTeam": item.get("team", {}).get("name"),
                    }

        print(f"  Found {len(api_players)} players in api-football")

        # Match players by name
        for player in team["players"]:
            norm = normalize(player["name"])

            match = api_players.get(norm)
            if not match:
                # Partial match
                for key, val in api_players.items():
                    if norm in key or key in norm:
                        match = val
                        break
            if not match:
                # Last name match
                parts = norm.split()
                if parts:
                    last = parts[-1]
                    if len(last) > 2:
                        for key, val in api_players.items():
                            if last in key:
                                match = val
                                break

            if match:
                if match.get("apiId"):
                    player["apiId"] = match["apiId"]
                if match.get("photo"):
                    player["photo"] = match["photo"]
                if match.get("shirtNumber") is not None:
                    player["shirtNumber"] = match["shirtNumber"]
                if match.get("currentTeam"):
                    player["currentTeam"] = match["currentTeam"]
                total_photos += 1

        # Now fetch height/weight for matched players
        matched = [p for p in team["players"] if p.get("apiId")]
        for i in range(0, len(matched), 5):
            batch = matched[i:i + 5]
            for player in batch:
                detail = api_get(f"players?id={player['apiId']}")
                if detail and detail.get("response"):
                    p_data = detail["response"][0].get("player", {})
                    if not player.get("height"):
                        player["height"] = p_data.get("height")
                    if not player.get("weight"):
                        player["weight"] = p_data.get("weight")
                    birth = p_data.get("birth", {})
                    if not player.get("birthPlace"):
                        player["birthPlace"] = birth.get("place")
                    if not player.get("birthCountry"):
                        player["birthCountry"] = birth.get("country")
                    # Fallback: get shirtNumber/currentTeam from detailed stats
                    if player.get("shirtNumber") is None or not player.get("currentTeam"):
                        for team_entry in detail["response"][0].get("statistics", []):
                            t = team_entry.get("team", {})
                            if t.get("id") and t.get("name"):
                                if player.get("shirtNumber") is None and team_entry.get("number"):
                                    player["shirtNumber"] = team_entry["number"]
                                if not player.get("currentTeam") and t.get("name"):
                                    player["currentTeam"] = t["name"]
                                if player.get("shirtNumber") is not None and player.get("currentTeam"):
                                    break
                    total_updated += 1
                time.sleep(0.5)  # Rate limiting

        time.sleep(1)  # Pause between teams

    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\nDone! Photos: {total_photos}, Details updated: {total_updated}")
    print(f"Saved to {JSON_PATH}")


if __name__ == "__main__":
    main()
