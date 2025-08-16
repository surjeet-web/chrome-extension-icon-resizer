#!/bin/bash

# Repo should already be cloned
REPO_DIR="."
cd $REPO_DIR || exit

START_DATE="2024-01-01"   # starting point
END_DATE="2024-08-01"     # ending point

CURRENT_DATE="$START_DATE"

while [ "$(date -d "$CURRENT_DATE" +%s)" -le "$(date -d "$END_DATE" +%s)" ]; do
    # 2 commits per day
    for i in 1 2; do  
        echo "Commit on $CURRENT_DATE $i" >> contribution.txt
        git add contribution.txt

        GIT_AUTHOR_DATE="$CURRENT_DATE 10:$i:00" \
        GIT_COMMITTER_DATE="$CURRENT_DATE 10:$i:00" \
        git commit -m "Backdated commit $i on $CURRENT_DATE"
    done
    # move to next day
    CURRENT_DATE=$(date -I -d "$CURRENT_DATE + 1 day")
done
