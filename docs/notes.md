
# Ignore this for now


# 1. Stage your files
git add .

# 2. Commit the initial release
git commit -m "feat: initial release v0.0.1"

# 3. Tag it as v0.0.1
git tag v0.0.1

# 4. Push everything to GitHub
git push origin main --tags


gh release create v0.0.1 --title "v0.0.1 Initial Release" --generate-notes


gh release delete v0.0.1 --cleanup-tag -y
