from pathlib import Path
import subprocess,re,json,tempfile
from concurrent.futures import ThreadPoolExecutor
root=Path('tmp/pdfs')
ids={80:'1000030154',79:'1000030131',78:'1000030119',77:'1000030110',76:'1000030098',75:'1000030080',74:'1000030069',73:'1000030052',72:'1000030043',71:'1000030032',70:'1000030012'}
def get(url, path):
    is_pdf = path.suffix.lower() == '.pdf'
    if path.exists() and (not is_pdf or path.read_bytes().startswith(b'%PDF')):
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    for suffix in ['', '&download=1', '&netfunnel=']:
        with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as temporary:
            temp_path = Path(temporary.name)
        try:
            result = subprocess.run([
                'curl', '-sS', '-L', '--fail', '--retry', '1', '--max-time', '30',
                url + suffix, '-o', str(temp_path),
            ])
            if result.returncode != 0:
                continue
            if is_pdf and not temp_path.read_bytes().startswith(b'%PDF'):
                continue
            temp_path.replace(path)
            return
        finally:
            temp_path.unlink(missing_ok=True)
    raise RuntimeError(f'Download failed: {url}')
def run(item):
 exam,pst=item
 url=f'https://www.historyexam.go.kr/pst/view.do?bbs=dat&pst_sno={pst}&netfunnel='
 path=root/f'view-{exam}.html';get(url,path)
 result={'exam':exam,'pageUrl':url}
 for fileid,name in re.findall(r"fnFileDownload\('([^']+)'\)[^>]*>\s*([^<]+)",path.read_text()):
  kind='questions' if '문제지' in name else 'answers' if '답지' in name or '정답' in name else None
  if not kind:continue
  dl=f'https://www.historyexam.go.kr/atchFile/FileDown.do?atch_file_id={fileid}'
  dest=root/f'{exam}-{kind}.pdf';get(dl,dest)
  assert dest.read_bytes().startswith(b'%PDF')
  result[kind]={'url':dl,'path':str(dest)}
 assert 'questions'in result and 'answers'in result,result
 print(exam,'ready',flush=True)
 return result
def main():
    root.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(max_workers=2) as pool:
        data = list(pool.map(run, ids.items()))
    (root / 'sources.json').write_text(json.dumps(data, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()
