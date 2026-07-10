git add client/src/types/extraction.ts
git commit -m "chore: Update extraction types"

git add client/src/store/enrollmentStore.ts
git commit -m "feat: Enhance enrollment store state"

git add client/src/pages/Dashboard.tsx
git commit -m "fix: Add backwards compatibility for legacy profiles"

git add client/src/utils/generateAutoFill.ts
git commit -m "refactor: Update auto-fill mapping logic"

git add client/src/components/JsonViewer.tsx
git commit -m "style: Improve JSON viewer display"

git add extension/content-donidcr.js
git commit -m "feat: Update NID autofill content script"

git add client/src/components/ApplicantDataTab.tsx
git commit -m "feat: Add form validation to Applicant Data"

git add client/src/components/ContactDetailsTab.tsx
git commit -m "feat: Add form validation to Contact Details"

git add client/src/components/FamilyDetailsTab.tsx
git commit -m "style: Improve Family Details UI architecture"

git add client/src/index.css
git commit -m "style: Overhaul global form CSS styling"

echo scratch_family_tab.tsx >> .gitignore
git add .gitignore
git commit -m "chore: Ignore family tab scratch file"

echo scratch_generateAutoFill.ts >> .gitignore
git add .gitignore
git commit -m "chore: Ignore generate autofill scratch file"

echo scratch_parse_ids.js >> .gitignore
git add .gitignore
git commit -m "chore: Ignore parse ids scratch file"

echo "docs/New Text Document.txt" >> .gitignore
git add .gitignore
git commit -m "chore: Ignore new text document"

git commit --allow-empty -m "chore: Prepare repository for deployment"

git push
