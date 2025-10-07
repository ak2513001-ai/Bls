import requests
import math
import csv
import io
import json

API_KEY = "iJcuhvzJp4XLyG0sA2Dh1Azh5YcP58te17nXyQqL"
CRUISE_ALT = 39000
OUR_RUNWAYS_CSV_URL = "https://raw.githubusercontent.com/davidmegginson/ourairports-data/master/runways.csv"

def bearing(lat1, lon1, lat2, lon2):
    dLon = math.radians(lon2 - lon1)
    lat1, lat2 = math.radians(lat1), math.radians(lat2)
    x = math.sin(dLon) * math.cos(lat2)
    y = math.cos(lat1)*math.sin(lat2) - math.sin(lat1)*math.cos(lat2)*math.cos(dLon)
    brng = math.degrees(math.atan2(x, y))
    return (brng + 360) % 360

def guess_type(ident):
    if ident.startswith("TOC") or ident.startswith("TOD"):
        return "FIX"
    if len(ident) == 3:
        return "VOR"
    return "WPT"

def fetch_runways_for_airport(icao):
    resp = requests.get(OUR_RUNWAYS_CSV_URL)
    resp.raise_for_status()
    runways = []
    reader = csv.DictReader(io.StringIO(resp.text))
    for row in reader:
        if row["airport_ident"].strip().upper() == icao.upper():
            runways.append(row)
    return runways

def select_runway(runways, airport_type):
    opts = []
    for rw in runways:
        le = rw["le_ident"]
        he = rw["he_ident"]
        if le and he:
            opts.append(f"{le}/{he}")
    print(f"Select runway for {airport_type} airport:")
    for i, o in enumerate(opts):
        print(f"{i+1}. {o}")
    choice = int(input("Enter number: ")) - 1
    if choice < 0 or choice >= len(opts):
        raise ValueError("Invalid choice")
    rw = runways[choice]
    return rw

def select_runway_threshold(runway, first_wpt_lat, first_wpt_lon):
    best = None
    best_diff = None
    desired_bearing = bearing(float(runway["le_latitude_deg"]), float(runway["le_longitude_deg"]), first_wpt_lat, first_wpt_lon)
    for end in ["le", "he"]:
        if runway[f"{end}_latitude_deg"] and runway[f"{end}_longitude_deg"]:
            lat = float(runway[f"{end}_latitude_deg"])
            lon = float(runway[f"{end}_longitude_deg"])
            diff = abs((bearing(lat, lon, first_wpt_lat, first_wpt_lon) - desired_bearing + 360) % 360)
            if best is None or diff < best_diff:
                best = (lat, lon)
                best_diff = diff
    return best

def fpdb_to_geofs(nodes, dep_threshold, arr_threshold):
    geofs = []
    total = len(nodes)
    for i, n in enumerate(nodes):
        ident = n.get("ident", f"WPT{i+1}")
        lat, lon = round(n["lat"], 5), round(n["lon"], 5)
        if i == 0 or i == total - 1:
            alt = 0
        elif i < total * 0.25:
            alt = int(CRUISE_ALT * (i / (total * 0.25)))
        elif i > total * 0.75:
            alt = int(CRUISE_ALT * (1 - (i - total * 0.75)/(total * 0.25)))
        else:
            alt = CRUISE_ALT
        if i == 0:
            type_ = "DPT"
        elif i == total - 1:
            type_ = "DST"
        elif i == round(total * 0.25):
            type_ = "FIX"; ident = "T_O_C"
        elif i == round(total * 0.75):
            type_ = "FIX"; ident = "T_O_D"
        else:
            type_ = guess_type(ident)
        heading = None
        if i == 0:
            heading = int(bearing(lat, lon, nodes[i+1]["lat"], nodes[i+1]["lon"]))
        elif i == total - 1:
            heading = int(bearing(nodes[i-1]["lat"], nodes[i-1]["lon"], lat, lon))
        wpt = {"ident": ident, "type": type_, "lat": lat, "lon": lon, "alt": alt}
        if heading is not None:
            wpt["heading"] = heading
        geofs.append(wpt)
    if dep_threshold:
        rw_lat, rw_lon = dep_threshold
        rw_wp = {"ident": "DEP_RWY", "type": "RWY", "lat": round(rw_lat,5), "lon": round(rw_lon,5), "alt": 0}
        geofs.insert(1, rw_wp)
    if arr_threshold:
        rw_lat, rw_lon = arr_threshold
        rw_wp = {"ident": "ARR_RWY", "type": "RWY", "lat": round(rw_lat,5), "lon": round(rw_lon,5), "alt": 0}
        geofs.insert(-1, rw_wp)
    return geofs

def get_fpdb_route(dep, arr):
    headers = {"Authorization": f"Bearer {API_KEY}"}
    search_url = f"https://api.flightplandatabase.com/search/plans?fromICAO={dep}&toICAO={arr}&limit=1"
    resp = requests.get(search_url, headers=headers)
    resp.raise_for_status()
    plans = resp.json()
    if not plans:
        raise ValueError("No plan found")
    pid = plans[0]["id"]
    plan_url = f"https://api.flightplandatabase.com/plan/{pid}?includeRoute=true"
    r = requests.get(plan_url, headers=headers)
    r.raise_for_status()
    return r.json()["route"]["nodes"]

if __name__ == "__main__":
    dep = input("Departure ICAO: ").strip().upper()
    arr = input("Destination ICAO: ").strip().upper()
    nodes = get_fpdb_route(dep, arr)
    if len(nodes) < 2:
        raise RuntimeError("Not enough route points")
    dep_runways = fetch_runways_for_airport(dep)
    arr_runways = fetch_runways_for_airport(arr)
    dep_threshold = arr_threshold = None
    if dep_runways:
        dep_rw = select_runway(dep_runways, "departure")
        first_wpt = nodes[1]
        dep_threshold = select_runway_threshold(dep_rw, first_wpt["lat"], first_wpt["lon"])
    if arr_runways:
        arr_rw = select_runway(arr_runways, "arrival")
        last_wpt = nodes[-2]
        arr_threshold = select_runway_threshold(arr_rw, last_wpt["lat"], last_wpt["lon"])
    geofs_plan = fpdb_to_geofs(nodes, dep_threshold, arr_threshold)
    fname = f"{dep}-{arr}.json"
    with open(fname, "w") as f:
        json.dump(geofs_plan, f, separators=(',',':'))
    print("Saved to", fname)
