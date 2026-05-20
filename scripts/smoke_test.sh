#!/usr/bin/env bash
set -euo pipefail
COOKIE=/tmp/ideaos-smoke-cookies.txt
OUT=/tmp/ideaos-smoke-output.txt
rm -f "$COOKIE" "$OUT"
EMAIL="smoke+$(date +%s)@example.com"
PASSWORD="Password123!"
{
  echo "EMAIL=$EMAIL"
  echo "\n--- REGISTER ---"
  printf '%s' "$(jq -nc --arg n 'Smoke Tester' --arg e "$EMAIL" --arg p "$PASSWORD" '{name:$n,email:$e,password:$p}')" | curl -s -X POST -H 'Content-Type: application/json' -c "$COOKIE" -d @- http://127.0.0.1:3000/api/auth/register | jq '.' || true

  echo "\n--- CSRF & LOGIN (json) ---"
  CSRF=$(curl -s -c "$COOKIE" http://127.0.0.1:3000/api/auth/csrf | jq -r '.csrfToken')
  echo "csrf=$CSRF"
  printf '%s' "$(jq -nc --arg csrf "$CSRF" --arg e "$EMAIL" --arg p "$PASSWORD" '{csrfToken:$csrf,callbackUrl:"http://127.0.0.1:3000",email:$e,password:$p,json:true}')" | curl -s -X POST -H 'Content-Type: application/json' -c "$COOKIE" -b "$COOKIE" -d @- 'http://127.0.0.1:3000/api/auth/callback/credentials' -D - | sed -n '1,40p' || true

  echo "\n--- SESSION ---"
  curl -s -b "$COOKIE" http://127.0.0.1:3000/api/auth/session | jq '.' || true

  echo "\n--- CREATE IDEA ---"
  printf '%s' "$(jq -nc --arg t 'Smoke idea' --arg d 'Created in smoke test' --arg c 'WEB_APP' --argjson tags '["smoke"]' --argjson pri 1 '{title:$t,description:$d,category:$c,tags:$tags,priority:$pri}')" | curl -s -b "$COOKIE" -X POST -H 'Content-Type: application/json' -d @- http://127.0.0.1:3000/api/ideas | jq '.' || true

  IDEA_ID=$(curl -s -b "$COOKIE" http://127.0.0.1:3000/api/ideas | jq -r '.data[0].id // empty')
  echo "idea_id=$IDEA_ID"

  if [ -n "$IDEA_ID" ]; then
    echo "\n--- CALL AI ANALYZE ---"
    curl -s -b "$COOKIE" -X POST -i http://127.0.0.1:3000/api/ai/analyze/$IDEA_ID | sed -n '1,20p' || true

    echo "\n--- CALL AI MILESTONES ---"
    curl -s -b "$COOKIE" -X POST -i http://127.0.0.1:3000/api/ai/milestones/$IDEA_ID | sed -n '1,20p' || true

    echo "\n--- GET IDEA DETAIL ---"
    curl -s -b "$COOKIE" http://127.0.0.1:3000/api/ideas/$IDEA_ID | jq '.' || true

    echo "\n--- START SESSION ---"
    START_RESP=$(curl -s -b "$COOKIE" -X POST -H 'Content-Type: application/json' -d '{}' http://127.0.0.1:3000/api/ideas/$IDEA_ID/sessions || true)
    echo "$START_RESP" | jq '.' || true
    SESSION_ID=$(echo "$START_RESP" | jq -r '.data.id // empty')
    echo "session_id=$SESSION_ID"

    if [ -n "$SESSION_ID" ]; then
      echo "\n--- END SESSION ---"
      curl -s -b "$COOKIE" -X POST -H 'Content-Type: application/json' -d '{"whatAccomplished":"Finished smoke task"}' http://127.0.0.1:3000/api/sessions/$SESSION_ID/end | jq '.' || true
    fi

    echo "\n--- CHAT (simple) ---"
    curl -s -b "$COOKIE" -X POST -H 'Content-Type: application/json' -d '{"message":"Hello from smoke test"}' http://127.0.0.1:3000/api/ideas/$IDEA_ID/chat | jq '.' || true
  fi

  echo "\n--- DAILY FOCUS (AI) ---"
  curl -s -b "$COOKIE" http://127.0.0.1:3000/api/ai/daily-focus | jq '.' || true

  echo "\n--- WEEKLY REVIEW (generate) ---"
  curl -s -b "$COOKIE" -X POST -i http://127.0.0.1:3000/api/ai/weekly-review | sed -n '1,20p' || true

  echo "\n--- GRAPH DATA ---"
  curl -s -b "$COOKIE" http://127.0.0.1:3000/api/ideas?limit=1000 | jq '.data | length' || true

  echo "\n--- DASHBOARD STATS ---"
  curl -s -b "$COOKIE" http://127.0.0.1:3000/api/dashboard/stats | jq '.' || true

  echo "\nSMOKE_TEST_DONE"
} > "$OUT" 2>&1

chmod +x /workspaces/IdeaOS/scripts/smoke_test.sh
/workspaces/IdeaOS/scripts/smoke_test.sh || true
cat /tmp/ideaos-smoke-output.txt | sed -n '1,240p'
