import json
from pathlib import Path

for name in ['occupation', 'era']:
    rows = {}
    for line in Path(f'scripts/{name}-explanations.tsv').read_text().splitlines():
        if not line.strip():
            continue
        fields = line.split('|')
        assert len(fields) == 7, (fields[0], len(fields))
        id, explanation, *notes = fields
        assert id not in rows, id
        assert all(field.strip() for field in fields), id
        rows[id] = dict(explanation=explanation, choiceNotes=notes)
    Path(f'scripts/{name}-explanations.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n')
    print(f'{name}: {len(rows)} questions, {len(rows)*5} choice explanations')
