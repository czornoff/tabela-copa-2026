#!/usr/bin/env python3
"""
Atualiza shirtNumber e currentTeam de todos os jogadores
usando a API football-data.org /persons/{id}.

Execute com: python scripts/update-shirt-team.py
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

BATCH_SIZE = 10
BATCH_PAUSE = 63  # seconds between batches (10 req/min limit)


def fd_get(endpoint):
    url = f"{FD_HOST}/{endpoint}"
    req = urllib.request.Request(url, headers={"X-Auth-Token": FD_TOKEN})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        if e.code == 429:
            return {"rate_limited": True}
        return None
    except Exception:
        return None


def fetch_person(fd_id):
    result = fd_get(f"persons/{fd_id}")
    if not result or result.get("rate_limited"):
        return fd_id, None, result and result.get("rate_limited", False)
    ct = result.get("currentTeam")
    team_name = ct.get("name") if isinstance(ct, dict) and ct.get("name") else None
    return fd_id, {
        "shirtNumber": result.get("shirtNumber"),
        "currentTeam": team_name,
    }, False


def main():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    all_players = []
    for team_id, team in data.items():
        for player in team.get("players", []):
            fd_id = player.get("fdId")
            if fd_id:
                all_players.append((team_id, player, fd_id))

    total = len(all_players)
    print(f"Total players with fdId: {total}")

    updated = 0
    errors = 0
    total_batches = (total + BATCH_SIZE - 1) // BATCH_SIZE

    with concurrent.futures.ThreadPoolExecutor(max_workers=BATCH_SIZE) as executor:
        for i in range(0, total, BATCH_SIZE):
            batch = all_players[i:i + BATCH_SIZE]
            batch_num = i // BATCH_SIZE + 1
            fd_ids = [p[2] for p in batch]

            futures = {executor.submit(fetch_person, fid): (tid, pl) for tid, pl, fid in batch}
            batch_limited = False

            for future in concurrent.futures.as_completed(futures):
                fd_id, info, limited = future.result()
                if limited:
                    batch_limited = True
                    continue
                if info is None:
                    errors += 1
                    continue
                tid, pl = futures[future]
                if info["shirtNumber"] is not None:
                    pl["shirtNumber"] = info["shirtNumber"]
                if info["currentTeam"]:
                    pl["currentTeam"] = info["currentTeam"]
                updated += 1

            # Save after each batch
            with open(JSON_PATH, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

            pct = (i + len(batch)) / total * 100
            print(f"[{batch_num}/{total_batches}] Updated: {updated}, Errors: {errors} ({pct:.0f}%)")

            if batch_limited:
                print(f"  Rate limited! Waiting {BATCH_PAUSE * 2}s...")
                time.sleep(BATCH_PAUSE * 2)
            elif batch_num < total_batches:
                time.sleep(BATCH_PAUSE)

    print(f"\nDone! Updated: {updated}, Errors: {errors}")
    print(f"Saved to {JSON_PATH}")


if __name__ == "__main__":
    main()
