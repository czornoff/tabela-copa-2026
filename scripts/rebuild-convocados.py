#!/usr/bin/env python3
"""
Gera public/data/convocados.json do zero usando football-data.org.
Busca times, elenos, técnicos e detalhes de cada jogador (shirtNumber, currentTeam/clube).

Execute com: python scripts/rebuild-convocados.py
"""
import json
import os
import sys
import time
import urllib.request
import urllib.error
import concurrent.futures

FD_TOKEN = "d5216a7fa33f4c909ac72a5e7ffacf4c"
FD_HOST = "https://api.football-data.org/v4"
JSON_PATH = os.path.join(os.path.dirname(__file__), "..", "public", "data", "convocados.json")
BASE_PATH = os.environ.get("BASE_PATH", "")

# fdTeamId -> localId mapping
FD_TO_LOCAL = {
    758: "uru", 759: "ger", 760: "esp", 761: "par", 762: "arg",
    763: "gha", 764: "bra", 765: "por", 766: "jpn", 769: "mex",
    770: "eng", 771: "usa", 772: "kor", 773: "fra", 774: "rsa",
    778: "alg", 779: "aus", 783: "nzl", 788: "sui", 791: "ecu",
    792: "swe", 798: "czr", 799: "cro", 801: "sau", 802: "tun",
    803: "tur", 804: "sen", 805: "bel", 815: "mar", 816: "aut",
    818: "col", 825: "egy", 828: "can", 836: "hai", 840: "irn",
    1060: "bih", 1836: "pan", 1930: "cpv", 1934: "cod", 1935: "civ",
    8030: "qat", 8049: "jor", 8062: "irq", 8070: "uzb", 8601: "ned",
    8872: "nor", 8873: "sco", 9460: "cuw",
}

POS_MAP = {
    "Goalkeeper": "GK",
    "Defender": "DEF",
    "Midfielder": "MID",
    "Offence": "FWD",
    "Offense": "FWD",
    "Forward": "FWD",
}

BATCH_SIZE = 10
BATCH_PAUSE = 63


def fd_get(endpoint):
    url = f"{FD_HOST}/{endpoint}"
    req = urllib.request.Request(url, headers={"X-Auth-Token": FD_TOKEN})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        if e.code == 429:
            return {"rate_limited": True}
        print(f"  HTTP {e.code} for {endpoint}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"  Error for {endpoint}: {e}", file=sys.stderr)
        return None


def map_position(fd_position):
    if not fd_position:
        return "MID"
    return POS_MAP.get(fd_position, "MID")


def fetch_person(fd_id):
    result = fd_get(f"persons/{fd_id}")
    if not result:
        return fd_id, None, False
    if result.get("rate_limited"):
        return fd_id, None, True
    ct = result.get("currentTeam")
    team_name = ct.get("name") if isinstance(ct, dict) and ct.get("name") else None
    return fd_id, {
        "shirtNumber": result.get("shirtNumber"),
        "currentTeam": team_name,
    }, False


def main():
    print("Fetching WC 2026 teams...")
    teams_data = fd_get("competitions/WC/teams?season=2026")
    if not teams_data or teams_data.get("rate_limited"):
        print("ERROR: Could not fetch teams or rate limited.")
        sys.exit(1)

    fd_teams = teams_data.get("teams", [])
    print(f"Found {len(fd_teams)} teams")

    # Build lookup: fdTeamId -> team data
    team_map = {}
    for t in fd_teams:
        local_id = FD_TO_LOCAL.get(t["id"])
        if not local_id:
            print(f"  WARNING: Unknown fdTeamId={t['id']} ({t['name']}), skipping")
            continue
        team_map[t["id"]] = {
            "local_id": local_id,
            "teamName": t["name"],
            "crest": t.get("crest", ""),
            "coach": None,
            "squad": t.get("squad", []),
        }
        # Extract coach from coachingStaff
        staff = t.get("coachingStaff", [])
        for s in staff:
            if s.get("role") == "COACH":
                team_map[t["id"]]["coach"] = {
                    "name": s.get("name", ""),
                    "nationality": s.get("nationality"),
                }
                break
        if not team_map[t["id"]]["coach"] and staff:
            s = staff[0]
            team_map[t["id"]]["coach"] = {
                "name": s.get("name", ""),
                "nationality": s.get("nationality"),
            }

    # Collect all player fdIds
    all_players = []
    for fd_tid, tinfo in team_map.items():
        for p in tinfo["squad"]:
            all_players.append((fd_tid, p))

    print(f"Total players: {len(all_players)}")

    # Fetch person details in batches
    person_cache = {}
    total_batches = (len(all_players) + BATCH_SIZE - 1) // BATCH_SIZE
    updated = 0
    errors = 0

    with concurrent.futures.ThreadPoolExecutor(max_workers=BATCH_SIZE) as executor:
        for i in range(0, len(all_players), BATCH_SIZE):
            batch = all_players[i:i + BATCH_SIZE]
            batch_num = i // BATCH_SIZE + 1

            futures = {}
            for fd_tid, p in batch:
                pid = p.get("id")
                if pid and pid not in person_cache:
                    futures[executor.submit(fetch_person, pid)] = (fd_tid, p)

            batch_limited = False
            for future in concurrent.futures.as_completed(futures):
                fd_id, info, limited = future.result()
                if limited:
                    batch_limited = True
                    continue
                person_cache[fd_id] = info
                if info:
                    updated += 1
                else:
                    errors += 1

            pct = min(100, (i + len(batch)) / len(all_players) * 100)
            print(f"  [{batch_num}/{total_batches}] Fetched {updated}/{len(person_cache)} persons ({pct:.0f}%)")

            if batch_limited:
                print(f"  Rate limited! Waiting {BATCH_PAUSE * 2}s...")
                time.sleep(BATCH_PAUSE * 2)
            elif batch_num < total_batches:
                time.sleep(BATCH_PAUSE)

    # Build JSON output
    output = {}
    for fd_tid, tinfo in team_map.items():
        local_id = tinfo["local_id"]
        players = []
        for p in tinfo["squad"]:
            pid = p.get("id")
            pdata = person_cache.get(pid) or {}
            fd_pos = p.get("position") or p.get("section")
            players.append({
                "fdId": pid,
                "apiId": None,
                "name": p.get("name", ""),
                "position": map_position(fd_pos),
                "shirtNumber": pdata.get("shirtNumber") or p.get("shirtNumber"),
                "photo": None,
                "age": None,
                "height": None,
                "weight": None,
                "birthDate": p.get("dateOfBirth"),
                "birthPlace": None,
                "birthCountry": None,
                "nationality": p.get("nationality", ""),
                "currentTeam": pdata.get("currentTeam") or tinfo["teamName"],
            })

        output[local_id] = {
            "teamId": local_id,
            "teamName": tinfo["teamName"],
            "crest": tinfo["crest"],
            "coach": tinfo["coach"],
            "players": players,
        }

    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\nDone! {len(output)} teams, {sum(len(t['players']) for t in output.values())} players")
    print(f"Saved to {JSON_PATH}")


if __name__ == "__main__":
    main()
