# Commit Conventions

Conventional Commits format.

> [!IMPORTANT]
> To maintain backwards traceability of the project history, commits must be as **atomic** (one discrete change per commit) and **clear** as possible. Use plain English to explicitly describe the action performed.

## Format

```
<type>(<scope>): <description>
```

## Types

| Type       | Use for                      |
| ---------- | ---------------------------- |
| `feat`     | New feature                  |
| `fix`      | Bug fix                      |
| `docs`     | Documentation                |
| `style`    | Formatting (no logic change) |
| `refactor` | Code restructure             |
| `perf`     | Performance                  |
| `test`     | Tests                        |
| `build`    | Dependencies, build system   |
| `ci`       | CI/CD                        |
| `chore`    | Maintenance, tooling         |
| `revert`   | Revert previous commit       |

## Scopes

`pages` `hero` `locations` `menu` `gallery` `contact` `careers` `rewards` `config` `layout` `ui` `deps` `docs` `ci` `readme`

> **Note:** For static assets (images, icons), use `chore(assets)`.

## Examples

```
feat(menu): add dynamic filtering
fix(contact): fix form submission issue
refactor(hero): remove jquery dependencies
docs(readme): update build instructions
chore(deps): upgrade astro to v5.18
ci: add github actions quality pipeline
style(gallery): fix flexbox alignment
perf(assets): convert images to webp
```

## Rules

- **Atomic**: One logical change per commit
- **Imperative**: "add" not "added"
- **Lowercase**: description starts lowercase
- **No code identifiers**: Avoid function/class/constant names in subject:
- **No period**: no `.` at end
- **Header max 72 chars**: type + scope + description combined

## Breaking Change

Add `!` after scope:

```
feat(layout)!: completely rebuild main navigation structure
```

## AI Instructions

> [!CAUTION]
> **DO NOT** execute git commands directly in the terminal. ALWAYS provide a bulk, copy-pasteable code block containing the commands for the user to run manually.

When suggesting commits:

1. **Batch format**: Provide commits as copy-pasteable PowerShell commands. **NO comment lines** (no `#` prefixes):

```powershell
git add "src/pages/marlboro.astro" "src/components/Locations.astro"
git commit -m "feat(locations): add marlboro specific page"

git add "src/components/Header.astro"
git commit -m "refactor(layout): optimize mobile menu logic"
```

2. **Quote all paths**: PowerShell requires quotes:

```powershell
git add "src/pages/index.astro"
```

3. **Atomic commits**: Group related files, separate unrelated changes into different commits.

4. **STRICT lowercase rule**: NEVER use camelCase, PascalCase or code identifiers in commit message subject:
   - ❌ `use updateStoreHours function` → camelCase identifier
   - ❌ `add Hero component` → PascalCase identifier
   - ✅ `export store hours logic` → descriptive lowercase
   - ✅ `add hero component` → descriptive lowercase
