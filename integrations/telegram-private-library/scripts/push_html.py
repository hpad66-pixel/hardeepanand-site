#!/usr/bin/env python3
"""Upload one explicitly approved HTML document. Never prints credentials."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import secrets
import ssl
import sys
import time
import urllib.error
import urllib.request

ENDPOINT = 'https://hardeepanand.com/integrations/library/push'
MAX_BYTES = 5 * 1024 * 1024

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

def credential():
    token = os.environ.get('HA_LIBRARY_PUSH_TOKEN', '').strip()
    if not token:
        token_path = Path(os.environ.get('HA_LIBRARY_PUSH_TOKEN_FILE', '~/.config/hardeepanand-library/push-token')).expanduser()
        if token_path.is_file():
            if token_path.stat().st_mode & 0o077:
                raise ValueError('Upload token file must be private (chmod 600).')
            token = token_path.read_text().strip()
    if not token.startswith('ha_push_') or len(token) != 51:
        raise ValueError('HA_LIBRARY_PUSH_TOKEN is not configured. Add it in the hosted Hermes environment; never paste it into Telegram.')
    return token

def prepare(args):
    file = Path(args.file).expanduser().resolve(strict=True)
    if file.suffix.lower() not in ('.html', '.htm') or not file.is_file():
        raise ValueError('Choose one HTML file.')
    if file.stat().st_size > MAX_BYTES:
        raise ValueError('The HTML file must be 5 MB or smaller.')
    data = file.read_bytes()
    if not data or len(data) > MAX_BYTES:
        raise ValueError('The HTML file must be nonempty and 5 MB or smaller.')
    title = args.title.strip()
    tags = [tag.strip() for tag in args.tags.split(',') if tag.strip()]
    if not title or len(title)>140 or len(args.summary)>500 or len(tags)>12 or any(len(t)>40 for t in tags):
        raise ValueError('Use a title up to 140 characters, summary up to 500, and at most 12 tags of 40 characters each.')
    boundary = 'ha_library_' + secrets.token_hex(20)
    parts=[]
    for name,value in [('title',title),('summary',args.summary),('tags',','.join(tags))]:
        parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{value}\r\n'.encode())
    # The original filename is intentionally not transmitted as private metadata.
    parts.extend([f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="document.html"\r\nContent-Type: text/html; charset=utf-8\r\n\r\n'.encode(),data,f'\r\n--{boundary}--\r\n'.encode()])
    return b''.join(parts), boundary, hashlib.sha256(data).hexdigest(),len(data)

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('file')
    parser.add_argument('--title',required=True)
    parser.add_argument('--summary',default='')
    parser.add_argument('--tags',default='')
    parser.add_argument('--push',action='store_true',help='Send only after the user explicitly says push it for this document.')
    args=parser.parse_args()
    body,boundary,digest,size=prepare(args)
    if not args.push:
        print(json.dumps({'ready':True,'uploaded':False,'title':args.title,'bytes':size,'sha256':digest,'destination':'private idea library','next':'Wait for the user to say push it, then rerun with --push.'}))
        return
    token=credential()
    # python.org's macOS distribution may not configure its CA bundle on install.
    # Use the system trust store when present; certificate checks remain required.
    ca_file='/etc/ssl/cert.pem' if sys.platform=='darwin' and Path('/etc/ssl/cert.pem').is_file() else None
    context=ssl.create_default_context(cafile=ca_file)
    opener=urllib.request.build_opener(NoRedirect(),urllib.request.HTTPSHandler(context=context))
    for attempt in range(3):
        request=urllib.request.Request(ENDPOINT,data=body,method='POST',headers={'Authorization':'Bearer '+token,'Content-Type':'multipart/form-data; boundary='+boundary,'Accept':'application/json','User-Agent':'Hardeep-Private-Library/1.0'})
        try:
            with opener.open(request,timeout=45) as response:
                result=json.load(response)
            if result.get('sha256')!=digest or not result.get('url','').startswith('https://hardeepanand.com/admin/ideas/'):
                raise ValueError('Unexpected upload response. Verify in the library before retrying.')
            print(json.dumps({'uploaded':True,'duplicate':result['duplicate'],'url':result['url'],'libraryUrl':result['libraryUrl'],'sha256':digest}))
            return
        except urllib.error.HTTPError as error:
            if error.code>=500 and attempt<2:
                time.sleep(2**attempt)
                continue
            messages={401:'Upload token was rejected. Check the hosted secret.',403:'Upload request was refused.',405:'The endpoint does not accept this request.',413:'The HTML exceeds the file-size limit.',503:'The upload service is not configured.'}
            raise ValueError(messages.get(error.code,f'Upload failed with HTTP {error.code}; no success confirmed.')) from None
        except (urllib.error.URLError,TimeoutError):
            if attempt<2:
                time.sleep(2**attempt)
                continue
            raise ValueError('Connection failed. Retrying the same file is safe; do not claim it uploaded yet.') from None

if __name__=='__main__':
    try:
        main()
    except (ValueError,OSError) as error:
        print(json.dumps({'uploaded':False,'error':str(error)}),file=sys.stderr)
        sys.exit(1)
