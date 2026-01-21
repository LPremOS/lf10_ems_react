#!/bin/bash
# CloudBox Git Workflow Setup Script
# Erstellt develop Branch und ersten Feature Branch

echo "🚀 CloudBox Git Workflow Setup"
echo "================================"
echo ""

# 1. Check ob wir auf main sind
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  Du bist nicht auf main Branch!"
    echo "Wechsle zu main..."
    git checkout main || exit 1
fi

echo "✅ Auf main Branch"
echo ""

# 2. main aktualisieren
echo "📥 Aktualisiere main Branch..."
git pull origin main || exit 1
echo "✅ main ist aktuell"
echo ""

# 3. develop Branch erstellen
echo "🌿 Erstelle develop Branch..."
if git show-ref --verify --quiet refs/heads/develop; then
    echo "⚠️  develop Branch existiert bereits"
    git checkout develop
    git pull origin develop
else
    git checkout -b develop || exit 1
    echo "✅ develop Branch erstellt"
fi
echo ""

# 4. develop pushen
echo "📤 Pushe develop zu GitHub..."
git push -u origin develop || exit 1
echo "✅ develop Branch ist auf GitHub"
echo ""

# 5. Ersten Feature Branch erstellen
echo "🎯 Erstelle ersten Feature Branch..."
read -p "Feature Branch Name (z.B. US-A.1-typescript-errors): " FEATURE_NAME

if [ -z "$FEATURE_NAME" ]; then
    FEATURE_NAME="US-A.1-typescript-errors"
    echo "Nutze Default: feature/$FEATURE_NAME"
fi

git checkout -b "feature/$FEATURE_NAME" || exit 1
echo "✅ Feature Branch erstellt: feature/$FEATURE_NAME"
echo ""

# 6. Fertig!
echo "🎉 Setup abgeschlossen!"
echo ""
echo "📋 Nächste Schritte:"
echo "1. Arbeite in deinem Feature Branch"
echo "2. Committe regelmäßig:"
echo "   git add ."
echo "   git commit -m 'feat(US-A.1): Fix TypeScript errors'"
echo "3. Wenn fertig, merge in develop:"
echo "   git checkout develop"
echo "   git merge feature/$FEATURE_NAME --no-ff"
echo "   git push origin develop"
echo "4. Teste auf Vercel Preview"
echo ""
echo "📖 Siehe GIT_WORKFLOW.md für Details"

