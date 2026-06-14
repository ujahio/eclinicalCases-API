import sys, json, time
from graphify.extract import collect_files, extract
from pathlib import Path

t0 = time.time()

detect = json.loads(Path('graphify-out/.graphify_detect.json').read_text(encoding='utf-8'))
all_code = []
for f in detect.get('files', {}).get('code', []):
    all_code.extend(collect_files(Path(f)) if Path(f).is_dir() else [Path(f)])

# Filter to meaningful source directories using relative path
cwd = Path.cwd()
meaningful_dirs = {'src', 'server', 'infra', 'appContext', 'scripts'}
code_files = []
for p in all_code:
    try:
        rel = p.relative_to(cwd)
        if rel.parts and rel.parts[0] in meaningful_dirs:
            code_files.append(p)
    except ValueError:
        pass

print(f'Collected {len(code_files)} meaningful code files (of {len(all_code)} total)', flush=True)

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
