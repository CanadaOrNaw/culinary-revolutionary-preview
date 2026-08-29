#!/usr/bin/env bash
# Namecheap API driver for the culinary-revolutionary.com migration.
#
# Credentials come from the environment, never from this file:
#   export NC_USER=your-namecheap-username
#   export NC_KEY=...            # Profile > Tools > Namecheap API Access
#   export NC_IP=$(curl -s https://ipv4.icanhazip.com)   # must be whitelisted
#
# The API spends from your Namecheap account balance. Fund the account once in
# the browser; nothing here ever sees a card.
#
# Usage:
#   ./namecheap.sh check              # is the domain transferable, what's the status
#   ./namecheap.sh transfer <EPPCODE> # start the inbound transfer
#   ./namecheap.sh status             # poll transfer progress
#   ./namecheap.sh dns                # point the domain at GitHub Pages
#   ./namecheap.sh verify             # read back what's actually live

set -euo pipefail

API="https://api.namecheap.com/xml.response"
SLD="culinary-revolutionary"
TLD="com"
DOMAIN="$SLD.$TLD"

: "${NC_USER:?set NC_USER}"; : "${NC_KEY:?set NC_KEY}"; : "${NC_IP:?set NC_IP}"

call() {
  local cmd="$1"; shift
  curl -sS --get "$API" \
    --data-urlencode "ApiUser=$NC_USER" \
    --data-urlencode "UserName=$NC_USER" \
    --data-urlencode "ApiKey=$NC_KEY" \
    --data-urlencode "ClientIp=$NC_IP" \
    --data-urlencode "Command=$cmd" \
    "$@"
}

# Namecheap returns HTTP 200 even for API errors, so the XML must be inspected.
fail_on_error() {
  python3 - "$1" <<'PY'
import sys, re
x = sys.argv[1]
errs = re.findall(r'<Error Number="(\d+)">([^<]*)</Error>', x)
if errs:
    for n, m in errs:
        print(f"  API ERROR {n}: {m}", file=sys.stderr)
    sys.exit(1)
PY
}

case "${1:-}" in
  check)
    out=$(call namecheap.domains.getInfo --data-urlencode "DomainName=$DOMAIN") || true
    fail_on_error "$out" || true
    echo "$out" | python3 -c "
import sys,re
x=sys.stdin.read()
print('in this account:', 'yes' if '<DomainGetInfoResult' in x else 'no (expected before transfer)')
"
    echo "--- registry view (authoritative on transferability) ---"
    curl -s "https://rdap.verisign.com/com/v1/domain/${DOMAIN^^}" | python3 -c "
import sys,json
d=json.load(sys.stdin)
s=d.get('status',[])
print('status      :', s)
print('nameservers :', [n['ldhName'] for n in d.get('nameservers',[])])
print('TRANSFERABLE:', 'YES' if not any('TransferProhibited' in x or 'pendingTransfer' in x for x in s) else 'NO')
"
    ;;

  transfer)
    EPP="${2:?usage: $0 transfer <EPPCODE>}"
    echo "Starting inbound transfer of $DOMAIN — this charges your Namecheap balance."
    out=$(call namecheap.domains.transfer.create \
      --data-urlencode "DomainName=$DOMAIN" \
      --data-urlencode "Years=1" \
      --data-urlencode "EPPCode=$EPP")
    fail_on_error "$out"
    echo "$out" | python3 -c "
import sys,re
x=sys.stdin.read()
m=re.search(r'<DomainTransferCreateResult([^>]*)>',x)
print(m.group(1).strip() if m else x[:600])
"
    ;;

  status)
    out=$(call namecheap.domains.transfer.getList)
    fail_on_error "$out"
    echo "$out" | python3 -c "
import sys,re
for a in re.findall(r'<Transfer ([^>]*)/?>', sys.stdin.read()):
    print(' ', a.strip())
"
    ;;

  dns)
    echo "Pointing $DOMAIN at GitHub Pages (apex A + www CNAME)."
    echo "NOTE: this replaces the ENTIRE host-record set in one call — every record"
    echo "      you want to keep must be listed here."
    out=$(call namecheap.domains.dns.setHosts \
      --data-urlencode "SLD=$SLD" --data-urlencode "TLD=$TLD" \
      --data-urlencode "HostName1=@"   --data-urlencode "RecordType1=A" --data-urlencode "Address1=185.199.108.153" --data-urlencode "TTL1=300" \
      --data-urlencode "HostName2=@"   --data-urlencode "RecordType2=A" --data-urlencode "Address2=185.199.109.153" --data-urlencode "TTL2=300" \
      --data-urlencode "HostName3=@"   --data-urlencode "RecordType3=A" --data-urlencode "Address3=185.199.110.153" --data-urlencode "TTL3=300" \
      --data-urlencode "HostName4=@"   --data-urlencode "RecordType4=A" --data-urlencode "Address4=185.199.111.153" --data-urlencode "TTL4=300" \
      --data-urlencode "HostName5=www" --data-urlencode "RecordType5=CNAME" --data-urlencode "Address5=canadaornaw.github.io." --data-urlencode "TTL5=300")
    fail_on_error "$out"
    echo "  host records set."
    ;;

  verify)
    echo "--- authoritative ---"
    ns=$(dig +short NS "$DOMAIN" | head -1)
    echo "nameservers: ${ns:-none}"
    echo "apex A     : $(dig +short A "$DOMAIN" @"${ns:-1.1.1.1}" | tr '\n' ' ')"
    echo "www        : $(dig +short CNAME "www.$DOMAIN" @"${ns:-1.1.1.1}")"
    echo "--- public resolvers ---"
    echo "1.1.1.1    : $(dig +short A "$DOMAIN" @1.1.1.1 | tr '\n' ' ')"
    echo "8.8.8.8    : $(dig +short A "$DOMAIN" @8.8.8.8 | tr '\n' ' ')"
    echo "--- serving ---"
    echo "http  www  : $(curl -s -o /dev/null -w '%{http_code}' "http://www.$DOMAIN" || echo fail)"
    echo "https www  : $(curl -s -o /dev/null -w '%{http_code}' "https://www.$DOMAIN" || echo 'cert not ready')"
    ;;

  *) sed -n '2,20p' "$0"; exit 1 ;;
esac
