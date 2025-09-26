import csv, json

input_file = "level4.csv"
output_file = "level4.json"

# Read CSV
with open(input_file, newline='', encoding="utf-8") as f:
    reader = csv.DictReader(f)
    rows = list(reader)

# Write JSON
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(rows, f, ensure_ascii=False, indent=2)

print(f"Converted {len(rows)} rows to {output_file}")