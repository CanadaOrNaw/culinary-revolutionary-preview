#!/usr/bin/env bash
# Read-only launch checks for culinary-revolutionary.com.
# This script never changes DNS, registrar state, GitHub, or email settings.

set -euo pipefail

DOMAIN="culinary-revolutionary.com"

echo "--- registry ---"
curl -fsS "https://rdap.verisign.com/com/v1/domain/${DOMAIN^^}" |
  jq -r '"status: " + (.status | join(", ")),
         "nameservers: " + ([.nameservers[].ldhName] | join(", "))'

echo "--- DNS ---"
printf 'NS:  %s\n' "$(dig +short NS "$DOMAIN" | tr '\n' ' ')"
printf 'A:   %s\n' "$(dig +short A "$DOMAIN" | tr '\n' ' ')"
printf 'www: %s\n' "$(dig +short CNAME "www.$DOMAIN" | tr '\n' ' ')"
printf 'MX:  %s\n' "$(dig +short MX "$DOMAIN" | tr '\n' ' ')"
printf 'TXT: %s\n' "$(dig +short TXT "$DOMAIN" | tr '\n' ' ')"

echo "--- public resolvers ---"
printf '1.1.1.1: %s\n' "$(dig +short A "$DOMAIN" @1.1.1.1 | tr '\n' ' ')"
printf '8.8.8.8: %s\n' "$(dig +short A "$DOMAIN" @8.8.8.8 | tr '\n' ' ')"

echo "--- serving ---"
for url in "http://$DOMAIN" "https://$DOMAIN" "http://www.$DOMAIN" "https://www.$DOMAIN"; do
  printf '%-46s %s\n' "$url" "$(curl -LsS -o /dev/null -w '%{http_code} %{url_effective}' "$url" || echo unavailable)"
done
