import sys, json, time
from graphify.extract import collect_files, extract
from pathlib import Path

t0 = time.time()
code_files = []
detect = json.loads(Path('graphify-out/.graphify_detect.json').read_text(encoding='utf-8'))
for f in detect.get('files', {}).get('code', []):
    code_files.extend(collect_files(Path(f)) if Path(f).is_dir() else [Path(f)])

print(f'Collected {len(code_files)} code files in {time.time()-t0:.1f}s', flush=True)

if code_files:
    t1 = time.time()
    result = extract(code_files, cache_root=Path('.'))
    elapsed = time.time() - t1
    print(f'extract() returned in {elapsed:.1f}s: {len(result.get("nodes",[]))} nodes, {len(result.get("edges",[]))} edges', flush=True)
    t2 = time.time()
    with open('graphify-out/.graphify_ast.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    print(f'File written in {time.time()-t2:.1f}s', flush=True)
    print('AST_DONE', flush=True)
else:
    Path('graphify-out/.graphify_ast.json').write_text(json.dumps({'nodes':[],'edges':[],'input_tokens':0,'output_tokens':0}, ensure_ascii=False), encoding='utf-8')
    print('No code files - skipping AST extraction')
